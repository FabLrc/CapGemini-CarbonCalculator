package com.capgemini.carboncalculator.repository;

import com.capgemini.carboncalculator.entity.EmissionFactor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmissionFactorRepository extends JpaRepository<EmissionFactor, Long> {
    Optional<EmissionFactor> findByCode(String code);
    List<EmissionFactor> findByCategory(EmissionFactor.EmissionCategory category);
}
