package com.hospital.management.config;

import com.hospital.management.model.Role;
import com.hospital.management.model.User;
import com.hospital.management.repository.RoleRepository;
import com.hospital.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Override
    public void run(String... args) throws Exception {
        // Initialize roles
        initRoles();
        
        // Initialize admin user
        initAdminUser();
    }

    private void initRoles() {
        if (roleRepository.count() == 0) {
            Role adminRole = new Role(Role.ERole.ROLE_ADMIN);
            Role doctorRole = new Role(Role.ERole.ROLE_DOCTOR);
            Role patientRole = new Role(Role.ERole.ROLE_PATIENT);

            roleRepository.save(adminRole);
            roleRepository.save(doctorRole);
            roleRepository.save(patientRole);
        }
    }

    private void initAdminUser() {
        if (!userRepository.existsByEmail("admin@hospital.com")) {
            // Create admin user
            User adminUser = new User();
            adminUser.setFirstName("Admin");
            adminUser.setLastName("User");
            adminUser.setEmail("admin@hospital.com");
            adminUser.setPhone("1234567890");
            adminUser.setPassword(encoder.encode("admin123"));
            adminUser.setGender(User.Gender.MALE);

            // Assign admin role
            Set<Role> roles = new HashSet<>();
            Role adminRole = roleRepository.findByName(Role.ERole.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Error: Admin Role not found."));
            roles.add(adminRole);
            adminUser.setRoles(roles);

            userRepository.save(adminUser);
        }
    }
}