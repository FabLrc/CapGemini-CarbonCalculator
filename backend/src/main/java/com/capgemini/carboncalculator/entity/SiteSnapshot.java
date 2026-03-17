package com.capgemini.carboncalculator.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "site_snapshots")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SiteSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id", nullable = false)
    private Site site;

    @Column(name = "snapshot_date", nullable = false)
    @CreationTimestamp
    private LocalDateTime snapshotDate;

    @Column(name = "co2_construction")
    private Double co2Construction;

    @Column(name = "co2_exploitation")
    private Double co2Exploitation;

    @Column(name = "co2_total")
    private Double co2Total;

    @Column(name = "co2_per_m2")
    private Double co2PerM2;

    @Column(name = "co2_per_employee")
    private Double co2PerEmployee;

    @Column(name = "annual_energy_kwh")
    private Double annualEnergyKwh;

    @Column(name = "energy_factor_code", length = 50)
    private String energyFactorCode;

    @Column(name = "note", length = 255)
    private String note;
}
