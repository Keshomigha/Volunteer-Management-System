# VolunteerHub — REST API Documentation

This document describes the REST API endpoints provided by the Express backend of VolunteerHub.

## Base URL
All API requests must be made to:
```
http://localhost:5000/api
```

---

## Authentication & Profiles

### 1. Register Student
* **Endpoint**: `POST /auth/register/student`
* **Access**: Public (Subject to Rate Limiting)
* **Request Body**:
  ```json
  {
    "name": "Full Name",
    "email": "student@uni.lk",
    "password": "password123",
    "phone": "+94771234567",
    "studentId": "STU100001",
    "faculty": "Faculty of Computing"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Student registered successfully",
    "user": { ... }
  }
  ```

### 2. Register Organizer
* **Endpoint**: `POST /auth/register/organizer`
* **Access**: Public (Subject to Rate Limiting)
* **Request Body**:
  ```json
  {
    "organizationName": "Rotaract Club",
    "email": "rotaract@uni.lk",
    "password": "password123",
    "phone": "+94771111111"
  }
  ```

### 3. Login (Unified)
* **Endpoint**: `POST /auth/login`
* **Access**: Public (Subject to Rate Limiting)
* **Request Body**:
  ```json
  {
    "email": "user@uni.lk",
    "password": "password123"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "User Name",
      "email": "user@uni.lk",
      "role": "student"
    }
  }
  ```

### 4. Forgot Password (Mocked)
* **Endpoint**: `POST /auth/forgot-password`
* **Access**: Public (Subject to Rate Limiting)
* **Request Body**:
  ```json
  {
    "email": "user@uni.lk"
  }
  ```

### 5. Reset Password
* **Endpoint**: `POST /auth/reset-password`
* **Access**: Public (Subject to Rate Limiting)
* **Request Body**:
  ```json
  {
    "token": "reset_token_received",
    "newPassword": "newSecurePassword123"
  }
  ```

### 6. Get Current User Identity
* **Endpoint**: `GET /auth/me`
* **Access**: Authenticated (All Roles)

---

## Event Management

### 1. Get Approved Public Events
* **Endpoint**: `GET /events`
* **Access**: Public
* **Query Parameters** (Optional):
  - `search`: Searches by event title or description.
  - `category`: Filters by event category.
  - `date`: Filters by event date (`YYYY-MM-DD`).

### 2. Get Event Details
* **Endpoint**: `GET /events/:id`
* **Access**: Public

### 3. Create Event
* **Endpoint**: `POST /events`
* **Access**: Authenticated (Role: `organizer`)
* **Request Body**:
  ```json
  {
    "title": "Beach Cleanup Drive",
    "description": "Preserve marine life.",
    "category": "Environmental",
    "location": "Mount Lavinia Beach",
    "eventDate": "2026-08-15",
    "volunteerRequired": 20,
    "reputationPoints": 25,
    "image": "https://..."
  }
  ```

### 4. Update Event
* **Endpoint**: `PUT /events/:id`
* **Access**: Authenticated (Role: `organizer` [Owner only], `admin`)

### 5. Delete/Archive Event
* **Endpoint**: `DELETE /events/:id`
* **Access**: Authenticated (Role: `organizer` [Owner only], `admin`)

### 6. Get Organizer's Own Events
* **Endpoint**: `GET /events/my-events`
* **Access**: Authenticated (Role: `organizer`)

---

## Application Workflows

### 1. Apply to Approved Event
* **Endpoint**: `POST /applications`
* **Access**: Authenticated (Role: `student`)
* **Request Body**:
  ```json
  {
    "eventId": 1,
    "formData": {
      "phone": "+94770000000",
      "skills": ["Tree Care"],
      "experience": "1 year",
      "motivation": "To help reverse deforestation."
    }
  }
  ```

### 2. Retrieve Student's Applications
* **Endpoint**: `GET /applications/my-applications`
* **Access**: Authenticated (Role: `student`)

### 3. Retrieve Event Applicants
* **Endpoint**: `GET /applications/event/:eventId`
* **Access**: Authenticated (Role: `organizer` [Event Owner only])

### 4. Approve Application
* **Endpoint**: `PUT /applications/:id/approve`
* **Access**: Authenticated (Role: `organizer` [Event Owner only])

### 5. Reject Application
* **Endpoint**: `PUT /applications/:id/reject`
* **Access**: Authenticated (Role: `organizer` [Event Owner only])

---

## Attendance Tracking

### 1. Get Event Attendees List
* **Endpoint**: `GET /attendance/event/:eventId`
* **Access**: Authenticated (Role: `organizer` [Event Owner only])

### 2. Bulk Save Attendance
* **Endpoint**: `POST /attendance/bulk-mark`
* **Access**: Authenticated (Role: `organizer` [Event Owner only])
* **Request Body**:
  ```json
  {
    "eventId": 1,
    "attendees": [
      { "userId": 2, "status": "Present" },
      { "userId": 3, "status": "Absent" }
    ]
  }
  ```

---

## Certification & Leaderboard

### 1. Generate Single Certificate
* **Endpoint**: `POST /certificates/generate`
* **Access**: Authenticated (Role: `organizer` [Event Owner only])
* **Request Body**:
  ```json
  {
    "eventId": 1,
    "userId": 2,
    "hours": 4
  }
  ```

### 2. Download Dynamic PDF Certificate
* **Endpoint**: `GET /certificates/:id/download`
* **Access**: Authenticated (Owner of certificate, Issuer organizer, or Admin)

### 3. Get Student Certificates
* **Endpoint**: `GET /certificates/my-certificates`
* **Access**: Authenticated (Role: `student`)

### 4. Global Leaderboard
* **Endpoint**: `GET /leaderboard`
* **Access**: Authenticated (All Roles)

---

## Notifications

### 1. Get Notifications
* **Endpoint**: `GET /notifications`
* **Access**: Authenticated (All Roles)

### 2. Get Unread Count
* **Endpoint**: `GET /notifications/unread-count`
* **Access**: Authenticated (All Roles)

### 3. Mark Notification as Read
* **Endpoint**: `PUT /notifications/:id/read` or `PATCH /notifications/:id/read`
* **Access**: Authenticated (Recipient only)

### 4. Mark All as Read
* **Endpoint**: `PUT /notifications/read-all`
* **Access**: Authenticated (All Roles)

### 5. Delete Notification
* **Endpoint**: `DELETE /notifications/:id`
* **Access**: Authenticated (Recipient only)

---

## Admin Dashboards & Settings

### 1. Admin Dashboard Stats
* **Endpoint**: `GET /admin/dashboard`
* **Access**: Authenticated (Role: `admin`)

### 2. Manage Users Status (Suspend / Reactivate)
* **Endpoint**: `PUT /admin/users/:id/status`
* **Access**: Authenticated (Role: `admin`)
* **Request Body**:
  ```json
  {
    "status": "suspended" // or "active"
  }
  ```

### 3. Get System Settings
* **Endpoint**: `GET /admin/settings`
* **Access**: Authenticated (Role: `admin`)

### 4. Update System Settings
* **Endpoint**: `PUT /admin/settings`
* **Access**: Authenticated (Role: `admin`)

### 5. Get Audit Logs
* **Endpoint**: `GET /admin/audit-logs`
* **Access**: Authenticated (Role: `admin`)
