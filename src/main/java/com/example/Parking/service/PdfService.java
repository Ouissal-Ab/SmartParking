package com.example.Parking.service;

import com.example.Parking.entity.Reservation;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
public class PdfService {

    public byte[] generatePdf(Reservation r) {

        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document doc = new Document();

            PdfWriter.getInstance(doc, out);

            doc.open();

            doc.add(new Paragraph("===== RESERVATION CONFIRMEE ====="));
            doc.add(new Paragraph("Code : " + r.getCode()));
            doc.add(new Paragraph("Parking : " + r.getParking().getNom()));
            doc.add(new Paragraph("Adresse : " + r.getParking().getAdresse()));
            doc.add(new Paragraph("Place : " + r.getPlace().getNumero()));
            doc.add(new Paragraph("Date : " + r.getDateReservation()));
            doc.add(new Paragraph("Heure : " + r.getHeureDebut() + " - " + r.getHeureFin()));
            doc.add(new Paragraph("Montant : " + r.getMontantTotal() + " MAD"));

            doc.close();

            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Erreur génération PDF", e);
        }
    }
}