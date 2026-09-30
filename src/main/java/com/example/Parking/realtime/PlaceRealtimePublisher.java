package com.example.Parking.realtime;

import com.example.Parking.entity.Place;
import com.example.Parking.entity.Reservation;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PlaceRealtimePublisher {

    private final SimpMessagingTemplate messagingTemplate;

    // 📡 envoyer update place vers frontend (inclut parkingId pour permettre le filtrage)
    public void sendPlaceUpdate(Place place) {
        if (place == null) return;
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", place.getId());
        payload.put("numero", place.getNumero());
        payload.put("statut", place.getStatut() != null ? place.getStatut().name() : null);
        payload.put("parkingId", place.getParking() != null ? place.getParking().getId() : null);
        messagingTemplate.convertAndSend("/topic/places", payload);
    }

    // 📡 envoyer stats parking (objet libre)
    public void sendParkingStats(Object stats) {
        messagingTemplate.convertAndSend("/topic/stats", stats);
    }

    // 📡 envoyer une nouvelle réservation (pour le dashboard admin live)
    public void sendReservationCreated(Reservation reservation) {
        if (reservation == null) return;
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", reservation.getId());
        payload.put("code", reservation.getCode());
        payload.put("dateReservation", reservation.getDateReservation());
        payload.put("heureDebut", reservation.getHeureDebut());
        payload.put("heureFin", reservation.getHeureFin());
        payload.put("montantTotal", reservation.getMontantTotal());
        payload.put("statut",
                reservation.getStatut() != null ? reservation.getStatut().name() : null);

        if (reservation.getUser() != null) {
            Map<String, Object> u = new HashMap<>();
            u.put("id", reservation.getUser().getId());
            u.put("prenom", reservation.getUser().getPrenom());
            u.put("nom", reservation.getUser().getNom());
            u.put("email", reservation.getUser().getEmail());
            payload.put("user", u);
        }
        if (reservation.getParking() != null) {
            Map<String, Object> p = new HashMap<>();
            p.put("id", reservation.getParking().getId());
            p.put("nom", reservation.getParking().getNom());
            payload.put("parking", p);
        }
        if (reservation.getPlace() != null) {
            Map<String, Object> pl = new HashMap<>();
            pl.put("id", reservation.getPlace().getId());
            pl.put("numero", reservation.getPlace().getNumero());
            pl.put("statut",
                    reservation.getPlace().getStatut() != null
                            ? reservation.getPlace().getStatut().name()
                            : null);
            payload.put("place", pl);
        }

        messagingTemplate.convertAndSend("/topic/reservations", payload);
    }
}
