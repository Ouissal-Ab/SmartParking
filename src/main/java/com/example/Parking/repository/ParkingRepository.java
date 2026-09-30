package com.example.Parking.repository;

import com.example.Parking.entity.Parking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ParkingRepository extends JpaRepository<Parking, Long> {

    // 🔍 recherche par nom (insensible à la casse)
    List<Parking> findByNomContainingIgnoreCase(String nom);
}