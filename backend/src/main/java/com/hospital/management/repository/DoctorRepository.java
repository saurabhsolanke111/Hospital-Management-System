package com.hospital.management.repository;

import com.hospital.management.model.Doctor;
import com.hospital.management.model.Doctor.Specialization;
import com.hospital.management.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByUser(User user);
    List<Doctor> findBySpecialization(Specialization specialization);
}