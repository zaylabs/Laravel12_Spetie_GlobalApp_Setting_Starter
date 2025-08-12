<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Branch; // Import the Branch model
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Http\Controllers\RegisteredCustomUserController;
use Inertia\Response;
use Spatie\Permission\Models\Role;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        // Eager-load roles and branch for all users.
        $users = User::with(['roles', 'branch'])->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->getRoleNames(),
                'branch_code' => $user->branch_code, // Add branch_code
                'branch_name' => $user->branch ? $user->branch->BranchName : 'N/A', // Display branch name if available
            ];
        });

        return Inertia::render('Users/Index', [
            'users' => $users,
        ])->with('success', 'Users listed successfully.');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        // Get all available branches for the dropdown
        $branches = Branch::all()->pluck('BranchCode', 'BranchCode');
        $roles = Role::pluck('name');
        
        return Inertia::render('Users/Create', [
            'branches' => $branches,
            'roles' => $roles
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => ['required', 'string', Rule::in(Role::all()->pluck('name'))],
            'branch_code' => ['required', 'string', Rule::in(Branch::all()->pluck('BranchCode'))],
        ]);
    
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'branch_code' => $validated['branch_code'],
        ]);
    
        $user->assignRole($validated['role']);
    
        return redirect()->route('users.index')->with('success', 'User created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        // Eager-load roles for the user and pass all available roles
        // to the frontend for the role selection dropdown/multiselect.
        $user->load('roles');
        $allRoles = Role::pluck('name');
        $branches = Branch::all()->pluck('BranchCode', 'BranchCode');

        return Inertia::render('Users/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->getRoleNames(),
                'branch_code' => $user->branch_code, // Pass the user's current branch code
            ],
            'allRoles' => $allRoles,
            'branches' => $branches, // Pass all available branches
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'branch_code' => ['required', 'string', Rule::in(Branch::all()->pluck('BranchCode'))],
            // Add validation for roles here if you're updating them
            // 'roles' => ['array'], 'roles.*' => [Rule::in(Role::all()->pluck('name'))]
        ]);

        $user->update($validated);

        // This is where you would sync the user's roles
        // if the 'roles' input is part of your form.
        // $user->syncRoles($request->input('roles', []));

        return redirect()->route('users.index')->with('success', 'User Updated Successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->route('users.index')->with('success', 'User deleted successfully.');
    }
}