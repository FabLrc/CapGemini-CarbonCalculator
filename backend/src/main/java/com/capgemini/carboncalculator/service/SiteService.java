package com.capgemini.carboncalculator.service;

import com.capgemini.carboncalculator.dto.site.MaterialRequest;
import com.capgemini.carboncalculator.dto.site.SnapshotResponse;
import com.capgemini.carboncalculator.dto.site.SiteRequest;
import com.capgemini.carboncalculator.dto.site.SiteResponse;
import com.capgemini.carboncalculator.entity.*;
import com.capgemini.carboncalculator.repository.EmissionFactorRepository;
import com.capgemini.carboncalculator.repository.OrganizationRepository;
import com.capgemini.carboncalculator.repository.SiteRepository;
import com.capgemini.carboncalculator.repository.SiteSnapshotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SiteService {

    private final SiteRepository siteRepository;
    private final OrganizationRepository organizationRepository;
    private final EmissionFactorRepository emissionFactorRepository;
    private final CarbonCalculationService calculationService;
    private final SiteSnapshotRepository snapshotRepository;

    @Transactional
    public SiteResponse createSite(SiteRequest request, User currentUser) {
        if (currentUser.getOrganization() == null) {
            throw new AccessDeniedException("SUPER_ADMIN doit spécifier une organisation");
        }

        String energyCode = resolveEnergyCode(request.getEnergyFactorCode());

        Site site = Site.builder()
                .name(request.getName())
                .description(request.getDescription())
                .location(request.getLocation())
                .totalAreaM2(request.getTotalAreaM2())
                .parkingSpaces(request.getParkingSpaces())
                .annualEnergyKwh(request.getAnnualEnergyKwh())
                .employeeCount(request.getEmployeeCount())
                .constructionYear(request.getConstructionYear())
                .energyFactorCode(energyCode)
                .organization(currentUser.getOrganization())
                .createdBy(currentUser)
                .build();

        for (MaterialRequest mr : request.getMaterials()) {
            EmissionFactor factor = emissionFactorRepository.findByCode(mr.getEmissionFactorCode())
                    .orElseThrow(() -> new IllegalArgumentException("Facteur inconnu : " + mr.getEmissionFactorCode()));
            SiteMaterial material = SiteMaterial.builder()
                    .site(site)
                    .emissionFactor(factor)
                    .quantityKg(mr.getQuantityKg())
                    .build();
            site.getMaterials().add(material);
        }

        calculationService.calculate(site);
        Site saved = siteRepository.save(site);
        saveSnapshot(saved, "Création");
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<SiteResponse> getSitesForUser(User currentUser) {
        if (currentUser.getRole() == Role.SUPER_ADMIN) {
            return siteRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
        }
        return siteRepository
                .findByOrganizationIdOrderByCreatedAtDesc(currentUser.getOrganization().getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SiteResponse getSiteById(Long id, User currentUser) {
        Site site = siteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Site introuvable : " + id));
        assertAccess(site, currentUser);
        return toResponse(site);
    }

    @Transactional
    public SiteResponse updateSite(Long id, SiteRequest request, User currentUser) {
        Site site = siteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Site introuvable : " + id));
        assertAccess(site, currentUser);

        site.setName(request.getName());
        site.setDescription(request.getDescription());
        site.setLocation(request.getLocation());
        site.setTotalAreaM2(request.getTotalAreaM2());
        site.setParkingSpaces(request.getParkingSpaces());
        site.setAnnualEnergyKwh(request.getAnnualEnergyKwh());
        site.setEmployeeCount(request.getEmployeeCount());
        site.setConstructionYear(request.getConstructionYear());
        site.setEnergyFactorCode(resolveEnergyCode(request.getEnergyFactorCode()));

        site.getMaterials().clear();
        for (MaterialRequest mr : request.getMaterials()) {
            EmissionFactor factor = emissionFactorRepository.findByCode(mr.getEmissionFactorCode())
                    .orElseThrow(() -> new IllegalArgumentException("Facteur inconnu : " + mr.getEmissionFactorCode()));
            site.getMaterials().add(SiteMaterial.builder()
                    .site(site)
                    .emissionFactor(factor)
                    .quantityKg(mr.getQuantityKg())
                    .build());
        }

        calculationService.calculate(site);
        Site saved = siteRepository.save(site);
        saveSnapshot(saved, "Mise à jour");
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<SnapshotResponse> getSnapshots(Long siteId, User currentUser) {
        Site site = siteRepository.findById(siteId)
                .orElseThrow(() -> new IllegalArgumentException("Site introuvable : " + siteId));
        assertAccess(site, currentUser);
        return snapshotRepository.findBySiteIdOrderBySnapshotDateAsc(siteId)
                .stream().map(this::toSnapshotResponse).collect(Collectors.toList());
    }

    @Transactional
    public void deleteSite(Long id, User currentUser) {
        Site site = siteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Site introuvable : " + id));
        assertAccess(site, currentUser);
        // Initialize the lazy collection so Hibernate issues DELETE (not SET NULL) for orphans
        site.getMaterials().size();
        site.getMaterials().clear();
        siteRepository.delete(site);
    }

    private void assertAccess(Site site, User user) {
        if (user.getRole() == Role.SUPER_ADMIN) return;
        if (!site.getOrganization().getId().equals(user.getOrganization().getId())) {
            throw new AccessDeniedException("Accès refusé à ce site");
        }
    }

    private SiteResponse toResponse(Site site) {
        double co2Total = (site.getCo2Construction() != null ? site.getCo2Construction() : 0.0)
                        + (site.getCo2Exploitation() != null ? site.getCo2Exploitation() : 0.0);

        List<SiteResponse.MaterialResponse> materials = site.getMaterials().stream()
                .map(m -> SiteResponse.MaterialResponse.builder()
                        .id(m.getId())
                        .factorCode(m.getEmissionFactor().getCode())
                        .factorLabel(m.getEmissionFactor().getLabel())
                        .quantityKg(m.getQuantityKg())
                        .co2Kg(m.getCo2Kg())
                        .build())
                .collect(Collectors.toList());

        String energyLabel = emissionFactorRepository.findByCode(site.getEnergyFactorCode())
                .map(EmissionFactor::getLabel).orElse(site.getEnergyFactorCode());

        return SiteResponse.builder()
                .id(site.getId())
                .name(site.getName())
                .description(site.getDescription())
                .location(site.getLocation())
                .totalAreaM2(site.getTotalAreaM2())
                .parkingSpaces(site.getParkingSpaces())
                .annualEnergyKwh(site.getAnnualEnergyKwh())
                .employeeCount(site.getEmployeeCount())
                .constructionYear(site.getConstructionYear())
                .energyFactorCode(site.getEnergyFactorCode())
                .energyLabel(energyLabel)
                .co2Construction(site.getCo2Construction())
                .co2Exploitation(site.getCo2Exploitation())
                .co2Total(co2Total)
                .co2PerM2(site.getTotalAreaM2() > 0 ? co2Total / site.getTotalAreaM2() : null)
                .co2PerEmployee(site.getEmployeeCount() > 0 ? co2Total / site.getEmployeeCount() : null)
                .materials(materials)
                .organizationId(site.getOrganization().getId())
                .organizationName(site.getOrganization().getName())
                .createdByName(site.getCreatedBy().getFirstName() + " " + site.getCreatedBy().getLastName())
                .createdAt(site.getCreatedAt())
                .updatedAt(site.getUpdatedAt())
                .build();
    }

    private String resolveEnergyCode(String code) {
        return (code != null && !code.isBlank()) ? code : "ELECTRICITY_FR";
    }

    private void saveSnapshot(Site site, String note) {
        double co2Total = (site.getCo2Construction() != null ? site.getCo2Construction() : 0.0)
                        + (site.getCo2Exploitation() != null ? site.getCo2Exploitation() : 0.0);
        snapshotRepository.save(SiteSnapshot.builder()
                .site(site)
                .co2Construction(site.getCo2Construction())
                .co2Exploitation(site.getCo2Exploitation())
                .co2Total(co2Total)
                .co2PerM2(site.getTotalAreaM2() > 0 ? co2Total / site.getTotalAreaM2() : null)
                .co2PerEmployee(site.getEmployeeCount() > 0 ? co2Total / site.getEmployeeCount() : null)
                .annualEnergyKwh(site.getAnnualEnergyKwh())
                .energyFactorCode(site.getEnergyFactorCode())
                .note(note)
                .build());
    }

    private SnapshotResponse toSnapshotResponse(SiteSnapshot s) {
        return SnapshotResponse.builder()
                .id(s.getId())
                .snapshotDate(s.getSnapshotDate())
                .co2Construction(s.getCo2Construction())
                .co2Exploitation(s.getCo2Exploitation())
                .co2Total(s.getCo2Total())
                .co2PerM2(s.getCo2PerM2())
                .co2PerEmployee(s.getCo2PerEmployee())
                .annualEnergyKwh(s.getAnnualEnergyKwh())
                .energyFactorCode(s.getEnergyFactorCode())
                .note(s.getNote())
                .build();
    }
}
