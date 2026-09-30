package com.example.Parking.repository;

import com.example.Parking.entity.Place;
import com.example.Parking.entity.StatutPlace;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PlaceRepository extends JpaRepository<Place, Long> {

    long countByStatut(StatutPlace statut);

    List<Place> findByParkingId(Long parkingId);

    Optional<Place> findByParkingIdAndNumero(Long parkingId, String numero);
}