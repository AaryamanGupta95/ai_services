package com.platform.service;

import com.platform.dto.ReviewCreateRequest;
import com.platform.entity.Booking;
import com.platform.entity.BookingStatus;
import com.platform.entity.ProviderProfile;
import com.platform.entity.Review;
import com.platform.entity.User;
import com.platform.repository.BookingRepository;
import com.platform.repository.ProviderProfileRepository;
import com.platform.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ProviderProfileRepository profileRepository;

    public Review createReview(User customer, ReviewCreateRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new RuntimeException("Review allowed only after COMPLETED booking");
        }

        if (booking.getProvider() == null) {
            throw new RuntimeException("No provider assigned");
        }

        // One review per booking (lightweight check)
        boolean alreadyReviewed = reviewRepository.existsByBooking(booking);
        if (alreadyReviewed) throw new RuntimeException("Review already submitted");

        Review review = Review.builder()
                .booking(booking)
                .customer(customer)
                .provider(booking.getProvider())
                .rating(request.getRating())
                .feedback(request.getFeedback())
                .build();

        Review saved = reviewRepository.save(review);
        recalcProviderRating(booking.getProvider());
        return saved;
    }

    public List<Review> getProviderReviews(User provider) {
        return reviewRepository.findByProvider(provider);
    }

    private void recalcProviderRating(User provider) {
        List<Review> reviews = reviewRepository.findByProvider(provider);
        double avg = reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);

        ProviderProfile profile = profileRepository.findByUser(provider)
                .orElseThrow(() -> new RuntimeException("Provider profile missing"));
        profile.setAverageRating(avg);
        profileRepository.save(profile);
    }
}

