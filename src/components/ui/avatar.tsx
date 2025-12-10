'use client';

import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn, getInitials, stringToColor } from '@/lib/utils';

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square h-full w-full', className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium',
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

// User avatar with automatic fallback
interface UserAvatarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

function UserAvatar({ user, size = 'md', className }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  };

  const displayName = user.name || user.email || 'User';
  const initials = getInitials(displayName);
  const bgColor = stringToColor(displayName);

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {user.image && <AvatarImage src={user.image} alt={displayName} />}
      <AvatarFallback style={{ backgroundColor: bgColor }} className="text-white">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

// Profile avatar for browser profiles
interface ProfileAvatarProps {
  profile: {
    name: string;
    templateId?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function ProfileAvatar({ profile, size = 'md', className }: ProfileAvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  // Get icon based on template/OS
  const getIcon = () => {
    const templateId = profile.templateId || '';
    if (templateId.includes('windows')) return '🪟';
    if (templateId.includes('mac')) return '🍎';
    if (templateId.includes('linux')) return '🐧';
    if (templateId.includes('android')) return '🤖';
    if (templateId.includes('ios') || templateId.includes('iphone')) return '📱';
    return '🌐';
  };

  return (
    <Avatar className={cn(sizeClasses[size], 'bg-muted', className)}>
      <AvatarFallback className="bg-primary/10 text-xl">{getIcon()}</AvatarFallback>
    </Avatar>
  );
}

export { Avatar, AvatarImage, AvatarFallback, UserAvatar, ProfileAvatar };
