'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'LawBud',
    supportEmail: 'support@lawbud.com',
    maxFileSize: '10',
    maintenanceMode: false,
  });

  const [aiSettings, setAiSettings] = useState({
    apiKey: process.env.OPENAI_API_KEY || '',
    model: 'gpt-4o-mini',
    maxTokens: '500',
    temperature: '0.7',
    systemPrompt: `You are an experienced lawyer with expertise in multiple areas of Indian law. Your role is to:
1. Provide legal information and general guidance
2. Help users understand their legal rights and obligations
3. Explain legal concepts in simple terms
4. Suggest possible courses of action`,
  });

  const handleGeneralSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Here you would typically make an API call to save settings
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      toast({
        title: 'Settings Updated',
        description: 'General settings have been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update settings.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAISubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Here you would typically make an API call to save AI settings
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      toast({
        title: 'AI Settings Updated',
        description: 'AI configuration has been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update AI settings.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='space-y-6'>
      <Tabs defaultValue='general' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='general'>General</TabsTrigger>
          <TabsTrigger value='ai'>AI Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value='general'>
          <Card className='p-6'>
            <form onSubmit={handleGeneralSubmit} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='siteName'>Site Name</Label>
                <Input
                  id='siteName'
                  value={generalSettings.siteName}
                  onChange={(e) =>
                    setGeneralSettings((prev) => ({
                      ...prev,
                      siteName: e.target.value,
                    }))
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='supportEmail'>Support Email</Label>
                <Input
                  id='supportEmail'
                  type='email'
                  value={generalSettings.supportEmail}
                  onChange={(e) =>
                    setGeneralSettings((prev) => ({
                      ...prev,
                      supportEmail: e.target.value,
                    }))
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='maxFileSize'>Max File Size (MB)</Label>
                <Input
                  id='maxFileSize'
                  type='number'
                  value={generalSettings.maxFileSize}
                  onChange={(e) =>
                    setGeneralSettings((prev) => ({
                      ...prev,
                      maxFileSize: e.target.value,
                    }))
                  }
                />
              </div>

              <div className='flex items-center justify-between'>
                <Label htmlFor='maintenanceMode'>Maintenance Mode</Label>
                <Switch
                  id='maintenanceMode'
                  checked={generalSettings.maintenanceMode}
                  onCheckedChange={(checked) =>
                    setGeneralSettings((prev) => ({
                      ...prev,
                      maintenanceMode: checked,
                    }))
                  }
                />
              </div>

              <Button type='submit' disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value='ai'>
          <Card className='p-6'>
            <form onSubmit={handleAISubmit} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='apiKey'>OpenAI API Key</Label>
                <Input
                  id='apiKey'
                  type='password'
                  value={aiSettings.apiKey}
                  onChange={(e) =>
                    setAiSettings((prev) => ({
                      ...prev,
                      apiKey: e.target.value,
                    }))
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='model'>AI Model</Label>
                <select
                  id='model'
                  value={aiSettings.model}
                  onChange={(e) =>
                    setAiSettings((prev) => ({
                      ...prev,
                      model: e.target.value,
                    }))
                  }
                  className='w-full h-10 rounded-md border border-input bg-background px-3 py-2'
                >
                  <option value='gpt-4o-mini'>GPT-4o Mini</option>
                  <option value='gpt-4-turbo-preview'>GPT-4 Turbo</option>
                  <option value='gpt-4'>GPT-4</option>
                  <option value='gpt-3.5-turbo'>GPT-3.5 Turbo</option>
                </select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='maxTokens'>Max Tokens</Label>
                <Input
                  id='maxTokens'
                  type='number'
                  value={aiSettings.maxTokens}
                  onChange={(e) =>
                    setAiSettings((prev) => ({
                      ...prev,
                      maxTokens: e.target.value,
                    }))
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='temperature'>Temperature</Label>
                <Input
                  id='temperature'
                  type='number'
                  step='0.1'
                  min='0'
                  max='2'
                  value={aiSettings.temperature}
                  onChange={(e) =>
                    setAiSettings((prev) => ({
                      ...prev,
                      temperature: e.target.value,
                    }))
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='systemPrompt'>System Prompt</Label>
                <textarea
                  id='systemPrompt'
                  value={aiSettings.systemPrompt}
                  onChange={(e) =>
                    setAiSettings((prev) => ({
                      ...prev,
                      systemPrompt: e.target.value,
                    }))
                  }
                  rows={6}
                  className='w-full rounded-md border border-input bg-background px-3 py-2'
                />
              </div>

              <Button type='submit' disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save AI Settings'}
              </Button>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
