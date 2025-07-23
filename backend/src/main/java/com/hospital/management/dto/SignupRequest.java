package com.hospital.management.dto;

import com.hospital.management.model.Patient;
import com.hospital.management.model.User;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonFormat;

@Data
public class SignupRequest {
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

    private Set<String> roles;

    // Patient specific fields
    @NotNull
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateOfBirth;

    @NotNull
    private Patient.BloodGroup bloodGroup;

    private String allergies;
}