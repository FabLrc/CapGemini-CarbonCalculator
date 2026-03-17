package com.capgemini.carboncalculator.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sites")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Site {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    private String location;

    /** Surface totale en m² */
    @Column(name = "total_area_m2", nullable = false)
    private Double totalAreaM2;

    /** Nombre de places de parking */
    @Column(name = "parking_spaces", nullable = false)
    private Integer parkingSpaces;

    /** Consommation énergétique annuelle en kWh */
    @Column(name = "annual_energy_kwh", nullable = false)
    private Double annualEnergyKwh;

    /** Nombre d'employés */
    @Column(name = "employee_count", nullable = false)
    private Integer employeeCount;

    /** Code du facteur d'émission du mix énergétique choisi (ex: ELECTRICITY_FR) */
    @Column(name = "energy_factor_code", nullable = false)
    @Builder.Default
    private String energyFactorCode = "ELECTRICITY_FR";

    /** Année de construction du bâtiment */
    @Column(name = "construction_year")
    private Integer constructionYear;

    /** CO₂ construction calculé (kgCO₂e) — null avant calcul */
    @Column(name = "co2_construction")
    private Double co2Construction;

    /** CO₂ exploitation annuel calculé (kgCO₂e) — null avant calcul */
    @Column(name = "co2_exploitation")
    private Double co2Exploitation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    @OneToMany(mappedBy = "site", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SiteMaterial> materials = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
