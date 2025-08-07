<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        // Fetch all roles and eager-load their permissions
        $roles = Role::with('permissions')->get();

        // Fetch all available permissions for the form
        $permissions = Permission::pluck('name')->toArray();

        // Render the React page and pass the roles and permissions data
        return Inertia::render('Roles/Index', [
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        // Validate the incoming request data
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles',
            'description' => 'nullable|string|max:255',
            'permissions' => 'array',
            'permissions.*' => 'string|exists:permissions,name', // Validate each permission name
        ]);

        // Create a new role
        $role = Role::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
        ]);

        // Assign the permissions to the newly created role
        if (isset($validated['permissions'])) {
            $role->givePermissionTo($validated['permissions']);
        }

        // Redirect back to the roles index page
        return redirect()->route('roles.index')->with('success', 'Role created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Role $role): \Illuminate\Http\RedirectResponse
    {
        // Validate the incoming request data
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,' . $role->id,
            'description' => 'nullable|string|max:255',
            'permissions' => 'array',
            'permissions.*' => 'string|exists:permissions,name', // Validate each permission name
        ]);
        
        // Update the role with the validated data
        $role->update($validated);
        
        // Sync the permissions with the updated role
        $role->syncPermissions($validated['permissions'] ?? []);
        
        // Redirect back to the roles index page
        return redirect()->route('roles.index')->with('success', 'Role updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role): \Illuminate\Http\RedirectResponse
    {
        // Delete the specified role
        $role->delete();

        // Redirect back to the roles index page
        return redirect()->route('roles.index')->with('success', 'Role deleted successfully.');
    }
}
