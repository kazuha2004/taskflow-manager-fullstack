# TaskFlow Manager

A complete, minimal, production-ready Team Task Management Web Application. Built with a modern full-stack architecture using Next.js, Django REST Framework, and MongoDB.

## Features (Core Requirements)

1. **Authentication**: JWT-based Signup and Login.
2. **Projects**: Admin can create projects and add members via email.
3. **Tasks**: Admin can create and assign tasks. Members can update status (`To Do`, `In Progress`, `Done`).
4. **Dashboard**: Real-time stats (Total, To Do, In Progress, Done, Overdue).
5. **Role-Based Access**: Admins have full control; Members can only view assigned tasks and update status.

## Tech Stack

* **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
* **Backend**: Django 4.x, Django REST Framework, PyJWT
* **Database**: MongoDB (via `mongoengine` ODM — *note: `djongo` was skipped due to modern Django incompatibilities for production*)
* **Deployment**: Railway (Backend), Vercel (Frontend), MongoDB Atlas (Database)

---

## Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB instance (Local or Atlas)

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:
```env
SECRET_KEY=your-secret-key
DEBUG=True
MONGO_URI=mongodb://localhost:27017/taskflow  # Or your Atlas URI
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

Run the backend:
```bash
python manage.py runserver
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend/` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Run the frontend:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Deployment Guide

### 1. Database (MongoDB Atlas)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Go to **Network Access** and allow IP address `0.0.0.0/0` (anywhere).
3. Create a Database User and copy the connection string (`mongodb+srv://...`).

### 2. Backend (Railway)
1. Push this repository to GitHub.
2. Sign in to [Railway.app](https://railway.app/) and create a "New Project" > "Deploy from GitHub repo".
3. Select this repository and set the Root Directory to `/backend` (if Railway prompts, or configure it in settings).
4. Go to the service **Variables** and add:
   - `MONGO_URI`: (Your Atlas connection string)
   - `SECRET_KEY`: (A random secure string)
   - `DEBUG`: `False`
   - `ALLOWED_HOSTS`: `*` (or your Railway domain)
   - `CORS_ALLOWED_ORIGINS`: `https://your-vercel-frontend-url.vercel.app`
5. Railway will automatically detect the `Procfile` and deploy using Gunicorn.
6. Copy your Railway Public Domain URL.

### 3. Frontend (Vercel)
1. Sign in to [Vercel](https://vercel.com/) and click "Add New Project".
2. Import the GitHub repository.
3. Set the **Root Directory** to `frontend`.
4. In Environment Variables, add:
   - `NEXT_PUBLIC_API_URL`: `https://your-railway-backend-url.up.railway.app/api`
5. Click **Deploy**.

---

## 3-Minute Interview Demo Script

**1. Introduction (30s)**
"Hi, I'm here to present TaskFlow Manager. It's built with Next.js and Tailwind on the frontend, and Django REST Framework with MongoDB on the backend. I chose `mongoengine` over `djongo` because it's much more stable for production with modern Django. The app is fully responsive and deployed on Vercel and Railway."

**2. Auth & Dashboard (30s)**
"Let me start by logging in. As you can see, JWT tokens are handled securely. The dashboard loads instantly, fetching real-time aggregations of all tasks assigned to me or projects I manage."

**3. Admin Flow (1m)**
"If I go to Projects, I can create a new project. Let's create 'Q3 Marketing'. As the Admin, I can click into it, click 'Add Member', and invite a colleague via email. Now, I'll create a task assigned to them with a due date. The UI updates instantly."

**4. Member Flow & RBAC (30s)**
"To demonstrate Role-Based Access, I'll log out and log in as that team member. Notice how they only see the task I just assigned them. They don't have the 'Add Member' or 'Create Task' buttons. However, they can use this inline dropdown to move the task to 'In Progress'."

**5. Architecture & Code Quality (30s)**
"I kept the codebase minimal and modular. The frontend uses a custom Axios interceptor to automatically inject the Bearer token. The backend uses custom DRF permission classes and a strict isolation layer where PyJWT manually decodes tokens against our Mongo User models without muddying Django's default SQL ORM."
