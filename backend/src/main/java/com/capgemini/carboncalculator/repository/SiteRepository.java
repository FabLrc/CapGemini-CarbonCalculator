package com.capgemini.carboncalculator.repository;

import com.capgemini.carboncalculator.entity.Site;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SiteRepository extends JpaRepository<Site, Long> {

    List<Site> findByOrganizationIdOrderByCreatedAtDesc(Long organizationId);

    @Query("SELECT s FROM Site s WHERE s.organization.id = :orgId AND s.co2Construction IS NOT NULL")
    List<Site> findCalculatedByOrganizationId(Long orgId);
}
