package com.capgemini.carboncalculator.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "emission_factors")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmissionFactor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code; // ex: "CONCRETE", "STEEL", "ELECTRICITY_FR"

    @Column(nullable = false)
    private String label; // ex: "Béton"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmissionCategory category;

    /**
     * Facteur d'émission en kgCO₂e par unité (kg pour matériaux, kWh pour énergie).
     */
    @Column(nullable = false)
    private Double kgCo2ePerUnit;

    private String unit; // "kg", "kWh", "m²"

    private String source; // "ADEME Base Carbone 2024"

    @Enumerated(EnumType.STRING)
    private CsrdScope scope; // Scope 1 / 2 / 3 (conformité CSRD)

    public enum EmissionCategory {
        MATERIAL,   // matériaux de construction
        ENERGY      // consommation énergétique (mix électrique, gaz, renouvelables…)
    }

    public enum CsrdScope {
        SCOPE_1,  // Émissions directes (combustion sur site)
        SCOPE_2,  // Émissions indirectes énergie achetée (électricité, chaleur)
        SCOPE_3   // Autres émissions indirectes (matériaux, amont)
    }
}
