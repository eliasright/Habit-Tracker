import React from 'react';
import MotivationQuoteSelector from './MotivationQuoteSelector';

interface MotivationQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: string;
  onChange: (quote: string) => void;
}

export default function MotivationQuoteModal({ isOpen, onClose, value, onChange }: MotivationQuoteModalProps) {
  if (!isOpen) return null;

  const handleQuoteChange = (quote: string) => {
    onChange(quote);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-card-bg border border-border rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card-bg border-b border-border px-6 py-4 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✨</span>
              <h2 className="text-xl font-bold text-text-primary">Pick your motivation</h2>
            </div>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary transition-colors p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-text-secondary mt-2">
            Choose a quote that motivates you, or write your own
          </p>
        </div>
        
        <div className="p-6">
          <MotivationQuoteSelector
            value={value}
            onChange={handleQuoteChange}
            className="motivation-modal-selector"
          />
        </div>
      </div>
    </div>
  );
}