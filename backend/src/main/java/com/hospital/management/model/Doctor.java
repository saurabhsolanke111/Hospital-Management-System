package com.hospital.management.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "doctors")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Doctor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @Enumerated(EnumType.STRING)
    private Specialization specialization;

    @NotNull
    @Positive
    private Double consultationFees;

    @ElementCollection
    @CollectionTable(name = "doctor_available_days", 
                    joinColumns = @JoinColumn(name = "doctor_id"))
    @Enumerated(EnumType.STRING)
    private Set<DayOfWeek> availableDays = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "doctor_available_time_slots", 
                    joinColumns = @JoinColumn(name = "doctor_id"))
    private Set<String> availableTimeSlots = new HashSet<>();

    @NotNull
    @Positive
    private Integer experience;

    @NotBlank
    private String education;

    @Column(columnDefinition = "TEXT")
    private String biography;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum Specialization {
        GENERAL_MEDICINE, CARDIOLOGY, DERMATOLOGY, ENDOCRINOLOGY, GASTROENTEROLOGY,
        NEUROLOGY, OBSTETRICS_GYNECOLOGY, OPHTHALMOLOGY, ORTHOPEDICS, PEDIATRICS,
        PSYCHIATRY, PULMONOLOGY, RADIOLOGY, UROLOGY
    }

    public enum DayOfWeek {
        MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
    }
}