<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class CustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Customers/Index', [
            'customers' => Customer::all(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'phone' => 'required|string|max:20|unique:customers,phone',
            'customer_type' => 'required|string|max:50',
            'number_of_bookings' => 'integer|min:0',
        ]);

        Customer::create($validatedData);

        return redirect()->route('customers.index')->with('success', 'Customer created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Customer $customer)
    {
        $validatedData = $request->validate([
            'phone' => ['required', 'string', 'max:20', Rule::unique('customers')->ignore($customer->id)],
            'customer_type' => 'required|string|max:50',
            'number_of_bookings' => 'integer|min:0',
        ]);

        $customer->update($validatedData);

        return redirect()->route('customers.index')->with('success', 'Customer updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Customer $customer)
    {
        $customer->delete();

        return redirect()->route('customers.index')->with('success', 'Customer deleted successfully.');
    }
}
