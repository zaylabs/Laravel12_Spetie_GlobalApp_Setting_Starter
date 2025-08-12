import React, { useState, useEffect } from 'react';
import { useForm, Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { type BreadcrumbItem } from '@/types';
import { type PageProps } from '@/types';
import { Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Define the shape of a Configuration object for type safety
interface ConfigurationItem {
    id: number;
    SalesTax: number;
    NumberOfDaysForNormal: number;
    NumberOfDaysForUrgent: number;
    ChargesForNormalUrgent: number;
    ChargesForSameDayUrgent: number;
    NTNNumber: string;
    Hangers: number;
}

// Define the props that this component expects from the Laravel controller
interface Props extends PageProps {
    configuration: ConfigurationItem | null;
}

// Default values for a new configuration
const DEFAULT_CONFIGURATION = {
    SalesTax: 5,
    NumberOfDaysForNormal: 4,
    NumberOfDaysForUrgent: 1,
    ChargesForNormalUrgent: 50,
    ChargesForSameDayUrgent: 100,
    NTNNumber: 'NTN-12345',
    Hangers: 50,
};

// Define the breadcrumbs for this page
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Configurations', href: '/configurations' },
];

export default function ConfigurationsIndex() {
    // Get the single configuration object from Inertia props
    const { configuration } = usePage<Props>().props;
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    // Initialize the form with data from the props or default values
    const { data, setData, post, processing, errors, reset } = useForm<Record<string, any> & {
        SalesTax: number;
        NumberOfDaysForNormal: number;
        NumberOfDaysForUrgent: number;
        ChargesForNormalUrgent: number;
        ChargesForSameDayUrgent: number;
        NTNNumber: string;
        Hangers: number;
        _method?: 'put'; // For method spoofing on updates
    }>({
        ...DEFAULT_CONFIGURATION,
        // The _method field is not needed for a new record, so it's initialized
        // in the `openModal` function for updates.
    });

    // Effect hook to set form data when the configuration prop changes
    useEffect(() => {
        if (configuration) {
            setData({
                SalesTax: configuration.SalesTax,
                NumberOfDaysForNormal: configuration.NumberOfDaysForNormal,
                NumberOfDaysForUrgent: configuration.NumberOfDaysForUrgent,
                ChargesForNormalUrgent: configuration.ChargesForNormalUrgent,
                ChargesForSameDayUrgent: configuration.ChargesForSameDayUrgent,
                NTNNumber: configuration.NTNNumber,
                Hangers: configuration.Hangers,
                _method: 'put',
            });
        } else {
            setData({ ...DEFAULT_CONFIGURATION });
        }
    }, [configuration, setData]);

    const openEditModal = () => {
        if (configuration) {
            // Populate form with existing data for editing
            setData({
                _method: 'put',
                SalesTax: configuration.SalesTax,
                NumberOfDaysForNormal: configuration.NumberOfDaysForNormal,
                ChargesForNormalUrgent: configuration.ChargesForNormalUrgent,
                NumberOfDaysForUrgent: configuration.NumberOfDaysForUrgent,
                ChargesForSameDayUrgent: configuration.ChargesForSameDayUrgent,
                NTNNumber: configuration.NTNNumber,
                Hangers: configuration.Hangers,
            });
        } else {
            // Populate with default data for creating a new one
            setData({ ...DEFAULT_CONFIGURATION });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Determine the correct route based on whether a configuration already exists
        const url = configuration?.id ? route('configurations.update', configuration.id) : route('configurations.store');

        post(url, {
            onSuccess: () => {
                closeModal();
                toast.success('Configuration saved successfully.', {
                    description: 'The application settings have been updated.',
                });
            },
            onError: (formErrors) => {
                toast.error("Failed to save configuration.", {
                    description: Object.values(formErrors).join('\n'),
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configurations Management" />
            <div className="flex-1 p-4 md:p-6">
                <Card className="max-w-3xl mx-auto">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-2xl font-bold tracking-tight">Configuration Settings</CardTitle>
                        <div className="flex space-x-2">
                            <Button
                                onClick={openEditModal}
                                variant="outline"
                                size="icon"
                                title={configuration ? "Edit Settings" : "Create Settings"}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <Separator />
                    <CardContent className="pt-6">
                        {configuration ? (
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <Label className="w-64 font-medium">Sales Tax (%):</Label>
                                    <span>{configuration.SalesTax}</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <Label className="w-64 font-medium">Days for Normal:</Label>
                                    <span>{configuration.NumberOfDaysForNormal}</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <Label className="w-64 font-medium">Days for Urgent:</Label>
                                    <span>{configuration.NumberOfDaysForUrgent}</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <Label className="w-64 font-medium">Charges for Normal Urgent (%):</Label>
                                    <span>{configuration.ChargesForNormalUrgent}</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <Label className="w-64 font-medium">Charges for Same Day Urgent (%):</Label>
                                    <span>{configuration.ChargesForSameDayUrgent}</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <Label className="w-64 font-medium">NTN Number:</Label>
                                    <span>{configuration.NTNNumber}</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <Label className="w-64 font-medium">Hangers:</Label>
                                    <span>{configuration.Hangers}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground">No configuration settings found. Click the pencil icon to create them.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Edit/Create Settings Modal */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{configuration ? 'Edit Configuration' : 'Create New Configuration'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 py-4">
                                <div className="space-y-1">
                                    <Label htmlFor="SalesTax">Sales Tax (%)</Label>
                                    <Input
                                        id="SalesTax"
                                        type="number"
                                        step="0.01"
                                        value={data.SalesTax}
                                        onChange={(e) => setData('SalesTax', parseFloat(e.target.value))}
                                        className={errors.SalesTax ? 'border-red-500' : ''}
                                    />
                                    {errors.SalesTax && <p className="text-sm text-red-500">{errors.SalesTax}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="NumberOfDaysForNormal">Days for Normal</Label>
                                    <Input
                                        id="NumberOfDaysForNormal"
                                        type="number"
                                        value={data.NumberOfDaysForNormal}
                                        onChange={(e) => setData('NumberOfDaysForNormal', parseInt(e.target.value, 10))}
                                        className={errors.NumberOfDaysForNormal ? 'border-red-500' : ''}
                                    />
                                    {errors.NumberOfDaysForNormal && <p className="text-sm text-red-500">{errors.NumberOfDaysForNormal}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="NumberOfDaysForUrgent">Days for Urgent</Label>
                                    <Input
                                        id="NumberOfDaysForUrgent"
                                        type="number"
                                        value={data.NumberOfDaysForUrgent}
                                        onChange={(e) => setData('NumberOfDaysForUrgent', parseInt(e.target.value, 10))}
                                        className={errors.NumberOfDaysForUrgent ? 'border-red-500' : ''}
                                    />
                                    {errors.NumberOfDaysForUrgent && <p className="text-sm text-red-500">{errors.NumberOfDaysForUrgent}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="ChargesForNormalUrgent">Charges for Normal Urgent (%)</Label>
                                    <Input
                                        id="ChargesForNormalUrgent"
                                        type="number"
                                        step="0.01"
                                        value={data.ChargesForNormalUrgent}
                                        onChange={(e) => setData('ChargesForNormalUrgent', parseFloat(e.target.value))}
                                        className={errors.ChargesForNormalUrgent ? 'border-red-500' : ''}
                                    />
                                    {errors.ChargesForNormalUrgent && <p className="text-sm text-red-500">{errors.ChargesForNormalUrgent}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="ChargesForSameDayUrgent">Charges for Same Day Urgent (%)</Label>
                                    <Input
                                        id="ChargesForSameDayUrgent"
                                        type="number"
                                        step="0.01"
                                        value={data.ChargesForSameDayUrgent}
                                        onChange={(e) => setData('ChargesForSameDayUrgent', parseFloat(e.target.value))}
                                        className={errors.ChargesForSameDayUrgent ? 'border-red-500' : ''}
                                    />
                                    {errors.ChargesForSameDayUrgent && <p className="text-sm text-red-500">{errors.ChargesForSameDayUrgent}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="NTNNumber">NTN Number</Label>
                                    <Input
                                        id="NTNNumber"
                                        value={data.NTNNumber}
                                        onChange={(e) => setData('NTNNumber', e.target.value)}
                                        className={errors.NTNNumber ? 'border-red-500' : ''}
                                    />
                                    {errors.NTNNumber && <p className="text-sm text-red-500">{errors.NTNNumber}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="Hangers">Hangers</Label>
                                    <Input
                                        id="Hangers"
                                        type="number"
                                        value={data.Hangers}
                                        onChange={(e) => setData('Hangers', parseInt(e.target.value, 10))}
                                        className={errors.Hangers ? 'border-red-500' : ''}
                                    />
                                    {errors.Hangers && <p className="text-sm text-red-500">{errors.Hangers}</p>}
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2 pt-4">
                                <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
                                <Button type="submit" disabled={processing}>{configuration ? 'Update' : 'Create'}</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
