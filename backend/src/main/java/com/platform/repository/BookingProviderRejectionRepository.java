package com.platform.repository;

import com.platform.entity.Booking;
import com.platform.entity.BookingProviderRejection;
import com.platform.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingProviderRejectionRepository extends JpaRepository<BookingProviderRejection, Long> {
    List<BookingProviderRejection> findByBooking(Booking booking);
    Optional<BookingProviderRejection> findByBookingAndProvider(Booking booking, User provider);
    boolean existsByBookingAndProvider(Booking booking, User provider);
}

