<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FormRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'form_id',
        'target_field_id',
        'condition_field_id',
        'condition_operator',
        'condition_value',
        'action_type',
        'action_value',
        'order',
    ];

    protected $casts = [
        'action_value' => 'array',
    ];

    public function form(): BelongsTo
    {
        return $this->belongsTo(Form::class);
    }

    public function targetField(): BelongsTo
    {
        return $this->belongsTo(FormField::class, 'target_field_id');
    }

    public function conditionField(): BelongsTo
    {
        return $this->belongsTo(FormField::class, 'condition_field_id');
    }
}
