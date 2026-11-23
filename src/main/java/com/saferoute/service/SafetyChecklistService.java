
package com.saferoute.service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;

import com.saferoute.entity.User;
import com.saferoute.entity.SafetyChecklistProgress;
import com.saferoute.repository.SafetyChecklistRepository;

@Service
public class SafetyChecklistService {

    private final SafetyChecklistRepository repository;
    private final EntityManager entityManager;

    public SafetyChecklistService(
            SafetyChecklistRepository repository,
            EntityManager entityManager) {

        this.repository = repository;
        this.entityManager = entityManager;
    }

    public Set<String> getChecklist(Long userId) {

        return repository.findByUser_Id(userId)
                .stream()
                .map(SafetyChecklistProgress::getItemKey)
                .collect(Collectors.toSet());
    }

    @Transactional
    public Set<String> saveChecklist(
            Long userId, List<String> checkedItems) {

        Set<String> allowedItems = Set.of(
            "journey_details",
            "emergency_numbers",
            "phone_charged",
            "identification",
            "check_route",
            "update_contacts"
        );

        if (checkedItems == null ||
                !allowedItems.containsAll(checkedItems)) {
            throw new IllegalArgumentException(
                "Invalid checklist items"
            );
        }

        repository.deleteByUser_Id(userId);

        User user = entityManager.getReference(
            User.class, userId
        );

        List<SafetyChecklistProgress> progressList =
                checkedItems.stream().distinct().map(item -> {

            SafetyChecklistProgress progress =
                    new SafetyChecklistProgress();

            progress.setUser(user);
            progress.setItemKey(item);

            return progress;

        }).collect(Collectors.toList());

        repository.saveAll(progressList);

        return Set.copyOf(checkedItems);
    }
}
