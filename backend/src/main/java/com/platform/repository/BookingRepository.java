package com.platform.repository;

import com.platform.entity.Booking;
import com.platform.entity.BookingStatus;
import com.platform.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByCustomerOrderByCreatedAtDesc(User customer);
    List<Booking> findByProviderOrderByCreatedAtDesc(User provider);

    List<Booking> findByProviderAndStatusInAndScheduledTimeBetween(
            User provider,
            List<BookingStatus> statuses,
            LocalDateTime start,
            LocalDateTime end
    );
}
