package com.example.Parking.scheduler;

import com.example.Parking.entity.Place;
import com.example.Parking.entity.Reservation;
import com.example.Parking.entity.StatutPlace;
import com.example.Parking.entity.StatutReservation;

import com.example.Parking.realtime.PlaceRealtimePublisher;
import com.example.Parking.repository.PlaceRepository;
import com.example.Parking.repository.ReservationRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;

@Component
@RequiredArgsConstructor
public class ReservationScheduler {

    private final ReservationRepository reservationRepository;
    private final PlaceRepository placeRepository;
    private final PlaceRealtimePublisher placeRealtimePublisher;

    @Scheduled(fixedRate = 60000)
    public void updateReservations() {

        for (Reservation r : reservationRepository.findAll()) {

            if (r.getDateReservation() == null || r.getHeureFin() == null) {
                continue;
            }

            boolean expired =
                    r.getDateReservation().isEqual(LocalDate.now())
                            && r.getHeureFin().isBefore(LocalTime.now());

            if (expired && r.getStatut() == StatutReservation.ACTIVE) {

                r.setStatut(StatutReservation.TERMINEE);

                if (r.getPlace() != null) {
                    r.getPlace().setStatut(StatutPlace.LIBRE);
                    Place saved = placeRepository.save(r.getPlace());

                    // 📡 push live update
                    placeRealtimePublisher.sendPlaceUpdate(saved);
                }

                reservationRepository.save(r);
            }
        }
    }
}
