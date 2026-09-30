package com.example.Parking.repository;

import com.example.Parking.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByUser(User user);

    List<Reservation> findByParking(Parking parking);

    List<Reservation> findByDateReservation(LocalDate dateReservation);

    // 🔥 AJOUT IMPORTANT : revenus par jour
    List<Reservation> findByParkingAndDateReservation(Parking parking, LocalDate dateReservation);
}