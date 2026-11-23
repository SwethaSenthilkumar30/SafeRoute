
package com.saferoute.controller;

import java.util.List;
import java.util.Set;

import org.springframework.web.bind.annotation.*;

import com.saferoute.service.SafetyChecklistService;

@RestController
@RequestMapping("/api/safety-checklist")
@CrossOrigin(origins = "http://localhost:5173")
public class SafetyChecklistController {

    private final SafetyChecklistService service;

    public SafetyChecklistController(
            SafetyChecklistService service) {
        this.service = service;
    }

    @GetMapping("/{userId}")
    public Set<String> getChecklist(
            @PathVariable Long userId) {

        return service.getChecklist(userId);
    }

    @PutMapping("/{userId}")
    public Set<String> saveChecklist(
            @PathVariable Long userId,
            @RequestBody List<String> checkedItems) {

        return service.saveChecklist(userId, checkedItems);
    }
}
