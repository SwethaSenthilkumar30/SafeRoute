package com.saferoute.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.saferoute.entity.EmergencyContact;
import com.saferoute.service.EmergencyContactService;

@RestController
@RequestMapping("/api/emergency-contacts")
@CrossOrigin(origins = "http://localhost:5173")
public class EmergencyContactController {

    private final EmergencyContactService emergencyContactService;

    public EmergencyContactController(EmergencyContactService emergencyContactService) {
        this.emergencyContactService = emergencyContactService;
    }

    // Add emergency contact
    @PostMapping
    public EmergencyContact addContact(@RequestBody EmergencyContact contact) {
        return emergencyContactService.addContact(contact);
    }

    // Get all contacts for a user
    @GetMapping("/user/{userId}")
    public List<EmergencyContact> getContacts(@PathVariable Long userId) {
        return emergencyContactService.getContactsByUserId(userId);
    }

    // Update emergency contact
    @PutMapping("/{id}")
    public EmergencyContact updateContact(
            @PathVariable Long id,
            @RequestBody EmergencyContact contact) {
        return emergencyContactService.updateContact(id, contact);
    }

    // Delete emergency contact
    @DeleteMapping("/{id}")
    public String deleteContact(@PathVariable Long id) {
        emergencyContactService.deleteContact(id);
        return "Emergency contact deleted successfully";
    }

    // Set primary contact
    @PatchMapping("/{id}/primary")
    public EmergencyContact setPrimaryContact(@PathVariable Long id) {
        return emergencyContactService.setPrimaryContact(id);
    }
}