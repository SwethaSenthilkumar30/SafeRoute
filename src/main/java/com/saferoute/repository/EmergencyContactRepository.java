package com.saferoute.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.saferoute.entity.EmergencyContact;

public interface EmergencyContactRepository extends JpaRepository<EmergencyContact, Long> {

    List<EmergencyContact> findByUserId(Long userId);

    boolean existsByUserIdAndPrimaryContactTrue(Long userId);
}