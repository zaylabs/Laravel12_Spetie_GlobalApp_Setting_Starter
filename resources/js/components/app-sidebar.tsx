import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { LayoutGrid, Combine, Receipt, Shirt, Settings, UserRound, Barcode, PackageSearch, Lock, ChartSpline, ShieldAlert, } from 'lucide-react';
import AppLogo from './app-logo';


const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Items',
        href: '/items',
        icon: Shirt,
    },
    {
        title: 'Bookings',
        href: '/bookings',
        icon: Barcode,
    },
   
    {
        title: 'Users',
        href: '/users',
        icon: UserRound,
    },
    
    {
        title: 'Reports',
        href: '/reports',
        icon: ChartSpline,
    },   

    {
        title: 'Settings',
        href: '/settingapp',
        icon: Settings,
    },
    {
        title: 'Branches',
        href: '/branches',
        icon: ChartSpline,
    },
 {
        title: 'Configurations',
        href: '/configurations',
        icon: ChartSpline,
    },
    {
        title: 'Problems',
        href: '/problems',
        icon: ShieldAlert,
    },
    {
        title: 'Roles',
        href: '/roles',
        icon: Lock,
    },
     {
        title: 'Permissions',
        href: '/permissions',
        icon: Lock,
    },
];

const footerNavItems: NavItem[] = [
    
{
        title: 'Point of Sale',
        href: route('bookings.create'),
        icon: Receipt,
    },

    {
        title: 'Processing',
        href: '/processing',
        icon: PackageSearch,
    },
{
       title: 'Packing',
       href: '/packing',
       icon: Combine,
   },

      
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
