
package com.saferoute.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.saferoute.entity.SafetyChecklistProgress;

public interface SafetyChecklistRepository
        extends JpaRepository<SafetyChecklistProgress, Long> {

    List<SafetyChecklistProgress> findByUser_Id(Long userId);

    void deleteByUser_Id(Long userId);
}
