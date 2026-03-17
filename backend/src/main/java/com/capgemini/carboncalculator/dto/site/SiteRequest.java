package com.capgemini.carboncalculator.dto.site;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class SiteRequest {

    @NotBlank
    private String name;

    private String description;

    private String location;

    @Positive
    private Double totalAreaM2;

    @PositiveOrZero
    private Integer parkingSpaces;

    @PositiveOrZero
    private Double annualEnergyKwh;

    @Positive
    private Integer employeeCount;

    /** Année de construction du bâtiment */
    private Integer constructionYear;

    /** Code du mix énergétique (ex: ELECTRICITY_FR, GAS_NATURAL…). Défaut: ELECTRICITY_FR */
    private String energyFactorCode = "ELECTRICITY_FR";

    @Valid
    private List<MaterialRequest> materials = new ArrayList<>();
}
