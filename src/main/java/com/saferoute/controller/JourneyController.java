
package com.saferoute.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.saferoute.entity.Journey;
import com.saferoute.service.JourneyService;

@RestController
@RequestMapping("/api/journeys")
@CrossOrigin(origins = "http://localhost:5173")
public class JourneyController {

    private final JourneyService journeyService;

    public JourneyController(JourneyService journeyService) {
        this.journeyService = journeyService;
    }

    // Add journey
    @PostMapping
    public Journey addJourney(@RequestBody Journey journey) {
        return journeyService.saveJourney(journey);
    }

    // Get all journeys of a user
    @GetMapping("/user/{userId}")
    public List<Journey> getUserJourneys(@PathVariable Long userId) {
        return journeyService.getUserJourneys(userId);
    }

    // Delete journey
    @DeleteMapping("/{journeyId}")
    public String deleteJourney(@PathVariable Long journeyId) {
        journeyService.deleteJourney(journeyId);
        return "Journey deleted successfully";
    }

    // Update journey
    @PutMapping("/{journeyId}")
    public Journey updateJourney(
            @PathVariable Long journeyId,
            @RequestBody Journey journey) {
        return journeyService.updateJourney(journeyId, journey);
    }

    // Start journey
    @PatchMapping("/{journeyId}/start")
    public Journey startJourney(@PathVariable Long journeyId) {
        return journeyService.startJourney(journeyId);
    }

    // Confirm safe arrival
    @PatchMapping("/{journeyId}/complete")
    public Journey completeJourney(@PathVariable Long journeyId) {
        return journeyService.completeJourney(journeyId);
    }
}
