package com.example.Parking.controller;

import com.example.Parking.dto.UserResponse;
import com.example.Parking.entity.User;
import com.example.Parking.repository.UserRepository;
import com.example.Parking.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;
    private final UserRepository userRepository;

    private UserResponse toDto(User u) {
        UserResponse r = new UserResponse();
        r.setId(u.getId());
        r.setPrenom(u.getPrenom());
        r.setNom(u.getNom());
        r.setEmail(u.getEmail());
        r.setTelephone(u.getTelephone());
        r.setImmatriculation(u.getImmatriculation());
        r.setRole(u.getRole());
        return r;
    }

    @GetMapping
    public List<UserResponse> getAll() {
        return userService.getAll().stream().map(this::toDto).toList();
    }

    @GetMapping("/{id}")
    public UserResponse getById(@PathVariable Long id) {
        return toDto(userService.getById(id));
    }

    @PutMapping("/{id}/role")
    public UserResponse updateRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        User user = userService.getById(id);
        String role = body.getOrDefault("role", "ROLE_USER");
        if (!role.equals("ROLE_ADMIN") && !role.equals("ROLE_USER")) {
            throw new RuntimeException("Rôle invalide");
        }
        user.setRole(role);
        return toDto(userRepository.save(user));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        userService.delete(id);
    }
}