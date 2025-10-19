import React, { useState } from 'react';
import apiClient from '../config/apiClient';
import { useAuthStore } from '../store/authStore';
import TimezoneSelector from './TimezoneSelector';
import MotivationQuoteModal from './MotivationQuoteModal';
import { Tooltip } from 'react-tooltip';

interface OnboardingData {
  name: string;
  timezone: string;
  motivationQuote: string;
}

interface OnboardingFlowProps {
  onComplete: () => void;
}


export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [formData, setFormData] = useState<OnboardingData>({
    name: '',
    timezone: '',
    motivationQuote: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const { user, setUser } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.timezone) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await apiClient.post('/api/onboarding/complete', formData);

      setUser(response.data.user);
      onComplete();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to complete onboarding');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      name: e.target.value
    }));
  };

  // Check if form is valid for submit button state
  const isFormValid = formData.name.trim() && formData.timezone;

  // Get display text for motivation quote
  const getQuoteDisplayText = () => {
    if (!formData.motivationQuote) return "Choose your inspiration";
    if (formData.motivationQuote.length > 50) {
      return formData.motivationQuote.substring(0, 50) + "...";
    }
    return formData.motivationQuote;
  };

  return (
    <div className="min-h-screen bg-bg-secondary flex items-center justify-center p-4">
      <div className="bg-card-bg border border-border rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Welcome!</h1>
          <p className="text-text-secondary">Let's set up your habit tracker</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
              What should we call you? *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border border-border bg-bg-primary text-text-primary rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
              required
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <label className="block text-sm font-medium text-text-primary">
                Where are you located? *
              </label>
              <div 
                data-tooltip-id="timezone-tooltip"
                data-tooltip-content="This helps us show you the correct time and schedule your habits properly"
                className="flex items-center justify-center w-6 h-6 bg-accent/20 rounded-full cursor-help"
              >
                <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <TimezoneSelector
              value={formData.timezone}
              onChange={(timezone) => setFormData(prev => ({ ...prev, timezone }))}
              className="timezone-selector"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-text-primary">
                Your Motivation
              </label>
              <button
                type="button"
                onClick={() => setShowQuoteModal(true)}
                className="text-xs bg-orange-100 hover:bg-orange-200 text-accent px-3 py-1 rounded-full border border-orange-100 hover:border-orange-200 transition-all"
              >
                Need inspiration?
              </button>
            </div>
            <textarea
              value={formData.motivationQuote}
              onChange={(e) => setFormData(prev => ({ ...prev, motivationQuote: e.target.value }))}
              placeholder="You can do it man!"
              rows={3}
              className="w-full px-4 py-3 border border-border bg-bg-primary text-text-primary rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-colors resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !isFormValid}
            className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Setting up...
              </>
            ) : (
              'Complete Setup'
            )}
          </button>
        </form>
      </div>
      
      {/* Motivation Quote Modal */}
      <MotivationQuoteModal
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        value={formData.motivationQuote}
        onChange={(quote) => setFormData(prev => ({ ...prev, motivationQuote: quote }))}
      />
      
      {/* Tooltips */}
      <Tooltip id="timezone-tooltip" place="top" />
    </div>
  );
}