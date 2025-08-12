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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Define the shape of a Customer object for type safety
interface Customer {
    id: number;
    phone: string;
    number_of_bookings: number;
    customer_type: string;
}

// Define the shape of the form data
interface FormData {
    phone: string;
    customer_type: string;
    number_of_bookings: number;
    _method?: 'put'; // For method spoofing on updates
}

// Define the props that this component expects from the Laravel controller
interface Props {
    customers: Customer[];
}

interface InertiaErrors {
    [key: string]: string;
}

// Define the breadcrumbs for this page
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Customers',
        href: '/customers',
    },
];

// Main App component
export default function CustomersIndex({ customers }: Props) {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);

    const { data, setData, post, processing, reset, delete: destroy, errors } = useForm<Record<string, any> & FormData>({
        phone: '',
        customer_type: 'normal',
        number_of_bookings: 0,
    });

    const openModal = (customer?: Customer) => {
        setIsModalOpen(true);
        if (customer) {
            setIsEditing(true);
            setCurrentCustomer(customer);
            setData({
                _method: 'put',
                phone: customer.phone,
                customer_type: customer.customer_type,
                number_of_bookings: customer.number_of_bookings,
            });
        } else {
            setIsEditing(false);
            setCurrentCustomer(null);
            reset();
            setData(previousData => ({ ...previousData, _method: undefined }));
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        setCurrentCustomer(null);
    };

    const openDeleteModal = (customer: Customer) => {
        setCurrentCustomer(customer);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setCurrentCustomer(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing && currentCustomer?.id) {
            post(route('customers.update', currentCustomer.id), {
                onSuccess: () => {
                    closeModal();
                    toast.success('Customer updated successfully.', {
                        description: 'The customer details have been saved.',
                    });
                },
                onError: (errors: InertiaErrors) => {
                    toast.error("Failed to update customer.", {
                        description: Object.values(errors).join('\n'),
                    });
                    console.error(errors);
                },
            });
        } else {
            post(route('customers.store'), {
                onSuccess: () => {
                    closeModal();
                    toast.success('Customer created successfully.', {
                        description: 'The new customer has been added.',
                    });
                },
                onError: (errors: InertiaErrors) => {
                    toast.error("Failed to create customer.", {
                        description: Object.values(errors).join('\n'),
                    });
                    console.error(errors);
                },
            });
        }
    };

    const handleDelete = () => {
        if (currentCustomer?.id) {
            destroy(`/customers/${currentCustomer.id}`, {
                onSuccess: () => {
                    closeDeleteModal();
                    toast.success("Customer deleted successfully.");
                },
                onError: (errors: InertiaErrors) => {
                    toast.error("Failed to delete customer.", {
                        description: Object.values(errors).join('\n'),
                    });
                    console.error(errors);
                }
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customers Management" />
            <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h1 className="text-3xl font-bold text-gray-800">Customers Management</h1>
                    <Button
                        onClick={() => openModal()}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors duration-200"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Create Customer
                    </Button>
                </div>

                {/* Customers Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr className="bg-gray-200 text-left text-gray-600 uppercase text-sm font-semibold">
                                <th className="px-5 py-3 border-b-2 border-gray-300">Phone</th>
                                <th className="px-5 py-3 border-b-2 border-gray-300">Bookings</th>
                                <th className="px-5 py-3 border-b-2 border-gray-300">Customer Type</th>
                                <th className="px-5 py-3 border-b-2 border-gray-300 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap font-medium">{customer.phone}</p>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap">{customer.number_of_bookings}</p>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <p className="text-gray-600 whitespace-no-wrap">{customer.customer_type}</p>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                        <div className="flex justify-center space-x-2">
                                            <Button
                                                onClick={() => openModal(customer)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                                title="Edit Customer"
                                                variant="ghost"
                                                size="icon"
                                            >
                                                <Pencil className="w-5 h-5" />
                                            </Button>
                                            <Button
                                                onClick={() => openDeleteModal(customer)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Delete Customer"
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

                {/* Create/Edit Customer Modal */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{isEditing ? 'Edit Customer' : 'Create New Customer'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="phone" className="text-right">Phone</Label>
                                    <Input id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} className="col-span-3" required />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="customer_type" className="text-right">Customer Type</Label>
                                    <Select onValueChange={(value) => setData('customer_type', value)} value={data.customer_type} required>
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select a customer type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="normal">Normal</SelectItem>
                                            <SelectItem value="premium">Premium</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="number_of_bookings" className="text-right">Number of Bookings</Label>
                                    <Input id="number_of_bookings" type="number" value={data.number_of_bookings} onChange={(e) => setData('number_of_bookings', parseInt(e.target.value, 10))} className="col-span-3" />
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
                            <p>Are you sure you want to delete the customer with phone "<b>{currentCustomer?.phone}</b>"? This action cannot be undone.</p>
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
