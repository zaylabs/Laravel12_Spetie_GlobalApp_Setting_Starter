<?php

namespace App\Http\Controllers;

use App\Models\Configuration;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Http\JsonResponse;

class ConfigurationController extends Controller
{
    /**
     * INERTIA/WEB ROUTES
     * These methods are for the web application using Inertia.js.
     */

    /**
     * Display the single configuration resource for the web.
     */
    public function index()
    {
        $configuration = Configuration::first();

        return Inertia::render('Configurations/Index', [
            'configuration' => $configuration,
        ]);
    }

    /**
     * Store a newly created resource from the web form.
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
     * Update the specified resource from the web form.
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
     * Remove the specified resource from the web.
     */
    public function destroy(Configuration $configuration)
    {
        $configuration->delete();

        return redirect()->route('configurations.index')->with('success', 'Configuration deleted successfully.');
    }

    /**
     * JSON API ROUTES
     * These methods are for the Android app and will return JSON responses.
     */

    /**
     * Display the single configuration resource as JSON.
     */
    public function showJson(): JsonResponse
    {
        $configuration = Configuration::first();
        if (!$configuration) {
            return response()->json(['message' => 'No configuration found.'], 404);
        }

        return response()->json($configuration);
    }

    /**
     * Store or update a single configuration resource as JSON.
     * This method is useful for a mobile app to handle both creation and updates in one endpoint.
     */
    public function storeOrUpdate(Request $request): JsonResponse
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

        $configuration = Configuration::first();

        if ($configuration) {
            $configuration->update($validatedData);
            return response()->json(['message' => 'Configuration updated successfully.', 'configuration' => $configuration]);
        } else {
            $newConfiguration = Configuration::create($validatedData);
            return response()->json(['message' => 'Configuration created successfully.', 'configuration' => $newConfiguration], 201);
        }
    }

    /**
     * Remove the specified resource as JSON.
     */
    public function destroyJson(Configuration $configuration): JsonResponse
    {
        $configuration->delete();

        return response()->json(['message' => 'Configuration deleted successfully.']);
    }
}
