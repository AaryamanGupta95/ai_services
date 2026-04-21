package com.platform.repository;

import com.platform.entity.ServiceInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceInfoRepository extends JpaRepository<ServiceInfo, Long> {
    List<ServiceInfo> findByCategoryId(Long categoryId);
}
