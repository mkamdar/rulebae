<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Services\DynamicForms\FormEngine;
use Illuminate\Http\JsonResponse;

class FormDefinitionController extends Controller
{
    public function showCurrent(): JsonResponse
    {
        $form = Form::query()->where('is_active', true)->latest('id')->first();

        if (!$form) {
            $form = Form::query()->create([
                'name' => 'Default Form',
                'is_active' => true,
                'definition' => FormEngine::defaultDefinition(),
            ]);
        }

        return response()->json([
            'id' => $form->id,
            'name' => $form->name,
            'definition' => $form->definition,
            'updated_at' => $form->updated_at,
        ]);
    }
}

