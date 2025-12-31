'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Mail, Settings } from 'lucide-react';
import { useEmailPreferences } from '@/hooks/useEmailPreferences';

interface EmailPreferencesProps {
  userId: string;
  organizationId: string;
}

export function EmailPreferences({ userId, organizationId }: EmailPreferencesProps) {
  const { preferences, loading, error, updatePreferences } = useEmailPreferences(userId, organizationId);
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePreferenceChange = async (key: keyof typeof preferences, value: boolean) => {
    setIsUpdating(true);
    const success = await updatePreferences({ [key]: value });
    
    if (success) {
      toast.success('Email preferences updated successfully');
    } else {
      toast.error('Failed to update email preferences');
    }
    
    setIsUpdating(false);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Email Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Email Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600 text-sm">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Preferences
        </CardTitle>
        <CardDescription>
          Choose which emails you'd like to receive from Futuristic HR
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Transactional Emails */}
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-sm text-gray-900 mb-3">Account & Security</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Transactional Emails</label>
                  <p className="text-xs text-gray-500">
                    Account signup, password reset, login alerts
                  </p>
                </div>
                <Switch
                  checked={preferences.transactional}
                  onCheckedChange={(checked) => handlePreferenceChange('transactional', checked)}
                  disabled={isUpdating}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Hiring Updates */}
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-sm text-gray-900 mb-3">Hiring Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Hiring Updates</label>
                  <p className="text-xs text-gray-500">
                    New applications, interview results, candidate status changes
                  </p>
                </div>
                <Switch
                  checked={preferences.hiring_updates}
                  onCheckedChange={(checked) => handlePreferenceChange('hiring_updates', checked)}
                  disabled={isUpdating}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Weekly Summary</label>
                  <p className="text-xs text-gray-500">
                    Weekly hiring activity and insights
                  </p>
                </div>
                <Switch
                  checked={preferences.weekly_summary}
                  onCheckedChange={(checked) => handlePreferenceChange('weekly_summary', checked)}
                  disabled={isUpdating}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Product Updates */}
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-sm text-gray-900 mb-3">Product Updates</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Product Updates</label>
                  <p className="text-xs text-gray-500">
                    New features, improvements, bug fixes
                  </p>
                </div>
                <Switch
                  checked={preferences.product_updates}
                  onCheckedChange={(checked) => handlePreferenceChange('product_updates', checked)}
                  disabled={isUpdating}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Marketing */}
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-sm text-gray-900 mb-3">Marketing</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Marketing Emails</label>
                  <p className="text-xs text-gray-500">
                    Tips, case studies, promotional offers
                  </p>
                </div>
                <Switch
                  checked={preferences.marketing}
                  onCheckedChange={(checked) => handlePreferenceChange('marketing', checked)}
                  disabled={isUpdating}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t">
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
            disabled={isUpdating}
          >
            Reset to Defaults
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
