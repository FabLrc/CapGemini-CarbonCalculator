package com.capgemini.carboncalculator.repository;

import com.capgemini.carboncalculator.entity.SiteSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SiteSnapshotRepository extends JpaRepository<SiteSnapshot, Long> {
    List<SiteSnapshot> findBySiteIdOrderBySnapshotDateAsc(Long siteId);
}
