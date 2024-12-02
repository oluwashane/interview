# User Management API

## Overview
A robust Node.js Express API with MongoDB for user management.

## Features
- Paginated user retrieval
- Complex aggregation queries
- CRUD operations
- Flexible sorting
- Comprehensive error handling

## Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up MongoDB connection
4. Run the server: `npm run dev`

## API Endpoints
- `GET /api/users`: Retrieve paginated users
- `GET /api/users/stats/city-age`: Get city age statistics
- `POST /api/users`: Create a new user
- `PUT /api/users/:id`: Update a user
- `DELETE /api/users/:id`: Delete a user

## Aggregation Pipeline
The city age statistics endpoint uses an aggregation pipeline to:
1. Group users by city
2. Calculate average age
3. Determine min and max ages
4. Count total users per city