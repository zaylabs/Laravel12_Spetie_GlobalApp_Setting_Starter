import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage} from '@inertiajs/react';
// Define PageProps locally if not exported from '@/types'
type PageProps = {
    auth: {
        user: {
            roles: string[];
            permissions: string[];
            [key: string]: unknown;
        };
        [key: string]: unknown;
    };
    [key: string]: unknown;
};



const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    // Get the page props using the usePage hook
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    // Helper function to check if the user has a specific permission
    const can = (permission: string): boolean => {
        return user.permissions.includes(permission);
    };

    // Helper function to check if the user has a specific role
    const hasRole = (role: string): boolean => {
        return user.roles.includes(role);
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <p className="mb-4">
                                You're logged in!
                            </p>

                            <p className="font-semibold">
                                Your roles: <span className="font-normal">{user.roles.join(', ')}</span>
                            </p>

                            <div className="mt-6 flex flex-col space-y-4">
                                {/* Conditionally render a button for creating posts */}
                                {can('create posts') && (
                                    <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-200">
                                        Create New Post
                                    </button>
                                )}

                                {/* Conditionally render an admin-specific section */}
                                {hasRole('admin') && (
                                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative">
                                        <p className="font-bold">Admin Section</p>
                                        <p className="text-sm">This content is only visible to users with the 'admin' role.</p>
                                    </div>
                                )}
                                {/* Conditionally render an admin-specific section */}
                                {hasRole('user') && (
                                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative">
                                        <p className="font-bold">User Section</p>
                                        <p className="text-sm">This content is only visible to users with the 'user' role.</p>
                                    </div>
                                )}
                                
                                {/* Conditionally render a POS-specific link */}
                                {can('access pos') && (
                                    <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-200">
                                        Go to POS
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </AppLayout>
    );
}
