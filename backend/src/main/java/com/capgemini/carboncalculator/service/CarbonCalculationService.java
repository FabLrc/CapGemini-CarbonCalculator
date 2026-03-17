package com.capgemini.carboncalculator.service;

import com.capgemini.carboncalculator.entity.EmissionFactor;
import com.capgemini.carboncalculator.entity.Site;
import com.capgemini.carboncalculator.entity.SiteMaterial;
import com.capgemini.carboncalculator.repository.EmissionFactorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CarbonCalculationService {

    private final EmissionFactorRepository emissionFactorRepository;

    /**
     * Calcule et met à jour les valeurs CO₂ d'un site.
     * co2Construction = somme(matériaux × facteur d'émission)
     * co2Exploitation  = énergie annuelle × facteur du mix énergétique choisi par le site
     */
    public void calculate(Site site) {
        double co2Construction = 0.0;

        for (SiteMaterial material : site.getMaterials()) {
            double co2 = material.getQuantityKg() * material.getEmissionFactor().getKgCo2ePerUnit();
            material.setCo2Kg(co2);
            co2Construction += co2;
        }

        String energyCode = (site.getEnergyFactorCode() != null && !site.getEnergyFactorCode().isBlank())
                ? site.getEnergyFactorCode() : "ELECTRICITY_FR";

        EmissionFactor energyFactor = emissionFactorRepository.findByCode(energyCode)
                .or(() -> emissionFactorRepository.findByCode("ELECTRICITY_FR"))
                .orElseThrow(() -> new IllegalStateException("Facteur énergétique introuvable : " + energyCode));

        double co2Exploitation = site.getAnnualEnergyKwh() * energyFactor.getKgCo2ePerUnit();

        site.setCo2Construction(co2Construction);
        site.setCo2Exploitation(co2Exploitation);
    }
}
