<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Services\DynamicForms\FormEngine;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

    public function upsertCurrent(Request $request, FormEngine $engine): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'definition' => ['required', 'array'],
        ]);

        $engine->validateDefinition($data['definition']);

        $form = DB::transaction(function () use ($data) {
            Form::query()->where('is_active', true)->update(['is_active' => false]);

            return Form::query()->create([
                'name' => $data['name'],
                'is_active' => true,
                'definition' => $data['definition'],
            ]);
        });

        return response()->json([
            'id' => $form->id,
            'name' => $form->name,
            'definition' => $form->definition,
            'updated_at' => $form->updated_at,
        ]);
    }
}

