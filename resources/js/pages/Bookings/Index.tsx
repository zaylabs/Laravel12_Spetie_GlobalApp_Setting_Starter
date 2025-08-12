import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

// Define the shape of an Item object for type safety
interface Item {
    id: number;
    name: string;
    price: number;
    units: number;
}

interface BookingItem {
    item: Item;
    units: number;
}

// Updated Booking interface to include all new columns from Booking.php
interface Booking {
    id: number;
    customer_phone: string;
    receipt_number: string;
    amount_total: number;
    sales_tax_percentage: number;
    sales_tax_amount: number;
    number_of_units: number;
    hanger_units: number;
    hanger_amount: number;
    total_amount: number;
    delivery_type: 'normal' | 'urgent' | 'same_day_urgent';
    booking_date: string;
    delivery_date: string;
    status: string;
    issues: string[] | null;
    booking_items: BookingItem[];
}

interface Props {
    bookings: Booking[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Bookings',
        href: '/bookings',
    },
];

export default function BookingsIndex({ bookings }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    const handleViewDetails = (booking: Booking) => {
        // Correctly handle the 'issues' property
        let issuesArray: string[] | null = null;
        if (booking.issues) {
            try {
                // If issues is a string, parse it as JSON
                issuesArray = typeof booking.issues === 'string' 
                    ? JSON.parse(booking.issues) 
                    : booking.issues;
            } catch (e) {
                console.error("Failed to parse issues JSON:", e);
                issuesArray = null;
            }
        }

        setSelectedBooking({ ...booking, issues: issuesArray });
        setIsModalOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bookings Management" />
            <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h1 className="text-3xl font-bold text-gray-800">All Bookings</h1>
                    <Button onClick={() => window.location.href = route('bookings.create')} className="bg-indigo-600 hover:bg-indigo-700">
                        Create New Booking
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Receipt #</TableHead>
                                <TableHead>Customer Phone</TableHead>
                                <TableHead>Delivery Type</TableHead>
                                <TableHead>Booking Date</TableHead>
                                <TableHead>Delivery Date</TableHead>
                                <TableHead>Total Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bookings.map((booking) => (
                                <TableRow key={booking.id}>
                                    <TableCell>{booking.receipt_number}</TableCell>
                                    <TableCell>{booking.customer_phone}</TableCell>
                                    <TableCell className="capitalize">{booking.delivery_type.replace('_', ' ')}</TableCell>
                                    <TableCell>{format(new Date(booking.booking_date), 'MMM d, yyyy h:mm a')}</TableCell>
                                    <TableCell>{booking.delivery_date ? format(new Date(booking.delivery_date), 'MMM d, yyyy') : 'N/A'}</TableCell>
                                    <TableCell>${booking.total_amount}</TableCell>
                                    <TableCell className="capitalize">{booking.status}</TableCell>
                                    <TableCell className="text-center">
                                        <Button onClick={() => handleViewDetails(booking)} variant="link">
                                            View Details
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* View Details Modal */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Booking Details: {selectedBooking?.receipt_number}</DialogTitle>
                        </DialogHeader>
                        {selectedBooking && (
                            <div className="grid gap-4 py-4">
                                <p><strong>Customer Phone:</strong> {selectedBooking.customer_phone}</p>
                                <p><strong>Delivery Type:</strong> <span className="capitalize">{selectedBooking.delivery_type.replace('_', ' ')}</span></p>
                                <p><strong>Booking Date:</strong> {format(new Date(selectedBooking.booking_date), 'PPPP p')}</p>
                                <p><strong>Delivery Date:</strong> {selectedBooking.delivery_date ? format(new Date(selectedBooking.delivery_date), 'PPPP') : 'N/A'}</p>
                                <p><strong>Status:</strong> <span className="capitalize">{selectedBooking.status}</span></p>

                                {selectedBooking.issues && selectedBooking.issues.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="font-bold mb-2">Issues:</h4>
                                        <ul className="list-disc list-inside">
                                            {selectedBooking.issues.map((issue, index) => (
                                                <li key={index}>{issue}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                
                                <div className="mt-4">
                                    <h4 className="font-bold mb-2">Items:</h4>
                                    <ul>
                                        {selectedBooking.booking_items.map((bi, index) => (
                                            <li key={index}>{bi.item.name} - {bi.units} unit(s)</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="mt-4 border-t pt-4">
                                    <p><strong>Amount (before tax):</strong> ${selectedBooking.amount_total}</p>
                                    <p><strong>Sales Tax (%):</strong> {selectedBooking.sales_tax_percentage}%</p>
                                    <p><strong>Sales Tax Amount:</strong> ${selectedBooking.sales_tax_amount}</p>
                                    <p><strong>Hanger Units:</strong> {selectedBooking.hanger_units}</p>
                                    <p><strong>Hanger Amount:</strong> ${selectedBooking.hanger_amount}</p>
                                    <h4 className="text-lg font-bold mt-2">Total: ${selectedBooking.total_amount}</h4>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}