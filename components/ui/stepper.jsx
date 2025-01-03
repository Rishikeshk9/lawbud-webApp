'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const Stepper = React.forwardRef(
  ({ className, currentStep, children, ...props }, ref) => {
    const steps = React.Children.toArray(children);

    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-2', className)}
        {...props}
      >
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full border-2',
                index + 1 <= currentStep
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-300 text-gray-500'
              )}
            >
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5',
                  index + 1 < currentStep ? 'bg-primary' : 'bg-gray-300'
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }
);
Stepper.displayName = 'Stepper';

const Step = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('text-sm text-gray-600', className)}
      {...props}
    >
      {children}
    </div>
  );
});
Step.displayName = 'Step';

export { Stepper, Step };
