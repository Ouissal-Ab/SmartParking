package com.example.Parking.dto;

import lombok.Data;

@Data
public class AuthResponse {
    private String token;
    private String role;
    private String email;
    private String prenom;
    private String nom;
}
