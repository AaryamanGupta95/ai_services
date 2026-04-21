package com.platform.service;

import com.platform.dto.AiMatchingResponse;
import com.platform.dto.BookingRequest;
import com.platform.entity.*;
import com.platform.repository.AvailabilityRepository;
import com.platform.repository.BookingRepository;
import com.platform.repository.BookingProviderRejectionRepository;
import com.platform.repository.ProviderProfileRepository;
import com.platform.repository.ProviderServiceRepository;
import com.platform.repository.ServiceInfoRepository;
import com.platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ServiceInfoRepository serviceInfoRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AvailabilityRepository availabilityRepository;

    @Autowired
    private AiMatchingService aiMatchingService;

    @Autowired
    private ProviderProfileRepository providerProfileRepository;

    @Autowired
    private ProviderServiceRepository providerServiceRepository;

    @Autowired
    private BookingProviderRejectionRepository rejectionRepository;

    @Autowired
    private NotificationService notificationService;

    public Booking createBooking(User customer, BookingRequest request) {
        ServiceInfo service = serviceInfoRepository.findById(request.getServiceId())
                .orElseThrow(() -> new RuntimeException("Service not found"));

        LocalDateTime scheduledTime = LocalDateTime.parse(request.getScheduledTime());

        Booking booking = Booking.builder()
                .customer(customer)
                .service(service)
                .status(BookingStatus.REQUESTED)
                .scheduledTime(scheduledTime)
                .customerNotes(request.getCustomerNotes())
                .build();

        booking = bookingRepository.save(booking);

        // If customer selected a specific provider, assign them directly
        if (request.getProviderId() != null) {
            User chosenProvider = userRepository.findById(request.getProviderId())
                    .orElseThrow(() -> new RuntimeException("Selected provider not found"));
            booking.setProvider(chosenProvider);
            booking.setStatus(BookingStatus.ASSIGNED);
            Booking saved = bookingRepository.save(booking);

            notificationService.notify(chosenProvider,
                    "New booking assigned",
                    "Hello " + chosenProvider.getName() + ",\n\nYou have a new booking!\nCustomer Name: " + customer.getName() + "\nService: " + service.getTitle() + "\nDate & Time: " + booking.getScheduledTime() + "\n\nPlease check your dashboard to accept.");
            
            notificationService.notify(customer,
                    "Booking assigned",
                    "Hello " + customer.getName() + ",\n\nYour booking has been assigned.\nService: " + service.getTitle() + "\nProvider: " + chosenProvider.getName() + "\nDate & Time: " + booking.getScheduledTime() + "\n\nAwaiting provider response.");
            return saved;
        }

        // Otherwise, use AI matching
        Booking assigned = assignProviderToBooking(booking);
        if (assigned.getProvider() == null) {
            booking.setStatus(BookingStatus.CANCELLED);
            bookingRepository.save(booking);
            throw new RuntimeException("No provider available for the selected service and time.");
        }

        return assigned;
    }

    public Booking assignProviderToBooking(Booking booking) {
        // 1. Fetch providers offering this service
        List<User> providersOffering = providerServiceRepository.findByService(booking.getService())
                .stream()
                .map(ProviderService::getProvider)
                .collect(Collectors.toList());

        // 2. Filter providers: verified + available at requested time + not rejected before + no overlapping jobs
        String dayOfWeekReq = booking.getScheduledTime().getDayOfWeek().name();
        java.time.LocalTime timeReq = booking.getScheduledTime().toLocalTime();
        LocalDateTime start = booking.getScheduledTime();
        LocalDateTime end = booking.getScheduledTime().plusMinutes(booking.getService().getDurationMinutes());

        List<User> availableProviders = new ArrayList<>();

        for (User provider : providersOffering) {
            ProviderProfile profile = providerProfileRepository.findByUser(provider).orElse(null);
            if (profile == null || Boolean.FALSE.equals(profile.getVerifiedStatus())) {
                continue;
            }
            if (rejectionRepository.existsByBookingAndProvider(booking, provider)) {
                continue;
            }

            List<Availability> availabilities = availabilityRepository.findByProvider(provider);
            
            boolean isAvailable = availabilities.stream().anyMatch(avail -> 
                avail.getDayOfWeek().equalsIgnoreCase(dayOfWeekReq) &&
                !timeReq.isBefore(avail.getStartTime()) && 
                !timeReq.isAfter(avail.getEndTime())
            );

            if (!isAvailable) continue;

            // Prevent overlapping bookings (ASSIGNED/ACCEPTED/IN_PROGRESS) in the same window
            List<BookingStatus> busyStatuses = new ArrayList<>(EnumSet.of(
                    BookingStatus.ASSIGNED,
                    BookingStatus.ACCEPTED,
                    BookingStatus.IN_PROGRESS
            ));
            boolean hasOverlap = !bookingRepository
                    .findByProviderAndStatusInAndScheduledTimeBetween(provider, busyStatuses, start.minusMinutes(booking.getService().getDurationMinutes()), end)
                    .isEmpty();
            if (hasOverlap) continue;

            // Location logic (spec):
            // IF customer and provider have latitude/longitude -> allow (AI uses distance)
            // ELSE -> must match by city
            boolean custHasCoords = booking.getCustomer().getLatitude() != null && booking.getCustomer().getLongitude() != null;
            boolean provHasCoords = provider.getLatitude() != null && provider.getLongitude() != null;
            if (!(custHasCoords && provHasCoords)) {
                String cCity = booking.getCustomer().getCity();
                String pCity = provider.getCity();
                if (cCity == null || pCity == null || !cCity.trim().equalsIgnoreCase(pCity.trim())) {
                    continue;
                }
            }

                availableProviders.add(provider);
        }

        if (availableProviders.isEmpty()) {
            booking.setProvider(null);
            bookingRepository.save(booking);
            return booking;
        }

        // 3. Call AI Matching Engine
        AiMatchingResponse aiResponse = aiMatchingService.findBestProvider(booking, availableProviders);

        if (aiResponse.getBest_provider_id() != null) {
            User bestProvider = userRepository.findById(aiResponse.getBest_provider_id()).orElse(null);
            if (bestProvider != null) {
                booking.setProvider(bestProvider);
                booking.setStatus(BookingStatus.ASSIGNED);
                Booking saved = bookingRepository.save(booking);

                notificationService.notify(bestProvider,
                        "New booking assigned",
                        "Hello " + bestProvider.getName() + ",\n\nYou have a new booking from AI matching!\nCustomer Name: " + booking.getCustomer().getName() + "\nService: " + booking.getService().getTitle() + "\nDate & Time: " + booking.getScheduledTime() + "\n\nPlease check your dashboard to accept.");
                
                notificationService.notify(booking.getCustomer(),
                        "Booking assigned",
                        "Hello " + booking.getCustomer().getName() + ",\n\nYour booking has been assigned by AI.\nService: " + booking.getService().getTitle() + "\nProvider: " + bestProvider.getName() + "\nDate & Time: " + booking.getScheduledTime() + "\n\nAwaiting provider response.");
                return saved;
            }
        }
        booking.setProvider(null);
        bookingRepository.save(booking);
        return booking;
    }

    public Booking updateStatus(Long bookingId, BookingStatus newStatus, User user) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (newStatus == null) throw new RuntimeException("Status is required");

        if (user.getRole() == Role.PROVIDER) {
            if (booking.getProvider() == null || !booking.getProvider().getId().equals(user.getId())) {
                throw new RuntimeException("Unauthorized to update this booking");
            }
            return updateStatusAsProvider(booking, newStatus, user);
        }

        if (user.getRole() == Role.CUSTOMER) {
            if (!booking.getCustomer().getId().equals(user.getId())) {
                throw new RuntimeException("Unauthorized to update this booking");
            }
            return updateStatusAsCustomer(booking, newStatus, user);
        }

        throw new RuntimeException("Unsupported role");
    }

    private Booking updateStatusAsProvider(Booking booking, BookingStatus newStatus, User provider) {
        BookingStatus current = booking.getStatus();

        if (current == BookingStatus.CANCELLED || current == BookingStatus.COMPLETED) {
            throw new RuntimeException("Booking is already closed");
        }

        if (current == BookingStatus.ASSIGNED && newStatus == BookingStatus.ACCEPTED) {
            booking.setStatus(BookingStatus.ACCEPTED);
            Booking saved = bookingRepository.save(booking);
            notificationService.notify(booking.getCustomer(), "Booking accepted", provider.getName() + " accepted your booking.");
            return saved;
        }

        if (current == BookingStatus.ASSIGNED && newStatus == BookingStatus.REJECTED) {
            rejectionRepository.save(BookingProviderRejection.builder().booking(booking).provider(provider).build());
            booking.setProvider(null);
            booking.setStatus(BookingStatus.REQUESTED);
            bookingRepository.save(booking);

            Booking reassigned = assignProviderToBooking(booking);
            if (reassigned.getProvider() == null) {
                booking.setStatus(BookingStatus.CANCELLED);
                Booking saved = bookingRepository.save(booking);
                notificationService.notify(booking.getCustomer(), "Booking cancelled", "No providers are available after rejection.");
                return saved;
            }
            return reassigned;
        }

        if (current == BookingStatus.ACCEPTED && newStatus == BookingStatus.IN_PROGRESS) {
            booking.setStatus(BookingStatus.IN_PROGRESS);
            Booking saved = bookingRepository.save(booking);
            notificationService.notify(booking.getCustomer(), "Service started", provider.getName() + " has started the service.");
            return saved;
        }

        if (current == BookingStatus.IN_PROGRESS && newStatus == BookingStatus.COMPLETED) {
            booking.setStatus(BookingStatus.COMPLETED);
            Booking saved = bookingRepository.save(booking);

            // Update provider stats
            ProviderProfile profile = providerProfileRepository.findByUser(provider).orElse(null);
            if (profile != null) {
                profile.setCompletedBookings((profile.getCompletedBookings() == null ? 0 : profile.getCompletedBookings()) + 1);
                providerProfileRepository.save(profile);
            }

            notificationService.notify(booking.getCustomer(), "Service completed", "Your booking is completed. You can leave a review now.");
            return saved;
        }

        throw new RuntimeException("Invalid status transition");
    }

    private Booking updateStatusAsCustomer(Booking booking, BookingStatus newStatus, User customer) {
        BookingStatus current = booking.getStatus();

        if (newStatus != BookingStatus.CANCELLED) {
            throw new RuntimeException("Customers can only cancel bookings");
        }

        if (current == BookingStatus.IN_PROGRESS || current == BookingStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel after service has started");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);
        notificationService.notify(booking.getProvider(), "Booking cancelled", "Customer cancelled the booking.");
        return saved;
    }
}
