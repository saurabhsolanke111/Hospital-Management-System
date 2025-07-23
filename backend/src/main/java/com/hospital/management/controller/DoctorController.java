package com.hospital.management.controller;

import com.hospital.management.dto.DoctorRegistrationRequest;
import com.hospital.management.dto.MessageResponse;
import com.hospital.management.model.Doctor;
import com.hospital.management.model.Role;
import com.hospital.management.model.User;
import com.hospital.management.repository.DoctorRepository;
import com.hospital.management.repository.RoleRepository;
import com.hospital.management.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/doctors")
public class DoctorController {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PasswordEncoder encoder;

    @GetMapping("/public/all")
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        List<Doctor> doctors = doctorRepository.findAll();
        return ResponseEntity.ok(doctors);
    }

    @GetMapping("/public/specialization/{specialization}")
    public ResponseEntity<List<Doctor>> getDoctorsBySpecialization(@PathVariable Doctor.Specialization specialization) {
        List<Doctor> doctors = doctorRepository.findBySpecialization(specialization);
        return ResponseEntity.ok(doctors);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Doctor> getDoctorById(@PathVariable Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));
        return ResponseEntity.ok(doctor);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> registerDoctor(@Valid @RequestBody DoctorRegistrationRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user account
        User user = new User(
                request.getFirstName(),
                request.getLastName(),
                request.getEmail(),
                request.getPhone(),
                encoder.encode(request.getPassword()),
                request.getGender());

        // Set doctor role
        Set<Role> roles = new HashSet<>();
        Role doctorRole = roleRepository.findByName(Role.ERole.ROLE_DOCTOR)
                .orElseThrow(() -> new RuntimeException("Error: Doctor role is not found."));
        roles.add(doctorRole);
        user.setRoles(roles);

        User savedUser = userRepository.save(user);

        // Create doctor profile
        Doctor doctor = new Doctor();
        doctor.setUser(savedUser);
        doctor.setSpecialization(request.getSpecialization());
        doctor.setConsultationFees(request.getConsultationFees());
        doctor.setAvailableDays(request.getAvailableDays());
        doctor.setAvailableTimeSlots(request.getAvailableTimeSlots());
        doctor.setExperience(request.getExperience());
        doctor.setEducation(request.getEducation());
        doctor.setBiography(request.getBiography());

        doctorRepository.save(doctor);

        return ResponseEntity.ok(new MessageResponse("Doctor registered successfully!"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateDoctor(@PathVariable Long id, @Valid @RequestBody Doctor doctorDetails) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));

        doctor.setSpecialization(doctorDetails.getSpecialization());
        doctor.setConsultationFees(doctorDetails.getConsultationFees());
        doctor.setAvailableDays(doctorDetails.getAvailableDays());
        doctor.setAvailableTimeSlots(doctorDetails.getAvailableTimeSlots());
        doctor.setExperience(doctorDetails.getExperience());
        doctor.setEducation(doctorDetails.getEducation());
        doctor.setBiography(doctorDetails.getBiography());

        doctorRepository.save(doctor);

        return ResponseEntity.ok(new MessageResponse("Doctor updated successfully!"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteDoctor(@PathVariable Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));

        // Delete doctor profile
        doctorRepository.delete(doctor);

        // Delete user account
        userRepository.delete(doctor.getUser());

        return ResponseEntity.ok(new MessageResponse("Doctor deleted successfully!"));
    }
}