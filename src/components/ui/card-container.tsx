import React from 'react';
import { cn } from '@/lib/utils';

interface CardContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  equalHeight?: boolean;
  responsive?: boolean;
}

const CardContainer: React.FC<CardContainerProps> = ({
  children,
  equalHeight = false,
  responsive = true,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 md:gap-6',
        responsive && 'lg:flex-row',
        equalHeight && 'items-stretch',
        'transition-all duration-300 ease-in-out',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  equalHeight?: boolean;
}

const Card: React.FC<CardProps> = ({ children, equalHeight = false, className, ...props }) => {
  return (
    <div
      className={cn(
        'bg-white dark:bg-[#2B2D31] rounded-xl shadow-xl border border-gray-200 dark:border-[#1E1F22]/50',
        equalHeight && 'h-full min-h-[400px] lg:min-h-[500px]',
        'transition-all duration-300 ease-in-out',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export { CardContainer, Card };
