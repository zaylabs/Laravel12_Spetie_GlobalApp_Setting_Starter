import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Items Edit',
        href: 'items/{item}/edit',
    },
];

export default function ItemsEdit() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Items Edit" />
            <div>
                
            </div>
        </AppLayout>
    );
}
