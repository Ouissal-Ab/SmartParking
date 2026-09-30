package com.example.Parking.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class ReservationRequest {

    private Long parkingId;

    private String numeroPlace; // P1, P2...

    private LocalDate dateReservation;

    private LocalTime heureDebut;

    private LocalTime heureFin;
}