package com.example.Parking.entity;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "parkings")
@Data

@NoArgsConstructor
@AllArgsConstructor
public class Parking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nom;
    private String adresse;
    private int nombreDePlaces;
    private double tarifParHeure;
    private LocalTime heureOuverture;
    private LocalTime heureFermeture;
    private boolean surveilleParIA = false;

    private Double latitude;
    private Double longitude;

    @OneToMany(mappedBy = "parking",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    @JsonIgnore
    private List<Place> places = new ArrayList<>();

    @OneToMany(mappedBy = "parking")
    @JsonIgnore
    private List<Reservation> reservations = new ArrayList<>();
}