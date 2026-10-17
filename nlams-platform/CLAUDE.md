# National Land Acquisition & Management System (NLAMS)

A production-grade, highly responsive web platform for end-to-end digital monitoring, transparency, and decision support for land acquisition.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Lucide React, Recharts, Leaflet.
- **Backend/Database**: Node.js, Drizzle ORM, PostgreSQL (PostGIS ready).
- **Authentication**: NextAuth.js.
- **Deployment**: Netlify.

## Getting Started
1. **Environment Variables**: Create a `.env` file and set:
   - `DATABASE_URL=postgres://user:password@localhost:5432/nlams_db`
   - `NEXTAUTH_SECRET=<secure-random-string>`
2. **Install**: `npm install`
3. **Database**: Apply migrations (using `drizzle-kit`).
4. **Run**: `npm run dev`

## Modules
- **Dashboard**: Executive overview with real-time acquisition metrics.
- **Registry**: Cadastral parcel management and GIS visualization.
- **Compensation**: Automated payout calculation and tracking.
- **Grievance**: Legal/grievance submission and status monitoring.
