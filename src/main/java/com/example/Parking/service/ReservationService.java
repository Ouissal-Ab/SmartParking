package com.example.Parking.service;

import com.example.Parking.dto.ReservationRequest;
import com.example.Parking.entity.*;
import com.example.Parking.realtime.PlaceRealtimePublisher;
import com.example.Parking.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final ParkingRepository parkingRepository;
    private final PlaceRepository placeRepository;
    private final PlaceRealtimePublisher placeRealtimePublisher;

    // =========================
    // GET ALL
    // =========================
    public List<Reservation> getAll() {
        return reservationRepository.findAll();
    }

    // =========================
    // GET BY ID
    // =========================
    public Reservation getById(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
    }

    // =========================
    // BY USER
    // =========================
    public List<Reservation> byUser(User user) {
        return reservationRepository.findByUser(user);
    }

    // =========================
    // BY PARKING
    // =========================
    public List<Reservation> byParking(Parking parking) {
        return reservationRepository.findByParking(parking);
    }

    // =========================
    // BY DATE
    // =========================
    public List<Reservation> byDate(LocalDate date) {
        return reservationRepository.findByDateReservation(date);
    }

    // =========================
    // CREATE RESERVATION (CORRECTED)
    // =========================
    public Reservation createFromRequest(ReservationRequest request) {

        // 👤 USER FROM JWT (IMPORTANT)
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 🅿️ PARKING
        Parking parking = parkingRepository.findById(request.getParkingId())
                .orElseThrow(() -> new RuntimeException("Parking not found"));

        // 📍 PLACE (BASED ON P1, P2...)
        Place place = placeRepository.findByParkingIdAndNumero(
                        request.getParkingId(),
                        request.getNumeroPlace()
                )
                .orElseThrow(() -> new RuntimeException("Place not found"));

        // ❌ disponibilité
        if (place.getStatut() != StatutPlace.LIBRE) {
            throw new RuntimeException("Place non disponible");
        }

        // ❌ conflit horaire
        boolean conflict = reservationRepository.findByParking(parking)
                .stream()
                .anyMatch(r ->
                        r.getPlace().getId().equals(place.getId()) &&
                                !(request.getHeureFin().isBefore(r.getHeureDebut())
                                        || request.getHeureDebut().isAfter(r.getHeureFin()))
                );

        if (conflict) {
            throw new RuntimeException("Créneau déjà réservé");
        }

        // ⏱ durée
        long hours = Duration.between(
                request.getHeureDebut(),
                request.getHeureFin()
        ).toHours();

        if (hours <= 0) {
            throw new RuntimeException("Heure invalide");
        }

        // 💰 montant
        double montant = hours * parking.getTarifParHeure();

        // 🧾 CREATE RESERVATION
        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setParking(parking);
        reservation.setPlace(place);
        reservation.setDateReservation(request.getDateReservation());
        reservation.setHeureDebut(request.getHeureDebut());
        reservation.setHeureFin(request.getHeureFin());
        reservation.setMontantTotal(montant);
        reservation.setCode(generateCode());
        reservation.setStatut(StatutReservation.ACTIVE);

        // 🚗 UPDATE PLACE STATUS
        place.setStatut(StatutPlace.RESERVE);
        Place savedPlace = placeRepository.save(place);

        // 📡 push live update aux clients WebSocket
        placeRealtimePublisher.sendPlaceUpdate(savedPlace);

        Reservation saved = reservationRepository.save(reservation);

        // 📡 push la réservation aux dashboards admin
        placeRealtimePublisher.sendReservationCreated(saved);

        return saved;
    }

    // =========================
    // CODE AUTO GENERATION
    // =========================
    private String generateCode() {
        long count = reservationRepository.count() + 1;

        return "SP-" +
                java.time.LocalDate.now().getYear() +
                "-" +
                String.format("%05d", count);
    }

    // =========================
    // SAVE
    // =========================
    public Reservation save(Reservation reservation) {
        return reservationRepository.save(reservation);
    }
}