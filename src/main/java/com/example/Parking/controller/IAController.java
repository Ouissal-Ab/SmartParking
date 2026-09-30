package com.example.Parking.controller;

import com.example.Parking.entity.Place;
import com.example.Parking.entity.StatutPlace;
import com.example.Parking.repository.PlaceRepository;
import com.example.Parking.realtime.PlaceRealtimePublisher;

import io.github.resilience4j.retry.annotation.Retry;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/ia")
@RequiredArgsConstructor
public class IAController {

    private final PlaceRepository placeRepository;
    private final PlaceRealtimePublisher realtimePublisher;

    @PostMapping("/update")
    @Retry(name = "iaRetry")
    @CircuitBreaker(
            name = "iaCircuit",
            fallbackMethod = "fallbackIA"
    )
    public void update(@RequestBody Map<String, Object> data) {

        String numero = data.get("numero").toString();
        String status = data.get("status").toString();

        Place place = placeRepository
                .findByParkingIdAndNumero(3L, numero)
                .orElseThrow(() ->
                        new RuntimeException("Place introuvable"));

        place.setStatut(
                StatutPlace.valueOf(status)
        );

        placeRepository.save(place);

        realtimePublisher.sendPlaceUpdate(place);
    }

    // ✅ FALLBACK
    public void fallbackIA(
            Map<String, Object> data,
            Exception e
    ) {

        System.out.println("IA indisponible");

        System.out.println(e.getMessage());
    }
}