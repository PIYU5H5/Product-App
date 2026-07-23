import React, { useState } from "react";
import products from "./products.js";

import.meta.env.API_KEY;

async function getRecommendedIds(userInput) {
  const catalog = products.map(({ id, name, category, price }) => ({
    id,
    name,
    category,
    price,
  }));

  const systemPrompt = `You are a product recommendation engine.
Here is the product catalog as JSON: ${JSON.stringify(catalog)}
Given the user's request, return ONLY raw JSON (no markdown, no extra text) in this exact shape:
{"ids": [1, 2]}
Include only the ids of products that match the request. If nothing matches, return {"ids": []}.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: "user", content: userInput }],
    }),
  });

  if (!response.ok) throw new Error("AI request failed");

  const data = await response.json();
  const text = data.content.find((b) => b.type === "text")?.text || "";
  const cleaned = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned);
  return parsed.ids || [];
}

export default function App() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [matchedIds, setMatchedIds] = useState(null); // null = no search yet

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const ids = await getRecommendedIds(query);
      setMatchedIds(ids);
    } catch (err) {
      setError("Something went wrong. Check your API key and try again.");
      setMatchedIds(null);
    }
    setLoading(false);
  }

  function clearSearch() {
    setQuery("");
    setMatchedIds(null);
    setError("");
  }

  return (
    <div className="app">
      <h1>Product Recommendations</h1>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='e.g. "I want a phone under $500"'
        />
        <button type="submit" disabled={loading}>
          {loading ? "Thinking..." : "Ask AI"}
        </button>
        {matchedIds !== null && (
          <button type="button" onClick={clearSearch} className="clear-btn">
            Clear
          </button>
        )}
      </form>

      {error && <p className="error">{error}</p>}

      {matchedIds !== null && (
        <p className="result-note">
          {matchedIds.length > 0
            ? `Found ${matchedIds.length} match(es) for "${query}"`
            : `No matches found for "${query}"`}
        </p>
      )}

      <ul className="product-list">
        {products.map((product) => {
          const isMatch = matchedIds?.includes(product.id);
          return (
            <li
              key={product.id}
              className={`product-card ${isMatch ? "matched" : ""}`}
            >
              {isMatch && <span className="badge">Recommended</span>}
              <span className="product-name">{product.name}</span>
              <span className="product-category">{product.category}</span>
              <span className="product-price">${product.price}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
