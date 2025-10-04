# UKNF Communication System

A secure communication platform for the Polish financial supervisory authority (UKNF) that enables structured, auditable communication between client organizations and the UKNF institution.

## 🏗️ Architecture

This system is built with a modern, scalable architecture:

- **Frontend**: Next.js 15 with App Router, shadcn/ui, TanStack Query/Form
- **Backend**: Drizzle ORM, Better-auth, RabbitMQ, PostgreSQL, Redis, MinIO
- **Infrastructure**: Fully Dockerized services

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ and pnpm

### 1. Clone and Setup

```bash
git clone <repository-url>
cd uknf-new
cp env.example .env
```

### 2. Start Infrastructure Services

```bash
# Start all backend services (PostgreSQL, Redis, MinIO, RabbitMQ)
docker-compose up -d

# Verify services are running
docker-compose ps
```

### 3. Install Dependencies and Start Development

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## 🐳 Docker Services

The following services are included in the Docker Compose setup:

| Service    | Port       | Description                     |
| ---------- | ---------- | ------------------------------- |
| PostgreSQL | 5432       | Primary database                |
| Redis      | 6379       | Cache and session store         |
| MinIO      | 9000/9001  | S3-compatible object storage    |
| RabbitMQ   | 5672/15672 | Message queue and management UI |

### Service URLs

- **MinIO Console**: [http://localhost:9001](http://localhost:9001) (uknf_minio_admin / uknf_minio_password)
- **RabbitMQ Management**: [http://localhost:15672](http://localhost:15672) (uknf_rabbitmq_user / uknf_rabbitmq_password)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
├── components/             # Reusable UI components
├── lib/                   # Utilities and configurations
├── db/                    # Database schema and migrations
└── types/                 # TypeScript type definitions
```

## 🔧 Development Commands

```bash
# Development
pnpm dev                   # Start development server
pnpm build                 # Build for production
pnpm start                 # Start production server

# Code Quality
pnpm lint                  # Run Biome linter
pnpm format                # Format code with Biome

# Docker
docker-compose up -d       # Start all services
docker-compose down        # Stop all services
docker-compose logs        # View service logs
```

## 🔐 Security Features

- Role-based access control (org admin/employee, UKNF admin/employee)
- Secure file upload and storage with S3
- Audit logging for compliance
- Encrypted communication channels
- Rate limiting and input validation

## 📚 Documentation

- [Architecture Overview](docs/architecture.md)
- [API Documentation](docs/api.md)
- [Deployment Guide](docs/deployment.md)
- [Security Guidelines](docs/security.md)

## 🤝 Contributing

Please read our contributing guidelines and ensure all code follows the project's standards.

## 📄 License

This project is proprietary software for UKNF internal use.
