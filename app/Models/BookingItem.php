<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'item_id',
        'units',
    ];

    /**
     * Get the booking that owns the item.
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    /**
     * Get the item associated with the booking item.
     */
    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }
}