import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Branches Edit',
        href: '/branches/edit',
    },
];

export default function BranchesEdit() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Branches Edit" />
            <div>
                
            </div>
        </AppLayout>
    );
}
