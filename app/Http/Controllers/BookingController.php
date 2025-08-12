<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Item;
use App\Models\Configuration;
use App\Models\Customer;
use App\Models\Problem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class BookingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $bookings = Booking::with('bookingItems.item')->latest()->get();
        return Inertia::render('Bookings/Index', [
            'bookings' => $bookings,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $items = Item::all();
        $configurations = Configuration::first();
        $problems = Problem::all();

        $bookingDate = $this->calculateBookingDate();
        
        $deliveryDates = [
            'normal' => $this->calculateDeliveryDate($bookingDate, 'normal', $configurations)?->toFormattedDateString(),
            'urgent' => $this->calculateDeliveryDate($bookingDate, 'urgent', $configurations)?->toFormattedDateString(),
            'same_day_urgent' => $this->calculateDeliveryDate($bookingDate, 'same_day_urgent', $configurations)?->toFormattedDateString(),
        ];

        return Inertia::render('Bookings/Pos', [
            'items' => $items,
            'configurations' => $configurations,
            'isSameDayUrgentEnabled' => $this->isSameDayUrgentEnabled(),
            'bookingDate' => $bookingDate->toFormattedDateString(),
            'deliveryDates' => $deliveryDates,
            'problems' => $problems,
        ]);
    }

    /**
     * Display the specified booking.
     */
    public function show(Booking $booking): Response
    {
        $booking->load('bookingItems.item');
        return Inertia::render('Bookings/Show', [
            'booking' => $booking,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validatedData = $request->validate([
            'customer_id' => 'required|string|max:20',
            'selectedItems' => 'required|array',
            'selectedItems.*.id' => 'required|exists:items,id',
            'selectedItems.*.units' => 'required|integer|min:1',
            'delivery_type' => 'required|in:normal,urgent,same_day_urgent',
            'hanger_units' => 'nullable|integer|min:0',
            'notes' => 'nullable|string',
            'issues' => 'sometimes|array',
        ]);
        
        $customer = Customer::firstOrCreate(
            ['phone' => $validatedData['customer_id']],
            ['customer_type' => 'normal', 'number_of_bookings' => 0]
        );

        $configurations = Configuration::first();
        if (!$configurations) {
            return redirect()->back()->with('error', 'Configuration settings not found.');
        }
        
        $itemPrices = Item::whereIn('id', collect($validatedData['selectedItems'])->pluck('id'))->get()->keyBy('id');
        $amountTotal = 0;
        $numberOfUnits = 0;
        foreach ($validatedData['selectedItems'] as $selectedItem) {
            $item = $itemPrices->get($selectedItem['id']);
            $amountTotal += $item->price * $selectedItem['units'];
            $numberOfUnits += $selectedItem['units'];
        }

        $salesTaxPercentage = $configurations->sales_tax_percentage ?? 0;
        $salesTaxAmount = $amountTotal * ($salesTaxPercentage / 100);
        
        $finalAmount = $amountTotal;
        if ($validatedData['delivery_type'] === 'urgent') {
            $finalAmount *= (1 + ($configurations->urgent_charges_percentage / 100));
        } elseif ($validatedData['delivery_type'] === 'same_day_urgent') {
            $finalAmount *= (1 + ($configurations->same_day_urgent_charges_percentage / 100));
        }

        $hangerUnits = $validatedData['hanger_units'] ?? 0;
        $hangerAmount = $hangerUnits * $configurations->hanger_charge_per_unit;
        $totalAmount = $finalAmount + $hangerAmount;
        
        $branchCode = Auth::user()->branch_code;
        $receiptNumber = $this->generateReceiptNumber($branchCode);

        $bookingDate = $this->calculateBookingDate();
        $deliveryDate = $this->calculateDeliveryDate($bookingDate, $validatedData['delivery_type'], $configurations);

        DB::transaction(function () use ($validatedData, $receiptNumber, $bookingDate, $deliveryDate, $finalAmount, $salesTaxPercentage, $salesTaxAmount, $numberOfUnits, $hangerUnits, $hangerAmount, $totalAmount, $customer) {
            $booking = Booking::create([
                'customer_phone' => $customer->phone,
                'receipt_number' => $receiptNumber,
                'amount_total' => $finalAmount,
                'sales_tax_percentage' => $salesTaxPercentage,
                'sales_tax_amount' => $salesTaxAmount,
                'number_of_units' => $numberOfUnits,
                'hanger_units' => $hangerUnits,
                'hanger_amount' => $hangerAmount,
                'total_amount' => $totalAmount,
                'delivery_type' => $validatedData['delivery_type'],
                'booking_date' => $bookingDate,
                'delivery_date' => $deliveryDate,
                'status' => 'booked',
                'notes' => $validatedData['notes'] ?? null,
                'issues' => isset($validatedData['issues']) ? json_encode($validatedData['issues']) : null,
            ]);
            
            foreach ($validatedData['selectedItems'] as $item) {
                $booking->bookingItems()->create([
                    'item_id' => $item['id'],
                    'units' => $item['units'],
                ]);
            }

            $customer->increment('number_of_bookings');
        });

        return redirect()->route('bookings.index')->with('success', 'Booking created successfully.');
    }

    /**
     * Helper to generate a unique receipt number based on the branch code.
     */
    private function generateReceiptNumber(string $branchCode): string
    {
        $lastBooking = Booking::where('receipt_number', 'like', "{$branchCode}-%")
                             ->latest('receipt_number')
                             ->first();
        
        $lastNumber = $lastBooking ? (int) substr($lastBooking->receipt_number, strrpos($lastBooking->receipt_number, '-') + 1) : 0;
        $newNumber = $lastNumber + 1;
        
        $paddedNumber = str_pad($newNumber, 4, '0', STR_PAD_LEFT);
        
        return "{$branchCode}-{$paddedNumber}";
    }

    /**
     * Helper to determine the booking date and time.
     */
    private function calculateBookingDate(): Carbon
    {
        $now = Carbon::now();
        $cutoffTime = Carbon::today()->setTime(18, 30);

        if ($now->greaterThan($cutoffTime)) {
            $nextDay = $now->copy()->addDay();
            if ($nextDay->isFriday()) {
                $nextDay->addDay();
            }
            return $nextDay->setTime(9, 0);
        }

        return $now;
    }

    /**
     * Helper to calculate the delivery date based on delivery type and configurations, skipping Fridays.
     */
    private function calculateDeliveryDate(Carbon $bookingDate, string $deliveryType, Configuration $configurations): ?Carbon
    {
        $now = Carbon::now();
        $cutoffTime = Carbon::today()->setTime(18, 30);
        $sameDayCutoff = Carbon::today()->setTime(10, 30);
        
        $daysToAdd = 0;

        if ($deliveryType === 'same_day_urgent') {
            // Same day if booked before 10:30 AM.
            if ($now->lessThan($sameDayCutoff)) {
                return $bookingDate->copy()->endOfDay();
            } 
            // If booked after 6:30 PM, delivery is next day.
            elseif ($now->greaterThan($cutoffTime)) {
                $daysToAdd = 1;
            } else {
                // Between 10:30 AM and 6:30 PM, same day urgent is not available.
                return null;
            }
        } elseif ($deliveryType === 'normal') {
            $daysToAdd = $configurations->NumberOfDaysForNormal;
        } elseif ($deliveryType === 'urgent') {
            $daysToAdd = $configurations->NumberOfDaysForUrgent;
        }

        // Add an extra day if the booking is made after 6:30 PM for Normal and Urgent deliveries
        if ($now->greaterThan($cutoffTime) && ($deliveryType === 'normal' || $deliveryType === 'urgent')) {
            $daysToAdd++;
        }
        
        $deliveryDate = $bookingDate->copy();
        
        for ($i = 0; $i < $daysToAdd; $i++) {
            $deliveryDate->addDay();
            if ($deliveryDate->isFriday()) {
                $deliveryDate->addDay();
            }
        }

        return $deliveryDate->endOfDay();
    }
    
    /**
     * Helper to check if same day urgent is enabled.
     */
    private function isSameDayUrgentEnabled(): bool
    {
        $now = Carbon::now();
        $sameDayCutoff = Carbon::today()->setTime(10, 30);
        $nextDayCutoff = Carbon::today()->setTime(18, 30);
        
        // Same Day Urgent is available before 10:30 AM and after 6:30 PM.
        return $now->lessThan($sameDayCutoff) || $now->greaterThan($nextDayCutoff);
    }
}