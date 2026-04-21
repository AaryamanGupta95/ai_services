package com.platform;

import com.platform.entity.Role;
import com.platform.entity.ServiceCategory;
import com.platform.entity.ServiceInfo;
import com.platform.repository.ServiceCategoryRepository;
import com.platform.repository.ServiceInfoRepository;
import com.platform.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserService userService;

    @Autowired
    private ServiceCategoryRepository categoryRepository;

    @Autowired
    private ServiceInfoRepository serviceRepository;

    @Override
    public void run(String... args) {
        // Default admin (can be changed later from DB)
        if (!userService.existsByEmail("admin@local.com")) {
            userService.createUser(
                    "Admin",
                    "admin@local.com",
                    "Admin@123",
                    Role.ADMIN,
                    "Pune",
                    null,
                    null,
                    null
            );
        }

        // Seed a small catalog so the app is usable immediately
        ServiceCategory beauty = categoryRepository.findByName("Beauty").orElseGet(() ->
                categoryRepository.save(ServiceCategory.builder()
                        .name("Beauty")
                        .description("Salon at home, makeup and beauty services")
                        .build())
        );
        ServiceCategory wellness = categoryRepository.findByName("Wellness").orElseGet(() ->
                categoryRepository.save(ServiceCategory.builder()
                        .name("Wellness")
                        .description("Massage, yoga and wellness services")
                        .build())
        );

        if (serviceRepository.findAll().isEmpty()) {
            serviceRepository.save(ServiceInfo.builder()
                    .category(beauty)
                    .title("Haircut & Styling")
                    .description("Professional haircut with styling at home")
                    .price(new BigDecimal("499.00"))
                    .durationMinutes(60)
                    .build());
            serviceRepository.save(ServiceInfo.builder()
                    .category(beauty)
                    .title("Bridal Makeup")
                    .description("Full bridal makeup package")
                    .price(new BigDecimal("4999.00"))
                    .durationMinutes(120)
                    .build());
            serviceRepository.save(ServiceInfo.builder()
                    .category(wellness)
                    .title("Yoga Session")
                    .description("Personalized 1:1 yoga session")
                    .price(new BigDecimal("799.00"))
                    .durationMinutes(60)
                    .build());
        }
    }
}

