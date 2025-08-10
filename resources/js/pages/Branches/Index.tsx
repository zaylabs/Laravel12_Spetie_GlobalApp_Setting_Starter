import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Pencil, Trash, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Define the shape of a Branch object for type safety
interface Branch {
    id: number;
    BranchName: string;
    BranchCode: string;
    Address: string | null;
    Mobile: string | null;
}

// Define the shape of the form data
interface FormData {
    BranchName: string;
    BranchCode: string;
    Address: string;
    Mobile: string;
    _method?: 'put'; // For method spoofing on updates
}

// Define the props that this component expects from the Laravel controller
interface Props {
    branches: Branch[];
}

interface InertiaErrors {
    [key: string]: string;
}

// Define the breadcrumbs for this page
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Branches',
        href: '/branches',
    },
];

// Main App component
export default function BranchesIndex({ branches }: Props) {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);

    const { data, setData, post, processing, reset, delete: destroy } = useForm<Record<string, any> & FormData>({
        BranchName: '',
        BranchCode: '',
        Address: '',
        Mobile: '',
    });

    const openModal = (branch?: Branch) => {
        setIsModalOpen(true);
        if (branch) {
            setIsEditing(true);
            setCurrentBranch(branch);
            setData({
                _method: 'put',
                BranchName: branch.BranchName,
                BranchCode: branch.BranchCode,
                Address: branch.Address || '',
                Mobile: branch.Mobile || '',
            });
        } else {
            setIsEditing(false);
            setCurrentBranch(null);
            reset();
            setData(previousData => ({ ...previousData, _method: undefined }));
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        setCurrentBranch(null);
    };

    const openDeleteModal = (branch: Branch) => {
        setCurrentBranch(branch);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setCurrentBranch(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing && currentBranch?.id) {
            post(route('branches.update', currentBranch.id), {
                onSuccess: () => {
                    closeModal();
                    toast.success('Branch updated successfully.', {
                        description: 'The branch details have been saved.',
                    });
                },
                onError: (errors: InertiaErrors) => {
                    toast.error("Failed to update branch.", {
                        description: Object.values(errors).join('\n'),
                    });
                    console.error(errors);
                },
            });
        } else {
            post(route('branches.store'), {
                onSuccess: () => {
                    closeModal();
                    toast.success('Branch created successfully.', {
                        description: 'The new branch has been added.',
                    });
                },
                onError: (errors: InertiaErrors) => {
                    toast.error("Failed to create branch.", {
                        description: Object.values(errors).join('\n'),
                    });
                    console.error(errors);
                },
            });
        }
    };

    const handleDelete = () => {
        if (currentBranch?.id) {
            destroy(`/branches/${currentBranch.id}`, {
                onSuccess: () => {
                    closeDeleteModal();
                    toast.success("Branch deleted successfully.");
                },
                onError: (errors: InertiaErrors) => {
                    toast.error("Failed to delete branch.", {
                        description: Object.values(errors).join('\n'),
                    });
                    console.error(errors);
                }
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Branches Management" />
            <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h1 className="text-3xl font-bold text-gray-800">Branches Management</h1>
                    <Button
                        onClick={() => openModal()}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors duration-200"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Create Branch
                    </Button>
                </div>

                {/* Branches Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr className="bg-gray-200 text-left text-gray-600 uppercase text-sm font-semibold">
                                <th className="px-5 py-3 border-b-2 border-gray-300">Name</th>
                                <th className="px-5 py-3 border-b-2 border-gray-300">Code</th>
                                <th className="px-5 py-3 border-b-2 border-gray-300">Address</th>
                                <th className="px-5 py-3 border-b-2 border-gray-300">Mobile</th>
                                <th className="px-5 py-3 border-b-2 border-gray-300 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {branches.map((branch) => (
                                <tr key={branch.id} className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap font-medium">{branch.BranchName}</p>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap">{branch.BranchCode}</p>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <p className="text-gray-600 whitespace-no-wrap">{branch.Address || 'N/A'}</p>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <p className="text-gray-600 whitespace-no-wrap">{branch.Mobile || 'N/A'}</p>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                        <div className="flex justify-center space-x-2">
                                            <Button
                                                onClick={() => openModal(branch)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                                title="Edit Branch"
                                                variant="ghost"
                                                size="icon"
                                            >
                                                <Pencil className="w-5 h-5" />
                                            </Button>
                                            <Button
                                                onClick={() => openDeleteModal(branch)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Delete Branch"
                                                variant="ghost"
                                                size="icon"
                                            >
                                                <Trash className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Create/Edit Branch Modal */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{isEditing ? 'Edit Branch' : 'Create New Branch'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="BranchName" className="text-right">Branch Name</Label>
                                    <Input id="BranchName" value={data.BranchName} onChange={(e) => setData('BranchName', e.target.value)} className="col-span-3" required />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="BranchCode" className="text-right">Branch Code</Label>
                                    <Input id="BranchCode" value={data.BranchCode} onChange={(e) => setData('BranchCode', e.target.value)} className="col-span-3" required />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="Address" className="text-right">Address</Label>
                                    <Input id="Address" value={data.Address} onChange={(e) => setData('Address', e.target.value)} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="Mobile" className="text-right">Mobile</Label>
                                    <Input id="Mobile" value={data.Mobile} onChange={(e) => setData('Mobile', e.target.value)} className="col-span-3" />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2 pt-4">
                                <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
                                <Button type="submit" disabled={processing}>{isEditing ? 'Update' : 'Create'}</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Modal */}
                <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Confirm Deletion</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <p>Are you sure you want to delete the branch "<b>{currentBranch?.BranchName}</b>"? This action cannot be undone.</p>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={closeDeleteModal}>Cancel</Button>
                            <Button type="button" variant="destructive" onClick={handleDelete} disabled={processing}>Delete</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}