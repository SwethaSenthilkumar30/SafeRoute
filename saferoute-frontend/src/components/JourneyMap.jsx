
import { useState, useEffect } from 'react';

import {
    MapContainer,
    TileLayer,
    Marker,
    Polyline,
    Popup,
    useMap
} from 'react-leaflet';

import L from 'leaflet';

import 'leaflet/dist/leaflet.css';
import './JourneyMap.css';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet marker icons in Vite
const defaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const API = 'https://nominatim.openstreetmap.org/search';

// Automatically adjust map to show both locations
function MapUpdater({ locations }) {
    const map = useMap();

    useEffect(() => {
        if (locations.length === 2) {
            const bounds = L.latLngBounds(locations);
            map.fitBounds(bounds, {
                padding: [50, 50],
                maxZoom: 13
            });
        }
    }, [locations, map]);

    return null;
}

function JourneyMap({
    source,
    destination,
    travelType,
    onRouteCalculated
}) {
    const [locations, setLocations] = useState([]);
    const [route, setRoute] = useState([]);
    const [distance, setDistance] = useState('');
    const [duration, setDuration] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Search for a location in India
    const searchLocation = async (place) => {
        const searchQuery = `${place.trim()}, India`;

        const response = await fetch(
            `${API}?format=jsonv2&q=${encodeURIComponent(
                searchQuery
            )}&limit=5&countrycodes=in&addressdetails=1`
        );

        if (!response.ok) {
            throw new Error('Location search failed. Please try again.');
        }

        const data = await response.json();

        if (!data || data.length === 0) {
            throw new Error(`Location not found in India: ${place}`);
        }

        console.log(`Search results for ${place}:`, data);

        const selectedLocation = data[0];

        const latitude = Number(selectedLocation.lat);
        const longitude = Number(selectedLocation.lon);

        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
        ) {
            throw new Error(`Invalid coordinates for ${place}`);
        }

        return {
            lat: latitude,
            lng: longitude,
            name: selectedLocation.display_name
        };
    };

    // Calculate and display route
    const handleShowRoute = async () => {
        if (!source.trim() || !destination.trim()) {
            setError(
                'Please enter both starting location and destination.'
            );
            return;
        }

        if (travelType === 'Train' || travelType === 'Flight') {
            setError(
                'Road route preview is currently available for Car and Bus journeys.'
            );
            return;
        }

        try {
            setLoading(true);
            setError('');

            // Clear previous route
            setRoute([]);
            setLocations([]);
            setDistance('');
            setDuration('');

            // Clear previously calculated route information
            onRouteCalculated(null);

            // Find starting location
            const start = await searchLocation(source);

            // Delay between public geocoding requests
            await new Promise(resolve => setTimeout(resolve, 1100));

            // Find destination
            const end = await searchLocation(destination);

            console.log('Starting coordinates:', start);
            console.log('Destination coordinates:', end);

            // Get road route from OSRM
            const response = await fetch(
                `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
            );

            if (!response.ok) {
                throw new Error('Unable to calculate route.');
            }

            const data = await response.json();

            if (data.code !== 'Ok' || !data.routes?.length) {
                throw new Error(
                    'No road route found between these locations.'
                );
            }

            const selectedRoute = data.routes[0];

            // Convert coordinates for Leaflet
            const coordinates =
                selectedRoute.geometry.coordinates.map(
                    ([lng, lat]) => [lat, lng]
                );

            const distanceKm = Number(
                (selectedRoute.distance / 1000).toFixed(2)
            );

            const durationMinutes = Math.round(
                selectedRoute.duration / 60
            );

            // Update map
            setLocations([start, end]);
            setRoute(coordinates);
            setDistance(distanceKm.toFixed(2));
            setDuration(String(durationMinutes));

            // Send route details to Journey.jsx
            onRouteCalculated({
                sourceLatitude: start.lat,
                sourceLongitude: start.lng,
                destinationLatitude: end.lat,
                destinationLongitude: end.lng,
                distanceKm: distanceKm,
                estimatedDurationMinutes: durationMinutes,
                routeGeometry: JSON.stringify(
                    selectedRoute.geometry
                )
            });

        } catch (err) {
            console.error('Journey Map Error:', err);

            setError(
                err.message || 'Unable to display route.'
            );

            setLocations([]);
            setRoute([]);
            setDistance('');
            setDuration('');

            onRouteCalculated(null);

        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="journey-map-card">

            <div className="journey-map-heading">
                <div>
                    <h3>Interactive Journey Route</h3>
                    <p>
                        View the route between your starting point
                        and destination.
                    </p>
                </div>
            </div>

            <button
                type="button"
                className="show-route-btn"
                onClick={handleShowRoute}
                disabled={loading}
            >
                {loading
                    ? 'Finding Route...'
                    : 'Show Journey Route'}
            </button>

            {error && (
                <div className="map-error">
                    {error}
                </div>
            )}

            {distance && duration && (
                <div className="route-summary">

                    <div>
                        <strong>{distance} km</strong>
                        <span>Estimated Distance</span>
                    </div>

                    <div>
                        <strong>{duration} minutes</strong>
                        <span>Estimated Duration</span>
                    </div>

                </div>
            )}

            <div className="journey-map-container">

                <MapContainer
                    center={[20.5937, 78.9629]}
                    zoom={5}
                    scrollWheelZoom={true}
                    className="journey-leaflet-map"
                >

                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {locations.map((location, index) => (
                        <Marker
                            key={`${location.lat}-${location.lng}-${index}`}
                            position={[
                                location.lat,
                                location.lng
                            ]}
                            icon={defaultIcon}
                        >
                            <Popup>
                                <strong>
                                    {index === 0
                                        ? 'Starting Location'
                                        : 'Destination'}
                                </strong>

                                <br />

                                {location.name}
                            </Popup>
                        </Marker>
                    ))}

                    {route.length > 0 && (
                        <Polyline
                            positions={route}
                            pathOptions={{
                                color: '#632f43',
                                weight: 5,
                                opacity: 0.85
                            }}
                        />
                    )}

                    <MapUpdater
                        locations={locations.map(location => [
                            location.lat,
                            location.lng
                        ])}
                    />

                </MapContainer>

            </div>

            <p className="map-disclaimer">
                Route distance and duration are estimates.
                Live traffic is not included.
            </p>

        </section>
    );
}

export default JourneyMap;
