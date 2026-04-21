package com.platform.repository;

import com.platform.entity.AiRecommendationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiRecommendationLogRepository extends JpaRepository<AiRecommendationLog, Long> {
    List<AiRecommendationLog> findByBookingId(Long bookingId);
}
