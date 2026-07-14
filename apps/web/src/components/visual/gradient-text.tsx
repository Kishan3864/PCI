import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * GradientText — emerald→teal→sky gradient clip on text.
 * `animated` gently shifts the gradient.
 */
export function GradientText({
  children,
  className,
  animated = false,
}: {
  children: ReactNode;
  className?: string;
  animated?: boolean;
}) {
  return (
    <span className={cn(animated ? 'text-gradient-animated' : 'text-gradient', className)}>
      {children}
    </span>
  );
}
