package com.hospital.management.controller;

import com.hospital.management.dto.MessageResponse;
import com.hospital.management.dto.PrescriptionRequest;
import com.hospital.management.model.*;
import com.hospital.management.repository.AppointmentRepository;
import com.hospital.management.repository.PrescriptionRepository;
import com.hospital.management.security.services.UserDetailsImpl;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {
    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @GetMapping
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<Prescription>> getPrescriptions() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        List<Prescription> prescriptions;
        
        if (authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_PATIENT"))) {
            Patient patient = new Patient();
            patient.setId(userDetails.getId());
            prescriptions = prescriptionRepository.findByPatient(patient);
        } else if (authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_DOCTOR"))) {
            Doctor doctor = new Doctor();
            doctor.setId(userDetails.getId());
            prescriptions = prescriptionRepository.findByDoctor(doctor);
        } else {
            prescriptions = prescriptionRepository.findAll();
        }
        
        return ResponseEntity.ok(prescriptions);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Prescription> getPrescriptionById(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found with id: " + id));
        
        // Check if user has access to this prescription
        if (authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_PATIENT"))) {
            if (!prescription.getPatient().getUser().getId().equals(userDetails.getId())) {
                return ResponseEntity.status(403).build();
            }
        } else if (authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_DOCTOR"))) {
            if (!prescription.getDoctor().getUser().getId().equals(userDetails.getId())) {
                return ResponseEntity.status(403).build();
            }
        }
        
        return ResponseEntity.ok(prescription);
    }

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> createPrescription(@Valid @RequestBody PrescriptionRequest prescriptionRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        // Get appointment
        Appointment appointment = appointmentRepository.findById(prescriptionRequest.getAppointmentId())
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + prescriptionRequest.getAppointmentId()));
        
        // Check if user is the doctor for this appointment
        if (!appointment.getDoctor().getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }
        
        // Check if appointment is completed
        if (appointment.getStatus() != Appointment.AppointmentStatus.COMPLETED) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Cannot create prescription for appointment with status: " + appointment.getStatus()));
        }
        
        // Check if prescription already exists for this appointment
        if (prescriptionRepository.findByAppointment(appointment).isPresent()) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Prescription already exists for this appointment"));
        }
        
        // Create prescription
        Prescription prescription = new Prescription();
        prescription.setAppointment(appointment);
        prescription.setPatient(appointment.getPatient());
        prescription.setDoctor(appointment.getDoctor());
        prescription.setDiagnosis(prescriptionRequest.getDiagnosis());
        prescription.setAdditionalNotes(prescriptionRequest.getAdditionalNotes());
        prescription.setFollowUpDate(prescriptionRequest.getFollowUpDate());
        
        // Create medications
        List<Medication> medications = new ArrayList<>();
        for (PrescriptionRequest.MedicationDto medicationDto : prescriptionRequest.getMedications()) {
            Medication medication = new Medication();
            medication.setPrescription(prescription);
            medication.setName(medicationDto.getName());
            medication.setDosage(medicationDto.getDosage());
            medication.setFrequency(medicationDto.getFrequency());
            medication.setDuration(medicationDto.getDuration());
            medication.setInstructions(medicationDto.getInstructions());
            medications.add(medication);
        }
        
        prescription.setMedications(medications);
        prescriptionRepository.save(prescription);
        
        return ResponseEntity.ok(new MessageResponse("Prescription created successfully!"));
    }

    @PutMapping("/{id}/pay")
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> markAsPaid(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found with id: " + id));
        
        // Check if user is the patient for this prescription
        if (authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_PATIENT")) &&
                !prescription.getPatient().getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }
        
        prescription.setPaid(true);
        prescriptionRepository.save(prescription);
        
        return ResponseEntity.ok(new MessageResponse("Prescription marked as paid!"));
    }

    @GetMapping("/{id}/pdf")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR') or hasRole('ADMIN')")
    public void generatePdf(@PathVariable Long id, HttpServletResponse response) throws IOException, DocumentException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found with id: " + id));
        
        // Check if user has access to this prescription
        if (authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_PATIENT"))) {
            if (!prescription.getPatient().getUser().getId().equals(userDetails.getId())) {
                response.sendError(403);
                return;
            }
        } else if (authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_DOCTOR"))) {
            if (!prescription.getDoctor().getUser().getId().equals(userDetails.getId())) {
                response.sendError(403);
                return;
            }
        }
        
        // Set response headers
        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=prescription_" + id + ".pdf");
        
        // Create PDF document
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, response.getOutputStream());
        
        document.open();
        
        // Add title
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, BaseColor.BLACK);
        Paragraph title = new Paragraph("Global Hospitals", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
        
        Paragraph subtitle = new Paragraph("Prescription", titleFont);
        subtitle.setAlignment(Element.ALIGN_CENTER);
        subtitle.setSpacingAfter(20);
        document.add(subtitle);
        
        // Add patient and doctor info
        Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12, BaseColor.BLACK);
        Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, BaseColor.BLACK);
        
        document.add(new Paragraph("Patient: " + prescription.getPatient().getUser().getFirstName() + " " + 
                prescription.getPatient().getUser().getLastName(), boldFont));
        document.add(new Paragraph("Doctor: Dr. " + prescription.getDoctor().getUser().getFirstName() + " " + 
                prescription.getDoctor().getUser().getLastName() + " (" + prescription.getDoctor().getSpecialization() + ")", boldFont));
        document.add(new Paragraph("Date: " + prescription.getCreatedAt().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")), boldFont));
        document.add(new Paragraph("Diagnosis: " + prescription.getDiagnosis(), boldFont));
        document.add(new Paragraph(" "));
        
        // Add medications
        document.add(new Paragraph("Medications:", boldFont));
        
        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);
        table.setSpacingBefore(10f);
        table.setSpacingAfter(10f);
        
        // Set table headers
        PdfPCell cell1 = new PdfPCell(new Paragraph("Medication", boldFont));
        PdfPCell cell2 = new PdfPCell(new Paragraph("Dosage", boldFont));
        PdfPCell cell3 = new PdfPCell(new Paragraph("Frequency", boldFont));
        PdfPCell cell4 = new PdfPCell(new Paragraph("Duration", boldFont));
        PdfPCell cell5 = new PdfPCell(new Paragraph("Instructions", boldFont));
        
        table.addCell(cell1);
        table.addCell(cell2);
        table.addCell(cell3);
        table.addCell(cell4);
        table.addCell(cell5);
        
        // Add medication rows
        for (Medication medication : prescription.getMedications()) {
            table.addCell(new Paragraph(medication.getName(), normalFont));
            table.addCell(new Paragraph(medication.getDosage(), normalFont));
            table.addCell(new Paragraph(medication.getFrequency(), normalFont));
            table.addCell(new Paragraph(medication.getDuration(), normalFont));
            table.addCell(new Paragraph(medication.getInstructions() != null ? medication.getInstructions() : "", normalFont));
        }
        
        document.add(table);
        
        // Add additional notes
        if (prescription.getAdditionalNotes() != null && !prescription.getAdditionalNotes().isEmpty()) {
            document.add(new Paragraph("Additional Notes:", boldFont));
            document.add(new Paragraph(prescription.getAdditionalNotes(), normalFont));
        }
        
        // Add follow-up date
        if (prescription.getFollowUpDate() != null) {
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Follow-up Date: " + 
                    prescription.getFollowUpDate().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")), boldFont));
        }
        
        // Add signature
        document.add(new Paragraph(" "));
        document.add(new Paragraph(" "));
        document.add(new Paragraph(" "));
        document.add(new Paragraph("Doctor's Signature", boldFont));
        
        document.close();
    }
}