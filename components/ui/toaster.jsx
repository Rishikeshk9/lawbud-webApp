'use client';

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast
            key={id}
            {...props}
            className='bg-white text-black border border-gray-200 shadow-lg'
          >
            <div className='grid gap-1'>
              {title && <ToastTitle className='text-black'>{title}</ToastTitle>}
              {description && (
                <ToastDescription className='text-gray-600'>
                  {description}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose className='text-gray-400 hover:text-gray-600' />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
