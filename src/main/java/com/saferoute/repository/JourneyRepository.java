
package com.saferoute.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.saferoute.entity.Journey;

public interface JourneyRepository extends JpaRepository<Journey, Long> {

    List<Journey> findByUserId(Long userId);

}
