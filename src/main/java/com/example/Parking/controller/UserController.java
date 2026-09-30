package com.example.Parking.controller;

import com.example.Parking.dto.ReservationRequest;
import com.example.Parking.dto.UserResponse;
import com.example.Parking.dto.UserUpdateRequest;
import com.example.Parking.entity.Parking;
import com.example.Parking.entity.Reservation;
import com.example.Parking.entity.User;
import com.example.Parking.repository.UserRepository;
import com.example.Parking.service.ParkingService;
import com.example.Parking.service.ReservationService;
import com.example.Parking.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final ParkingService parkingService;
    private final ReservationService reservationService;
    private final UserService userService;
    private final UserRepository userRepository;

    // =========================
    // 🅿️ PARKINGS
    // =========================

    @GetMapping("/parkings")
    public List<Parking> getAllParkings() {
        return parkingService.getAll();
    }

    @GetMapping("/parkings/{id}")
    public Parking getParking(@PathVariable Long id) {
        return parkingService.getById(id);
    }

    // =========================
    // 🅿️ RESERVATION
    // =========================

    @PostMapping("/reserve")
    public Reservation reserve(@RequestBody ReservationRequest request) {
        return reservationService.createFromRequest(request);
    }

    @GetMapping("/reservations")
    public List<Reservation> myReservations() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return reservationService.byUser(user);
    }

    // =========================
    // 👤 PROFILE (SAFE DTO)
    // =========================

    @GetMapping("/profile")
    public UserResponse getProfile() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserResponse res = new UserResponse();
        res.setId(user.getId());
        res.setPrenom(user.getPrenom());
        res.setNom(user.getNom());
        res.setEmail(user.getEmail());
        res.setTelephone(user.getTelephone());
        res.setImmatriculation(user.getImmatriculation());
        res.setRole(user.getRole());

        return res;
    }

    @PutMapping("/profile")
    public UserResponse updateProfile(@RequestBody UserUpdateRequest req) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPrenom(req.getPrenom());
        user.setNom(req.getNom());
        user.setTelephone(req.getTelephone());
        user.setImmatriculation(req.getImmatriculation());

        User updated = userRepository.save(user);

        // retourner DTO aussi
        UserResponse res = new UserResponse();
        res.setId(updated.getId());
        res.setPrenom(updated.getPrenom());
        res.setNom(updated.getNom());
        res.setEmail(updated.getEmail());
        res.setTelephone(updated.getTelephone());
        res.setImmatriculation(updated.getImmatriculation());
        res.setRole(updated.getRole());

        return res;
    }

    // =========================
    // 📊 BONUS
    // =========================

    @GetMapping("/reservations/count")
    public long countReservations() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return userService.getReservationCount(user);
    }
    @GetMapping("/parkings/search")
    public List<Parking> searchParkings(@RequestParam String nom) {
        return parkingService.search(nom);
    }
}