import React from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';

// Import the base PageProps type from Inertia
import type { PageProps } from '@inertiajs/core';

interface User {
    id: number;
    name: string;
    email: string;
    branch_code: string;
}

// Extend the base PageProps type to include your custom props
interface EditUserPageProps extends PageProps {
    user: User;
    branches: Record<string, string>;
}

const UsersEdit: React.FC = () => {
    // Cast the page props to your custom type
    const { user, branches } = usePage<EditUserPageProps>().props;

    const { data, setData, patch, errors } = useForm({
        name: user.name,
        email: user.email,
        branch_code: user.branch_code || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('users.update', user.id));
    };

    return (
        <AppLayout>
            <Head title="Edit User" />
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Edit User</h1>
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                        {errors.name && <p className="text-red-500 text-xs italic mt-2">{errors.name}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                        {errors.email && <p className="text-red-500 text-xs italic mt-2">{errors.email}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="branch_code">
                            Branch
                        </label>
                        <Select
                            value={data.branch_code}
                            onValueChange={(value) => setData('branch_code', value)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a branch" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(branches).map(([code, name]) => (
                                    <SelectItem key={code} value={code}>
                                        {name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.branch_code && <p className="text-red-500 text-xs italic mt-2">{errors.branch_code}</p>}
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Update User
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
};

export default UsersEdit;