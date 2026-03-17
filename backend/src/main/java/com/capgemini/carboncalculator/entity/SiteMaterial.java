package com.capgemini.carboncalculator.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "site_materials")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SiteMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id", nullable = false)
    private Site site;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emission_factor_id", nullable = false)
    private EmissionFactor emissionFactor;

    /** Quantité en kg */
    @Column(name = "quantity_kg", nullable = false)
    private Double quantityKg;

    /** CO₂ calculé pour ce matériau (kgCO₂e) */
    @Column(name = "co2_kg")
    private Double co2Kg;
}
