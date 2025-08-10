<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BranchController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Branches/Index', [
            'branches' => Branch::all(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'BranchName' => 'required|string|max:100',
            'BranchCode' => 'required|string|max:20|unique:branches,BranchCode',
            'Address' => 'nullable|string|max:255',
            'Mobile' => 'nullable|string|max:20',
        ]);

        Branch::create($validatedData);

        return redirect()->route('branches.index')->with('success', 'Branch created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Branch $branch)
    {
        $validatedData = $request->validate([
            'BranchName' => 'required|string|max:100',
            'BranchCode' => 'required|string|max:20|unique:branches,BranchCode,' . $branch->id,
            'Address' => 'nullable|string|max:255',
            'Mobile' => 'nullable|string|max:20',
        ]);

        $branch->update($validatedData);

        return redirect()->route('branches.index')->with('success', 'Branch updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Branch $branch)
    {
        $branch->delete();

        return redirect()->route('branches.index')->with('success', 'Branch deleted successfully.');
    }
}