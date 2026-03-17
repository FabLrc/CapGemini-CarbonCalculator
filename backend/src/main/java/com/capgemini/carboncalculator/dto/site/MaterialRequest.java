package com.capgemini.carboncalculator.dto.site;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class MaterialRequest {

    @NotBlank
    private String emissionFactorCode; // ex: "CONCRETE"

    @Positive
    private Double quantityKg;
}
