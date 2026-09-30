package com.example.Parking.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "places")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Place {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String numero;

    @Enumerated(EnumType.STRING)
    private StatutPlace statut = StatutPlace.LIBRE;

    @ManyToOne
    @JoinColumn(name = "parking_id")
    @JsonIgnore   // ✅ ICI seulement
    private Parking parking;

    @OneToMany(mappedBy = "place")
    @JsonIgnore
    private List<Reservation> reservations = new ArrayList<>();
}