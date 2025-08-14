<?php

// routes/api.php
use App\Http\Controllers\ConfigurationController;
use App\Http\Controllers\Auth\ApiLoginController;
use App\Http\Controllers\LocationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// The login route was pointing to a non-existent controller.
// This has been corrected to use the ApiLoginController as seen in your original code.
Route::post('/login', [ApiLoginController::class, 'login']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Protected routes using the 'auth:sanctum' middleware
Route::middleware('auth:sanctum')->group(function () {
    // Corrected route to get configuration
    Route::get('/configuration', [ConfigurationController::class, 'showJson']);

    // Corrected route to update or create configuration
    Route::post('/configuration', [ConfigurationController::class, 'storeOrUpdate']);

    // Delete configuration
    // Note: The original route for DELETE was also incorrect as it expected a wild card and not a static path.
    // If you need to delete a specific configuration by an ID, you need to update your API to expect a variable.
    // But since you have one configuration resource, the following route is what you would expect to use:
    Route::delete('/configuration', [ConfigurationController::class, 'destroyJson']);


    // Location API Routes
    Route::get('/locations', [LocationController::class, 'indexJson']);
    Route::post('/locations', [LocationController::class, 'storeJson']);
    Route::put('/locations/{location}', [LocationController::class, 'updateJson']);
    Route::delete('/locations/{location}', [LocationController::class, 'destroyJson']);
});
