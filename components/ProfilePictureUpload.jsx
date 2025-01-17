'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export function ProfilePictureUpload({ user, onUpdate }) {
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user?.avatar_url) {
      setAvatarUrl(user.avatar_url);
    }
  }, [user?.avatar_url]);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async (event) => {
    try {
      setIsUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload an image file',
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please upload an image smaller than 5MB',
          variant: 'destructive',
        });
        return;
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.id);

      // Upload to API
      const response = await fetch('/api/users/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      // Update local avatar URL
      setAvatarUrl(data.avatarUrl);

      // Call onUpdate callback with new avatar URL
      onUpdate(data.avatarUrl);

      toast({
        title: 'Success',
        description: 'Profile picture updated successfully',
      });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile picture. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className='relative'>
      <div className='relative w-24 h-24 overflow-hidden bg-gray-100 rounded-full'>
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={user?.name || 'Profile picture'}
            fill
            className='object-cover'
            sizes='96px'
          />
        ) : (
          <div className='flex items-center justify-center w-full h-full text-lg font-medium text-gray-400'>
            {user?.name
              ?.split(' ')
              .map((n) => n[0])
              .join('')}
          </div>
        )}
        <Button
          size='icon'
          variant='outline'
          className='absolute bottom-0 right-0 bg-white rounded-full cursor-pointer'
          disabled={isUploading}
          onClick={handleButtonClick}
        >
          {isUploading ? (
            <Loader2 className='w-4 h-4 animate-spin' />
          ) : (
            <Edit2 className='w-4 h-4' />
          )}
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        onChange={handleUpload}
        className='hidden'
      />
    </div>
  );
}
