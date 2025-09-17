# citizen-engagement-mvp

<<<<<<< Updated upstream
Citizen Engagement System that allows citizens to submit complaints or feedback on public services.
=======
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-19.1.0-blue)](https://reactjs.org/)

A comprehensive citizen engagement platform that streamlines the complaint submission and resolution process between citizens, government institutions, and administrative oversight.

##  Overview

CitizenVoice is a full-stack web application designed to bridge the communication gap between citizens and government institutions. The platform provides a transparent, efficient, and accountable system for managing public complaints and service requests.

### Key Stakeholders

- ** Citizens**: Submit complaints, track progress, and receive updates
- ** Institutions**: Manage assigned complaints and provide citizen responses
- ** Administrators**: Oversee system operations and approve institutional access

---

## Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [API Documentation](#-api-documentation)
- [User Workflows](#-user-workflows)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

---

## Features

### Security & Authentication
- JWT-based authentication with role-based access control
- Argon2 password hashing for enhanced security
- Protected routes and API endpoints

### Role-Based System
- **Citizens**: Create and track complaints
- **Institutions**: Manage departmental complaints
- **Admins**: System oversight and institution approval

### Complaint Management
- Complete complaint lifecycle tracking
- Real-time status updates
- Response management system
- History tracking and audit trail

### Institution Management
- Self-registration with admin approval workflow
- Category-based complaint routing
- Department-specific dashboards

### Analytics & Monitoring
- Real-time complaint statistics
- Category-based reporting
- Resolution tracking metrics

---

## Tech Stack

### Backend
- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Security**: Argon2, CORS, Express middleware

### Frontend
- **Framework**: React 19.1
- **Routing**: React Router DOM 7.6
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS 3.4
- **State Management**: React Context API

### Development Tools
- **Backend**: Nodemon, ESLint
- **Frontend**: Create React App, PostCSS, Autoprefixer
- **Testing**: Jest, React Testing Library

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/citizen-engagement-mvp.git
cd citizen-engagement-mvp

# Install and start backend
cd server
npm install
npm run dev

# Install and start frontend (new terminal)
cd ../clients
npm install
npm start
```

**Access the application**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

---

## Installation

### Prerequisites

Ensure you have the following installed:

- **Node.js** v16.0.0 or higher
- **npm** v7.0.0 or higher
- **MongoDB** (Atlas account or local installation)
- **Git** for version control

### System Requirements

- **RAM**: Minimum 4GB recommended
- **Storage**: 500MB free space
- **Network**: Internet connection for MongoDB Atlas

### Step-by-Step Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/citizen-engagement-mvp.git
   cd citizen-engagement-mvp
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd ../clients
   npm install
   ```

4. **Configure Environment Variables** (see [Configuration](#-configuration))

5. **Start Development Servers**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev

   # Terminal 2 - Frontend
   cd clients
   npm start
   ```

---

## ⚙️ Configuration

### Environment Variables

Create the following environment files:

#### Backend Configuration (`server/.env`)

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/citizenvoice?retryWrites=true&w=majority

# Security
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRES_IN=24h

# CORS
FRONTEND_URL=http://localhost:3000

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

#### Frontend Configuration (`clients/.env`)

```env
# API Configuration
REACT_APP_API_URL=http://localhost:3001/api

# App Configuration
REACT_APP_NAME=CitizenVoice
REACT_APP_VERSION=1.0.0

# Development
GENERATE_SOURCEMAP=true
```

### Database Setup

1. **MongoDB Atlas** (Recommended):
   - Create an account at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a new cluster
   - Get your connection string
   - Add to `MONGODB_URI` in `.env`

2. **Local MongoDB**:
   ```bash
   # Install MongoDB locally
   # Ubuntu/Debian
   sudo apt-get install mongodb

   # macOS
   brew install mongodb

   # Start MongoDB service
   sudo systemctl start mongodb
   ```

---

## API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "citizen",
  "category": "Health" // Required for institutions
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "citizen",
  "category": null
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Complaint Endpoints

#### Create Complaint
```http
POST /complaints
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "Street Light Outage",
  "description": "Street light on Main St has been out for 3 days",
  "category": "Infrastructure",
  "location": "123 Main Street",
  "citizen": "john@example.com"
}
```

#### Get All Complaints
```http
GET /complaints?status=Open&category=Health
Authorization: Bearer <jwt-token>
```

#### Update Complaint
```http
PUT /complaints/:id
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "status": "In Progress",
  "note": "Investigation started",
  "updatedBy": "Health Department"
}
```

### Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message description",
  "code": "ERROR_CODE",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## User Workflows

### Citizen Journey

1. **Registration & Setup**
   - Navigate to `/register`
   - Select "Citizen" role
   - Complete registration form
   - Verify email (if configured)

2. **Complaint Submission**
   - Login at `/login`
   - Access dashboard at `/dashboard/citizen`
   - Click "Submit New Complaint"
   - Fill complaint details
   - Submit and receive tracking ID

3. **Tracking & Updates**
   - View complaint status in dashboard
   - Receive real-time updates
   - View institutional responses
   - Track resolution progress

### Institution Workflow

1. **Self-Registration**
   - Register at `/register`
   - Select "Institution" role
   - Choose department category
   - Await admin approval

2. **Complaint Management**
   - Access approved complaints
   - Update complaint status
   - Add responses and updates
   - Mark complaints as resolved

### Admin Operations

1. **Institution Approval**
   - Review pending registrations
   - Verify institutional legitimacy
   - Approve or reject applications

2. **System Oversight**
   - Monitor all complaints
   - Generate reports
   - Manage user roles
   - Handle escalations

---

## 📁 Project Structure

```
citizen-engagement-mvp/
├── 📁 clients/                    # Frontend React application
│   ├── 📁 public/                # Static assets
│   │   ├── index.html            # Main HTML template
│   │   └── favicon.ico           # App icon
│   ├── 📁 src/
│   │   ├── 📁 components/        # Reusable UI components
│   │   │   ├── Navigation.js     # Main navigation bar
│   │   │   └── ProtectedRoute.js # Route protection component
│   │   ├── 📁 context/           # React Context providers
│   │   │   └── AppContext.js     # Global state management
│   │   ├── 📁 data/              # Mock data and constants
│   │   │   └── mockData.js       # Development data
│   │   ├── 📁 pages/             # Page components
│   │   │   ├── Home.js           # Landing page
│   │   │   ├── Login.js          # Authentication page
│   │   │   ├── Registration.js   # User registration
│   │   │   ├── Submit.js         # Complaint submission
│   │   │   ├── Status.js         # Complaint tracking
│   │   │   ├── CitizenDashboard.js
│   │   │   ├── InstitutionDashboard.js
│   │   │   ├── Admin.js          # Admin panel
│   │   │   └── ComplaintDetail.js
│   │   ├── api.js                # Axios configuration
│   │   ├── App.js                # Main app component
│   │   └── index.js              # App entry point
│   ├── package.json              # Frontend dependencies
│   └── tailwind.config.js        # Tailwind CSS config
│
├── 📁 server/                     # Backend Node.js application
│   ├── 📁 controllers/           # Business logic handlers
│   │   ├── auth.js               # Authentication logic
│   │   ├── complaints.js         # Complaint management
│   │   ├── login.js              # Login handling
│   │   └── registration.js       # Registration logic
│   ├── 📁 middleware/            # Express middleware
│   │   └── auth.js               # JWT authentication
│   ├── 📁 model/                 # Database schemas
│   │   ├── User.js               # User data model
│   │   └── Complaint.js          # Complaint data model
│   ├── 📁 routes/                # API route definitions
│   │   ├── auth.js               # Authentication routes
│   │   └── complaints.js         # Complaint routes
│   ├── 📁 utils/                 # Utility functions
│   │   └── sendEmail.js          # Email notifications
│   ├── server.js                 # Express server setup
│   └── package.json              # Backend dependencies
│
├── 📄 README.md                   # Project documentation
├── 📄 .gitignore                  # Git ignore rules
└── 📄 LICENSE                     # MIT license
```

---

##  Development

### Development Scripts

**Backend:**
```bash
cd server
npm run dev        # Start with nodemon
npm start          # Start production server
npm run lint       # Run ESLint
```

**Frontend:**
```bash
cd clients
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run lint       # Run ESLint
```

### Code Style Guidelines

- **JavaScript**: ES6+ features, async/await over promises
- **React**: Functional components with hooks
- **Naming**: camelCase for variables, PascalCase for components
- **Comments**: JSDoc for functions, inline for complex logic

### Database Schema

#### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: Enum ['citizen', 'pending_institution', 'institution', 'admin'],
  category: Enum ['Road', 'Water', 'Electricity', 'Health', 'Other'],
  status: Enum ['pending', 'approved'],
  createdAt: Date,
  updatedAt: Date
}
```

#### Complaint Model
```javascript
{
  title: String (required),
  description: String (required),
  category: String (required),
  location: String,
  citizen: String (required),
  assignedAgency: String (required),
  status: Enum ['Open', 'In Progress', 'Resolved', 'Rejected'],
  responses: [{
    text: String,
    from: String,
    date: String
  }],
  history: [{
    action: String,
    notes: String,
    updatedBy: String,
    timestamp: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

---

##  Deployment

### Production Environment Variables

Update environment variables for production:

```env
# server/.env
NODE_ENV=production
PORT=8080
MONGODB_URI=mongodb+srv://prod-user:password@prod-cluster.mongodb.net/
JWT_SECRET=your-production-jwt-secret
FRONTEND_URL=https://yourapp.com
```

### Build for Production

```bash
# Build frontend
cd clients
npm run build

# The build folder contains optimized production files
```

### Deployment Options

#### Heroku Deployment

```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create your-app-name

# Set environment variables
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret

# Deploy
git push heroku main
```

#### Docker Deployment

Create `Dockerfile` in project root:

```dockerfile
FROM node:16-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY clients/package*.json ./clients/

# Install dependencies
RUN npm install
RUN cd server && npm install
RUN cd clients && npm install && npm run build

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Start server
CMD ["node", "server/server.js"]
```

---

## Contributing

We welcome contributions! Please follow these guidelines:

### Getting Started

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Run tests**: `npm test`
5. **Commit changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Workflow

1. **Check existing issues** before starting work
2. **Create an issue** for new features or bugs
3. **Follow code style** guidelines
4. **Write tests** for new functionality
5. **Update documentation** as needed

### Pull Request Guidelines

- **Clear description** of changes
- **Reference related issues**
- **Include screenshots** for UI changes
- **Ensure all tests pass**
- **Keep commits focused** and well-documented

### Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/0/code_of_conduct/).

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Bahati Steven

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Support

### Getting Help

- ** Documentation**: Check this README and inline code comments
- ** Bug Reports**: [Create an issue](https://github.com/yourusername/citizen-engagement-mvp/issues/new)
- ** Feature Requests**: [Create an issue](https://github.com/yourusername/citizen-engagement-mvp/issues/new)
- ** Discussions**: [GitHub Discussions](https://github.com/yourusername/citizen-engagement-mvp/discussions)

### Troubleshooting

**Common Issues:**

1. **MongoDB Connection Error**
   - Verify `MONGODB_URI` is correct
   - Check network connectivity
   - Ensure MongoDB Atlas whitelist includes your IP

2. **JWT Token Issues**
   - Verify `JWT_SECRET` is set
   - Check token expiration
   - Clear browser localStorage

3. **CORS Errors**
   - Verify `FRONTEND_URL` in backend `.env`
   - Check frontend API URL configuration

**Performance Optimization:**

- Enable MongoDB indexing for frequently queried fields
- Implement pagination for large datasets
- Use React.memo for expensive components
- Optimize bundle size with code splitting

### Roadmap

- [ ] Real-time notifications with WebSockets
- [ ] Email notification system
- [ ] Mobile responsive design improvements
- [ ] Advanced reporting and analytics
- [ ] Multi-language support
- [ ] Integration with government APIs
- [ ] Mobile application (React Native)

---

**Made with ❤️ by Bahati Steven**

*Last updated: January 2025*
>>>>>>> Stashed changes
