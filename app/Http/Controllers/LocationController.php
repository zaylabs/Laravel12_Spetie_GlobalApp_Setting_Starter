<?php

namespace App\Http\Controllers;

use App\Models\Location;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class LocationController extends Controller
{
    /**
     * INERTIA/WEB ROUTES
     * These methods are for the web application using Inertia.js.
     */

    /**
     * Display a listing of the locations.
     */
    public function index()
    {
        $locations = Location::all();

        return Inertia::render('Locations/Index', [
            'locations' => $locations,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        Location::create($validatedData);

        return redirect()->route('locations.index')->with('success', 'Location created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Location $location)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        $location->update($validatedData);

        return redirect()->route('locations.index')->with('success', 'Location updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Location $location)
    {
        $location->delete();

        return redirect()->route('locations.index')->with('success', 'Location deleted successfully.');
    }

    // --- JSON API ROUTES ---
    // These methods are for the Android app and will return JSON responses.

    /**
     * Display a listing of the locations as JSON.
     */
    public function indexJson(): JsonResponse
    {
        $locations = Location::all();
        return response()->json($locations);
    }

    /**
     * Store a newly created location resource as JSON.
     */
    public function storeJson(Request $request): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'latitude' => 'required|numeric|between:-90,90',
                'longitude' => 'required|numeric|between:-180,180',
            ]);

            $location = Location::create($validatedData);

            return response()->json([
                'message' => 'Location created successfully.',
                'location' => $location
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Location store failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified location resource as JSON.
     */
    public function updateJson(Request $request, Location $location): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'latitude' => 'required|numeric|between:-90,90',
                'longitude' => 'required|numeric|between:-180,180',
            ]);

            $location->update($validatedData);

            return response()->json([
                'message' => 'Location updated successfully.',
                'location' => $location
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Location update failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified location resource as JSON.
     */
    public function destroyJson(Location $location): JsonResponse
    {
        $location->delete();

        return response()->json([
            'message' => 'Location deleted successfully.'
        ]);
    }
}