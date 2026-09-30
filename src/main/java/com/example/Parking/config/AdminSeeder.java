package com.example.Parking.config;

import org.springframework.beans.factory.annotation.Value;

import com.example.Parking.entity.User;
import com.example.Parking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Component
@RequiredArgsConstructor
public class AdminSeeder {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    @Value("${app.admin.password}")
    private String adminPassword;

    @PostConstruct
    public void init() {

        if (userRepository.findByEmail("admin@parking.com").isEmpty()) {

            User admin = new User();
            admin.setPrenom("Admin");
            admin.setNom("System");
            admin.setEmail("admin@parking.com");
            admin.setTelephone("0000000000");
            admin.setImmatriculation("ADMIN");

            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole("ROLE_ADMIN");

            userRepository.save(admin);
        }
    }
}