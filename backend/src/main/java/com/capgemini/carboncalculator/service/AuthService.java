package com.capgemini.carboncalculator.service;

import com.capgemini.carboncalculator.dto.auth.AuthResponse;
import com.capgemini.carboncalculator.dto.auth.LoginRequest;
import com.capgemini.carboncalculator.dto.auth.RegisterRequest;
import com.capgemini.carboncalculator.entity.Organization;
import com.capgemini.carboncalculator.entity.Role;
import com.capgemini.carboncalculator.entity.User;
import com.capgemini.carboncalculator.repository.OrganizationRepository;
import com.capgemini.carboncalculator.repository.UserRepository;
import com.capgemini.carboncalculator.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email déjà utilisé : " + request.getEmail());
        }

        Organization organization = resolveOrganization(request);
        Role role = determineRole(request, organization);

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .organization(organization)
                .build();

        userRepository.save(user);

        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();
        return buildAuthResponse(user);
    }

    private Organization resolveOrganization(RegisterRequest request) {
        if (request.getOrganizationId() != null) {
            return organizationRepository.findById(request.getOrganizationId())
                    .orElseThrow(() -> new IllegalArgumentException("Organisation introuvable"));
        }
        if (request.getOrganizationName() != null && !request.getOrganizationName().isBlank()) {
            if (organizationRepository.existsByName(request.getOrganizationName())) {
                throw new IllegalArgumentException("Nom d'organisation déjà pris");
            }
            Organization org = Organization.builder()
                    .name(request.getOrganizationName())
                    .build();
            return organizationRepository.save(org);
        }
        return null; // SUPER_ADMIN sans org
    }

    private Role determineRole(RegisterRequest request, Organization organization) {
        if (organization == null) return Role.SUPER_ADMIN;
        // Premier utilisateur d'une nouvelle org = ADMIN
        if (request.getOrganizationId() == null) return Role.ADMIN;
        return Role.MEMBER;
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().name())
                .organizationId(user.getOrganization() != null ? user.getOrganization().getId() : null)
                .organizationName(user.getOrganization() != null ? user.getOrganization().getName() : null)
                .build();
    }
}
