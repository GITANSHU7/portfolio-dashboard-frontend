# Frontend

This is the frontend for the portfolio dashboard assignment. It is built with Next.js, TypeScript, Tailwind CSS, React Query, and Recharts.

## Features

- Portfolio summary cards for investment, current value, and gain or loss
- Sector summary with detailed rollup data
- Sector allocation pie chart
- Sector gain or loss comparison chart
- Holdings table with valuation and performance details
- Auto refresh every 15 seconds with visible countdown
- Dark mode toggle
- Backend API integration with local fallback support

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- TanStack React Query
- Recharts

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server on port `3000`:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Start the production server on port `3000`:

```bash
npm run start
```

Lint the project:

```bash
npm run lint
```

## Environment Variables

Create a `.env.local` file in the `frontend` folder and add:

```env
PORTFOLIO_API_SERVER_URL=https://portfolio-dashboard-backend-omega.vercel.app
```

Notes:

- You can set either the backend base URL or the full `/api/portfolio` URL.
- The frontend API route automatically resolves the correct portfolio endpoint.
- If the remote backend is unavailable, the app falls back to local server-side portfolio snapshot generation.

## Project Structure

```text
frontend/
  app/
    api/portfolio/route.ts
    page.tsx
  components/
  lib/
  public/
```

## API Flow

- The UI loads data through the frontend route at `/api/portfolio`
- That route tries to fetch data from `PORTFOLIO_API_SERVER_URL`
- If the backend response fails or returns an invalid shape, the frontend generates the portfolio snapshot locally

## Deployment

Deploy the frontend on Vercel and set:

```env
PORTFOLIO_API_SERVER_URL=https://portfolio-dashboard-backend-omega.vercel.app
```

Make sure the backend deployment is live before testing the frontend deployment.
