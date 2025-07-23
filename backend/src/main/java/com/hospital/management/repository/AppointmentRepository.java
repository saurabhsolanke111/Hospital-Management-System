package com.hospital.management.repository;

import com.hospital.management.model.Appointment;
import com.hospital.management.model.Doctor;
import com.hospital.management.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatient(Patient patient);
    List<Appointment> findByDoctor(Doctor doctor);
    List<Appointment> findByPatientAndStatus(Patient patient, Appointment.AppointmentStatus status);
    List<Appointment> findByDoctorAndStatus(Doctor doctor, Appointment.AppointmentStatus status);
    Optional<Appointment> findByDoctorAndAppointmentDateAndAppointmentTimeAndStatus(
        Doctor doctor, 
        LocalDate appointmentDate, 
        LocalTime appointmentTime, 
        Appointment.AppointmentStatus status
    );
}