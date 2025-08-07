import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Bookings Edit',
        href: '/bookings/edit',
    },
];

export default function BookingsEdit() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bookings Edit" />
            <div>
                
            </div>
        </AppLayout>
    );
}
