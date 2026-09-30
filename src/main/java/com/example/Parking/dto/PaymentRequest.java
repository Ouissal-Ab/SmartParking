package com.example.Parking.dto;

import lombok.Data;

@Data
public class PaymentRequest {

    private Long reservationId;
    private String methode; // CARTE / MOBILE / VIREMENT
}