package com.saferoute.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.saferoute.entity.EmergencyContact;
import com.saferoute.repository.EmergencyContactRepository;

@Service
public class EmergencyContactService {

    private final EmergencyContactRepository emergencyContactRepository;

    public EmergencyContactService(EmergencyContactRepository emergencyContactRepository) {
        this.emergencyContactRepository = emergencyContactRepository;
    }

    // Add emergency contact
    public EmergencyContact addContact(EmergencyContact contact) {
        return emergencyContactRepository.save(contact);
    }

    // Get all contacts of a user
    public List<EmergencyContact> getContactsByUserId(Long userId) {
        return emergencyContactRepository.findByUserId(userId);
    }

    // Get contact by ID
    public EmergencyContact getContactById(Long id) {
        return emergencyContactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Emergency contact not found"));
    }

    // Update contact
    public EmergencyContact updateContact(Long id, EmergencyContact updatedContact) {

        EmergencyContact existingContact = getContactById(id);

        existingContact.setFullName(updatedContact.getFullName());
        existingContact.setPhoneNumber(updatedContact.getPhoneNumber());
        existingContact.setRelationship(updatedContact.getRelationship());

        return emergencyContactRepository.save(existingContact);
    }

    // Delete contact
    public void deleteContact(Long id) {
        EmergencyContact contact = getContactById(id);
        emergencyContactRepository.delete(contact);
    }

    // Set primary contact
    public EmergencyContact setPrimaryContact(Long id) {

        EmergencyContact contact = getContactById(id);

        List<EmergencyContact> contacts =
                emergencyContactRepository.findByUserId(contact.getUserId());

        for (EmergencyContact existingContact : contacts) {
            existingContact.setPrimaryContact(false);
        }

        contact.setPrimaryContact(true);

        emergencyContactRepository.saveAll(contacts);

        return contact;
    }
}