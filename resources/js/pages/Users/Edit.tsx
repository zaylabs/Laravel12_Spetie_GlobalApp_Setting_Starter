import React from 'react';
import { Head, useForm } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Props {
    user: User;
}

const UsersEdit: React.FC<Props> = ({ user }) => {
    // The useForm hook simplifies form handling with Inertia.
    const { data, setData, patch, errors } = useForm({
        name: user.name,
        email: user.email,
    });

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('users.update', user.id));
    };

    return (
        <>
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
        </>
    );
};

export default UsersEdit;