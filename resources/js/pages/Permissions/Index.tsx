import React, { FormEventHandler, useState } from 'react';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

// Temporary fix: define PageProps here if not present in '@/types'
type PageProps = {
    // Add properties as needed for your app
    flash?: { success?: string };
};

import { Pencil, Trash, Plus, X } from 'lucide-react';

// --- MOCK COMPONENTS (assuming a UI library like shadcn/ui is not present) ---
// You should replace these with your actual UI components if available.
interface ButtonProps {
    children: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    className?: string;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({ children, onClick, className, disabled, type = 'button' }) => (
    <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`px-4 py-2 rounded-md font-semibold transition-colors duration-200 ${className}`}
    >
        {children}
    </button>
);

const Input = ({ ...props }) => (
    <input
        {...props}
        className="mt-1 block w-full rounded-md shadow-sm border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
    />
);

const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ children, ...props }) => (
    <label {...props} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {children}
    </label>
);
// --- END MOCK COMPONENTS ---

interface PermissionsIndexPageProps extends PageProps {
    permissions: SpatiePermission[];
}

interface SpatiePermission {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Permissions',
        href: '/permissions',
    },
];


const PermissionsIndex: React.FC<PermissionsIndexPageProps> = ({ permissions }) => {
    const { success } = (usePage().props.flash ?? {}) as { success?: string };

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [currentPermission, setCurrentPermission] = useState<SpatiePermission | null>(null);

    const { data, setData, post, put, reset, errors, processing } = useForm<{ name: string }>({
        name: '',
    });

    const openModal = (permission?: SpatiePermission) => {
        setIsModalOpen(true);
        if (permission) {
            setIsEditing(true);
            setCurrentPermission(permission);
            setData('name', permission.name);
        } else {
            setIsEditing(false);
            setCurrentPermission(null);
            reset();
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const openDeleteModal = (permission: SpatiePermission) => {
        setCurrentPermission(permission);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setCurrentPermission(null);
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        if (isEditing && currentPermission?.id) {
            put(route('permissions.update', currentPermission.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('permissions.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = () => {
        if (currentPermission?.id) {
            router.delete(route('permissions.destroy', currentPermission.id), {
                onSuccess: () => closeDeleteModal(),
            });
        }
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Permissions" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                            <span className="block sm:inline">{success}</span>
                        </div>
                    )}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="flex justify-between items-center mb-6 border-b pb-4">
                                <h3 className="text-xl font-bold">Permissions Management</h3>
                                <Button
                                    onClick={() => openModal()}
                                    className="flex items-center bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Permission
                                </Button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                ID
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {permissions.length > 0 ? (
                                            permissions.map((permission) => (
                                                <tr key={permission.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {permission.id}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                        {permission.name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                        <div className="flex justify-center space-x-2">
                                                            <Button
                                                                onClick={() => openModal(permission)}
                                                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 bg-transparent px-2"
                                                            >
                                                                <Pencil className="w-5 h-5" />
                                                            </Button>
                                                            <Button
                                                                onClick={() => openDeleteModal(permission)}
                                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 bg-transparent px-2"
                                                            >
                                                                <Trash className="w-5 h-5" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                                    No permissions found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create/Edit Permission Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-600 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md p-6 relative m-4">
                        <Button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-transparent px-2">
                            <X className="w-6 h-6" />
                        </Button>
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">{isEditing ? 'Edit Permission' : 'Create New Permission'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <Label htmlFor="name">Permission Name</Label>
                                <Input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('name', e.target.value)}
                                    required
                                />
                                {errors.name && <div className="text-sm text-red-500 mt-1">{errors.name}</div>}
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button
                                    type="button"
                                    onClick={closeModal}
                                    className="bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-indigo-600 text-white hover:bg-indigo-700"
                                >
                                    {isEditing ? 'Update' : 'Create'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-600 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-sm p-6 relative m-4">
                        <Button onClick={closeDeleteModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-transparent px-2">
                            <X className="w-6 h-6" />
                        </Button>
                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Confirm Deletion</h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-6">
                            Are you sure you want to delete the permission "{currentPermission?.name}"? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-2">
                            <Button
                                type="button"
                                onClick={closeDeleteModal}
                                className="bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleDelete}
                                disabled={processing}
                                className="bg-red-600 text-white hover:bg-red-700"
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

export default PermissionsIndex;
