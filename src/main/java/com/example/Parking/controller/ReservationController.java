package com.example.Parking.controller;

import com.example.Parking.entity.Reservation;
import com.example.Parking.entity.Parking;
import com.example.Parking.service.ReservationService;
import com.example.Parking.service.UserService;
import com.example.Parking.service.PdfService;
import com.example.Parking.service.QrCodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/admin/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;
    private final UserService userService;
    private final PdfService pdfService;
    private final QrCodeService qrCodeService;

    // =========================
    // GET ALL
    // =========================
    @GetMapping
    public List<Reservation> getAll() {
        return reservationService.getAll();
    }

    // =========================
    // BY USER
    // =========================
    @GetMapping("/user/{id}")
    public List<Reservation> byUser(@PathVariable Long id) {
        return reservationService.byUser(userService.getById(id));
    }

    // =========================
    // BY PARKING
    // =========================
    @GetMapping("/parking/{id}")
    public List<Reservation> byParking(@PathVariable Long id) {
        Parking p = new Parking();
        p.setId(id);
        return reservationService.byParking(p);
    }

    // =========================
    // BY DATE
    // =========================
    @GetMapping("/date/{date}")
    public List<Reservation> byDate(@PathVariable LocalDate date) {
        return reservationService.byDate(date);
    }

    // =========================
    // PDF RECU
    // =========================
    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable Long id) throws Exception {

        Reservation r = reservationService.getById(id);

        byte[] pdf = pdfService.generatePdf(r);

        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .body(pdf);
    }

    // =========================
    // QR CODE
    // =========================
    @GetMapping("/{id}/qr")
    public ResponseEntity<byte[]> getQr(@PathVariable Long id) throws Exception {

        Reservation r = reservationService.getById(id);

        String data = "RES:" + r.getCode()
                + "|PARKING:" + r.getParking().getNom()
                + "|PLACE:" + r.getPlace().getNumero()
                + "|MONTANT:" + r.getMontantTotal();

        byte[] qr = qrCodeService.generateQr(data);

        return ResponseEntity.ok()
                .header("Content-Type", "image/png")
                .body(qr);
    }
}