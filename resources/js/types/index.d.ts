// Update this file with the following code

import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';
// Remove 'Page' from the import statement
import { PageProps as InertiaPageProps } from '@inertiajs/core'; 

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

// Custom type for the authenticated user, including roles and permissions
export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    roles?: string[];
    permissions?: string[];
    [key: string]: unknown; // Allow for other properties
}

// Custom type for the application settings
export interface SettingApp {
    app_name: string;
    description: string;
    color: string;
    logo?: string;
    favicon?: string;
}

// This is the global PageProps interface that will be used across your application
export interface PageProps extends InertiaPageProps {
    auth: {
        user: User | null;
    };
    ziggy: Config & { location: string };
    flash: {
        success?: string;
        error?: string;
    };
    sidebarOpen: boolean;
    setting: SettingApp | null; // Add the setting prop here
    [key: string]: unknown; // Ensure it can accept other properties
}