import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
// Define a minimal PageProps type if not available in '@/types'
type PageProps = Record<string, unknown>;

// Extend the User interface to include roles
interface User {
    id: number;
    name: string;
    email: string;
    roles: string[];
}

// Extend PageProps to include the authenticated user with roles/permissions
interface AuthenticatedPageProps extends PageProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            roles: string[];
            permissions: string[];
        };
    };
    users: User[];
}

// The main component now accepts the `users` prop from the controller
const Index: React.FC<AuthenticatedPageProps> = ({ users }) => {
    // Access the shared auth props from Inertia
    const { props } = usePage<PageProps>();
    const authUser = ((props as unknown) as AuthenticatedPageProps).auth.user;

    // Helper function to check if the user has a specific permission
    const can = (permission: string): boolean => {
        return authUser.permissions.includes(permission);
    };

    // Delete handler
    const handleDelete = (id: number) => {
        // Only allow deletion if the authenticated user has the 'manage users' permission
        if (can('manage users')) {
            if (confirm('Are you sure you want to delete this user?')) {
                router.delete(`/users/${id}`, {
                    onSuccess: () => {
                        console.log(`User ${id} deleted successfully.`);
                    },
                    onError: (errors) => {
                        console.error('Delete failed:', errors);
                    }
                });
            }
        } else {
            console.error('Permission denied: You do not have the necessary permissions to delete users.');
        }
    };

    return (
        <AppLayout>
            <div className="p-6">
                {/* Conditionally render the 'Add User' button based on permission */}
                {can('manage users') && (
                    <Link href="/users/create">
                        <Button className="w-full md:w-auto" size="sm">Add User</Button>
                    </Link>
                )}
            </div>
            <Head title="Users Table" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">All Users</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ID
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Roles
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.map((user) => (
                                            <tr key={user.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {user.id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {user.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {user.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <span className="font-semibold">{user.roles.join(', ')}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right space-x-2">
                                                    {/* Conditionally render the 'Edit' and 'Delete' buttons */}
                                                    {can('manage users') && (
                                                        <>
                                                            <Link href={`/user/${user.id}/edit`} className="text-blue-600 hover:text-blue-900">
                                                                Edit
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(user.id)}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                Delete
                                                            </button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default Index;
