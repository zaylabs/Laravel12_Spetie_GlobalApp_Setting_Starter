import React from 'react';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { Toaster } from 'sonner'; // <-- Import Toaster


interface AppLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  title?: string;
}

export default function AppLayout({ children, breadcrumbs, title }: AppLayoutProps) {
  return (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} title={title}>
      {children}
      <Toaster position="top-right" richColors /> {/* <-- Add the Toaster component */}
    </AppLayoutTemplate>
  );
}
