
package com.saferoute.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.saferoute.entity.SOSAlert;
import com.saferoute.repository.SOSAlertRepository;

@Service
public class SOSAlertService {

    private final SOSAlertRepository sosAlertRepository;

    public SOSAlertService(SOSAlertRepository sosAlertRepository) {
        this.sosAlertRepository = sosAlertRepository;
    }

    // Create SOS alert
    public SOSAlert createAlert(SOSAlert alert) {

        if (alert.getUserId() == null) {
            throw new IllegalArgumentException("User ID is required");
        }

        validateLocation(alert);

        alert.setStatus("ACTIVE");

        return sosAlertRepository.save(alert);
    }

    // Get all alerts for a user
    public List<SOSAlert> getAlertsByUserId(Long userId) {

        return sosAlertRepository
                .findByUserIdOrderByCreatedAtDesc(userId);
    }

    // Get one alert belonging to a user
    public SOSAlert getAlertById(Long id, Long userId) {

        return sosAlertRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() ->
                        new RuntimeException("SOS alert not found"));
    }

    // Update alert details
    public SOSAlert updateAlert(
            Long id,
            Long userId,
            SOSAlert updatedAlert) {

        SOSAlert existingAlert = getAlertById(id, userId);

        validateLocation(updatedAlert);

        existingAlert.setLatitude(updatedAlert.getLatitude());
        existingAlert.setLongitude(updatedAlert.getLongitude());
        existingAlert.setLocationAddress(
                updatedAlert.getLocationAddress());
        existingAlert.setMessage(updatedAlert.getMessage());

        return sosAlertRepository.save(existingAlert);
    }

    // Resolve SOS alert
    public SOSAlert resolveAlert(Long id, Long userId) {

        SOSAlert alert = getAlertById(id, userId);

        alert.setStatus("RESOLVED");

        return sosAlertRepository.save(alert);
    }

    // Delete SOS alert
    public void deleteAlert(Long id, Long userId) {

        SOSAlert alert = getAlertById(id, userId);

        sosAlertRepository.delete(alert);
    }

    // Validate GPS coordinates
    private void validateLocation(SOSAlert alert) {

        Double latitude = alert.getLatitude();
        Double longitude = alert.getLongitude();

        if ((latitude == null) != (longitude == null)) {
            throw new IllegalArgumentException(
                    "Both latitude and longitude are required together");
        }

        if (latitude != null &&
                (latitude < -90 || latitude > 90)) {
            throw new IllegalArgumentException("Invalid latitude");
        }

        if (longitude != null &&
                (longitude < -180 || longitude > 180)) {
            throw new IllegalArgumentException("Invalid longitude");
        }
    }
}
