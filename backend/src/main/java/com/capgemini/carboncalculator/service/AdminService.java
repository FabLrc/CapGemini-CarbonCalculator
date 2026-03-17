package com.capgemini.carboncalculator.service;

import com.capgemini.carboncalculator.entity.EmissionFactor;
import com.capgemini.carboncalculator.entity.EmissionFactor.CsrdScope;
import com.capgemini.carboncalculator.entity.EmissionFactor.EmissionCategory;
import com.capgemini.carboncalculator.repository.EmissionFactorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Synchronisation des facteurs d'émission ADEME Base Carbone.
 * Dans une future intégration réelle, cette méthode appellerait l'API ADEME.
 * Pour l'instant elle s'assure que les valeurs de référence sont à jour en base.
 */
@Service
@RequiredArgsConstructor
public class AdminService {

    private final EmissionFactorRepository emissionFactorRepository;

    @Transactional
    public SyncResult syncAdemeFactors() {
        List<EmissionFactor> canonical = buildCanonicalFactors();
        Map<String, EmissionFactor> existing = emissionFactorRepository.findAll()
                .stream().collect(Collectors.toMap(EmissionFactor::getCode, Function.identity()));

        int created = 0;
        int updated = 0;

        for (EmissionFactor ref : canonical) {
            EmissionFactor ef = existing.get(ref.getCode());
            if (ef == null) {
                emissionFactorRepository.save(ref);
                created++;
            } else if (!ef.getKgCo2ePerUnit().equals(ref.getKgCo2ePerUnit())
                    || !ref.getScope().equals(ef.getScope())) {
                ef.setKgCo2ePerUnit(ref.getKgCo2ePerUnit());
                ef.setScope(ref.getScope());
                ef.setSource(ref.getSource());
                emissionFactorRepository.save(ef);
                updated++;
            }
        }

        return new SyncResult(created, updated, canonical.size());
    }

    public record SyncResult(int created, int updated, int total) {}

    private List<EmissionFactor> buildCanonicalFactors() {
        final String SRC = "ADEME Base Carbone 2024";
        return List.of(
            // --- MATÉRIAUX (Scope 3) ---
            ef("CONCRETE",            "Béton ordinaire",              EmissionCategory.MATERIAL, 0.159,  "kg", SRC, CsrdScope.SCOPE_3),
            ef("CONCRETE_REINFORCED", "Béton armé",                   EmissionCategory.MATERIAL, 0.210,  "kg", SRC, CsrdScope.SCOPE_3),
            ef("STEEL",               "Acier",                        EmissionCategory.MATERIAL, 1.770,  "kg", SRC, CsrdScope.SCOPE_3),
            ef("STEEL_RECYCLED",      "Acier recyclé",                EmissionCategory.MATERIAL, 0.510,  "kg", SRC, CsrdScope.SCOPE_3),
            ef("WOOD",                "Bois (général)",               EmissionCategory.MATERIAL, 0.110,  "kg", SRC, CsrdScope.SCOPE_3),
            ef("WOOD_CLT",            "Bois lamellé-croisé (CLT)",    EmissionCategory.MATERIAL, 0.055,  "kg", SRC, CsrdScope.SCOPE_3),
            ef("ALUMINUM",            "Aluminium vierge",             EmissionCategory.MATERIAL, 8.240,  "kg", SRC, CsrdScope.SCOPE_3),
            ef("ALUMINUM_RECYCLED",   "Aluminium recyclé",            EmissionCategory.MATERIAL, 0.680,  "kg", SRC, CsrdScope.SCOPE_3),
            ef("GLASS",               "Verre",                        EmissionCategory.MATERIAL, 0.850,  "kg", SRC, CsrdScope.SCOPE_3),
            ef("INSULATION_MW",       "Laine minérale",               EmissionCategory.MATERIAL, 1.280,  "kg", SRC, CsrdScope.SCOPE_3),
            ef("INSULATION_CELLULOSE","Ouate de cellulose",           EmissionCategory.MATERIAL, 0.670,  "kg", SRC, CsrdScope.SCOPE_3),
            ef("PVC",                 "PVC",                          EmissionCategory.MATERIAL, 2.410,  "kg", SRC, CsrdScope.SCOPE_3),
            ef("PLASTER",             "Plâtre",                       EmissionCategory.MATERIAL, 0.120,  "kg", SRC, CsrdScope.SCOPE_3),
            ef("POLYSTYRENE_EPS",     "Polystyrène expansé (EPS)",    EmissionCategory.MATERIAL, 3.290,  "kg", SRC, CsrdScope.SCOPE_3),
            ef("BITUMEN",             "Bitume / asphalte",            EmissionCategory.MATERIAL, 0.460,  "kg", SRC, CsrdScope.SCOPE_3),
            // --- ÉNERGIE SCOPE 2 ---
            ef("ELECTRICITY_FR",      "Électricité (France)",         EmissionCategory.ENERGY,   0.052,  "kWh", SRC, CsrdScope.SCOPE_2),
            ef("ELECTRICITY_DE",      "Électricité (Allemagne)",      EmissionCategory.ENERGY,   0.350,  "kWh", SRC, CsrdScope.SCOPE_2),
            ef("ELECTRICITY_EU",      "Électricité (Moyenne UE)",     EmissionCategory.ENERGY,   0.295,  "kWh", SRC, CsrdScope.SCOPE_2),
            ef("SOLAR_PV",            "Solaire photovoltaïque",       EmissionCategory.ENERGY,   0.043,  "kWh", SRC, CsrdScope.SCOPE_2),
            ef("WIND_ONSHORE",        "Éolien terrestre",             EmissionCategory.ENERGY,   0.011,  "kWh", SRC, CsrdScope.SCOPE_2),
            ef("HEAT_PUMP_AIR",       "Pompe à chaleur (air/eau)",    EmissionCategory.ENERGY,   0.032,  "kWh", SRC, CsrdScope.SCOPE_2),
            // --- ÉNERGIE SCOPE 1 ---
            ef("GAS_NATURAL",         "Gaz naturel",                  EmissionCategory.ENERGY,   0.227,  "kWh", SRC, CsrdScope.SCOPE_1),
            ef("GAS_PROPANE",         "Propane / GPL",                EmissionCategory.ENERGY,   0.274,  "kWh", SRC, CsrdScope.SCOPE_1),
            ef("BIOMETHANE",          "Biométhane",                   EmissionCategory.ENERGY,   0.044,  "kWh", SRC, CsrdScope.SCOPE_1)
        );
    }

    private EmissionFactor ef(String code, String label, EmissionCategory cat,
                              double factor, String unit, String source, CsrdScope scope) {
        return EmissionFactor.builder()
                .code(code).label(label).category(cat)
                .kgCo2ePerUnit(factor).unit(unit).source(source).scope(scope)
                .build();
    }
}
