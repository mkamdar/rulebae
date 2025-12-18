<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('form_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_id')->constrained()->onDelete('cascade');
            $table->string('label');
            $table->string('name');
            $table->string('type'); // text, email, number, select, checkbox, radio, textarea, date
            $table->text('options')->nullable(); // JSON for select/radio options
            $table->text('validation_rules')->nullable(); // JSON for validation rules
            $table->boolean('required')->default(false);
            $table->text('placeholder')->nullable();
            $table->text('help_text')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('form_fields');
    }
};
