package com.platform.repository;

import com.platform.entity.Review;
import com.platform.entity.Booking;
import com.platform.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProvider(User provider);
    boolean existsByBooking(Booking booking);
}
