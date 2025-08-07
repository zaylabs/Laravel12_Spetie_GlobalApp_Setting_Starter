<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;
use App\Models\SettingApp; // <-- Import the SettingApp model

class HandleInertiaRequests extends Middleware
{
    // ... (rest of the file is the same)

    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        // Correctly fetch and update the global settings
        // Use `firstOrNew` to find the record, then `fill` and `save` to update it.
        $setting = SettingApp::firstOrNew(['id' => 1]);
        $setting->fill([
            'app_name' => $setting->app_name ?? config('app.name'),
            'description' => $setting->description ?? '',
            'color' => $setting->color ?? '#0ea5e9',
            'logo' => $setting->logo ?? null,
            'favicon' => $setting->favicon ?? null,
        ])->save();
        
        // Return a single array with all the shared data, including the settings
        return array_merge(parent::share($request), [
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'roles' => $request->user()->getRoleNames(),
                    'permissions' => $request->user()->getAllPermissions()->pluck('name'),
                ] : null,
            ],
            // Share the application settings globally
            'setting' => $setting ? [
                'app_name' => $setting->app_name,
                'description' => $setting->description,
                'color' => $setting->color,
                'logo' => $setting->logo,
                'favicon' => $setting->favicon,
            ] : null,
            'ziggy' => fn (): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ]);
    }
}