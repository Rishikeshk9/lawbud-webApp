'use client';

import * as React from 'react';
import { Check, CheckCircle, CheckIcon, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select options',
  className,
}) {
  const [open, setOpen] = React.useState(false);

  const handleUnselect = (item) => {
    onChange(selected.filter((i) => i !== item));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className={cn(
            'w-full justify-between hover:bg-background',
            selected.length > 0 ? 'h-full min-h-[2.5rem] py-2' : 'h-10',
            className
          )}
        >
          <div className='flex flex-wrap gap-1'>
            {selected.length === 0 && placeholder}
            {selected.map((item) => (
              <Badge
                variant='secondary'
                key={item}
                className='mr-1 mb-1'
                onClick={(e) => {
                  e.stopPropagation();
                  handleUnselect(item);
                }}
              >
                {item}
                <button
                  className='ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleUnselect(item);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleUnselect(item);
                  }}
                >
                  <X className='h-3 w-3 text-muted-foreground hover:text-foreground' />
                </button>
              </Badge>
            ))}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-full p-0' align='start'>
        <Command className='w-full'>
          <CommandInput placeholder='Search...' className='h-9' />
          <CommandEmpty>No option found.</CommandEmpty>
          <CommandGroup className='max-h-64 overflow-auto z-50'>
            {options.map((option) => (
              <CommandItem
                key={option}
                value={option}
                onSelect={() => {
                  console.log('option', option);
                  onChange(
                    selected.includes(option)
                      ? selected.filter((item) => item !== option)
                      : [...selected, option]
                  );
                }}
                className='cursor-pointer  '
              >
                <CheckIcon
                  className={cn(
                    'mr-2 h-4 w-4  ',
                    selected.includes(option) ? 'opacity-100' : 'opacity-0'
                  )}
                />
                {option}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
