package com.example.Parking.service;

import com.example.Parking.entity.*;
import com.example.Parking.repository.ParkingRepository;
import com.example.Parking.repository.PlaceRepository;
import com.example.Parking.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ParkingService {

    private final ParkingRepository parkingRepository;
    private final PlaceRepository placeRepository;
    private final ReservationRepository reservationRepository;

    // =========================
    // CREATE PARKING + PLACES
    // =========================
    public Parking create(Parking p) {

        Parking saved = parkingRepository.save(p);

        List<Place> places = new ArrayList<>();

        for (int i = 1; i <= p.getNombreDePlaces(); i++) {
            Place place = new Place();
            place.setNumero("P" + i);
            place.setStatut(StatutPlace.LIBRE);
            place.setParking(saved);
            places.add(place);
        }

        placeRepository.saveAll(places);
        saved.setPlaces(places);

        return saved;
    }

    // =========================
    // GET ALL
    // =========================
    public List<Parking> getAll() {
        return parkingRepository.findAll();
    }

    // =========================
    // GET BY ID
    // =========================
    public Parking getById(Long id) {
        return parkingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Parking not found"));
    }

    // =========================
    // UPDATE
    // =========================
    public Parking update(Long id, Parking p) {

        Parking existing = getById(id);

        existing.setNom(p.getNom());
        existing.setAdresse(p.getAdresse());
        existing.setTarifParHeure(p.getTarifParHeure());
        existing.setNombreDePlaces(p.getNombreDePlaces());
        existing.setHeureOuverture(p.getHeureOuverture());
        existing.setHeureFermeture(p.getHeureFermeture());
        existing.setLatitude(p.getLatitude());
        existing.setLongitude(p.getLongitude());
        existing.setSurveilleParIA(p.isSurveilleParIA());

        return parkingRepository.save(existing);
    }

    // =========================
    // DELETE — cascade reservations + places
    // =========================
    @Transactional
    public void delete(Long id) {
        Parking parking = parkingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Parking not found"));

        // Reservations reference both parkings and places via FK without
        // cascade — clear them first so Postgres doesn't reject the delete.
        List<Reservation> reservations = reservationRepository.findByParking(parking);
        if (!reservations.isEmpty()) {
            reservationRepository.deleteAll(reservations);
            reservationRepository.flush();
        }

        // Places carry cascade ALL + orphanRemoval, so deleting the parking
        // will clean them up automatically.
        parkingRepository.delete(parking);
    }

    // =========================
    // STATUT PARKING
    // =========================
    public String getStatus(Parking parking) {

        long total = placeRepository.findByParkingId(parking.getId()).size();

        long libres = placeRepository.findByParkingId(parking.getId())
                .stream()
                .filter(p -> p.getStatut() == StatutPlace.LIBRE)
                .count();

        if (libres == 0) return "COMPLET";
        if (libres <= 3 || libres < total * 0.2) return "LIMITÉ";

        return "DISPONIBLE";
    }

    // =========================
    // REVENUS AUJOURD’HUI
    // =========================
    public double getTodayRevenue(Long parkingId) {

        Parking parking = getById(parkingId);

        return reservationRepository.findByParking(parking)
                .stream()
                .filter(r -> r.getDateReservation().isEqual(LocalDate.now()))
                .mapToDouble(Reservation::getMontantTotal)
                .sum();
    }

    // =========================
    // 🔍 RECHERCHE PARKING (NEW)
    // =========================
    public List<Parking> search(String nom) {
        return parkingRepository.findByNomContainingIgnoreCase(nom);
    }

    // =========================
    // 🅿️ NOMBRE PLACES LIBRES (NEW)
    // =========================
    public long freePlaces(Long parkingId) {

        return placeRepository.findByParkingId(parkingId)
                .stream()
                .filter(p -> p.getStatut() == StatutPlace.LIBRE)
                .count();
    }
}