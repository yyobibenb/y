# Replit.md

## Overview

This is a full-stack betting application similar to ThaiBC Thailand, built with React frontend and Node.js/Express backend. The application provides comprehensive sports betting functionality including user registration/authentication, real-time odds updates, deposit/withdrawal management, and admin panel for complete system control. The system supports multiple sports (football, basketball, tennis) with a special focus on Thai sports, and includes multilingual support (Thai/English).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite build system
- **UI Library**: Shadcn/UI components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom dark theme optimized for betting interfaces
- **State Management**: TanStack React Query for server state, React Context for client state (auth, betting slip)
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation schemas
- **Real-time Updates**: WebSocket integration for live odds updates

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Passport.js with local strategy, session-based auth using PostgreSQL session store
- **Real-time Communication**: WebSocket server for broadcasting odds updates
- **Background Jobs**: Cron-based services for fetching sports data and updating odds
- **Password Security**: Node.js crypto module with scrypt for secure password hashing

### Database Design
- **Users**: Account management with auto-generated account IDs, balance tracking, admin flags
- **Fixtures**: Sports matches with odds, scores, and API references
- **Bets**: User betting history with stake amounts and outcomes
- **Financial Transactions**: Separate tables for deposits, withdrawals, and admin balance adjustments
- **Session Storage**: PostgreSQL-backed session management

### Authentication & Authorization
- **Registration**: Email/password only with auto-generated numeric account IDs
- **Session Management**: Server-side sessions with PostgreSQL storage
- **Role-based Access**: Admin flag system for administrative functions
- **Protected Routes**: Frontend route protection with auth state management

### Real-time Features
- **Live Odds Updates**: WebSocket broadcasting of odds changes to all connected clients
- **Connection Status**: Visual indicators for WebSocket connection state
- **Auto-reconnection**: Automatic WebSocket reconnection with exponential backoff

## External Dependencies

### Database & Storage
- **Neon Serverless Postgres**: Primary database with connection pooling
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### Sports Data Integration
- **External Sports APIs**: Integration ready for API-Football, Sportmonks, or Sportradar
- **Cron Jobs**: Automated fixture updates every 5 minutes, odds updates every 30 seconds
- **API Data Mapping**: Structured mapping of external API data to internal fixture schema

### UI & Styling
- **Radix UI**: Comprehensive set of accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom betting theme
- **Lucide React**: Modern icon library
- **Custom Animations**: CSS animations for betting interactions and notifications

### Development & Build Tools
- **Vite**: Fast build tool with HMR and TypeScript support
- **TypeScript**: Full type safety across frontend and backend
- **ESBuild**: Backend bundling for production deployment
- **Drizzle Kit**: Database migration and schema management tools

### Third-party Integrations
- **Cryptocurrency Support**: Ready for USDT (TRC20, BEP20) and SOL wallet integrations
- **Thai Banking**: Structured for Thai bank card integration
- **Multi-language**: i18n ready with Thai and English language support