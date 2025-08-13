<?php

// routes/api.php
use App\Http\Controllers\Auth\ApiLoginController;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;

// routes/api.php
Route::post('/login', [ApiLoginController::class, 'login']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});