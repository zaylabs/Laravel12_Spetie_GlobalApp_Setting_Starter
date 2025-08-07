<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use App\Models\SettingApp;

class SettingAppController extends Controller
{
    /**
     * Show the form for editing application settings.
     */
    public function show()
    {
        // Fetch the settings. If they don't exist, create them with defaults.
        $setting = SettingApp::firstOrCreate([
            // This is just a key for finding the setting. It's better to use 'id'
            // or just find the first record and create if none exists.
            // Using an empty array in `firstOrCreate` is a common pattern for singletons.
        ], [
            'app_name' => 'My App',
            'description' => '',
            'color' => '#ffffff',
            'logo' => null, // Add default values for logo and favicon
            'favicon' => null,
        ]);

        return Inertia::render('settingapp/Form', [
            'setting' => $setting,
        ]);
    }

    /**
     * Store or update application settings.
     */
    public function store(Request $request)
    {
        // Find the first record or create it if none exists.
        $setting = SettingApp::firstOrCreate([]);

        $validated = $request->validate([
            'app_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'required|string|max:7',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'favicon' => 'nullable|image|mimes:ico,png|max:1024',
        ]);

        // Handle logo upload
        if ($request->hasFile('logo')) {
            // Delete old logo
            if ($setting->logo) {
                Storage::disk('public')->delete($setting->logo);
            }
            // Store new logo
            $logoPath = $request->file('logo')->store('images', 'public');
            $setting->logo = $logoPath;
        }

        // Handle favicon upload
        if ($request->hasFile('favicon')) {
            // Delete old favicon
            if ($setting->favicon) {
                Storage::disk('public')->delete($setting->favicon);
            }
            // Store new favicon
            $faviconPath = $request->file('favicon')->store('images', 'public');
            $setting->favicon = $faviconPath;
        }

        // Update other fields
        $setting->app_name = $validated['app_name'];
        $setting->description = $validated['description'];
        $setting->color = $validated['color'];
        
        $setting->save();

        return redirect()->route('settingapp.show')->with('success', 'Application settings updated successfully.');
    }
}