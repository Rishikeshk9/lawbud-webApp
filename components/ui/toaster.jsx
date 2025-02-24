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
import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';

export function Toaster() {
  const { toasts } = useToast();

  const getToastStyles = (variant) => {
    switch (variant) {
      case 'success':
        return {
          containerClass: 'bg-green-50 border-green-200',
          titleClass: 'text-green-800',
          descriptionClass: 'text-green-600',
          icon: <CheckCircle className='w-5 h-5 text-green-500' />,
        };
      case 'destructive':
        return {
          containerClass: 'bg-red-50 border-red-200',
          titleClass: 'text-red-800',
          descriptionClass: 'text-red-600',
          icon: <XCircle className='w-5 h-5 text-red-500' />,
        };
      case 'warning':
        return {
          containerClass: 'bg-yellow-50 border-yellow-200',
          titleClass: 'text-yellow-800',
          descriptionClass: 'text-yellow-600',
          icon: <AlertCircle className='w-5 h-5 text-yellow-500' />,
        };
      default:
        return {
          containerClass: 'bg-white border-gray-200',
          titleClass: 'text-gray-800',
          descriptionClass: 'text-gray-600',
          icon: <Info className='w-5 h-5 text-gray-500' />,
        };
    }
  };

  return (
    <ToastProvider>
      {toasts.map(function ({
        id,
        title,
        description,
        action,
        variant,
        ...props
      }) {
        const styles = getToastStyles(variant);

        return (
          <Toast
            key={id}
            {...props}
            className={`${styles.containerClass} border shadow-lg`}
          >
            <div className='flex gap-3'>
              {styles.icon}
              <div className='grid gap-1'>
                {title && (
                  <ToastTitle className={styles.titleClass}>{title}</ToastTitle>
                )}
                {description && (
                  <ToastDescription className={styles.descriptionClass}>
                    {description}
                  </ToastDescription>
                )}
              </div>
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
