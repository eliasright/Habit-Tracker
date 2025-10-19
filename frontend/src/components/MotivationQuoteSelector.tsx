import React, { useState, useMemo } from 'react';

interface Quote {
  id: number;
  text: string;
  author: string;
}

interface MotivationQuoteSelectorProps {
  value: string;
  onChange: (quote: string) => void;
  className?: string;
}

// Curated list of motivational quotes
const defaultQuotes: Quote[] = [
  { id: 1, text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { id: 2, text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { id: 3, text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { id: 4, text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
  { id: 5, text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { id: 6, text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { id: 7, text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { id: 8, text: "Life is what happens to you while you're busy making other plans.", author: "John Lennon" },
  { id: 9, text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
  { id: 10, text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" }
];

// Just use default quotes - no API loading
const getQuotes = (): Quote[] => {
  return defaultQuotes;
};

export default function MotivationQuoteSelector({ value, onChange, className = '' }: MotivationQuoteSelectorProps) {
  const [quotes] = useState<Quote[]>(getQuotes());
  
  // Calculate selected quote from current value - no useEffect needed
  const selectedQuote = useMemo(() => {
    if (value) {
      return quotes.find(q => q.text === value) || null;
    }
    return null;
  }, [value, quotes]);

  const handleQuoteSelect = (quote: Quote) => {
    onChange(quote.text); // Just the quote text, no formatting
  };

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Quote Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
          {quotes.map((quote) => (
            <button
              key={quote.id}
              onClick={() => handleQuoteSelect(quote)}
              className={`group text-left p-4 rounded-xl transition-all duration-300 border hover:shadow-md ${
                selectedQuote?.id === quote.id
                  ? 'bg-accent/10 border-accent text-accent'
                  : 'bg-bg-secondary hover:bg-accent/5 border-border hover:border-accent/30'
              }`}
            >
              <div className="text-sm mb-3 leading-relaxed font-medium text-text-primary">
                "{quote.text}"
              </div>
              <div className="text-xs font-semibold text-accent">
                — {quote.author}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}