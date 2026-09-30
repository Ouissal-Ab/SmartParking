package com.example.Parking.service;

import com.example.Parking.entity.Place;
import com.example.Parking.entity.StatutPlace;
import com.example.Parking.repository.PlaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PlaceRealtimeService {

    private final PlaceRepository placeRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public void update(Long placeId, String status) {

        Place place = placeRepository.findById(placeId)
                .orElseThrow();

        place.setStatut(StatutPlace.valueOf(status));

        placeRepository.save(place);

        messagingTemplate.convertAndSend("/topic/places", place);
    }
}