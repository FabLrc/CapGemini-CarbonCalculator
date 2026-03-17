package com.capgemini.carboncalculator.controller;

import com.capgemini.carboncalculator.service.AdminService;
import com.capgemini.carboncalculator.service.AdminService.SyncResult;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    /**
     * Synchronise les facteurs d'émission avec les valeurs de référence ADEME Base Carbone.
     * Réservé au SUPER_ADMIN.
     */
    @PostMapping("/emission-factors/sync")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> syncAdemeFactors() {
        SyncResult result = adminService.syncAdemeFactors();
        return ResponseEntity.ok(Map.of(
            "status", "OK",
            "source", "ADEME Base Carbone 2024",
            "total", result.total(),
            "created", result.created(),
            "updated", result.updated()
        ));
    }
}
