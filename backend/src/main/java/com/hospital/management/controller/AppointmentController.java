package com.hospital.management.controller;

import com.hospital.management.dto.AppointmentRequest;
import com.hospital.management.dto.MessageResponse;
import com.hospital.management.model.Appointment;
import com.hospital.management.model.Doctor;
import com.hospital.management.model.Patient;
import com.hospital.management.model.User;
import com.hospital.management.repository.AppointmentRepository;
import com.hospital.management.repository.DoctorRepository;
import com.hospital.management.repository.PatientRepository;
import com.hospital.management.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {
    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @GetMapping
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<Appointment>> getAppointments() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        List<Appointment> appointments;
        
        if (authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_PATIENT"))) {
            Patient patient = patientRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("Patient not found"));
            appointments = appointmentRepository.findByPatient(patient);
        } else if (authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_DOCTOR"))) {
            Doctor doctor = doctorRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("Doctor not found"));
            appointments = appointmentRepository.findByDoctor(doctor);
        } else {
            appointments = appointmentRepository.findAll();
        }
        
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Appointment> getAppointmentById(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));
        
        // Check if user has access to this appointment
        if (authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_PATIENT"))) {
            if (!appointment.getPatient().getUser().getId().equals(userDetails.getId())) {
                return ResponseEntity.status(403).build();
            }
        } else if (authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_DOCTOR"))) {
            if (!appointment.getDoctor().getUser().getId().equals(userDetails.getId())) {
                return ResponseEntity.status(403).build();
            }
        }
        
        return ResponseEntity.ok(appointment);
    }

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> createAppointment(@Valid @RequestBody AppointmentRequest appointmentRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        // Get patient
        Patient patient = patientRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        
        // Get doctor
        Doctor doctor = doctorRepository.findById(appointmentRequest.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + appointmentRequest.getDoctorId()));
        
        // Check if time slot is available
        Optional<Appointment> existingAppointment = appointmentRepository.findByDoctorAndAppointmentDateAndAppointmentTimeAndStatus(
                doctor, 
                appointmentRequest.getAppointmentDate(), 
                appointmentRequest.getAppointmentTime(),
                Appointment.AppointmentStatus.SCHEDULED
        );
        
        if (existingAppointment.isPresent()) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("This time slot is already booked"));
        }
        
        // Create appointment
        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDate(appointmentRequest.getAppointmentDate());
        appointment.setAppointmentTime(appointmentRequest.getAppointmentTime());
        appointment.setConsultationFees(appointmentRequest.getConsultationFees());
        appointment.setReason(appointmentRequest.getReason());
        appointment.setNotes(appointmentRequest.getNotes());
        appointment.setStatus(Appointment.AppointmentStatus.SCHEDULED);
        
        appointmentRepository.save(appointment);
        
        return ResponseEntity.ok(new MessageResponse("Appointment booked successfully!"));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> cancelAppointment(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));
        
        // Check if user is the patient who booked this appointment
        if (!appointment.getPatient().getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }
        
        // Check if appointment can be cancelled
        if (appointment.getStatus() != Appointment.AppointmentStatus.SCHEDULED) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Cannot cancel appointment with status: " + appointment.getStatus()));
        }
        
        appointment.setStatus(Appointment.AppointmentStatus.CANCELLED_BY_PATIENT);
        appointmentRepository.save(appointment);
        
        return ResponseEntity.ok(new MessageResponse("Appointment cancelled successfully!"));
    }

    @PutMapping("/{id}/doctor-cancel")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> doctorCancelAppointment(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));
        
        // Check if user is the doctor for this appointment
        if (!appointment.getDoctor().getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }
        
        // Check if appointment can be cancelled
        if (appointment.getStatus() != Appointment.AppointmentStatus.SCHEDULED) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Cannot cancel appointment with status: " + appointment.getStatus()));
        }
        
        appointment.setStatus(Appointment.AppointmentStatus.CANCELLED_BY_DOCTOR);
        appointmentRepository.save(appointment);
        
        return ResponseEntity.ok(new MessageResponse("Appointment cancelled successfully!"));
    }

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> completeAppointment(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));
        
        // Check if user is the doctor for this appointment
        if (!appointment.getDoctor().getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }
        
        // Check if appointment can be completed
        if (appointment.getStatus() != Appointment.AppointmentStatus.SCHEDULED) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Cannot complete appointment with status: " + appointment.getStatus()));
        }
        
        appointment.setStatus(Appointment.AppointmentStatus.COMPLETED);
        appointmentRepository.save(appointment);
        
        return ResponseEntity.ok(new MessageResponse("Appointment marked as completed!"));
    }
}