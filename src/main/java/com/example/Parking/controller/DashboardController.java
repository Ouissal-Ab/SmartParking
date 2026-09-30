package com.example.Parking.controller;

import com.example.Parking.entity.StatutPlace;
import com.example.Parking.repository.ParkingRepository;
import com.example.Parking.repository.PlaceRepository;
import com.example.Parking.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/admin/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final ParkingRepository parkingRepository;
    private final PlaceRepository placeRepository;
    private final ReservationRepository reservationRepository;

    @GetMapping("/stats")
    public Map<String, Object> stats() {

        Map<String, Object> map = new HashMap<>();

        // 📊 stats globales
        map.put("totalParkings", parkingRepository.count());
        map.put("totalPlaces", placeRepository.count());
        map.put("totalReservations", reservationRepository.count());

        // 🟢🔴 stats places (OPTIMISÉ)
        long libres = placeRepository.countByStatut(StatutPlace.LIBRE);
        long occupees = placeRepository.countByStatut(StatutPlace.OCCUPE);

        map.put("placesLibres", libres);
        map.put("placesOccupees", occupees);

        // 📈 taux d'occupation
        long total = libres + occupees;
        double taux = total == 0 ? 0 : (double) occupees / total * 100;

        map.put("tauxOccupation", taux);

        map.put("message", "Dashboard OK");

        return map;
    }
}