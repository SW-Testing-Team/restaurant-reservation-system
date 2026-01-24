# Restaurant Reservation System

A full-stack restaurant reservation and management system built with **React (Vite)**, **NestJS**, and **MongoDB**. This application allows users to make reservations, view menus, place orders, and leave feedback.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Running Locally](#running-locally)
- [Deployment](#deployment)
- [Screenshots](#screenshots)
- [Testing](#testing)
- [API Documentation](#api-documentation)

## ✨ Features

### User Features

- **User Authentication** - Secure login and registration
- **Menu Browsing** - View restaurant menu items with detailed descriptions and pricing
- **Reservations** - Book tables with date/time selection
- **Orders** - Place and manage food orders
- **Feedback** - Leave reviews and ratings for the restaurant
- **Dashboard** - Personalized user dashboard with order history

### Admin Features

- **Admin Dashboard** - Overview of all reservations, orders, and feedback
- **Menu Management** - Add, edit, and delete menu items
- **Reservation Management** - View and manage all reservations
- **Order Management** - Track and update order status
- **Analytics** - View restaurant statistics and feedback

## 🛠 Tech Stack

### Frontend

- **React** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Lucide Icons** - Icon library

### Backend

- **NestJS** - Progressive Node.js framework
- **MongoDB** - NoSQL database
- **JWT** - Authentication
- **Passport** - Authentication middleware
- **Jest** - Testing framework

### Deployment

- **Vercel** - Frontend and API hosting
- **Railway** - Backend database and services

## 📁 Project Structure

```
restaurant-reservation-system/
├── frontend/                    # React frontend
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── Pages/              # Page components
│   │   ├── context/            # React Context
│   │   ├── config/             # Configuration files
│   │   └── assets/             # Images and static files
│   ├── cypress/                # E2E tests
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                     # NestJS backend
│   ├── src/
│   │   ├── auth/               # Authentication module
│   │   ├── dashboard/          # Dashboard module
│   │   ├── menu-order/         # Menu and orders
│   │   ├── reservations/       # Reservations module
│   │   ├── feedback/           # Feedback module
│   │   └── main.ts             # Application entry
│   ├── test/                   # E2E tests
│   ├── nest-cli.json
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB instance
- Git

## 💻 Installation

### Clone the Repository

```bash
git clone https://github.com/yourusername/restaurant-reservation-system.git
cd restaurant-reservation-system
```

### Frontend Setup

```bash
cd frontend
npm install
```

### Backend Setup

```bash
cd backend
npm install
```

## 🏃 Running Locally

### Start Backend

```bash
cd backend
npm run start:dev
```

Backend runs on: `http://localhost:3000`

### Start Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on: `http://localhost:5173`

### Environment Variables

**Backend (.env)**

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

**Frontend (.env)**

```
VITE_API_URL=http://localhost:3000
```

## 📸 Screenshots

### Login Page


<img width="1919" height="951" alt="Screenshot 2026-01-24 205035" src="https://github.com/user-attachments/assets/75f7abf6-f576-4ce1-a83c-c3dd02b981d3" />

_User login and test credentials quick-fill buttons_

### Home Page / Dashboard


_Main dashboard with featured dishes and restaurant info_
<img width="1920" height="3872" alt="FireShot Capture 001 - Bella Vista -  localhost" src="https://github.com/user-attachments/assets/620b4765-1dac-4deb-8217-daacf4d2c817" />


### Menu
<img width="1905" height="951" alt="Screenshot 2026-01-24 185300" src="https://github.com/user-attachments/assets/fce8d933-2d3a-4fba-ab84-d51e569525d4" />


### Reservations


_Make and manage table reservations_
<img width="1914" height="949" alt="Screenshot 2026-01-24 205342" src="https://github.com/user-attachments/assets/e9f29bf1-8ac7-4fdc-b74b-56d708179baa" />
<img width="1898" height="951" alt="Screenshot 2026-01-24 185247" src="https://github.com/user-attachments/assets/a45a6b9d-fbb2-4a92-bf3d-b86febd5ba89" />

### Orders


_View and place food orders_
<img width="1896" height="952" alt="Screenshot 2026-01-24 184127" src="https://github.com/user-attachments/assets/83fed9e0-fa24-4765-ad30-45a3b8a30c9f" />

### Feedback


_Leave reviews and ratings_
<img width="1876" height="720" alt="Screenshot 2026-01-24 205451" src="https://github.com/user-attachments/assets/4a21017b-f856-490e-98bc-18ffb9a11f35" />

### Admin Dashboard


_Admin overview of all operations_
<img width="1903" height="947" alt="Screenshot 2026-01-24 184053" src="https://github.com/user-attachments/assets/843eb123-b8fc-4f0e-834d-98632ff9e1ea" />

## 🧪 Testing

### Frontend Tests

```bash
cd frontend
npm run test
```

### E2E Tests with Cypress

```bash
cd frontend
npm run cypress:open
```

### Backend Tests

```bash
cd backend
npm test
```

## 🚀 Deployment

### Frontend (Vercel)

```bash
# Push to main branch triggers automatic deployment
git push origin main
```

Deployed at: [https://restaurant-reservation-system-blond.vercel.app](https://restaurant-reservation-system-blond.vercel.app)

### Backend (Railway)

```bash
# Configure Railway with your repo
# Deploy automatically on push
git push origin main
```

## 📚 API Documentation

### Authentication Endpoints

- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile

### Menu Endpoints

- `GET /menu` - Get all menu items
- `POST /menu` - Create menu item (Admin)
- `PUT /menu/:id` - Update menu item (Admin)
- `DELETE /menu/:id` - Delete menu item (Admin)

### Reservations Endpoints

- `GET /reservations` - Get user reservations
- `POST /reservations` - Create reservation
- `PUT /reservations/:id` - Update reservation
- `DELETE /reservations/:id` - Cancel reservation

### Orders Endpoints

- `GET /order` - Get user orders
- `POST /order` - Create order
- `PUT /order/:id` - Update order status

### Feedback Endpoints

- `GET /feedback` - Get all feedback
- `POST /feedback` - Submit feedback
- `GET /feedback/restaurantFeedbacks/recent` - Get recent feedback

## 👥 Test Accounts

### Admin Account

- **Email:** admin@bellavista.com
- **Password:** admin123

### User Account

- **Email:** user@bellavista.com
- **Password:** user123

## 📧 Support

For issues and questions, please open an issue on GitHub or contact the development team.

## 📄 License

This project is licensed under the UNLICENSED - see the LICENSE file for details.


