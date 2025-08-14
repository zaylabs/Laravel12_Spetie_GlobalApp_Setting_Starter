/* eslint-disable no-irregular-whitespace */
import React, { useState } from 'react';
import { useForm, Head, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { type BreadcrumbItem } from '@/types';
import { type PageProps } from '@/types';
import { Pencil, Plus, MapPin, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Define the shape of a Location object
interface LocationItem {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
}

// Define the props that this component expects from the Laravel controller
interface Props extends PageProps {
    locations: LocationItem[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Locations', href: '/locations' }];

export default function LocationsIndex() {
    const { locations } = usePage<Props>().props;
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        latitude: '',
        longitude: '',
    });

    const openCreateModal = () => {
        setSelectedLocation(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (location: LocationItem) => {
        setSelectedLocation(location);
        setData({
            name: location.name,
            latitude: location.latitude.toString(),
            longitude: location.longitude.toString(),
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const openDeleteModal = (location: LocationItem) => {
        setSelectedLocation(location);
        setIsDeleteModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedLocation(null);
    };

    const handleGeocode = async () => {
        if (!data.name) {
            toast.error("Please enter a location name.");
            return;
        }

        try {
            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(data.name)}&key=${process.env.VITE_GOOGLE_MAPS_API_KEY}`);           
            const result = await response.json();

            if (result.status === 'OK' && result.results.length > 0) {
                const { lat, lng } = result.results[0].geometry.location;
                setData(prev => ({
                    ...prev,
                    latitude: lat.toString(),
                    longitude: lng.toString(),
                }));
                toast.success('Coordinates found!', { description: `Lat: ${lat}, Lng: ${lng}` });
            } else {
                toast.error('Location not found.', { description: 'Could not find coordinates for the given name.' });
            }
        } catch (error) {
            toast.error('Geocoding failed.', { description: 'An error occurred while contacting the Google Maps API.' });
        }
    };

    // New function to get the current location using the Geolocation API
    const handleGetCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setData(prev => ({
                        ...prev,
                        latitude: latitude.toString(),
                        longitude: longitude.toString(),
                    }));
                    toast.success('Current location fetched!', { description: `Lat: ${latitude}, Lng: ${longitude}` });
                },
                (error) => {
                    let errorMessage = 'An unknown error occurred.';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'User denied the request for Geolocation. Please enable location services.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information is unavailable.';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'The request to get user location timed out.';
                            break;
                    }
                    toast.error('Failed to get current location.', { description: errorMessage });
                }
            );
        } else {
            toast.error('Geolocation is not supported by your browser.');
        }
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedLocation) {
            put(route('locations.update', selectedLocation.id), {
                onSuccess: () => {
                    closeModal();
                    toast.success('Location updated successfully.');
                },
                onError: (formErrors) => {
                    toast.error("Failed to update location.", { description: Object.values(formErrors).join('\n') });
                },
            });
        } else {
            post(route('locations.store'), {
                onSuccess: () => {
                    closeModal();
                    toast.success('Location created successfully.');
                },
                onError: (formErrors) => {
                    toast.error("Failed to create location.", { description: Object.values(formErrors).join('\n') });
                },
            });
        }
    };

    const handleDelete = () => {
        if (selectedLocation) {
            router.delete(route('locations.destroy', selectedLocation.id), {
                onSuccess: () => {
                    closeDeleteModal();
                    toast.success('Location deleted successfully.');
                },
                onError: () => {
                    toast.error('Failed to delete location.');
                }
            });
        }
    };

    const handleViewOnMap = (lat: number, lng: number) => {
       window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Locations Management" />
            <div className="flex-1 p-4 md:p-6">
                <Card className="max-w-4xl mx-auto">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-2xl font-bold tracking-tight">Locations</CardTitle>
                        <Button onClick={openCreateModal} size="sm" className="space-x-1">
                            <Plus className="h-4 w-4" />
                            <span>Add New</span>
                        </Button>
                    </CardHeader>
                    <Separator />
                    <CardContent className="pt-6">
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Location Name</TableHead>
                                        <TableHead>Latitude</TableHead>
                                        <TableHead>Longitude</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {locations.length > 0 ? (
                                        locations.map((location) => (
                                            <TableRow key={location.id}>
                                                <TableCell>{location.name}</TableCell>
                                                <TableCell>{location.latitude}</TableCell>
                                                <TableCell>{location.longitude}</TableCell>
                                                <TableCell className="flex justify-end space-x-2">
                                                    <Button onClick={() => handleViewOnMap(location.latitude, location.longitude)} variant="outline" size="icon" title="View on Map">
                                                        <MapPin className="h-4 w-4" />
                                                    </Button>
                                                    <Button onClick={() => openEditModal(location)} variant="outline" size="icon" title="Edit">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button onClick={() => openDeleteModal(location)} variant="destructive" size="icon" title="Delete">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                                                No locations found. Click 'Add New' to create one.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Create/Edit Location Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{selectedLocation ? 'Edit Location' : 'Create New Location'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-4 py-4">
                            <div className="space-y-1">
                                <Label htmlFor="name">Location Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="latitude">Latitude</Label>
                                <Input
                                    id="latitude"
                                    type="text"
                                    value={data.latitude}
                                    onChange={(e) => setData('latitude', e.target.value)}
                                    className={errors.latitude ? 'border-red-500' : ''}
                                    readOnly
                                />
                                {errors.latitude && <p className="text-sm text-red-500">{errors.latitude}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="longitude">Longitude</Label>
                                <Input
                                    id="longitude"
                                    type="text"
                                    value={data.longitude}
                                    onChange={(e) => setData('longitude', e.target.value)}
                                    className={errors.longitude ? 'border-red-500' : ''}
                                    readOnly
                                />
                                {errors.longitude && <p className="text-sm text-red-500">{errors.longitude}</p>}
                            </div>
                            <Button type="button" onClick={handleGeocode} disabled={processing} className="w-full mt-4">
                                Get Coordinates
                            </Button>
                            {/* New button for getting the current location */}
                            <Button type="button" onClick={handleGetCurrentLocation} disabled={processing} variant="secondary" className="w-full mt-2">
                                Get My Location
                            </Button>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
                            <Button type="submit" disabled={processing || !data.latitude || !data.longitude}>
                                {selectedLocation ? 'Update Location' : 'Create Location'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Location</DialogTitle>
                    </DialogHeader>
                    <p>Are you sure you want to delete the location "{selectedLocation?.name}"? This action cannot be undone.</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={closeDeleteModal}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
