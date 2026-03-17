package com.capgemini.carboncalculator.controller;

import com.capgemini.carboncalculator.dto.site.SnapshotResponse;
import com.capgemini.carboncalculator.dto.site.SiteRequest;
import com.capgemini.carboncalculator.dto.site.SiteResponse;
import com.capgemini.carboncalculator.entity.User;
import com.capgemini.carboncalculator.service.SiteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sites")
@RequiredArgsConstructor
public class SiteController {

    private final SiteService siteService;

    @PostMapping
    public ResponseEntity<SiteResponse> createSite(
            @Valid @RequestBody SiteRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(siteService.createSite(request, currentUser));
    }

    @GetMapping
    public ResponseEntity<List<SiteResponse>> listSites(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(siteService.getSitesForUser(currentUser));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SiteResponse> getSite(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(siteService.getSiteById(id, currentUser));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SiteResponse> updateSite(
            @PathVariable Long id,
            @Valid @RequestBody SiteRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(siteService.updateSite(id, request, currentUser));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSite(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        siteService.deleteSite(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/snapshots")
    public ResponseEntity<List<SnapshotResponse>> getSnapshots(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(siteService.getSnapshots(id, currentUser));
    }
}
