# Pet Food Shop (fean)

A complete e-commerce solution for a Pet Food Shop built with Angular 17+ and Node.js with Firebase.

## Prerequisites
1. Node.js (v18+)
2. Angular CLI (`npm install -g @angular/cli`)
3. Firebase Account

## Setup Instructions

### 1. Backend Setup
1. Navigate to `backend/` folder.
   ```bash
   cd backend
   npm install
   ```
2. **IMPORTANT**: Place your Firebase Admin Service Account Key as `serviceAccountKey.json` inside the `backend/` directory.
   - Go to Firebase Console -> Project Settings -> Service Accounts -> Generate New Private Key.
   - Rename the file to `serviceAccountKey.json`.
3. Start the server:
   ```bash
   node server.js
   ```
   Server runs on http://localhost:5000

### 2. Frontend Setup
1. Navigate to `frontend/` folder.
   ```bash
   cd frontend
   npm install
   ```
2. **IMPORTANT**: Update `src/environments/environment.ts` with your Firebase Client Configuration.
   - Go to Firebase Console -> Project Settings -> General -> Your Apps -> SDK Setup and Configuration.
3. Start the app:
   ```bash
   ng serve
   ```
   App runs on http://localhost:4200

## Admin Access
- By default, new users are **Users (Role 0)**.
- To create an **Admin**:
  1. Register a user via the Signup page.
  2. Go to Firebase Console -> Firestore Database -> `users` collection.
  3. Find the user document and change `role` to **1**.
  4. Login again to access the Admin Dashboard.

## Features
- **User**: Browse Products, Filter by Category, Cart, Checkout, My Orders (PDF Invoice), Profile (Image Upload).
- **Admin**: Dashboard, Product Management (Image Upload), Category Management, Order Management, User Management.

## Tech Stack
- Frontend: Angular 17+ (Modules), Bootstrap 5.
- Backend: Node.js, Express.
- Database: Firebase Firestore.
- Auth: Firebase Authentication.
- Storage: Firebase Storage (or Local Uploads supported).

## Documentation & Security
- [Project Architecture & ER Diagram](file:///c:/Users/Samar%20Taibani/Desktop/one/documentation/project_documentation.md)
- [Production Security & Hardening Checklist](file:///c:/Users/Samar%20Taibani/Desktop/one/documentation/PRODUCTION_SECURITY_CHECKLIST.md)
