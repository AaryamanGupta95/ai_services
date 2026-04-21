package com.platform.repository;

import com.platform.entity.Availability;
import com.platform.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AvailabilityRepository extends JpaRepository<Availability, Long> {
    List<Availability> findByProvider(User provider);
    List<Availability> findByProviderId(Long providerId);
    void deleteByProviderId(Long providerId);
}
