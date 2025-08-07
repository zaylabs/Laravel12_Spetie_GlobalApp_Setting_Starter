<?php

namespace App\Http\Controllers;

use App\Models\User;
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
        // Fetch all users and eager-load their roles to make the data
        // available for the frontend without N+1 query issues.
        $users = User::with('roles')->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->getRoleNames(), // Get the names of roles as a collection
            ];
        });

        return Inertia::render('Users/Index', [
            'users' => $users,
        ])->with('success', 'Users listed successfully.');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Assuming your 'user.create' route leads to a form.
        return redirect()->route('user.create')->with('success', 'User creation form displayed successfully.');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
        return redirect()->route('user.store')->with('success', 'User created successfully.');
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
        $allRoles = Role::pluck('name'); // Get all role names from the database

        return Inertia::render('Users/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->getRoleNames(), // Pass the user's current roles
            ],
            'allRoles' => $allRoles, // Pass all available roles
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
            // You might need to add validation for roles here if you're updating them
            // For example: 'roles' => ['array'], 'roles.*' => [Rule::in(Role::all()->pluck('name'))]
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
