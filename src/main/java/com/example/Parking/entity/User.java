package com.example.Parking.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String prenom;
    private String nom;

    @Column(unique = true)
    private String email;

    private String telephone;
    private String immatriculation;
    private String password;
    private String role;

    @OneToMany(mappedBy = "user")
    @JsonIgnore
    private List<Reservation> reservations = new ArrayList<>();
}