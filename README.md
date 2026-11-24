# SafeRoute – Smart Travel Safety and Emergency Assistance System

SafeRoute is a full-stack web application designed to improve travel safety by helping users plan journeys, manage emergency contacts, access SOS assistance, and follow essential safety practices.

## Project Overview

SafeRoute provides a centralized platform for travel planning and emergency assistance. Users can manage their journeys, view routes on an interactive map, maintain emergency contacts, and access safety-related features through a simple interface.

## Key Features

- **User Registration and Login:** User account creation and authentication.
- **Dashboard:** Centralized access to application features.
- **Journey Management:** Add, view, edit, update, and delete journey details.
- **Interactive Route Map:** Visualize journeys using Leaflet and OpenStreetMap.
- **Emergency Contacts:** Manage important emergency contact details.
- **SOS Assistance:** Access emergency assistance features.
- **SOS Alerts:** View and manage SOS alerts.
- **Safety Centre:** Access travel safety information and resources.
- **Safety Checklist:** Track safety checklist progress and reset it when needed.
- **Journey Sharing:** Share journey details using available sharing options, including WhatsApp.

## Technologies Used

### Frontend
- React.js
- JavaScript
- HTML5
- CSS3
- Vite
- Leaflet
- OpenStreetMap

### Backend
- Java
- Spring Boot
- Spring Data JPA
- Hibernate
- REST APIs
- Maven

### Database
- MySQL

### External Services
- OpenStreetMap
- OSRM
- Nominatim

## Project Structure

```text
SafeRoute/
├── saferoute-frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── App.jsx
│       └── main.jsx
│
├── src/
│   └── main/
│       ├── java/com/saferoute/
│       │   ├── controller/
│       │   ├── dto/
│       │   ├── entity/
│       │   ├── repository/
│       │   └── service/
│       │
│       └── resources/
│           └── application.properties
│
├── pom.xml
├── .gitignore
└── README.md
```

## Database Configuration

SafeRoute uses MySQL for storing application data.

The application reads database credentials from environment variables to avoid exposing sensitive information in the source code.

| Variable | Description |
|---|---|
| `DB_NAME` | MySQL database name |
| `DB_USERNAME` | MySQL username |
| `DB_PASSWORD` | MySQL password |

## Learning Outcomes

- Developed a full-stack application using React and Spring Boot.
- Implemented REST API integration.
- Worked with MySQL database connectivity using Spring Data JPA and Hibernate.
- Practiced frontend and backend integration.
- Implemented CRUD operations.
- Integrated interactive maps and route visualization.
- Applied environment variables for database configuration.

## Future Enhancements

- Real-time journey tracking.
- Location-based emergency alerts.
- Enhanced emergency notification features.
- Improved travel safety recommendations.

## Developer

**Swetha SenthilKumar**

- GitHub: [SwethaSenthilKumar30](https://github.com/SwethaSenthilKumar30)
- Project Repository: [SafeRoute](https://github.com/SwethaSenthilKumar30/SafeRoute)

---

*SafeRoute – Making Every Journey Safer.*

