import { useState, useEffect } from 'react';
import { emailService } from '../services/email.service';

interface EmailPreferences {
  product_updates: boolean;
  hiring_updates: boolean;
  transactional: boolean;
  weekly_summary: boolean;
}

export const useEmailPreferences = (userId: string, organizationId: string) => {
  const [preferences, setPreferences] = useState<EmailPreferences>({
    product_updates: true,
    hiring_updates: true,
    transactional: true,
    weekly_summary: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setLoading(true);
        setError(null);
        const userPreferences = await emailService.getUserEmailPreferences(userId, organizationId);
        setPreferences(userPreferences);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load email preferences');
      } finally {
        setLoading(false);
      }
    };

    if (userId && organizationId) {
      loadPreferences();
    }
  }, [userId, organizationId]);

  const updatePreferences = async (newPreferences: Partial<EmailPreferences>) => {
    try {
      setError(null);
      const success = await emailService.updateUserEmailPreferences(userId, organizationId, newPreferences);
      
      if (success) {
        setPreferences(prev => ({ ...prev, ...newPreferences }));
        return true;
      } else {
        setError('Failed to update email preferences');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update email preferences';
      setError(errorMessage);
      return false;
    }
  };

  const togglePreference = (key: keyof EmailPreferences) => {
    const newValue = !preferences[key];
    updatePreferences({ [key]: newValue });
  };

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    togglePreference,
  };
};
