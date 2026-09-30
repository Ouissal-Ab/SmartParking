package com.example.Parking.service;

import com.example.Parking.entity.Place;
import com.example.Parking.entity.StatutPlace;
import com.example.Parking.realtime.PlaceRealtimePublisher;
import com.example.Parking.repository.PlaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PlaceService {

    private final PlaceRepository placeRepository;
    private final PlaceRealtimePublisher placeRealtimePublisher;

    public List<Place> getByParking(Long parkingId) {
        return placeRepository.findByParkingId(parkingId);
    }

    public Place getByParkingAndNumero(Long parkingId, String numero) {
        return placeRepository.findByParkingIdAndNumero(parkingId, numero)
                .orElseThrow(() -> new RuntimeException("Place introuvable"));
    }

    public Place updateStatus(Long parkingId, String numero, StatutPlace statut) {

        Place place = getByParkingAndNumero(parkingId, numero);

        place.setStatut(statut);

        Place saved = placeRepository.save(place);

        // 📡 push live update aux clients WebSocket
        placeRealtimePublisher.sendPlaceUpdate(saved);

        return saved;
    }
}
