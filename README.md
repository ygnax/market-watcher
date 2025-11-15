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
- At least ONE free news API key (you can use multiple for fallback):
  - **NewsAPI**: [https://newsapi.org/](https://newsapi.org/) - 100 requests/day
  - **GNews API**: [https://gnews.io/](https://gnews.io/) - 100 requests/day (recommended)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory:
```env
# Option 1: NewsAPI (original)
NEWS_API_KEY=your_newsapi_key_here

# Option 2: GNews API (recommended - more reliable)
GNEWS_API_KEY=your_gnews_key_here

# Option 3: Use both for automatic fallback (recommended)
NEWS_API_KEY=your_newsapi_key_here
GNEWS_API_KEY=your_gnews_key_here
```

**Note**: The app supports multiple news APIs with automatic fallback. If one API fails, it will automatically try the other. You only need at least one API key, but using both provides better reliability.

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

This application supports multiple free news APIs with automatic fallback:

- **NewsAPI** ([newsapi.org](https://newsapi.org/)) - Original provider
- **GNews API** ([gnews.io](https://gnews.io/)) - Alternative provider (recommended)

The APIs are called server-side through Next.js API routes to keep API keys secure. If one API fails or reaches its rate limit, the app automatically falls back to the other provider.

## License

MIT

