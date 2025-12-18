<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('form_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_id')->constrained()->onDelete('cascade');
            $table->foreignId('target_field_id')->constrained('form_fields')->onDelete('cascade');
            $table->foreignId('condition_field_id')->constrained('form_fields')->onDelete('cascade');
            $table->string('condition_operator'); // equals, not_equals, contains, etc.
            $table->text('condition_value'); // The value to compare against
            $table->string('action_type'); // show, hide, enable, disable, set_options
            $table->text('action_value')->nullable(); // JSON for action-specific values (e.g., options for set_options)
            $table->integer('order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('form_rules');
    }
};
