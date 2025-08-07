<?php


use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\SettingAppController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\BookingsController;
use App\Http\Controllers\BranchesController;
use App\Http\Controllers\RegisterCustomUserController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
use Illuminate\Support\Facades\Auth;

//Route::get('/', function () {
  //  return Inertia::render('welcome');
//})->name('home');

Route::get('/', function () {
    if (Auth::check()) {
        // Logged in → go to dashboard
        return redirect()->route('dashboard');
    }

    // Not logged in → go to login page
    return redirect()->route('login');
})->name('home');


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
     Route::get('/settingapp', [SettingAppController::class, 'edit'])->name('setting.edit');
     Route::post('/settingapp', [SettingAppController::class, 'update'])->name('setting.update');
   // The name 'settingapp.show' is used in your controller's redirect.
Route::get('/settingapp', [SettingAppController::class, 'show'])->name('settingapp.show');
// Route to handle the form submission and update the settings.
// The name 'settingapp.store' is used in your frontend form.
Route::post('/settingapp', [SettingAppController::class, 'store'])->name('settingapp.store');
   Route::resource('items', ItemController::class);
     Route::resource('bookings', BookingsController::class);
     Route::resource('branches', BranchesController::class);
     Route::resource('users', UserController::class);
     Route::get('user/create', [RegisterCustomUserController::class, 'create'])->name('user.create');
     Route::post('user/store', [RegisterCustomUserController::class, 'store'])->name('user.store');
     Route::get('reports',[ReportController::class, 'index'])->name('reports.index');
     Route::get('user/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
     Route::patch('/users/{user}', [UserController::class, 'update'])->name('users.update');
     Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    // Resource routes for the RoleController
     Route::resource('roles', RoleController::class)->only(['index', 'store', 'update', 'destroy']);
    // Permissions management routes
     Route::resource('permissions', PermissionController::class)->only(['index', 'store', 'update', 'destroy']);

    });

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
