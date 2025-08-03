# Sistem PM Mesin - Preventive Maintenance Management System

## Overview

This is a web-based Preventive Maintenance (PM) Management System designed for tracking and managing machine maintenance schedules. The application allows users to create, update, and monitor PM machine records with features like data import/export, note-taking, and status tracking. Built with a modern full-stack architecture using React, Express, and PostgreSQL with Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent design
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript for API development
- **Database ORM**: Drizzle ORM for type-safe database operations and migrations
- **Authentication**: Replit Auth with OpenID Connect for secure user authentication
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **File Upload**: Multer for handling Excel file imports
- **Excel Processing**: XLSX library for reading and processing Excel files

### Database Design
- **Primary Database**: PostgreSQL with connection pooling via Neon serverless
- **Schema Management**: Drizzle migrations for version-controlled database changes
- **Core Tables**:
  - `users` - User authentication and profile data (required for Replit Auth)
  - `sessions` - Session storage for authentication persistence
  - `pm_machines` - Main PM machine records with status tracking
  - `machine_notes` - Machine-specific notes and documentation

### Authentication & Authorization
- **Provider**: Replit Auth with OIDC (OpenID Connect) integration
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL
- **Security**: HTTP-only cookies, CSRF protection, and secure session management
- **User Management**: Automatic user creation/update on successful authentication

### API Architecture
- **Pattern**: RESTful API with CRUD operations
- **Error Handling**: Centralized error middleware with proper HTTP status codes
- **Logging**: Request/response logging for API endpoints
- **Data Validation**: Zod schemas for runtime type validation and API safety

### Key Features
- **Machine Management**: Full CRUD operations for PM machine records
- **Status Tracking**: Outstanding/Done status with completion date tracking
- **Search Functionality**: Real-time search across machine records
- **Excel Import/Export**: Bulk data operations with error handling
- **Note System**: Machine-specific notes for maintenance documentation
- **Responsive Design**: Mobile-first approach with adaptive layouts

## External Dependencies

### Database & Storage
- **Neon PostgreSQL**: Serverless PostgreSQL database with connection pooling
- **Drizzle ORM**: Type-safe database toolkit with migration support

### Authentication
- **Replit Auth**: OpenID Connect authentication provider
- **Passport.js**: Authentication middleware for Node.js

### Frontend Libraries
- **TanStack Query**: Server state management and caching
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Wouter**: Minimalist routing library

### Backend Dependencies
- **Express.js**: Web application framework
- **Multer**: File upload middleware
- **XLSX**: Excel file processing
- **Zod**: Schema validation library

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Static type checking
- **ESBuild**: Fast bundling for production