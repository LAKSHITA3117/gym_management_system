# ParkEase — Parking Management System

A responsive front-end web development project built with HTML, CSS and vanilla JavaScript.

## Features
- Admin dashboard with total, available and occupied parking slots
- Live slot overview with available/occupied filters
- Vehicle entry form with automatic slot assignment
- Vehicle checkout and parking fee calculation
- Vehicle search and session history
- Revenue/session report and CSV export
- Browser `localStorage` persistence (data remains in the same browser)

## Run the project
1. Extract `parking-management-system.zip`.
2. Open `index.html` in a modern browser.
3. Click **Vehicle entry** to add a vehicle, then use **Check out** in Vehicle Management to complete a session.

No installation or build step is required. For the best development experience, open the folder in VS Code and use the Live Server extension.

## Demo billing rule
- First hour (or part of it): ₹30
- Every additional hour (or part of it): ₹20

## Project limitations
This is a front-end academic/demo project. It stores data in the browser and does not include user authentication, a server, a shared database, payment gateway, or real sensor integration. For a multi-user production system, add a backend (for example PHP/Node.js), a database (MySQL/PostgreSQL), authentication, server-side validation and secure payment handling.

## Suggested project synopsis
**Objective:** To develop a web-based parking management system that helps an administrator monitor parking-space availability, record vehicle arrivals and departures, and calculate parking charges.

**Modules:** Admin dashboard, parking-slot management, vehicle entry/exit, billing, and reports.

**Technology used:** HTML5, CSS3, JavaScript, browser localStorage.
