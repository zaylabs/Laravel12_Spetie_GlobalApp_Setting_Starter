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
import { type PageProps } from '@/types';
import { Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const DEFAULT_COLOR = '#3b82f6';

interface SettingApp {
    id?: number;
    app_name: string;
    description: string;
    color: string;
    logo?: string;
    favicon?: string;
}

interface AppProps extends PageProps {
    setting: SettingApp | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Application Settings', href: '/settingapp' },
];

export default function SettingAppIndex() {
    const { setting } = usePage<AppProps>().props;
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

    // Use a new form helper with the appropriate methods for creating and updating
   // Correctly initialize useForm for a PUT request
const { data, setData, post, processing, errors, reset } = useForm<Record<string, any> & {
    app_name: string;
    description: string;
    color: string;
    logo: File | null;
    favicon: File | null;
    _method?: 'put'; 
}>({
    app_name: '',
    description: '',
    color: DEFAULT_COLOR,
    logo: null,
    favicon: null,
    // Add this line to enable method spoofing for a PUT request
    _method: 'put', 
});
    useEffect(() => {
        if (setting) {
            setData({
                // Set the _method field for update
                _method: 'put',
                app_name: setting.app_name,
                description: setting.description,
                color: setting.color,
                logo: null,
                favicon: null,
            });
            setLogoPreview(setting.logo ? `/storage/${setting.logo}?t=${new Date().getTime()}` : null);
            setFaviconPreview(setting.favicon ? `/storage/${setting.favicon}?t=${new Date().getTime()}` : null);
        } else {
            setData({
                app_name: '',
                description: '',
                color: DEFAULT_COLOR,
                logo: null,
                favicon: null,
            });
            setLogoPreview(null);
            setFaviconPreview(null);
        }
    }, [setting, setData]);

    const openEditModal = () => {
        if (setting) {
            setData({
                // Set the _method field for update when modal is opened
                _method: 'put',
                app_name: setting.app_name,
                description: setting.description,
                color: setting.color,
                logo: null,
                favicon: null,
            });
            setLogoPreview(setting.logo ? `/storage/${setting.logo}?t=${new Date().getTime()}` : null);
            setFaviconPreview(setting.favicon ? `/storage/${setting.favicon}?t=${new Date().getTime()}` : null);
        } else {
            // For a new setting, we don't need _method
            setData({
                app_name: '',
                description: '',
                color: DEFAULT_COLOR,
                logo: null,
                favicon: null,
            });
            setLogoPreview(null);
            setFaviconPreview(null);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        if (setting) {
            setLogoPreview(setting.logo ? `/storage/${setting.logo}?t=${new Date().getTime()}` : null);
            setFaviconPreview(setting.favicon ? `/storage/${setting.favicon}?t=${new Date().getTime()}` : null);
        }
    };

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
    
    // Determine the correct route based on whether `setting` exists
    const url = setting?.id ? route('settingapp.update') : route('settingapp.store');
    
    post(url, {
        forceFormData: true,
        onSuccess: () => {
            closeModal();
            toast.success('Application settings saved successfully.');
        },
        onError: (formErrors) => {
            toast.error("Failed to save settings.", {
                description: Object.values(formErrors).join('\n'),
            });
        },
    });
};

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Application Settings" />
            <div className="flex-1 p-4 md:p-6">
                <Card className="max-w-3xl mx-auto">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-2xl font-bold tracking-tight">Application Settings</CardTitle>
                        <div className="flex space-x-2">
                            <Button
                                onClick={openEditModal}
                                variant="outline"
                                size="icon"
                                title={setting ? "Edit Settings" : "Create Settings"}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <Separator />
                    <CardContent className="pt-6">
                        {setting ? (
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <Label className="w-32 font-medium">Application Name:</Label>
                                    <span>{setting.app_name}</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <Label className="w-32 font-medium">Description:</Label>
                                    <span className="max-w-md">{setting.description}</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <Label className="w-32 font-medium">Theme Color:</Label>
                                    <div className="h-8 w-8 rounded-full" style={{ backgroundColor: setting.color }}></div>
                                    <span>{setting.color}</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <Label className="w-32 font-medium">Logo:</Label>
                                    {setting.logo && <img src={logoPreview || ''} alt="Logo" className="h-16 rounded" />}
                                </div>
                                <div className="flex items-center space-x-4">
                                    <Label className="w-32 font-medium">Favicon:</Label>
                                    {setting.favicon && <img src={faviconPreview || ''} alt="Favicon" className="h-10 rounded" />}
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground">No application settings found. Click the pencil icon to create them.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Edit/Create Settings Modal */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{setting ? 'Edit Application Settings' : 'Create Application Settings'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
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
                            <div className="space-y-1">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                            </div>
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
                            <div className="flex justify-end space-x-2 pt-4">
                                <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
                                <Button type="submit" disabled={processing}>{setting ? 'Update' : 'Create'}</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}