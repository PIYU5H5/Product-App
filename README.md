# Product Recommendation App

A simple React + Vite app that lists products and lets the user type a
preference (e.g. "I want a phone under $500"). The request is sent to
the Claude API, which returns the ids of matching products, and the
matching ones get a "Recommended" badge.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Add your Anthropic API key:
   ```
   cp .env.example .env
   ```
   then open `.env` and paste your key in place of `your-api-key-here`.
   Get a key at https://console.anthropic.com

3. Run it:
   ```
   npm run dev
   ```
   Open the URL Vite prints (usually http://localhost:5173).

## How it works

- `src/products.js` — static list of 10 products (id, name, category, price).
- `src/App.jsx` — renders the list, has a search box, and calls
  `getRecommendedIds()` on submit.
- `getRecommendedIds()` sends the catalog + the user's text to Claude,
  asking it to reply with strict JSON: `{"ids": [1, 2]}`. Those ids are
  used to highlight the matching product cards.

## Project structure

```
product-app/
├── index.html
├── package.json
├── vite.config.js
├── .env.example
└── src/
    ├── main.jsx      # React entry point
    ├── App.jsx       # UI + AI call
    ├── products.js   # static product data
    └── index.css     # styling
```
