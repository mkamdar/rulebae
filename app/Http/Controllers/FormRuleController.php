<?php

namespace App\Http\Controllers;

use App\Models\Form;
use App\Models\FormRule;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class FormRuleController extends Controller
{
    public function store(Request $request, $formId): JsonResponse
    {
        $form = Form::findOrFail($formId);
        
        $validator = Validator::make($request->all(), [
            'target_field_id' => 'required|exists:form_fields,id',
            'condition_field_id' => 'required|exists:form_fields,id',
            'condition_operator' => 'required|string|in:equals,not_equals,contains,not_contains,greater_than,less_than',
            'condition_value' => 'required|string',
            'action_type' => 'required|string|in:show,hide,enable,disable,set_options',
            'action_value' => 'nullable|array',
            'order' => 'integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $rule = $form->rules()->create($request->all());
        return response()->json($rule->load(['conditionField', 'targetField']), 201);
    }

    public function update(Request $request, $formId, $ruleId): JsonResponse
    {
        $rule = FormRule::where('form_id', $formId)->findOrFail($ruleId);
        
        $validator = Validator::make($request->all(), [
            'target_field_id' => 'sometimes|required|exists:form_fields,id',
            'condition_field_id' => 'sometimes|required|exists:form_fields,id',
            'condition_operator' => 'sometimes|required|string|in:equals,not_equals,contains,not_contains,greater_than,less_than',
            'condition_value' => 'sometimes|required|string',
            'action_type' => 'sometimes|required|string|in:show,hide,enable,disable,set_options',
            'action_value' => 'nullable|array',
            'order' => 'integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $rule->update($request->all());
        return response()->json($rule->load(['conditionField', 'targetField']));
    }

    public function destroy($formId, $ruleId): JsonResponse
    {
        $rule = FormRule::where('form_id', $formId)->findOrFail($ruleId);
        $rule->delete();
        return response()->json(['message' => 'Rule deleted successfully']);
    }
}
