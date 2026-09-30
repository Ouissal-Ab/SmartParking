package com.example.Parking.dto;

import lombok.Data;

@Data
public class ReservationResponse {

    private Long id;
    private String code;
    private double montantTotal;

    private String statut;

    private String parkingNom;
    private String placeNumero;
}