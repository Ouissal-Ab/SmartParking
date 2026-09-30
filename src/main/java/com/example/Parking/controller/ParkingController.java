package com.example.Parking.controller;

import com.example.Parking.entity.Parking;
import com.example.Parking.service.ParkingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/parkings")
@RequiredArgsConstructor
public class ParkingController {

    private final ParkingService parkingService;

    // =========================
    // CREATE
    // =========================
    @PostMapping
    public Parking create(@RequestBody Parking p) {
        return parkingService.create(p);
    }

    // =========================
    // GET ALL
    // =========================
    @GetMapping
    public List<Parking> getAll() {
        return parkingService.getAll();
    }

    // =========================
    // GET BY ID
    // =========================
    @GetMapping("/{id}")
    public Parking getById(@PathVariable Long id) {
        return parkingService.getById(id);
    }

    // =========================
    // UPDATE
    // =========================
    @PutMapping("/{id}")
    public Parking update(@PathVariable Long id, @RequestBody Parking p) {
        return parkingService.update(id, p);
    }

    // =========================
    // DELETE
    // =========================
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        parkingService.delete(id);
    }

    // =========================
    // STATUT PARKING
    // =========================
    @GetMapping("/{id}/status")
    public String status(@PathVariable Long id) {
        Parking p = parkingService.getById(id);
        return parkingService.getStatus(p);
    }

    // =========================
    // REVENUS
    // =========================
    @GetMapping("/{id}/revenue/today")
    public double revenueToday(@PathVariable Long id) {
        return parkingService.getTodayRevenue(id);
    }

    // =========================
    // 🔍 SEARCH PARKING (NEW)
    // =========================
    @GetMapping("/search")
    public List<Parking> search(@RequestParam String nom) {
        return parkingService.search(nom);
    }

    // =========================
    // 🅿️ FREE PLACES (NEW)
    // =========================
    @GetMapping("/{id}/free")
    public long free(@PathVariable Long id) {
        return parkingService.freePlaces(id);
    }
}