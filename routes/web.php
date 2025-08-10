<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\SettingAppController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\BookingsController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\RegisterCustomUserController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
use Illuminate\Support\Facades\Auth;

Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Consolidated and corrected routes for application settings
    Route::get('/settingapp', [SettingAppController::class, 'show'])->name('settingapp.show');
    // Define a POST route for creating new settings
    Route::post('/settingapp', [SettingAppController::class, 'store'])->name('settingapp.store');
    // Define a POST route for updates, which handles method spoofing
    Route::put('/settingapp/update', [SettingAppController::class, 'update'])->name('settingapp.update');

    Route::resource('items', ItemController::class);
    Route::resource('bookings', BookingsController::class);
    Route::resource('branches', BranchController::class);
    Route::resource('users', UserController::class);

    Route::get('user/create', [RegisterCustomUserController::class, 'create'])->name('user.create');
    Route::post('user/store', [RegisterCustomUserController::class, 'store'])->name('user.store');
    Route::get('reports', [ReportController::class, 'index'])->name('reports.index');

    Route::get('user/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
    Route::patch('/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    
    Route::resource('roles', RoleController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('permissions', PermissionController::class)->only(['index', 'store', 'update', 'destroy']);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';