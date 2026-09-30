package com.example.Parking.controller;

import com.example.Parking.entity.Place;
import com.example.Parking.entity.StatutPlace;
import com.example.Parking.service.PlaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/places")
@RequiredArgsConstructor
public class PlaceController {

    private final PlaceService placeService;

    // 📌 toutes les places d’un parking
    @GetMapping("/parking/{parkingId}")
    public List<Place> getByParking(@PathVariable Long parkingId) {
        return placeService.getByParking(parkingId);
    }

    // 📌 une place précise dans un parking
    @GetMapping("/parking/{parkingId}/{numero}")
    public Place getOne(@PathVariable Long parkingId,
                        @PathVariable String numero) {
        return placeService.getByParkingAndNumero(parkingId, numero);
    }

    // 📌 update manuel (Postman)
    @PutMapping("/parking/{parkingId}/{numero}")
    public Place updateStatus(@PathVariable Long parkingId,
                              @PathVariable String numero,
                              @RequestParam StatutPlace statut) {

        return placeService.updateStatus(parkingId, numero, statut);
    }
}