# PeakPath AI

PeakPath AI is an intelligent scholarship and research opportunity finder. It leverages advanced web search and large language models (LLMs) to match students and researchers with relevant funding programs based on their individual academic profiles.

## Core Features

*   **Profile-Driven Matching:** Users create detailed profiles including their degree level, field of study, preferred destination countries, and funding requirements.
*   **Real-Time AI Search Integration:** Utilizes the Tavily Search API to scan the web for the latest opportunities, and OpenRouter (via Vercel AI SDK) to extract, format, and stream structured data directly to the user's dashboard in real-time.
*   **Opportunity Management:** Users can bookmark interesting opportunities directly from their dashboard for later review.
*   **Weekly Automated Digests:** A secure scheduled cron job runs background searches for all eligible users and automatically emails them a curated digest of new opportunities using Resend.
*   **Quota Management:** Built-in search quotas restrict heavy API usage, allowing for sustainable free-tier operations.

## Technology Stack

*   **Framework:** [Next.js 14](https://nextjs.org/) (App Router, React 19)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)
*   **Database & Authentication:** [Supabase](https://supabase.com/) (PostgreSQL)
*   **Search Engine:** [Tavily](https://tavily.com/)
*   **LLM Orchestration:** [Vercel AI SDK](https://sdk.vercel.ai/docs)
*   **LLM Provider:** [OpenRouter](https://openrouter.ai/)
*   **Email Delivery:** [Resend](https://resend.com/) & React Email

## Project Structure

*   `/src/app`: Next.js App Router definitions.
    *   `/(app)`: Authenticated application routes (Dashboard, Profile, Explore).
    *   `/api/search`: Route handler for real-time AI opportunity generation.
    *   `/api/cron/weekly-search`: Secure endpoint for background email digests.
*   `/src/components`: Reusable UI components (Layout, OpportunityCards, Navigation).
*   `/src/lib`: Core utility functions mapped to external services (Supabase clients, OpenRouter parsers, Tavily searchers).
*   `/src/types`: Global TypeScript interface definitions.

## Prerequisites

To run this project locally, ensure you have the following installed:

*   Node.js (v18+)
*   pnpm (recommended) or npm/yarn
*   A Supabase account
*   API keys for Tavily, OpenRouter, and Resend

## Environment Variables

Create a `.env.local` file in the root directory and populate it with the following required variables:

```env
# Next.js Application URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# External APIs
OPENROUTER_API_KEY=your_openrouter_api_key
TAVILY_API_KEY=your_tavily_api_key
RESEND_API_KEY=your_resend_api_key

# Security
CRON_SECRET=your_secure_cron_secret
```

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/peakpathai.git
    cd peakpathai
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Run the development server:**
    ```bash
    pnpm dev
    ```

    The application will be available at `http://localhost:3000`.

## Database Schema Overview

The Supabase PostgreSQL database relies on the following core tables:

*   **`profiles`**: Tied to the Supabase Auth user. Stores `degree_level`, `field_of_study`, `country`, and `funding_preference`.
*   **`opportunities`**: Stores structured data extracted by the LLM (e.g., `title`, `provider`, `deadline`, `source_url`). Includes boolean flags for `saved` (bookmarked) and `seen` (to trigger UI notifications).
*   **`search_quota`**: Tracks the number of searches a user has executed within a `week_start` period to enforce usage limits.

## Legal and Licensing

This application relies on web scraping and third-party AI generation. Ensure compliance with the terms of service of Tavily, OpenRouter, and any websites queried during the search process.
