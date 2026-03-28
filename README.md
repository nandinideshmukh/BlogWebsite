# 📖 Narrative Blog Platform

A **full-stack blog application** built using **Next.js (Frontend)** and **FastAPI (Backend)** with Dockerized deployment.
This project allows users to create blogs, like posts, comment (including nested replies), and manage authentication securely.

---

# 🚀 Project Overview

**Narrative Blog Platform** is a modern blogging system where users can:

* Create and publish blog posts
* Like and interact with posts
* Add comments and nested replies
* Upload images
* Authenticate securely
* Manage their own content

The project is fully containerized using **Docker Compose** for easy setup and deployment.

---

# ✨ Features

## 👤 User Authentication

* User Registration
* User Login
* Secure authentication system
* User profile support
* Authorization-based access control
* Only authenticated users can:

  * Create posts
  * Like posts
  * Add comments
  * Delete their own content

---

## 📝 Blog Management

* Create blog posts
* Edit existing posts
* Delete posts
* Upload images with posts
* View all blog posts
* View individual blog details

---

## ❤️ Likes System

* Like blog posts
* Unlike posts
* Real-time like count updates
* Prevent duplicate likes from the same user

---

## 💬 Comment System

* Add comments on posts
* Nested replies (reply to comments)
* Delete own comments
* Comment threading support
* Display user information with comments

---

## 🖼 Image Upload Support

* Upload images for:

  * Blog posts
  * Comments
  * User profile
* Stored and served via backend

---

## 🔐 Backend API (FastAPI)

* REST API architecture
* Structured endpoints
* Environment-based configuration
* Database integration
* Error handling and validation

---

## 🎨 Frontend (Next.js)

* Modern UI
* Dynamic routing
* Client-side rendering
* Optimized image handling
* Responsive layout

---

## 🐳 Dockerized Deployment

* Frontend and Backend containers
* Docker Compose orchestration
* Network isolation
* Environment variable support

---

# 🏗 Project Structure

```
BlogWebsite/
│
├── narrative-frontend/
│   ├── Dockerfile
│   └── (Next.js frontend code)
│
├── backend/
│   ├── Dockerfile
│   ├── .env
│   └── (FastAPI backend code)
│
├── docker-compose.yml
│
└── README.md
```

---

# ⚙️ Docker Compose Configuration

This project uses **Docker Compose** to run both frontend and backend services together.

Services included:

* **Frontend**

  * Next.js Application
  * Runs on port **3000**

* **Backend**

  * FastAPI Application
  * Runs on port **8000**

* **Network**

  * Bridge network connecting frontend and backend

---

# 🐳 How to Run the Project (Docker Compose)

## Step 1 — Install Docker

Make sure Docker is installed:

```
docker --version
docker compose version
```

If not installed, install Docker from:

https://www.docker.com/

---

## Step 2 — Navigate to Project Folder

```
cd BlogWebsite
```

---

## Step 3 — Build and Start Containers

Run:

```
docker compose up --build
```

This will:

* Build frontend image
* Build backend image
* Start both containers
* Connect them via network

---

## Step 4 — Access the Application

Frontend:

```
http://localhost:3000
```

Backend API:

```
http://localhost:8000
```

---

## Step 5 — Stop Containers

Press:

```
CTRL + C
```

Or run:

```
docker compose down
```

---

# 🔄 Rebuild After Changes

If code changes:

```
docker compose up --build
```

---


# 🌐 Environment Variables

Backend environment variables are loaded from:

```
backend/.env
```

Example:

```
SQL_URL=your_database_url
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CLOUDINARY_KEY
CLOUDINARY_SECRET
CLOUDINARY_URL
```

---

# 🛠 Technologies Used

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

## Backend

* FastAPI
* SQLAlchemy
* SQLite

## DevOps

* Docker
* Docker Compose

---

# 📌 Key Functionalities

* Full Blog CRUD
* Like System
* Nested Comments
* Authentication
* Image Upload
* User-based permissions
* Dockerized Deployment

---

# 📷 Example Workflow

1. Register user
2. Login
3. Create blog post
4. Upload image
5. Like post
6. Add comment
7. Reply to comment
8. Delete own content

---

# 🐞 Troubleshooting

## Port Already in Use

Change ports in `docker-compose.yml`:

Example:

```
"3001:3000"
"8001:8000"
```

---

## Container Not Starting

Run:

```
docker compose logs
```

---

## Clean Build

```
docker compose down
docker compose build --no-cache
docker compose up
```

---




