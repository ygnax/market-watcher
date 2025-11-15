# Market Watcher

A minimal Next.js application for displaying stock market news, similar to Seeking Alpha but simplified for MVP purposes.

## Features

- Homepage displaying the latest 10 stock market news articles
- Individual article detail pages
- Clean, minimal design with Tailwind CSS
- Responsive layout

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A free NewsAPI key from [https://newsapi.org/](https://newsapi.org/)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory:
```env
NEWS_API_KEY=your_api_key_here
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
market-watcher/
├── app/
│   ├── api/
│   │   └── news/
│   │       ├── route.ts          # API route for fetching news list
│   │       └── [id]/route.ts     # API route for fetching single article
│   ├── article/
│   │   └── [id]/
│   │       └── page.tsx          # Article detail page
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   ├── not-found.tsx             # 404 page
│   └── page.tsx                  # Homepage
├── components/
│   ├── ArticleCard.tsx           # Article card component
│   ├── ArticleContent.tsx        # Article detail component
│   ├── ArticleList.tsx           # Article list container
│   └── Header.tsx                # Header component
├── types/
│   └── article.ts                # TypeScript types
└── package.json
```

## Technologies Used

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS

## API Integration

This application uses the NewsAPI free tier to fetch stock market news. The API is called server-side through Next.js API routes to keep the API key secure.

## License

MIT

