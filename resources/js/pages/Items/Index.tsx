import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Items',
        href: '/items',
    },
];

export default function ItemsIndex() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Items" />
            <div>
                
            </div>
        </AppLayout>
    );
}
