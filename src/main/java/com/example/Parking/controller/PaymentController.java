package com.example.Parking.controller;

import com.example.Parking.dto.PaymentRequest;
import com.example.Parking.entity.MethodePaiement;
import com.example.Parking.entity.Reservation;
import com.example.Parking.entity.StatutReservation;
import com.example.Parking.service.ReservationService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final ReservationService reservationService;

    @PostMapping
    public Reservation pay(
            @RequestBody PaymentRequest request
    ) {

        Reservation reservation =
                reservationService.getById(
                        request.getReservationId()
                );

        // ✅ méthode paiement
        reservation.setMethodePaiement(
                MethodePaiement.valueOf(
                        request.getMethode()
                )
        );

        // ✅ réservation confirmée
        reservation.setStatut(
                StatutReservation.ACTIVE
        );

        return reservationService.save(
                reservation
        );
    }
}