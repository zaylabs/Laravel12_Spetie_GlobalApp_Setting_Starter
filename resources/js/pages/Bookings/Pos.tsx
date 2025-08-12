import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Trash2, ShoppingCart, Plus, Minus, Search, Package2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Define the data interfaces for clarity and type safety
interface Item {
    id: number;
    name: string;
    price: number;
    no_of_units: number;
    unit_type: string;
}

interface Configuration {
    SalesTax: number;
    Hangers: number;
    ChargesForNormalUrgent: number;
    ChargesForSameDayUrgent: number;
    NumberOfDaysForNormal: number;
    NumberOfDaysForUrgent: number;
}

interface Problem {
    id: number;
    Problem: string;
}

interface Props {
    items: Item[];
    configurations: Configuration;
    isSameDayUrgentEnabled: boolean;
    bookingDate: string;
    deliveryDate: string;
    problems: Problem[];
}

interface SelectedItem extends Item {
    units: number;
}

// Define the breadcrumbs for the page layout
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Bookings',
        href: '/bookings',
    },
    {
        title: 'POS',
        href: '/bookings/create',
    },
];

// Main Pos component
export default function Pos({ items, configurations, isSameDayUrgentEnabled, bookingDate, deliveryDate, problems }: Props) {
    const [searchQuery, setSearchQuery] = useState('');

    // Use Inertia's `useForm` hook to manage form state
    const { data, setData, post, processing, errors, reset } = useForm({
        customer_id: '',
        delivery_type: 'normal',
        hanger_units: 0,
        issues: [] as string[],
        selectedItems: [] as SelectedItem[],
        amount_total: 0,
        sales_tax_percentage: configurations.SalesTax,
        sales_tax_amount: 0,
        number_of_units: 0,
        hanger_amount: 0,
        total_amount: 0,
        booking_date: bookingDate,
        delivery_date: deliveryDate,
    });

    // Handle adding an item or incrementing its unit count
    const handleItemSelect = (item: Item) => {
        const existingItem = data.selectedItems.find(i => i.id === item.id);
        if (existingItem) {
            setData('selectedItems', data.selectedItems.map(i =>
                i.id === item.id ? { ...i, units: i.units + 1 } : i
            ));
        } else {
            setData('selectedItems', [...data.selectedItems, { ...item, units: 1 }]);
        }
    };

    // Handle changing the number of units for a selected item
    const handleItemUnitChange = (itemId: number, units: number) => {
        if (units <= 0) {
            setData('selectedItems', data.selectedItems.filter(item => item.id !== itemId));
        } else {
            setData('selectedItems', data.selectedItems.map(item =>
                item.id === itemId ? { ...item, units: units } : item
            ));
        }
    };

    // Handle removing an item from the selected list
    const handleRemoveItem = (itemId: number) => {
        setData('selectedItems', data.selectedItems.filter(item => item.id !== itemId));
    };

    // Calculate the subtotal based on selected items and delivery type
    const calculateSubTotal = () => {
        const subTotal = data.selectedItems.reduce((acc, item) => acc + (item.price * item.units), 0);
        if (data.delivery_type === 'urgent') {
            return subTotal * (1 + (configurations.ChargesForNormalUrgent / 100));
        }
        if (data.delivery_type === 'same_day_urgent') {
            return subTotal * (1 + (configurations.ChargesForSameDayUrgent / 100));
        }
        return subTotal;
    };

    // Calculate the total number of pieces
    const calculateTotalPieces = () => {
        return data.selectedItems.reduce((acc, item) => acc + item.units, 0);
    };

    // Calculate the total number of booking units (from item.no_of_units)
    const calculateTotalBookingUnits = () => {
        return data.selectedItems.reduce((acc, item) => acc + (item.units * item.no_of_units), 0);
    };

    // Calculate the sales tax amount
    const calculateSalesTax = () => {
        return calculateSubTotal() * (configurations.SalesTax / 100);
    };

    // Calculate the hanger charge amount
    const calculateHangerAmount = () => {
        return data.hanger_units * configurations.Hangers;
    };

    // Calculate the final total amount
    const calculateTotal = () => {
        return calculateSubTotal() + calculateSalesTax() + calculateHangerAmount();
    };

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (data.selectedItems.length === 0) {
            toast.error("Please select at least one item.");
            return;
        }

        const postData = {
            ...data,
            amount_total: calculateSubTotal(),
            sales_tax_amount: calculateSalesTax(),
            number_of_units: calculateTotalBookingUnits(),
            hanger_amount: calculateHangerAmount(),
            total_amount: calculateTotal(),
        };

        post(route('bookings.store'), postData, {
            onSuccess: () => {
                toast.success('Booking created successfully.');
                reset();
                setData('issues', []);
            },
            onError: (formErrors) => {
                toast.error('Failed to create booking.', {
                    description: Object.values(formErrors).join('\n'),
                });
            },
        });
    };

    // Filter items based on the search query
    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculate summary values
    const subTotal = calculateSubTotal();
    const salesTax = calculateSalesTax();
    const hangerAmount = calculateHangerAmount();
    const total = calculateTotal();
    const totalPieces = calculateTotalPieces();
    const totalBookingUnits = calculateTotalBookingUnits();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Point of Sale" />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 lg:p-8 font-sans antialiased">
                <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
                    {/* Left Column - Items & Selected Items */}
                    <div className="flex-1 space-y-8">
                        {/* Item Grid Card */}
                        <Card className="rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
                            <CardHeader className="p-6 pb-2">
                                <CardTitle className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                                    <Package2 className="h-8 w-8 text-green-500" />
                                    Items
                                </CardTitle>
                                <CardDescription className="text-lg text-gray-500 dark:text-gray-400 mt-2">
                                    Tap an item to add it to the booking.
                                </CardDescription>
                                <div className="relative mt-6">
                                    <Input
                                        type="text"
                                        placeholder="Search for an item..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full h-12 pl-12 rounded-2xl bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-lg focus:ring-green-500 focus:border-green-500"
                                    />
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 pt-4">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {filteredItems.map((item) => (
                                        <Button
                                            key={item.id}
                                            variant="outline"
                                            onClick={() => handleItemSelect(item)}
                                            className="h-40 flex-col justify-center items-center p-4 text-center rounded-3xl transition-all duration-200 transform hover:scale-105 active:scale-95 border-2 border-gray-200 dark:border-gray-600 hover:border-green-500 hover:bg-green-50 dark:hover:bg-gray-700"
                                        >
                                            <span className="font-semibold text-2xl text-gray-800 dark:text-gray-100">{item.name}</span>
                                            <span className="text-xl text-gray-600 dark:text-gray-400 mt-2">${item.price.toFixed(2)}</span>
                                            <span className="text-sm text-gray-400 dark:text-gray-500 mt-1">({item.no_of_units} units)</span>
                                        </Button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Selected Items Card */}
                        <Card className="rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
                            <CardHeader className="p-6 pb-2">
                                <CardTitle className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                                    <ShoppingCart className="h-8 w-8 text-green-500" />
                                    Selected Items
                                </CardTitle>
                                <CardDescription className="text-lg text-gray-500 dark:text-gray-400 mt-2">
                                    Review and modify your order.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 pt-4">
                                {data.selectedItems.length === 0 ? (
                                    <p className="text-gray-500 dark:text-gray-400 italic text-center text-lg p-6 bg-gray-100 dark:bg-gray-700 rounded-2xl">
                                        No items selected.
                                    </p>
                                ) : (
                                    <ul className="space-y-6">
                                        {data.selectedItems.map((item) => (
                                            <li key={item.id} className="flex flex-col sm:flex-row justify-between items-center bg-gray-100 dark:bg-gray-700 p-6 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-lg">
                                                <div className="flex-1 text-center sm:text-left">
                                                    <span className="font-medium text-xl text-gray-900 dark:text-gray-100">{item.name}</span>
                                                    <span className="text-lg text-gray-600 dark:text-gray-400 block sm:inline sm:ml-2">
                                                        (${item.price.toFixed(2)}/pc)
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 mt-4 sm:mt-0">
                                                    <Button
                                                        variant="outline"
                                                        size="lg"
                                                        onClick={() => handleItemUnitChange(item.id, item.units - 1)}
                                                        className="rounded-full h-10 w-10 text-gray-500 dark:text-gray-300 border-gray-300 dark:border-gray-600 active:scale-95"
                                                    >
                                                        <Minus className="h-5 w-5" />
                                                    </Button>
                                                    <Input
                                                        type="number"
                                                        value={item.units}
                                                        onChange={(e) => handleItemUnitChange(item.id, parseInt(e.target.value) || 0)}
                                                        min="1"
                                                        className="w-20 h-10 text-center rounded-2xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-lg"
                                                    />
                                                    <Button
                                                        variant="outline"
                                                        size="lg"
                                                        onClick={() => handleItemUnitChange(item.id, item.units + 1)}
                                                        className="rounded-full h-10 w-10 text-gray-500 dark:text-gray-300 border-gray-300 dark:border-gray-600 active:scale-95"
                                                    >
                                                        <Plus className="h-5 w-5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="lg"
                                                        onClick={() => handleRemoveItem(item.id)}
                                                        className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 active:scale-95"
                                                    >
                                                        <Trash2 className="h-6 w-6" />
                                                    </Button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Booking & Summary */}
                    <div className="w-full lg:w-2/5 space-y-8">
                        <Card className="rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
                            <CardHeader className="p-6 pb-2">
                                <CardTitle className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">New Booking</CardTitle>
                                <CardDescription className="text-lg text-gray-500 dark:text-gray-400 mt-2">
                                    Fill out the customer and booking details.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 pt-4">
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="flex flex-col">
                                            <Label className="text-lg text-gray-700 dark:text-gray-300 font-semibold">Booking Date</Label>
                                            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{bookingDate}</p>
                                        </div>
                                        <div className="flex flex-col">
                                            <Label className="text-lg text-gray-700 dark:text-gray-300 font-semibold">Delivery Date</Label>
                                            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{deliveryDate}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <Label htmlFor="customer_id" className="text-lg text-gray-700 dark:text-gray-300 font-semibold">Customer ID (Phone Number)</Label>
                                            <Input
                                                id="customer_id"
                                                type="tel"
                                                value={data.customer_id}
                                                onChange={(e) => setData('customer_id', e.target.value)}
                                                required
                                                className="mt-2 block w-full h-12 rounded-2xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 shadow-sm text-lg focus:border-green-500 focus:ring-green-500"
                                            />
                                            {errors.customer_id && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.customer_id}</p>}
                                        </div>
                                        <div className="space-y-4">
                                            <Label className="text-lg text-gray-700 dark:text-gray-300 font-semibold">Delivery Type</Label>
                                            <RadioGroup
                                                value={data.delivery_type}
                                                onValueChange={(value) => setData('delivery_type', value)}
                                                className="flex flex-wrap gap-6"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="normal" id="normal" className="text-green-500 h-6 w-6" />
                                                    <Label htmlFor="normal" className="text-lg">Normal</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="urgent" id="urgent" className="text-green-500 h-6 w-6" />
                                                    <Label htmlFor="urgent" className="text-lg">Urgent</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="same_day_urgent" id="same_day_urgent" className="text-green-500 h-6 w-6" disabled={!isSameDayUrgentEnabled} />
                                                    <Label htmlFor="same_day_urgent" className={`text-lg ${!isSameDayUrgentEnabled ? "text-gray-400 dark:text-gray-500" : ""}`}>Same Day Urgent</Label>
                                                </div>
                                            </RadioGroup>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                                        <Label className="text-lg text-gray-700 dark:text-gray-300 font-semibold">Issues</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            {problems.map((problem) => (
                                                <div key={problem.id} className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        id={`issue-${problem.id}`}
                                                        value={problem.Problem}
                                                        checked={data.issues.includes(problem.Problem)}
                                                        onChange={(e) => {
                                                            const newIssues = e.target.checked
                                                                ? [...data.issues, problem.Problem]
                                                                : data.issues.filter(issue => issue !== problem.Problem);
                                                            setData('issues', newIssues);
                                                        }}
                                                        className="h-5 w-5 text-green-600 focus:ring-green-500 rounded border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700"
                                                    />
                                                    <Label htmlFor={`issue-${problem.id}`} className="text-lg cursor-pointer">
                                                        {problem.Problem}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                        {errors.issues && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.issues}</p>}
                                    </div>

                                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                                        <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                            Summary
                                        </h3>
                                        <div className="space-y-4 mt-4 text-gray-700 dark:text-gray-300">
                                            <div className="flex justify-between items-center text-xl">
                                                <span>Total Pieces:</span>
                                                <span className="font-bold">{totalPieces}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xl">
                                                <span>Total Items (db units):</span>
                                                <span className="font-bold">{totalBookingUnits}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-lg">
                                                <span>Subtotal:</span>
                                                <span className="font-medium">${subTotal}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-lg">
                                                <span>Sales Tax ({configurations.SalesTax}%):</span>
                                                <span className="font-medium">${salesTax}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-lg">
                                                <span>Hanger Charge (${configurations.Hangers}/unit):</span>
                                                <Input
                                                    type="number"
                                                    value={data.hanger_units}
                                                    onChange={(e) => setData('hanger_units', parseInt(e.target.value) || 0)}
                                                    min="0"
                                                    className="w-20 h-10 text-center rounded-2xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 ml-4 text-lg"
                                                />
                                            </div>
                                            <div className="flex justify-between items-center text-2xl font-bold text-gray-900 dark:text-gray-100 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                <span>Total:</span>
                                                {/* The fix is applied here: check if 'total' is a valid number before formatting */}
                                                <span>${typeof total === 'number' && !isNaN(total) ? total : '0'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end mt-8">
                                        <Button
                                            type="submit"
                                            size="xl"
                                            disabled={processing}
                                            className="rounded-2xl px-8 py-4 text-2xl font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg transition-all duration-200"
                                        >
                                            {processing ? "Processing..." : `Create Booking ($${typeof total === 'number' && !isNaN(total) ? total.toFixed(2) : '0.00'})`}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
