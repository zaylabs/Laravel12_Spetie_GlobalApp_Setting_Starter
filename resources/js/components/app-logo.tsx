import { usePage } from '@inertiajs/react';
import React from 'react';
import AppLogoIcon from './app-logo-icon';
import { cn } from '@/lib/utils';

interface AppLogoProps {
    className?: string;
}

export default function AppLogo({ className }: AppLogoProps) {
    const setting = usePage().props.setting as {
        app_name?: string;
        logo?: string;
    } | null;

    const defaultAppName = 'Novex Dry Cleaners';
    const appName = setting?.app_name || defaultAppName;
    const logo = setting?.logo;

    return (
        <div className={cn('flex items-center gap-2', className)}>
            {logo ? (
                <img
                    src={`/storage/${logo}`}
                    alt="Logo"
                    className="h-8 w-8 rounded-md object-contain"
                />
            ) : (
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md">
                    <AppLogoIcon className="size-[1.375rem] fill-current text-white dark:text-black" />
                </div>
            )}
            <div className="grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate font-semibold leading-none">
                    {appName}
                </span>
            </div>
        </div>
    );
}
