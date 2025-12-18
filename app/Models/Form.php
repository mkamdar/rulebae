<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Form extends Model
{
    protected $fillable = [
        'name',
        'is_active',
        'definition',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'definition' => 'array',
    ];

    public function submissions(): HasMany
    {
        return $this->hasMany(FormSubmission::class);
    }
}

