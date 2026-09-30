package com.example.Parking.dto;



import lombok.Data;

@Data
public class UserUpdateRequest {

    private String prenom;
    private String nom;
    private String telephone;
    private String immatriculation;


}
