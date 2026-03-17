package com.capgemini.carboncalculator.repository;

import com.capgemini.carboncalculator.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    Optional<Organization> findByName(String name);
    boolean existsByName(String name);
}
