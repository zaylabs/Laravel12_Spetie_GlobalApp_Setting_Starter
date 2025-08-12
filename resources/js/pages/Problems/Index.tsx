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

// Define the shape of a Problem object for type safety
interface ProblemItem {
    id: number;
    Problem: string;
}

// Define the shape of the form data
interface FormData {
    Problem: string;
    _method?: 'put'; // For method spoofing on updates
}

// Define the props that this component expects from the Laravel controller
interface Props {
    problems: ProblemItem[];
}

interface InertiaErrors {
    [key: string]: string;
}

// Define the breadcrumbs for this page
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Problems',
        href: '/problems',
    },
];

// Main App component
export default function ProblemsIndex({ problems }: Props) {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [currentProblem, setCurrentProblem] = useState<ProblemItem | null>(null);

    const { data, setData, post, processing, reset, delete: destroy } = useForm<Record<string, any> & FormData>({
        Problem: '',
    });

    const openModal = (problem?: ProblemItem) => {
        setIsModalOpen(true);
        if (problem) {
            setIsEditing(true);
            setCurrentProblem(problem);
            setData({
                _method: 'put',
                Problem: problem.Problem,
            });
        } else {
            setIsEditing(false);
            setCurrentProblem(null);
            reset();
            setData(previousData => ({ ...previousData, _method: undefined }));
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        setCurrentProblem(null);
    };

    const openDeleteModal = (problem: ProblemItem) => {
        setCurrentProblem(problem);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setCurrentProblem(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing && currentProblem?.id) {
            post(route('problems.update', currentProblem.id), {
                onSuccess: () => {
                    closeModal();
                    toast.success('Problem updated successfully.', {
                        description: 'The problem details have been saved.',
                    });
                },
                onError: (errors: InertiaErrors) => {
                    toast.error("Failed to update problem.", {
                        description: Object.values(errors).join('\n'),
                    });
                    console.error(errors);
                },
            });
        } else {
            post(route('problems.store'), {
                onSuccess: () => {
                    closeModal();
                    toast.success('Problem created successfully.', {
                        description: 'The new problem has been added.',
                    });
                },
                onError: (errors: InertiaErrors) => {
                    toast.error("Failed to create problem.", {
                        description: Object.values(errors).join('\n'),
                    });
                    console.error(errors);
                },
            });
        }
    };

    const handleDelete = () => {
        if (currentProblem?.id) {
            destroy(route('problems.destroy', currentProblem.id), {
                onSuccess: () => {
                    closeDeleteModal();
                    toast.success("Problem deleted successfully.");
                },
                onError: (errors: InertiaErrors) => {
                    toast.error("Failed to delete problem.", {
                        description: Object.values(errors).join('\n'),
                    });
                    console.error(errors);
                }
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Problems Management" />
            <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h1 className="text-3xl font-bold text-gray-800">Problems Management</h1>
                    <Button
                        onClick={() => openModal()}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors duration-200"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Create Problem
                    </Button>
                </div>

                {/* Problems Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr className="bg-gray-200 text-left text-gray-600 uppercase text-sm font-semibold">
                                <th className="px-5 py-3 border-b-2 border-gray-300">Problem</th>
                                <th className="px-5 py-3 border-b-2 border-gray-300 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {problems.map((problem) => (
                                <tr key={problem.id} className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap font-medium">{problem.Problem}</p>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                        <div className="flex justify-center space-x-2">
                                            <Button
                                                onClick={() => openModal(problem)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                                title="Edit Problem"
                                                variant="ghost"
                                                size="icon"
                                            >
                                                <Pencil className="w-5 h-5" />
                                            </Button>
                                            <Button
                                                onClick={() => openDeleteModal(problem)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Delete Problem"
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

                {/* Create/Edit Problem Modal */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{isEditing ? 'Edit Problem' : 'Create New Problem'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="Problem" className="text-right">Problem</Label>
                                    <Input id="Problem" value={data.Problem} onChange={(e) => setData('Problem', e.target.value)} className="col-span-3" required />
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
                            <p>Are you sure you want to delete the problem "<b>{currentProblem?.Problem}</b>"? This action cannot be undone.</p>
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