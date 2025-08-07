<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        Permission::firstOrCreate(['name' => 'view dashboard']);
        Permission::firstOrCreate(['name' => 'create roles']);
        Permission::firstOrCreate(['name' => 'manage roles']);
        Permission::firstOrCreate(['name' => 'create user']);
        Permission::firstOrCreate(['name' => 'manage users']);
        Permission::firstOrCreate(['name' => 'create permissions']);
        Permission::firstOrCreate(['name' => 'manage permissions']);
        Permission::firstOrCreate(['name' => 'create branches']);
        Permission::firstOrCreate(['name' => 'manage branches']);
        Permission::firstOrCreate(['name' => 'access settings']);
        Permission::firstOrCreate(['name' => 'access jr packing']);
        Permission::firstOrCreate(['name' => 'access ts packing']);
        Permission::firstOrCreate(['name' => 'access jr processing']);
        Permission::firstOrCreate(['name' => 'access ts processing']);
        Permission::firstOrCreate(['name' => 'access pos']);
        Permission::firstOrCreate(['name' => 'view reports']);
        Permission::firstOrCreate(['name' => 'update bookings']);

        
        
        


        // Create roles and assign created permissions
        $roleAdmin = Role::firstOrCreate(['name' => 'admin']);
        $roleAdmin->givePermissionTo(Permission::all());

        $roleUser = Role::firstOrCreate(['name' => 'user']);
        $roleUser->givePermissionTo(['view dashboard']);

        $roleManager = Role::firstOrCreate(['name' => 'manager']);
        $roleManager->givePermissionTo(['access pos']);

        $rolePackingJR = Role::firstOrCreate(['name' => 'Packing_JR']);
        $rolePackingJR->givePermissionTo(['access jr packing']);

        $rolePackingTS = Role::firstOrCreate(['name' => 'Packing_TS']);
        $rolePackingTS->givePermissionTo(['access ts packing']);

        $roleProcessingJR = Role::firstOrCreate(['name' => 'Processing_JR']);
        $roleProcessingJR->givePermissionTo(['access jr processing']);

        $roleProcessingTS = Role::firstOrCreate(['name' => 'Processing_TS']);
        $roleProcessingTS->givePermissionTo(['access ts processing']);

        // Create a user and assign the admin role to it
        $user = \App\Models\User::firstOrCreate([
            'name' => 'Admin User',
            'email' => 'admin@zaylabs.com',
            'password' => bcrypt('password')
        ]);
        $user->assignRole($roleAdmin);

        // Create another user and assign the user role
        $user = \App\Models\User::firstOrCreate([
            'name' => 'normal User',
            'email' => 'user@zaylabs.com',
            'password' => bcrypt('password')
        ]);
        $user->assignRole($roleUser);
        // Create another user and assign the user role
        $user = \App\Models\User::firstOrCreate([
            'name' => 'packing jr User',
            'email' => 'packingjr@zaylabs.com',
            'password' => bcrypt('password')
        ]);
        $user->assignRole($rolePackingJR);

        // Create another user and assign the user role
        $user = \App\Models\User::firstOrCreate([
            'name' => 'packing ts User',
            'email' => 'packingts@zaylabs.com',
            'password' => bcrypt('password')
        ]);
        $user->assignRole($rolePackingTS);

        // Create another user and assign the user role
        $user = \App\Models\User::firstOrCreate([
            'name' => 'processing jr User',
            'email' => 'processingjr@zaylabs.com',
            'password' => bcrypt('password')
        ]);
        $user->assignRole($roleProcessingJR);

        $user = \App\Models\User::firstOrCreate([
            'name' => 'processing ts User',
            'email' => 'processingts@zaylabs.com',
            'password' => bcrypt('password')
        ]);
        $user->assignRole($roleProcessingTS);

        // Create another user and assign the manager role
        $user = \App\Models\User::firstOrCreate([
            'name' => 'manager User',
            'email' => 'manager@zaylabs.com',
            'password' => bcrypt('password')
        ]);
        $user->assignRole($roleManager);
    }
}