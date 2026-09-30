package com.example.Parking.dto;


import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank
    private String prenom;

    @NotBlank
    private String nom;

    @Email
    @NotBlank
    private String email;

    // 🇲🇦 Format marocain : 0XXXXXXXXX ou +212XXXXXXXXX
    @Pattern(
            regexp = "^(\\+212|0)[0-9]{9}$",
            message = "Numéro de téléphone invalide (format marocain requis)"
    )
    private String telephone;

    @NotBlank
    private String immatriculation;

    @Size(min = 4, max = 20)
    private String password;

    private String confirmPassword;
}