import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Pencil, Trash, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
    SelectContent,
    SelectItem,
    Select,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Define the shape of an Item object for type safety
interface Item {
    id: number;
    code: string;
    name: string;
    no_of_units: number;
    price: number;
    status: 'Active' | 'Disable';
    image: string | null;
    date_added: string;
}

// Define the shape of the form data
interface FormData {
    code: string;
    name: string;
    no_of_units: number;
    price: number;
    status: 'Active' | 'Disable';
    image: File | null;
    date_added: string;
    // Add _method to the FormData interface for type safety with method spoofing
    _method?: 'put'; // Update the type to be a literal string 'put'
}

// Define the props that this component expects from the Laravel controller
interface Props {
    items: Item[];
}

interface InertiaErrors {
    [key: string]: string;
}

// Define the breadcrumbs for this page
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Items',
        href: '/items',
    },
];

// Main App component
export default function ItemsIndex({ items }: Props) {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [currentItem, setCurrentItem] = useState<Item | null>(null);

    // 👇🏻 Updated useForm with the Record utility type for correct typing
    const { data, setData, post, processing, reset, delete: destroy } = useForm<Record<string, any> & FormData>({
        code: '',
        name: '',
        no_of_units: 0,
        price: 0.00,
        status: 'Active',
        image: null,
        date_added: new Date().toISOString().slice(0, 10),
    });

    const openModal = (item?: Item) => {
        setIsModalOpen(true);
        if (item) {
            setIsEditing(true);
            setCurrentItem(item);

            const formattedDate = new Date(item.date_added).toISOString().slice(0, 10);

            // Add the _method: 'put' field here for method spoofing
            setData({
                _method: 'put',
                code: item.code,
                name: item.name,
                no_of_units: item.no_of_units,
                price: item.price,
                status: item.status,
                image: null,
                date_added: formattedDate,
            });
        } else {
            setIsEditing(false);
            setCurrentItem(null);
            reset();
            // Important: reset the _method field when creating a new item
            setData(previousData => ({ ...previousData, _method: undefined }));
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        setCurrentItem(null);
    };

    const openDeleteModal = (item: Item) => {
        setCurrentItem(item);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setCurrentItem(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing && currentItem?.id) {
            // FIX: Use the 'post' method with method spoofing for updates with files.
            post(route('items.update', currentItem.id), {
                onSuccess: () => {
                    closeModal();
                    toast.success('Item updated successfully.', {
                        description: 'The item details have been saved.',
                    });
                },
                onError: (errors: InertiaErrors) => {
                    toast.error("Failed to update item.", {
                        description: Object.values(errors).join('\n'),
                    });
                    console.error(errors);
                },
            });
        } else {
            post(route('items.store'), {
                onSuccess: () => {
                    closeModal();
                    toast.success('Item created successfully.', {
                        description: 'The item has been added to the inventory.',
                    });
                },
                onError: (errors: InertiaErrors) => {
                    toast.error("Failed to create item.", {
                        description: Object.values(errors).join('\n'),
                    });
                    console.error(errors);
                },
            });
        }
    };

    const handleDelete = () => {
        if (currentItem?.id) {
            destroy(`/items/${currentItem.id}`, {
                onSuccess: () => {
                    closeDeleteModal();
                    toast.success("Item deleted successfully.");
                },
                onError: (errors: InertiaErrors) => {
                    toast.error("Failed to delete item.", {
                        description: Object.values(errors).join('\n'),
                    });
                    console.error(errors);
                }
            });
        }
    };

    // The return statement is correctly placed here, inside the function body.
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Items Management" />
            <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h1 className="text-3xl font-bold text-gray-800">Items Management</h1>
                    <Button
                        onClick={() => openModal()}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors duration-200"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Create Item
                    </Button>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr className="bg-gray-200 text-left text-gray-600 uppercase text-sm font-semibold">
                                <th className="px-5 py-3 border-b-2 border-gray-300">Image</th>
                                <th className="px-5 py-3 border-b-2 border-gray-300">Code</th>
                                <th className="px-5 py-3 border-b-2 border-gray-300">Name</th>
                                <th className="px-5 py-3 border-b-2 border-gray-300">Units</th>
                                <th className="px-5 py-3 border-b-2 border-gray-300">Price</th>
                                <th className="px-5 py-3 border-b-2 border-gray-300">Status</th>
                                <th className="px-5 py-3 border-b-2 border-gray-300">Date Added</th>
                                <th className="px-5 py-3 border-b-2 border-gray-300 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        {item.image && (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-12 h-12 object-cover rounded-md"
                                            />
                                        )}
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap font-medium">{item.code}</p>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap">{item.name}</p>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <p className="text-gray-600 whitespace-no-wrap">{item.no_of_units}</p>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <p className="text-gray-600 whitespace-no-wrap">${typeof item.price === 'number' ? item.price.toFixed(2) : '0.00'}</p>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            item.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        {/* FIX: Format the date for display in the table */}
                                        <p className="text-gray-600 whitespace-no-wrap">{new Date(item.date_added).toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')}</p>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                        <div className="flex justify-center space-x-2">
                                            <Button
                                                onClick={() => openModal(item)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                                title="Edit Item"
                                                variant="ghost"
                                                size="icon"
                                            >
                                                <Pencil className="w-5 h-5" />
                                            </Button>
                                            <Button
                                                onClick={() => openDeleteModal(item)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Delete Item"
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

                {/* Create/Edit Item Modal */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{isEditing ? 'Edit Item' : 'Create New Item'}</DialogTitle>
                        </DialogHeader>
                        {/* The form handler now submits via POST for both create and edit */}
                        <form onSubmit={handleSubmit}> 
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="code" className="text-right">Code</Label>
                                    <Input id="code" value={data.code} onChange={(e) => setData('code', e.target.value)} className="col-span-3" required />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">Name</Label>
                                    <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} className="col-span-3" required />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="no_of_units" className="text-right">Units</Label>
                                    <Input
                                        id="no_of_units"
                                        type="number"
                                        value={data.no_of_units}
                                        onChange={(e) => {
                                            const value = parseInt(e.target.value);
                                            setData('no_of_units', isNaN(value) ? 0 : value);
                                        }}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="price" className="text-right">Price</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        value={data.price}
                                        onChange={(e) => {
                                            const value = parseFloat(e.target.value);
                                            setData('price', isNaN(value) ? 0.00 : value);
                                        }}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="status" className="text-right">Status</Label>
                                    <Select onValueChange={(value: 'Active' | 'Disable') => setData('status', value)} value={data.status}>
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Active">Active</SelectItem>
                                            <SelectItem value="Disable">Disable</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {/* Conditionally display current image and provide option to change */}
                                {isEditing && currentItem?.image && (
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">Current Image</Label>
                                        <div className="col-span-3">
                                            <img
                                                src={currentItem.image}
                                                alt={currentItem.name}
                                                className="w-24 h-24 object-cover rounded-md"
                                            />
                                        </div>
                                    </div>
                                )}
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="image" className="text-right">Image</Label>
                                    <Input id="image" type="file" onChange={(e) => setData('image', e.target.files?.[0] || null)} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="date_added" className="text-right">Date Added</Label>
                                    <Input id="date_added" type="date" value={data.date_added} onChange={(e) => setData('date_added', e.target.value)} className="col-span-3" required />
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
                            <p>Are you sure you want to delete the item "<b>{currentItem?.name}</b>"? This action cannot be undone.</p>
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