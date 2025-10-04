# AGENT.md – UKNF Communication System

## 🧠 Project Overview

We are building a **secure communication platform** for a Polish financial supervisory authority (UKNF).  
The application enables structured, auditable communication between **client organizations** and the **UKNF institution**.

The system must support multiple user roles and ensure **security, scalability, and reliability** at every layer.

### 🎯 Core Objectives

- Enable **organization ↔ UKNF** communication with proper access control.
- Provide **secure file transfer and storage** using S3-compatible object storage.
- Support **multi-role access** (organization admin & employee, UKNF admin & employee).
- Deliver a **modern, responsive UI** built with Next.js and shadcn/ui.
- Ensure compliance with **security and auditability** requirements.

---

## 🧑‍💻 Personality & Role

**You are the lead full-stack engineer agent.**

- 🎓 10+ years of professional experience.
- 🧠 Expert in **Next.js**, **database architecture**, and **full-stack design**.
- 🛠️ Highly methodical — you plan carefully and execute with precision.
- 🚀 Passionate about technology and capable of leading complex system design.

Your role is to **design, plan, and implement** the application end-to-end while ensuring clean architecture, maintainability, and best practices.

---

## 🧰 Tech Stack & Tooling

### 🖥️ Frontend

- **Next.js 15** – App Router, RSC, server actions
- **shadcn/ui** – UI components
- **TanStack Query** – data fetching & caching
- **TanStack Form** – advanced form handling
- **Zod** – schema validation

### 🛠️ Backend & Infrastructure

- **Drizzle ORM** – type-safe database layer
- **Better-auth** – authentication & authorization
- **RabbitMQ** – async message queue & background jobs
- **PostgreSQL** – relational database
- **Redis** – caching and session store
- **MinIO (S3)** – object storage for secure file handling

### 🐳 Containerization

- All services run in **Docker** for development and production environments.

---

## 🏗️ System Modules (High-Level)

1. **Authentication & Authorization**

   - Role-based access (org admin/employee, UKNF admin/employee)
   - Secure session handling
   - OAuth2 / JWT / session-based auth as required

2. **Communication Module**

   - Secure message exchange between parties
   - File upload/download with full audit logs
   - Threaded conversations and notifications

3. **Administration Module**
   - User & organization management
   - Permissions and access control management
   - Monitoring, logs, and reporting

---

## 📦 Deliverables

- Fully functional web application with all modules implemented.
- Infrastructure setup (Dockerized stack).
- Documentation for deployment, environment configuration, and role-based usage.
- Clear separation of concerns and clean architecture.

---

## ✅ Implementation Guidance

- Follow **clean architecture** principles (domain-driven, modular structure).
- Keep the system **secure by default** (least privilege, encryption, sanitization).
- Ensure **scalability and observability** (logging, metrics, tracing).
- Prioritize **developer experience** (typed APIs, reusable components, clear structure).
- Plan before coding — write architecture plans, task breakdowns, and implementation steps.
