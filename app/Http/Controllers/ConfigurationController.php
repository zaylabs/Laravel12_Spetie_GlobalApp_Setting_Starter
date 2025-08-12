<?php

namespace App\Http\Controllers;

use App\Models\Configuration;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ConfigurationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
   public function index()
{
    $configuration = Configuration::first();

    return Inertia::render('Configurations/Index', [
        'configuration' => $configuration,
    ]);
}

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'SalesTax' => 'required|numeric|min:0',
            'NumberOfDaysForNormal' => 'required|integer|min:0',
            'NumberOfDaysForUrgent' => 'required|integer|min:0',
            'ChargesForNormalUrgent' => 'required|numeric|min:0',
            'ChargesForSameDayUrgent' => 'required|numeric|min:0',
            'NTNNumber' => 'required|string|max:255',
            'Hangers' => 'required|integer|min:0',
        ]);

        Configuration::create($validatedData);

        return redirect()->route('configurations.index')->with('success', 'Configuration created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Configuration $configuration)
    {
        $validatedData = $request->validate([
            'SalesTax' => 'required|numeric|min:0',
            'NumberOfDaysForNormal' => 'required|integer|min:0',
            'NumberOfDaysForUrgent' => 'required|integer|min:0',
            'ChargesForNormalUrgent' => 'required|numeric|min:0',
            'ChargesForSameDayUrgent' => 'required|numeric|min:0',
            'NTNNumber' => 'required|string|max:255',
            'Hangers' => 'required|integer|min:0',
        ]);

        $configuration->update($validatedData);

        return redirect()->route('configurations.index')->with('success', 'Configuration updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Configuration $configuration)
    {
        $configuration->delete();

        return redirect()->route('configurations.index')->with('success', 'Configuration deleted successfully.');
    }
}
