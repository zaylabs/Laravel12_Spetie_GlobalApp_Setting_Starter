<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Illuminate\Validation\Rule;
use Illuminate\Http\RedirectResponse;

class PermissionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        // Fetch all permissions and return them to the Inertia page
        $permissions = Permission::all();

        return Inertia::render('Permissions/Index', [
            'permissions' => $permissions
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        // Validate the incoming request data for creating a new permission
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:permissions'],
        ]);

        // Create a new permission with the validated name
        Permission::create(['name' => $validated['name']]);

        // Redirect back to the permissions index page with a success message
        return redirect()->route('permissions.index')->with('success', 'Permission created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Permission $permission): RedirectResponse
    {
        // Validate the incoming request data for updating the permission
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                // Ensure the permission name is unique, but ignore the current permission's name
                Rule::unique('permissions', 'name')->ignore($permission->id),
            ],
        ]);
        
        // Update the permission with the validated data
        $permission->update(['name' => $validated['name']]);
        
        // Redirect back to the permissions index page with a success message
        return redirect()->route('permissions.index')->with('success', 'Permission updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Permission $permission): RedirectResponse
    {
        // Delete the specified permission
        $permission->delete();

        // Redirect back to the permissions index page with a success message
        return redirect()->route('permissions.index')->with('success', 'Permission deleted successfully.');
    }
}
