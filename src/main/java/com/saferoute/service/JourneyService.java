
package com.saferoute.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.saferoute.entity.Journey;
import com.saferoute.repository.JourneyRepository;

@Service
public class JourneyService {

    private final JourneyRepository journeyRepository;

    public JourneyService(JourneyRepository journeyRepository) {
        this.journeyRepository = journeyRepository;
    }

    // Add journey
    public Journey saveJourney(Journey journey) {
        validateRoute(journey);
        return journeyRepository.save(journey);
    }

    // Get all journeys of a user
    public List<Journey> getUserJourneys(Long userId) {
        return journeyRepository.findByUserId(userId);
    }

    // Delete journey
    public void deleteJourney(Long journeyId) {
        journeyRepository.deleteById(journeyId);
    }

    // Update journey
    public Journey updateJourney(Long journeyId, Journey updatedJourney) {

        Journey existingJourney = journeyRepository.findById(journeyId)
                .orElseThrow(() -> new RuntimeException("Journey not found"));

        // Check location changes BEFORE updating existing values
        boolean locationChanged =
                !existingJourney.getSource().equals(updatedJourney.getSource()) ||
                !existingJourney.getDestination().equals(updatedJourney.getDestination());

        // Update basic journey information
        existingJourney.setTitle(updatedJourney.getTitle());
        existingJourney.setSource(updatedJourney.getSource());
        existingJourney.setDestination(updatedJourney.getDestination());
        existingJourney.setTravelDate(updatedJourney.getTravelDate());
        existingJourney.setTravelTime(updatedJourney.getTravelTime());
        existingJourney.setTravelType(updatedJourney.getTravelType());

        // Check whether route information was provided
        boolean routeProvided =
                updatedJourney.getSourceLatitude() != null ||
                updatedJourney.getSourceLongitude() != null ||
                updatedJourney.getDestinationLatitude() != null ||
                updatedJourney.getDestinationLongitude() != null ||
                updatedJourney.getDistanceKm() != null ||
                updatedJourney.getEstimatedDurationMinutes() != null ||
                updatedJourney.getRouteGeometry() != null;

        if (routeProvided) {

            validateRoute(updatedJourney);

            existingJourney.setSourceLatitude(
                    updatedJourney.getSourceLatitude());

            existingJourney.setSourceLongitude(
                    updatedJourney.getSourceLongitude());

            existingJourney.setDestinationLatitude(
                    updatedJourney.getDestinationLatitude());

            existingJourney.setDestinationLongitude(
                    updatedJourney.getDestinationLongitude());

            existingJourney.setDistanceKm(
                    updatedJourney.getDistanceKm());

            existingJourney.setEstimatedDurationMinutes(
                    updatedJourney.getEstimatedDurationMinutes());

            existingJourney.setRouteGeometry(
                    updatedJourney.getRouteGeometry());

        } else if (locationChanged) {

            // Clear old route when locations change
            existingJourney.setSourceLatitude(null);
            existingJourney.setSourceLongitude(null);

            existingJourney.setDestinationLatitude(null);
            existingJourney.setDestinationLongitude(null);

            existingJourney.setDistanceKm(null);
            existingJourney.setEstimatedDurationMinutes(null);
            existingJourney.setRouteGeometry(null);
        }

        return journeyRepository.save(existingJourney);
    }

    // Start journey
    public Journey startJourney(Long journeyId) {

        Journey journey = journeyRepository.findById(journeyId)
                .orElseThrow(() ->
                        new RuntimeException("Journey not found"));

        if (journey.getStatus() == null) {
            journey.setStatus("PLANNED");
        }

        if (!"PLANNED".equals(journey.getStatus())) {
            throw new RuntimeException(
                    "Only planned journeys can be started");
        }

        journey.setStatus("IN_PROGRESS");
        journey.setStartedAt(LocalDateTime.now());

        return journeyRepository.save(journey);
    }

    // Confirm safe arrival
    public Journey completeJourney(Long journeyId) {

        Journey journey = journeyRepository.findById(journeyId)
                .orElseThrow(() ->
                        new RuntimeException("Journey not found"));

        if (!"IN_PROGRESS".equals(journey.getStatus())) {
            throw new RuntimeException(
                    "Start the journey before confirming safe arrival");
        }

        journey.setStatus("COMPLETED");
        journey.setCompletedAt(LocalDateTime.now());

        return journeyRepository.save(journey);
    }

    // Validate route information
    private void validateRoute(Journey journey) {

        Double sourceLat = journey.getSourceLatitude();
        Double sourceLng = journey.getSourceLongitude();

        Double destinationLat = journey.getDestinationLatitude();
        Double destinationLng = journey.getDestinationLongitude();

        // Coordinates must be provided in pairs
        if ((sourceLat == null) != (sourceLng == null)) {
            throw new IllegalArgumentException(
                    "Both starting location coordinates are required");
        }

        if ((destinationLat == null) != (destinationLng == null)) {
            throw new IllegalArgumentException(
                    "Both destination coordinates are required");
        }

        // Validate latitude
        if (sourceLat != null &&
                (sourceLat < -90 || sourceLat > 90)) {
            throw new IllegalArgumentException(
                    "Invalid starting latitude");
        }

        if (destinationLat != null &&
                (destinationLat < -90 || destinationLat > 90)) {
            throw new IllegalArgumentException(
                    "Invalid destination latitude");
        }

        // Validate longitude
        if (sourceLng != null &&
                (sourceLng < -180 || sourceLng > 180)) {
            throw new IllegalArgumentException(
                    "Invalid starting longitude");
        }

        if (destinationLng != null &&
                (destinationLng < -180 || destinationLng > 180)) {
            throw new IllegalArgumentException(
                    "Invalid destination longitude");
        }

        // Validate distance
        if (journey.getDistanceKm() != null &&
                journey.getDistanceKm() < 0) {
            throw new IllegalArgumentException(
                    "Distance cannot be negative");
        }

        // Validate duration
        if (journey.getEstimatedDurationMinutes() != null &&
                journey.getEstimatedDurationMinutes() < 0) {
            throw new IllegalArgumentException(
                    "Duration cannot be negative");
        }
    }
}
