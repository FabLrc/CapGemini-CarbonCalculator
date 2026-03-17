package com.capgemini.carboncalculator.dto.site;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data @Builder
public class SiteResponse {
    private Long id;
    private String name;
    private String description;
    private String location;
    private Double totalAreaM2;
    private Integer parkingSpaces;
    private Double annualEnergyKwh;
    private Integer employeeCount;
    private Integer constructionYear;
    private String energyFactorCode;
    private String energyLabel;
    private Double co2Construction;
    private Double co2Exploitation;
    private Double co2Total;
    private Double co2PerM2;
    private Double co2PerEmployee;
    private List<MaterialResponse> materials;
    private Long organizationId;
    private String organizationName;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data @Builder
    public static class MaterialResponse {
        private Long id;
        private String factorCode;
        private String factorLabel;
        private Double quantityKg;
        private Double co2Kg;
    }
}
