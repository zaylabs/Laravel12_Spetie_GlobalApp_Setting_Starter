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
        $setting = SettingApp::firstOrCreate([], [
            'app_name' => 'My App',
            'description' => '',
            'color' => '#3b82f6',
            'logo' => null,
            'favicon' => null,
        ]);

        return Inertia::render('SettingApp/Index', [
            'setting' => $setting,
        ]);
    }

    /**
     * Store or update application settings.
     * * Since the frontend uses method spoofing (POST with _method=PUT),
     * this method can handle both creation and updates.
     */
public function store(Request $request)
    {
        $validated = $request->validate([
            'app_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'required|string|max:7',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'favicon' => 'nullable|image|mimes:ico,png|max:1024',
        ]);
        
        // ... (Handle file uploads and save) ...

        $setting = SettingApp::create($validated);
        // Handle file uploads and save
        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('images', 'public');
            $setting->logo = $logoPath;
        }

        if ($request->hasFile('favicon')) {
            $faviconPath = $request->file('favicon')->store('images', 'public');
            $setting->favicon = $faviconPath;
        }

        $setting->save();
        return redirect()->route('settingapp.show')->with('success', 'Application settings created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request)
    {
        $setting = SettingApp::firstOrFail(); // Use firstOrFail to ensure a setting exists

        $validated = $request->validate([
            'app_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'required|string|max:7',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'favicon' => 'nullable|image|mimes:ico,png|max:1024',
        ]);

        // Handle logo upload
        if ($request->hasFile('logo')) {
            if ($setting->logo) {
                Storage::disk('public')->delete($setting->logo);
            }
            $logoPath = $request->file('logo')->store('images', 'public');
            $validated['logo'] = $logoPath;
        }

        // Handle favicon upload
        if ($request->hasFile('favicon')) {
            if ($setting->favicon) {
                Storage::disk('public')->delete($setting->favicon);
            }
            $faviconPath = $request->file('favicon')->store('images', 'public');
            $validated['favicon'] = $faviconPath;
        }

        $setting->update($validated);
        
        return redirect()->route('settingapp.show')->with('success', 'Application settings updated successfully.');
    }
}