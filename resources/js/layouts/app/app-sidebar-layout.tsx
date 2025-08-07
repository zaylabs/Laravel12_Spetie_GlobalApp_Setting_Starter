import { useEffect, useMemo } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

interface Props {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    title?: string;
}

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
    title = 'Dashboard',
}: Props) {
    const { props } = usePage();

    const flash = useMemo(() => (props?.flash as { success?: string; error?: string }) ?? {}, [props?.flash]);
    const setting = props?.setting as {
        app_name: string;
        logo?: string;
        favicon?: string; // Ensure favicon is also in the type definition
        color?: string;
        seo?: {
            title?: string;
            description?: string;
            keywords?: string;
        };
    };

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash]);

    const primaryColor = setting?.color || '#0ea5e9';
    const primaryForeground = '#ffffff';

    useEffect(() => {
        const unsubscribe = router.on('navigate', () => {
            router.reload({ only: ['menus'] });
        });

        return () => unsubscribe();
    }, []);

    // Function to add a cache-busting timestamp
    const getFaviconUrl = (path: string) => {
        return `${path}?t=${new Date().getTime()}`;
    };

    return (
        <>
            <Head>
                <title>{title ?? setting?.app_name ?? 'Dashboard'}</title>
                             {/* Dynamically add the favicon link */}
                {setting?.favicon && (
                    <link rel="icon" type="image/x-icon" href={getFaviconUrl(`/storage/${setting.favicon}`)} />
                )}
                <style>
                    {`
                        :root {
                            --primary: ${primaryColor};
                            --color-primary: ${primaryColor};
                            --primary-foreground: ${primaryForeground};
                            --color-primary-foreground: ${primaryForeground};
                        }
                        .dark {
                            --primary: ${primaryColor};
                            --color-primary: ${primaryColor};
                            --primary-foreground: ${primaryForeground};
                            --color-primary-foreground: ${primaryForeground};
                        }
                    `}
                </style>
            </Head>

            <div
                style={{
                    ['--primary' as string]: primaryColor,
                    ['--primary-foreground' as string]: primaryForeground,
                    ['--color-primary' as string]: primaryColor,
                    ['--color-primary-foreground' as string]: primaryForeground,
                }}
            >
                <AppShell variant="sidebar">
                    <AppSidebar />
                    <AppContent variant="sidebar">
                        <AppSidebarHeader breadcrumbs={breadcrumbs} />
                        {children}
                    </AppContent>
                </AppShell>
            </div>

            <Toaster />
        </>
    );
}
