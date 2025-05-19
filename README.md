# CitizenVoice

CitizenVoice is a full-stack complaint submission and tracking platform that enables:

* **Citizens**: Submit complaints, track statuses, and view responses.
* **Institutions**: Review and manage complaints routed to their department after admin approval.
* **Admins**: Oversee all complaints, approve institution registrations, and manage the system.

---

## Table of Contents

 [Features](#features)
 [Tech Stack](#tech-stack)
 [Getting Started](#getting-started)
   [Prerequisites](#prerequisites)
   [Environment Variables](#environment-variables)
   [Backend Setup](#backend-setup)
   [Frontend Setup](#frontend-setup)
 [API Endpoints](#api-endpoints)
 [User Flows](#user-flows)
   [Citizen Registration & Login](#citizen-registration--login)
   [Institution Self-Registration & Approval](institution-self-registration-and-approval)
   [Admin Dashboard](#admin-dashboard)
 [Directory Structure](#directory-structure)
 [Contributing](#contributing)
 [License](#license)

---

## Features

* **Role-based access**: Citizen, Institution, Admin
* **Complaint lifecycle**: Create → Assign → Update status → Respond
* **Institution self‑service**: Institutions sign up and await admin approval
* **Admin control**: View all complaints, approve institutions, and monitor key metrics
* **Real‑time data**: Frontend fetches live data via REST API

---

## Tech Stack

* **Backend**: Node.js, Express, MongoDB (Mongoose)
* **Authentication**: JSON Web Tokens (JWT)
* **Frontend**: React, React Router, Axios, Tailwind CSS

---

## Getting Started

### Prerequisites

* Node.js v16+ and npm
* MongoDB Atlas (or local MongoDB)
* Git

### Environment Variables

Create two `.env` files:

#### For Backend (`server/.env`)

PORT=3001
MONGODB_URI=mongodb+srv://dbUser:dbUserPassword@cluster0.aad0hmf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=jwtSecret!
FRONTEND_URL=<http://localhost:3000>

#### For Frontend (`client/.env`)

REACT_APP_API_URL=<http://localhost:3001/api>

---

### Backend Setup

```bash
cd server
npm install
npx nodemon server   # starts on http://localhost:3001
```

### Frontend Setup

```bash
cd client
npm install
npm start     # starts on http://localhost:3000
```

---

## API Endpoints

### Authentication

| Method | Endpoint                         | Description                                       |
| ------ | -------------------------------- | ------------------------------------------------- |
| POST   | `/api/auth/register`             | Register citizen or institution (pending)         |
| POST   | `/api/auth/login`                | Login and receive JWT                             |
| GET    | `/api/auth/pending-institutions` | *(Admin only)* List institutions pending approval |
| PUT    | `/api/auth/approve/:id`          | *(Admin only)* Approve pending institution        |

### Complaints

| Method | Endpoint                                | Description                        |
| ------ | --------------------------------------- | ---------------------------------- |
| POST   | `/api/complaints`                       | Create a new complaint             |
| GET    | `/api/complaints`                       | List all complaints (admin)        |
| GET    | `/api/complaints/citizen/:id`           | List complaints by citizen         |
| GET    | `/api/complaints/institution/:category` | List complaints for an institution |
| GET    | `/api/complaints/:id`                   | Get a single complaint             |
| PUT    | `/api/complaints/:id`                   | Update status / add history        |
| POST   | `/api/complaints/:id/responses`         | Add a response to a complaint      |

---

## User Flows

### Citizen Registration & Login

1. **Register** on `/register` as a *Citizen*.
2. **Login** on `/login`, selecting "Citizen".
3. **Dashboard**: View `CitizenDashboard`, submit new complaints, and track status.

### Institution Self‑Registration & Approval

1. **Register** on `/register` selecting "Institution" and choosing a department.
2. **Pending**: See "Pending Approval" page until admin approves.
3. **Login** on `/login`, selecting "Institution".
4. **Dashboard**: View `InstitutionDashboard`, showing complaints routed to their category.

### Admin Dashboard

1. **Login** on `/login`, selecting "Admin".
2. **Dashboard**: View `Admin`, including metrics, recent complaints, and pending institution approvals.
3. **Approve Institutions**: In "Pending Institutions" section, click *Approve* to activate an institution account.
4. **Manage Complaints**: View, filter, and navigate to any complaint details.

---

## Directory Structure

/clients
  public/
   index.html
  src/
   components/
      Navigation.js
      ProtectedRoute.js
    context/
      AppContext.js
    data/
      mockData.js
    pages/
      Home.js
      Login.js
      Registration.js
      InstitutionPending.js
      Submit.js
      Status.js
      ComplaintDetail.js
      CitizenDashboard.js
      InstitutionDashboard.js
      Admin.js
  api.js
  App.css
  App.js
  App.test.js
  index.css
  index.js
  .env

/server
  server.js
  .env
  package.json
  /model
    User.js
    Complaint.js
  /routes
    auth.js
    complaints.js
  /controllers
    auth.js
    complaints.js
    login.js
    registration.js
  /middleware
    auth.js

---

## Contributing

1. Fork the repo and create your branch: `git checkout -b feature/YourFeature`
2. Commit your changes: `git commit -m 'Add YourFeature'`
3. Push to the branch: `git push origin feature/YourFeature`
4. Open a pull request

---

## License

MIT © Bahati Steven
