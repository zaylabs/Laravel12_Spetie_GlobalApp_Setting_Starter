<?php

// app/Http/Controllers/ItemController.php

namespace App\Http\Controllers;

use App\Models\Item;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Items/Index', [
            'items' => Item::all(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'code' => 'required|string|size:4|unique:items,code',
            'name' => 'required|string|max:255',
            'no_of_units' => 'required|integer|min:0',
            'price' => 'required|numeric|min:0',
            'status' => 'required|string|in:Active,Disable',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // 2MB max
            'date_added' => 'required|date',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            // ✅ FIX: Removed 'public/' from the store path.
            // This prevents the 'public/public/' issue.
            $imagePath = $request->file('image')->store('items');
        }

        Item::create([
            ...$validatedData,
            // The Storage::url() method will automatically prepend the correct URL.
            'image' => $imagePath ? Storage::url($imagePath) : null,
        ]);

        return redirect()->route('items.index')->with('success', 'Item created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Item $item)
    {
        $validatedData = $request->validate([
            'code' => 'required|string|size:4|unique:items,code,' . $item->id,
            'name' => 'required|string|max:255',
            'no_of_units' => 'required|integer|min:0',
            'price' => 'required|numeric|min:0',
            'status' => 'required|string|in:Active,Disable',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // 2MB max
            'date_added' => 'required|date',
        ]);

        // Handle image update logic
        if ($request->hasFile('image')) {
            // Delete old image if it exists
            if ($item->image) {
                // Check if the old file exists on disk before attempting to delete it.
                // ✅ FIX: Use Storage::path() to get the correct full path for checking and deleting.
                $oldImagePath = str_replace(Storage::url(''), '', $item->image);
                if (Storage::disk('public')->exists($oldImagePath)) {
                    Storage::disk('public')->delete($oldImagePath);
                }
            }
            // ✅ FIX: Removed 'public/' from the store path.
            $imagePath = $request->file('image')->store('items', 'public');
            $validatedData['image'] = Storage::url($imagePath);
        }

        $item->update($validatedData);

        return redirect()->route('items.index')->with('success', 'Item updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Item $item)
    {
        // Delete the image file from storage
        if ($item->image) {
            // ✅ FIX: Correctly find the file path on the disk
            $filePath = str_replace(Storage::url(''), '', $item->image);
            Storage::disk('public')->delete($filePath);
        }

        $item->delete();
        return redirect()->route('items.index')->with('success', 'Item deleted successfully.');
    }
}