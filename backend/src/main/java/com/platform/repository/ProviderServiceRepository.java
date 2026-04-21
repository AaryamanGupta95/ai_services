package com.platform.repository;

import com.platform.entity.ProviderService;
import com.platform.entity.ServiceInfo;
import com.platform.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProviderServiceRepository extends JpaRepository<ProviderService, Long> {
    List<ProviderService> findByProvider(User provider);
    List<ProviderService> findByService(ServiceInfo service);
    Optional<ProviderService> findByProviderAndService(User provider, ServiceInfo service);
    boolean existsByProviderAndService(User provider, ServiceInfo service);
}

