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
        Schema::create('configurations', function (Blueprint $table) {
            $table->id();
            $table->decimal('SalesTax', 8, 2); // Sales Tax (in %)
            $table->integer('NumberOfDaysForNormal'); // Number of Days for Normal
            $table->integer('NumberOfDaysForUrgent'); // Number of Days for Urgent
            $table->decimal('ChargesForNormalUrgent', 8, 2); // Charges for Normal Urgent (in %)
            $table->decimal('ChargesForSameDayUrgent', 8, 2); // Charges for Same Day Urgent (in %)
            $table->string('NTNNumber', 255); // NTN Number
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('configurations');
    }
};
