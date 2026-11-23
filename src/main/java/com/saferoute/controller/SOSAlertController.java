
package com.saferoute.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.saferoute.entity.SOSAlert;
import com.saferoute.service.SOSAlertService;

@RestController
@RequestMapping("/api/sos")
@CrossOrigin(origins = "http://localhost:5173")
public class SOSAlertController {

    private final SOSAlertService sosAlertService;

    public SOSAlertController(SOSAlertService sosAlertService) {
        this.sosAlertService = sosAlertService;
    }

    // Create SOS alert
    @PostMapping
    public SOSAlert createAlert(@RequestBody SOSAlert alert) {

        return sosAlertService.createAlert(alert);
    }

    // Get all SOS alerts for a user
    @GetMapping("/user/{userId}")
    public List<SOSAlert> getAlerts(@PathVariable Long userId) {

        return sosAlertService.getAlertsByUserId(userId);
    }

    // Get one SOS alert
    @GetMapping("/{id}/user/{userId}")
    public SOSAlert getAlert(
            @PathVariable Long id,
            @PathVariable Long userId) {

        return sosAlertService.getAlertById(id, userId);
    }

    // Update SOS alert
    @PutMapping("/{id}/user/{userId}")
    public SOSAlert updateAlert(
            @PathVariable Long id,
            @PathVariable Long userId,
            @RequestBody SOSAlert alert) {

        return sosAlertService.updateAlert(id, userId, alert);
    }

    // Resolve SOS alert
    @PatchMapping("/{id}/resolve/user/{userId}")
    public SOSAlert resolveAlert(
            @PathVariable Long id,
            @PathVariable Long userId) {

        return sosAlertService.resolveAlert(id, userId);
    }

    // Delete SOS alert
    @DeleteMapping("/{id}/user/{userId}")
    public String deleteAlert(
            @PathVariable Long id,
            @PathVariable Long userId) {

        sosAlertService.deleteAlert(id, userId);

        return "SOS alert deleted successfully";
    }
}
