import React, { useState, useEffect } from 'react';
import { useForm, Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { type BreadcrumbItem } from '@/types';
import { type PageProps } from '@/types'; // <-- Import PageProps

const DEFAULT_COLOR = '#3b82f6';

interface SettingApp {
    app_name: string;
    description: string;
    color: string;
    logo?: string;
    favicon?: string;
}

// Define a new interface that extends PageProps and includes your custom setting prop
interface AppProps extends PageProps {
    setting: SettingApp | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Application Settings', href: '/settingapp' },
];

export default function SettingForm() {
    // Cast the usePage().props to your new interface to ensure TypeScript knows about the 'setting' prop
    const { setting } = usePage<AppProps>().props;

    const { data, setData, post, processing, errors, isDirty } = useForm({
        app_name: setting?.app_name || '',
        description: setting?.description || '',
        color: setting?.color || DEFAULT_COLOR,
        logo: null as File | null,
        favicon: null as File | null,
    });

    const [logoPreview, setLogoPreview] = useState<string | null>(
        setting?.logo ? `/storage/${setting.logo}` : null
    );
    const [faviconPreview, setFaviconPreview] = useState<string | null>(
        setting?.favicon ? `/storage/${setting.favicon}` : null
    );

    useEffect(() => {
        if (setting) {
            setData({
                app_name: setting.app_name,
                description: setting.description,
                color: setting.color,
                logo: null,
                favicon: null,
            });
            // Update the preview states with the new image paths and a cache-buster.
            setLogoPreview(setting.logo ? `/storage/${setting.logo}?t=${new Date().getTime()}` : null);
            setFaviconPreview(setting.favicon ? `/storage/${setting.favicon}?t=${new Date().getTime()}` : null);
        }
    }, [setting, setData]);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('logo', file);
        if (file) {
            setLogoPreview(URL.createObjectURL(file));
        } else {
            setLogoPreview(setting?.logo ? `/storage/${setting.logo}` : null);
        }
    };

    const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('favicon', file);
        if (file) {
            setFaviconPreview(URL.createObjectURL(file));
        } else {
            setFaviconPreview(setting?.favicon ? `/storage/${setting.favicon}` : null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('settingapp.store'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} title="Application Settings">
            <Head title="Application Settings" />
            <div className="flex-1 p-4 md:p-6">
                <Card className="max-w-3xl mx-auto">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold tracking-tight">Application Settings</CardTitle>
                        <p className="text-muted-foreground text-sm mt-1">Configure application identity, theme color & logo.</p>
                    </CardHeader>
                    <Separator />
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* App Name */}
                            <div className="space-y-1">
                                <Label htmlFor="app_name">Application Name</Label>
                                <Input
                                    id="app_name"
                                    value={data.app_name}
                                    onChange={(e) => setData('app_name', e.target.value)}
                                    className={errors.app_name ? 'border-red-500' : ''}
                                />
                                {errors.app_name && <p className="text-sm text-red-500">{errors.app_name}</p>}
                            </div>

                            {/* Description */}
                            <div className="space-y-1">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                            </div>

                            {/* Theme Color */}
                            <div className="space-y-1">
                                <Label htmlFor="color">Theme Color</Label>
                                <div className="flex items-center gap-4">
                                    <Input
                                        id="color"
                                        type="color"
                                        value={data.color}
                                        onChange={(e) => setData('color', e.target.value)}
                                        className="w-16 h-10 p-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setData('color', DEFAULT_COLOR)}
                                    >
                                        Reset Default
                                    </Button>
                                </div>
                            </div>

                            {/* Logo Upload */}
                            <div className="space-y-1">
                                <Label htmlFor="logo">Logo (Max 2MB)</Label>
                                <Input
                                    id="logo"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                />
                                {logoPreview && (
                                    <img src={logoPreview} alt="Preview Logo" className="mt-2 h-16 rounded" />
                                )}
                            </div>

                            {/* Favicon Upload */}
                            <div className="space-y-1">
                                <Label htmlFor="favicon">Favicon (Max 1MB)</Label>
                                <Input
                                    id="favicon"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFaviconChange}
                                />
                                {faviconPreview && (
                                    <img src={faviconPreview} alt="Preview Favicon" className="mt-2 h-10 rounded" />
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4 flex justify-end">
                                <Button type="submit" disabled={processing || !isDirty} className="px-6">
                                    {processing ? 'Saving...' : 'Update Settings'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}