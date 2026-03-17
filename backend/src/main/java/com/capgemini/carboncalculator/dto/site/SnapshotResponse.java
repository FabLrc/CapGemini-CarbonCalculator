package com.capgemini.carboncalculator.dto.site;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class SnapshotResponse {
    private Long id;
    private LocalDateTime snapshotDate;
    private Double co2Construction;
    private Double co2Exploitation;
    private Double co2Total;
    private Double co2PerM2;
    private Double co2PerEmployee;
    private Double annualEnergyKwh;
    private String energyFactorCode;
    private String note;
}
