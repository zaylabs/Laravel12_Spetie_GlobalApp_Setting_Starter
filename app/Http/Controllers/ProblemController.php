<?php

namespace App\Http\Controllers;

use App\Models\Problem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProblemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Problems/Index', [
            'problems' => Problem::all(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'Problem' => 'required|string|max:255',
        ]);

        Problem::create($validatedData);

        return redirect()->route('problems.index')->with('success', 'Problem created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Problem $problem)
    {
        $validatedData = $request->validate([
            'Problem' => 'required|string|max:255',
        ]);

        $problem->update($validatedData);

        return redirect()->route('problems.index')->with('success', 'Problem updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Problem $problem)
    {
        $problem->delete();

        return redirect()->route('problems.index')->with('success', 'Problem deleted successfully.');
    }
}