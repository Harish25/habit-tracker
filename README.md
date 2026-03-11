# habit-tracker

## Project Structure
* `src/app/`: File-based routing (UI and API routes) 
    * Create a new folder `app/featureName` for a feature. Inside this folder:
        * Create **page.tsx** (frontend) 
        * Create **actions.ts** (Server-side functions (forms/buttons))
    * Create a new folder `app/api/featureName` for API routes. Inside this folder:
        * Create **route.ts** (REST logic (GET, POST, PATCH, DELETE))
* `src/components/`: Reusable React components (UI/Shared)
* `src/lib/`: For S3 cloud storage, Pusher, DB singleton
* `prisma/`: Database schema and migration files

## Setup

Install Dependencies:
```bash
cd habit-tracker
npm install
```

Configure .env:
```text
POSTGRES_PASS="placeholdersecretpass"
DATABASE_URL="postgresql://postgres:placeholdersecretpass@localhost:5432/habit_tracker?schema=public"
```

Start Postgres DB:
```bash
docker-compose up
```
Init Prisma:
```bash
npx prisma generate
```

## Development 

Run App:
```bash
npm run dev
```
Application will be available at `http://localhost:3000`

## DB Management
`npx prisma studio` to view/edit data with GUI
`npx prisma db push` to sync changes to DB after modifying schema.prisma