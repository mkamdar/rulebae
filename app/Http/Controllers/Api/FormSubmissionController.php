<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Models\FormSubmission;
use App\Services\DynamicForms\FormEngine;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FormSubmissionController extends Controller
{
    public function store(Request $request, FormEngine $engine): JsonResponse
    {
        $data = $request->validate([
            'payload' => ['required', 'array'],
        ]);

        $form = Form::query()->where('is_active', true)->latest('id')->first();
        if (!$form) {
            $form = Form::query()->create([
                'name' => 'Default Form',
                'is_active' => true,
                'definition' => FormEngine::defaultDefinition(),
            ]);
        }

        $engine->validateSubmission($form->definition, $data['payload']);

        $submission = FormSubmission::query()->create([
            'form_id' => $form->id,
            'payload' => $data['payload'],
        ]);

        return response()->json([
            'id' => $submission->id,
            'form_id' => $submission->form_id,
            'created_at' => $submission->created_at,
        ], 201);
    }
}

