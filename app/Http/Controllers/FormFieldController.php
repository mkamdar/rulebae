<?php

namespace App\Http\Controllers;

use App\Models\Form;
use App\Models\FormField;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class FormFieldController extends Controller
{
    public function store(Request $request, $formId): JsonResponse
    {
        $form = Form::findOrFail($formId);
        
        $validator = Validator::make($request->all(), [
            'label' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:text,email,number,select,checkbox,radio,textarea,date',
            'options' => 'nullable|array',
            'validation_rules' => 'nullable|array',
            'required' => 'boolean',
            'placeholder' => 'nullable|string',
            'help_text' => 'nullable|string',
            'order' => 'integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $field = $form->fields()->create($request->all());
        return response()->json($field, 201);
    }

    public function update(Request $request, $formId, $fieldId): JsonResponse
    {
        $field = FormField::where('form_id', $formId)->findOrFail($fieldId);
        
        $validator = Validator::make($request->all(), [
            'label' => 'sometimes|required|string|max:255',
            'name' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|string|in:text,email,number,select,checkbox,radio,textarea,date',
            'options' => 'nullable|array',
            'validation_rules' => 'nullable|array',
            'required' => 'boolean',
            'placeholder' => 'nullable|string',
            'help_text' => 'nullable|string',
            'order' => 'integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $field->update($request->all());
        return response()->json($field);
    }

    public function destroy($formId, $fieldId): JsonResponse
    {
        $field = FormField::where('form_id', $formId)->findOrFail($fieldId);
        $field->delete();
        return response()->json(['message' => 'Field deleted successfully']);
    }

    public function reorder(Request $request, $formId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'fields' => 'required|array',
            'fields.*.id' => 'required|exists:form_fields,id',
            'fields.*.order' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        foreach ($request->fields as $fieldData) {
            FormField::where('id', $fieldData['id'])
                ->where('form_id', $formId)
                ->update(['order' => $fieldData['order']]);
        }

        return response()->json(['message' => 'Fields reordered successfully']);
    }
}
