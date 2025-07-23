package com.hospital.management.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class PrescriptionRequest {
    @NotNull
    private Long appointmentId;

    @NotBlank
    private String diagnosis;

    @NotEmpty
    @Valid
    private List<MedicationDto> medications;

    private String additionalNotes;

    private LocalDate followUpDate;

    @Data
    public static class MedicationDto {
        @NotBlank
        private String name;

        @NotBlank
        private String dosage;

        @NotBlank
        private String frequency;

        @NotBlank
        private String duration;

        private String instructions;
    }
}