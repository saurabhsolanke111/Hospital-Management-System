package com.hospital.management.dto;

import com.hospital.management.model.Doctor;
import com.hospital.management.model.User;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.Set;

@Data
public class DoctorRegistrationRequest {
    @NotBlank
    @Size(min = 2, max = 50)
    private String firstName;

    @NotBlank
    @Size(min = 2, max = 50)
    private String lastName;

    @NotBlank
    @Size(max = 50)
    @Email
    private String email;

    @NotBlank
    @Size(min = 10, max = 20)
    private String phone;

    @NotBlank
    @Size(min = 6, max = 40)
    private String password;

    @NotNull
    private User.Gender gender;

    // Doctor specific fields
    @NotNull
    private Doctor.Specialization specialization;

    @NotNull
    @Positive
    private Double consultationFees;

    @NotEmpty
    private Set<Doctor.DayOfWeek> availableDays;

    @NotEmpty
    private Set<String> availableTimeSlots;

    @NotNull
    @Positive
    private Integer experience;

    @NotBlank
    private String education;

    private String biography;
}