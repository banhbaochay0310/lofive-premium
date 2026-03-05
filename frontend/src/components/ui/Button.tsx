import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-bold transition-all duration-200 cursor-pointer focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-black hover:bg-primary-hover hover:scale-[1.04]',
        secondary:
          'bg-white text-black hover:bg-neutral-200 hover:scale-[1.04]',
        outline:
          'border border-neutral-500 text-white bg-transparent hover:border-white hover:scale-[1.04]',
        ghost:
          'text-text-secondary hover:text-white bg-transparent',
        link:
          'text-text-secondary hover:text-white underline-offset-4 hover:underline bg-transparent p-0 h-auto',
      },
      size: {
        sm: 'h-8 px-4 text-sm rounded-full',
        md: 'h-12 px-8 text-base rounded-full',
        lg: 'h-14 px-10 text-lg rounded-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), fullWidth && 'w-full', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
