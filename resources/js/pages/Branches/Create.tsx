import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Branches Create',
        href: '/branches/create',
    },
];

export default function BranchesCreate() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Branches Create" />
            <div>
                
            </div>
        </AppLayout>
    );
}
