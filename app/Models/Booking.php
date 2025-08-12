<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'customer_phone',
        'receipt_number',
        'amount_total',
        'sales_tax_percentage',
        'sales_tax_amount',
        'number_of_units',
        'hanger_units',
        'hanger_amount',
        'total_amount',
        'delivery_type',
        'booking_date',
        'delivery_date',
        'status',
        'issues',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'booking_date' => 'datetime',
        'delivery_date' => 'datetime',
        'issues' => 'array',
    ];

    /**
     * Get the booking items for the booking.
     */
    public function bookingItems()
    {
        return $this->hasMany(BookingItem::class);
    }
}