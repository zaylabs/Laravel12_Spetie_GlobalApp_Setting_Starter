<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('booking', function (Blueprint $table) {
            $table->id();
            $table->string('customer_phone', 20);
            $table->string('receipt_number', 50)->unique();
            $table->decimal('amount_total', 10, 2);
            $table->decimal('sales_tax_percentage', 5, 2)->default(0);
            $table->decimal('sales_tax_amount', 10, 2);
            $table->integer('number_of_units')->unsigned();
            $table->integer('hanger_units')->unsigned()->default(0);
            $table->decimal('hanger_amount', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2);
            $table->enum('delivery_type', ['normal', 'urgent', 'same_day_urgent'])->default('normal');
            $table->timestamp('booking_date');
            $table->timestamp('delivery_date')->nullable();
            $table->timestamps();
        });

        Schema::create('booking_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade');
            $table->foreignId('item_id')->constrained('items')->onDelete('cascade');
            $table->integer('units')->unsigned();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_items');
        Schema::dropIfExists('booking');
    }
};