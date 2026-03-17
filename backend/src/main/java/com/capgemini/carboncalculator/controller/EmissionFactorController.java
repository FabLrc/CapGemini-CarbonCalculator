package com.capgemini.carboncalculator.controller;

import com.capgemini.carboncalculator.entity.EmissionFactor;
import com.capgemini.carboncalculator.repository.EmissionFactorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/emission-factors")
@RequiredArgsConstructor
public class EmissionFactorController {

    private final EmissionFactorRepository emissionFactorRepository;

    @GetMapping
    public ResponseEntity<List<EmissionFactor>> getAll() {
        return ResponseEntity.ok(emissionFactorRepository.findAll());
    }
}
