# Hospital Management System (Java Spring Boot + React)

A modern Hospital Management System built with Java Spring Boot for the backend and React for the frontend.

## Features

- User authentication (patients, doctors, admin)
- Appointment booking and management
- Doctor profiles and specializations
- Prescription management
- PDF generation for prescriptions
- Responsive design with Material UI

## Tech Stack

### Backend
- Java 17
- Spring Boot 3.1
- Spring Security with JWT
- Spring Data JPA
- H2 Database (can be replaced with MySQL/PostgreSQL for production)
- iText PDF for PDF generation

### Frontend
- React 18
- Material UI
- React Router
- Formik & Yup for form validation
- Axios for API calls
- JWT Decode for token handling

## Project Structure

```
java-react-hms/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/
│   │   │   │       └── hospital/
│   │   │   │           └── management/
│   │   │   │               ├── config/
│   │   │   │               ├── controller/
│   │   │   │               ├── dto/
│   │   │   │               ├── exception/
│   │   │   │               ├── model/
│   │   │   │               ├── repository/
│   │   │   │               ├── security/
│   │   │   │               └── service/
│   │   │   └── resources/
│   │   └── test/
│   └── pom.xml
└── frontend/
    ├── public/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   └── utils/
    └── package.json
```

## Getting Started

### Prerequisites
- Java 17 or higher
- Node.js 14 or higher
- Maven

### Running the Backend

1. Navigate to the backend directory:
```
cd backend
```

2. Build and run the Spring Boot application:
```
mvn spring-boot:run
```

The backend will start on http://localhost:8081

### Running the Frontend

1. Navigate to the frontend directory:
```
cd frontend
```

2. Install dependencies:
```
npm install
```

3. Start the development server:
```
npm start
```

The frontend will start on http://localhost:3000

## API Endpoints

### Auth
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register a new patient

### Doctors
- `GET /api/doctors/public/all` - Get all doctors (public)
- `GET /api/doctors/public/specialization/{specialization}` - Get doctors by specialization (public)
- `GET /api/doctors/{id}` - Get doctor by ID
- `POST /api/doctors` - Register a new doctor (admin only)
- `PUT /api/doctors/{id}` - Update doctor (admin only)
- `DELETE /api/doctors/{id}` - Delete doctor (admin only)

### Appointments
- `GET /api/appointments` - Get user appointments
- `GET /api/appointments/{id}` - Get appointment by ID
- `POST /api/appointments` - Book appointment (patient only)
- `PUT /api/appointments/{id}/cancel` - Cancel appointment (patient only)
- `PUT /api/appointments/{id}/doctor-cancel` - Cancel appointment (doctor only)
- `PUT /api/appointments/{id}/complete` - Complete appointment (doctor only)

### Prescriptions
- `GET /api/prescriptions` - Get user prescriptions
- `GET /api/prescriptions/{id}` - Get prescription by ID
- `POST /api/prescriptions` - Create prescription (doctor only)
- `PUT /api/prescriptions/{id}/pay` - Mark prescription as paid
- `GET /api/prescriptions/{id}/pdf` - Generate prescription PDF

## Default Admin User

- Email: admin@hospital.com
- Password: admin123

## License

This project is licensed under the MIT License.