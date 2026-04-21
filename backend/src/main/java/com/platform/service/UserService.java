package com.platform.service;

import com.platform.entity.Role;
import com.platform.entity.User;
import com.platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    public boolean existsByEmail(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    public User createUser(String name, String email, String password, Role role, String city, String phone, Double lat, Double lng) {
        User user = User.builder()
                .name(name)
                .email(email)
                .password(encoder.encode(password))
                .role(role)
                .city(city)
                .phone(phone)
                .latitude(lat)
                .longitude(lng)
                .build();
        return userRepository.save(user);
    }
    
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
}
