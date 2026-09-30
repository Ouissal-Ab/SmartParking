package com.example.Parking.service;

import com.example.Parking.entity.User;
import com.example.Parking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
        private final UserRepository userRepository;

        // ✔ récupérer tous les utilisateurs
        public List<User> getAll() {
            return userRepository.findAll();
        }

        // ✔ récupérer un utilisateur par ID
        public User getById(Long id) {
            return userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));
        }
    // ✔ supprimer user (ADMIN)
    public void delete(Long id) {
        userRepository.deleteById(id);
    }


    // ✔ nombre de réservations d’un user
        public long getReservationCount(User user) {
            if (user.getReservations() == null) return 0;
            return user.getReservations().size();
        }
    }