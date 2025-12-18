<?php

namespace App\Http\Controllers;

use App\Models\Form;
use App\Models\FormSubmission;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class FormSubmissionController extends Controller
{
    public function store(Request $request, $formId): JsonResponse
    {
        $form = Form::with(['fields', 'rules.conditionField', 'rules.targetField'])->findOrFail($formId);
        
        // Build validation rules from form fields
        $rules = [];
        $messages = [];
        
        foreach ($form->fields as $field) {
            $fieldRules = [];
            
            if ($field->required) {
                $fieldRules[] = 'required';
            } else {
                $fieldRules[] = 'nullable';
            }
            
            // Add type-specific validation
            switch ($field->type) {
                case 'email':
                    $fieldRules[] = 'email';
                    break;
                case 'number':
                    $fieldRules[] = 'numeric';
                    break;
                case 'date':
                    $fieldRules[] = 'date';
                    break;
            }
            
            // Add custom validation rules if any
            if ($field->validation_rules) {
                $fieldRules = array_merge($fieldRules, $field->validation_rules);
            }
            
            $rules[$field->name] = $fieldRules;
            $messages[$field->name . '.required'] = "The {$field->label} field is required.";
        }
        
        $validator = Validator::make($request->all(), $rules, $messages);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Validate conditional rules
        $errors = $this->validateRules($form, $request->all());
        if (!empty($errors)) {
            return response()->json(['errors' => $errors], 422);
        }
        
        $submission = $form->submissions()->create([
            'data' => $request->all(),
        ]);
        
        return response()->json($submission, 201);
    }
    
    private function validateRules(Form $form, array $data): array
    {
        $errors = [];
        
        foreach ($form->rules as $rule) {
            $conditionValue = $data[$rule->conditionField->name] ?? null;
            $conditionMet = false;
            
            // Check if condition is met
            switch ($rule->condition_operator) {
                case 'equals':
                    $conditionMet = (string)$conditionValue === (string)$rule->condition_value;
                    break;
                case 'not_equals':
                    $conditionMet = (string)$conditionValue !== (string)$rule->condition_value;
                    break;
                case 'contains':
                    $conditionMet = str_contains((string)$conditionValue, (string)$rule->condition_value);
                    break;
                case 'not_contains':
                    $conditionMet = !str_contains((string)$conditionValue, (string)$rule->condition_value);
                    break;
                case 'greater_than':
                    $conditionMet = (float)$conditionValue > (float)$rule->condition_value;
                    break;
                case 'less_than':
                    $conditionMet = (float)$conditionValue < (float)$rule->condition_value;
                    break;
            }
            
            if ($conditionMet) {
                $targetValue = $data[$rule->targetField->name] ?? null;
                
                // Validate action-specific rules
                if ($rule->action_type === 'set_options' && $rule->action_value) {
                    $allowedOptions = $rule->action_value['options'] ?? [];
                    if (!empty($allowedOptions) && !in_array($targetValue, $allowedOptions)) {
                        $errors[$rule->targetField->name] = [
                            "The {$rule->targetField->label} must be one of the allowed values."
                        ];
                    }
                }
            }
        }
        
        return $errors;
    }
}
