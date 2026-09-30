package com.example.Parking.dto;

import lombok.Data;

@Data
public class IADetectionDTO {

    private Long placeId;
    private String status; // LIBRE / OCCUPE
}