<?php

namespace App\Http\Controllers;

use App\Models\Form;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class FormController extends Controller
{
    public function index(): JsonResponse
    {
        $forms = Form::with(['fields', 'rules'])->get();
        return response()->json($forms);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $form = Form::create($request->only(['name', 'description']));
        return response()->json($form, 201);
    }

    public function show($id): JsonResponse
    {
        $form = Form::with(['fields', 'rules.conditionField', 'rules.targetField'])->findOrFail($id);
        return response()->json($form);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $form = Form::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $form->update($request->only(['name', 'description', 'is_active']));
        return response()->json($form);
    }

    public function destroy($id): JsonResponse
    {
        $form = Form::findOrFail($id);
        $form->delete();
        return response()->json(['message' => 'Form deleted successfully']);
    }
}
