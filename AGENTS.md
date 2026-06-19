# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.
# 🧠 Karigar App - Agent Instructions

This project is a full-stack service marketplace app (similar to Fiverr / Upwork for local technicians).

## 🏗️ Architecture Overview

- Frontend: Expo React Native (TypeScript)
- Backend: Node.js + Express (MVC)
- Database: PostgreSQL (Prisma ORM)
- Auth: JWT (stateless authentication)
- Real-time: Socket.io
- Cache: Redis (for service categories + performance optimization)

---

## 👤 User Roles

### CLIENT
- Can register/login
- Can post jobs
- Can view their jobs
- Can accept bids

### TECHNICIAN
- Can register/login
- Can browse job feed
- Can place bids
- Can track bid status

---

## 🔐 Auth Rules

- JWT stored on client
- Role is included in JWT payload
- Middleware must enforce:
  - CLIENT-only routes
  - TECHNICIAN-only routes
- Never trust client-provided userId or role

---

## 📡 API Rules

- All protected routes must use:
  - authenticateToken middleware
- Business logic must use:
  - req.user.id (NOT req.body.userId)

---

## ⚡ Real-time (Socket.io)

Events:
- new_job_available → broadcast to all technicians
- bid_accepted → sent only to winning technician

---

## 🚀 Performance Rules

- Use Redis for:
  - service categories
  - rarely changing reference data
- Always set TTL for cached values

---

## 🧱 Code Structure (Backend)

controllers/
routes/
middlewares/
utils/
socket/
config/

---

## 🎯 Coding Principles

- Keep controllers thin
- Use middleware for auth/roles
- Use Prisma transactions for multi-update operations
- Avoid duplicated try/catch → use global error handler

---

## 📱 Frontend Rules (Expo)

- Use Expo Router (file-based routing)
- Separate flows:
  - (auth)
  - (client)
  - (technician)
- Do NOT mix role screens

---

## 🧠 AI/Agent Behavior Guidance

When assisting with this project:
- Prefer clean architecture over quick hacks
- Suggest scalable patterns
- Avoid tightly coupling UI and business logic
- Always consider role-based access