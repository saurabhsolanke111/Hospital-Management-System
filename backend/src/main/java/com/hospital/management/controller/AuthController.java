package com.hospital.management.controller;

import com.hospital.management.dto.JwtResponse;
import com.hospital.management.dto.LoginRequest;
import com.hospital.management.dto.MessageResponse;
import com.hospital.management.dto.SignupRequest;
import com.hospital.management.model.Patient;
import com.hospital.management.model.Role;
import com.hospital.management.model.User;
import com.hospital.management.repository.PatientRepository;
import com.hospital.management.repository.RoleRepository;
import com.hospital.management.repository.UserRepository;
import com.hospital.management.security.jwt.JwtUtils;
import com.hospital.management.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PatientRepository patientRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(jwt,
                                                userDetails.getId(), 
                                                userDetails.getFirstName(),
                                                userDetails.getLastName(),
                                                userDetails.getEmail(), 
                                                roles));
    }

    @PostMapping("/debug")
    public ResponseEntity<?> debugRegistration(@RequestBody SignupRequest signUpRequest) {
        System.out.println("Debug registration request: " + signUpRequest);
        return ResponseEntity.ok(new MessageResponse("Debug successful"));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        System.out.println("Received registration request: " + signUpRequest);
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user's account
        User user = new User(
                signUpRequest.getFirstName(),
                signUpRequest.getLastName(),
                signUpRequest.getEmail(),
                signUpRequest.getPhone(),
                encoder.encode(signUpRequest.getPassword()),
                signUpRequest.getGender());

        Set<String> strRoles = signUpRequest.getRoles();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null) {
            Role patientRole = roleRepository.findByName(Role.ERole.ROLE_PATIENT)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(patientRole);
        } else {
            strRoles.forEach(role -> {
                switch (role) {
                    case "admin":
                        Role adminRole = roleRepository.findByName(Role.ERole.ROLE_ADMIN)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(adminRole);
                        break;
                    case "doctor":
                        Role doctorRole = roleRepository.findByName(Role.ERole.ROLE_DOCTOR)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(doctorRole);
                        break;
                    default:
                        Role patientRole = roleRepository.findByName(Role.ERole.ROLE_PATIENT)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(patientRole);
                }
            });
        }

        user.setRoles(roles);
        User savedUser = userRepository.save(user);

        // Create patient profile if user is a patient
        if (roles.stream().anyMatch(r -> r.getName() == Role.ERole.ROLE_PATIENT)) {
            Patient patient = new Patient();
            patient.setUser(savedUser);
            patient.setDateOfBirth(signUpRequest.getDateOfBirth());
            patient.setBloodGroup(signUpRequest.getBloodGroup());
            patient.setAllergies(signUpRequest.getAllergies());
            patientRepository.save(patient);
        }

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
}