package com.capgemini.carboncalculator.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @Email @NotBlank
    private String email;

    @NotBlank @Size(min = 8)
    private String password;

    /** Null = SUPER_ADMIN crée sans org. Sinon = rejoindre cette org. */
    private Long organizationId;

    /** Nom d'une nouvelle organisation à créer (si organizationId est null et rôle ADMIN) */
    private String organizationName;
}
