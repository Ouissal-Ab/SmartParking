package com.example.Parking.dto;

import lombok.Data;

@Data
public class UserResponse {
    private Long id;
    private String prenom;
    private String nom;
    private String email;
    private String telephone;
    private String immatriculation;
    private String role;
}