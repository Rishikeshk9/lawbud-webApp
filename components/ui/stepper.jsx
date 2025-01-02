'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Stepper({ steps, currentStep }) {
  return (
    <div className='w-full'>
      {/* Steps with connecting lines */}
      <div className='relative flex items-center justify-between'>
        {steps.map((step, index) => (
          <div key={index} className='flex items-center flex-col relative'>
            {/* Connecting line before */}
            {index > 0 && (
              <div
                className={cn(
                  'absolute right-[50%] top-[15px] h-[2px] w-[calc(100%_-_2rem)]',
                  {
                    'bg-primary': index <= currentStep,
                    'bg-red-200': index > currentStep,
                  }
                )}
                style={{ right: '50%', width: 'calc(100% - 2rem)' }}
              />
            )}
            {/* Step circle */}
            <div
              className={cn(
                'relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-200',
                {
                  'border-primary bg-black text-black': index < currentStep,
                  'border-primary bg-white text-primary ring-2 ring-black ring-offset-2':
                    index === currentStep,
                  'border-gray-200 bg-white text-gray-400': index > currentStep,
                }
              )}
            >
              {index < currentStep ? (
                <Check className='h-5 w-5 text-white' />
              ) : (
                <span
                  className={cn('text-sm font-medium', {
                    'text-white': index < currentStep,
                    'text-primary': index === currentStep,
                    'text-gray-400': index > currentStep,
                  })}
                >
                  {index + 1}
                </span>
              )}
            </div>
            {/* Step label */}
            <div className='absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap'>
              <span
                className={cn(
                  'text-sm font-medium transition-colors duration-200',
                  {
                    'text-primary': index <= currentStep,
                    'text-gray-400': index > currentStep,
                  }
                )}
              >
                {step}
              </span>
            </div>
          </div>
        ))}
      </div>
      {/* Spacer for labels */}
      <div className='h-8'></div>
    </div>
  );
}
