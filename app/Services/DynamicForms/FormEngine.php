<?php

namespace App\Services\DynamicForms;

use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class FormEngine
{
    /**
     * Returns a safe default form definition (used when DB is empty).
     */
    public static function defaultDefinition(): array
    {
        return [
            'version' => 1,
            'title' => 'Example Dynamic Form',
            'fields' => [
                [
                    'id' => 'dropdown1',
                    'label' => 'Dropdown 1',
                    'type' => 'select',
                    'required' => true,
                    'options' => [
                        ['value' => '1', 'label' => 'One'],
                        ['value' => '2', 'label' => 'Two'],
                    ],
                ],
                [
                    'id' => 'dropdown2',
                    'label' => 'Dropdown 2',
                    'type' => 'select',
                    'required' => true,
                    'options' => [
                        ['value' => 'a', 'label' => 'A'],
                        ['value' => 'b', 'label' => 'B'],
                        ['value' => 'c', 'label' => 'C'],
                    ],
                ],
            ],
            'rules' => [
                [
                    'id' => 'r1',
                    'when' => [
                        'field' => 'dropdown1',
                        'operator' => 'equals',
                        'value' => '1',
                    ],
                    'then' => [
                        [
                            'type' => 'restrictOptions',
                            'field' => 'dropdown2',
                            'allowedValues' => ['a', 'b'],
                        ],
                    ],
                ],
            ],
        ];
    }

    /**
     * Minimal validation for a definition coming from the admin UI.
     */
    public function validateDefinition(array $definition): void
    {
        $v = Validator::make($definition, [
            'version' => ['nullable', 'integer', 'min:1'],
            'title' => ['nullable', 'string', 'max:255'],
            'fields' => ['required', 'array', 'min:1'],
            'fields.*.id' => ['required', 'string', 'max:64'],
            'fields.*.label' => ['required', 'string', 'max:255'],
            'fields.*.type' => ['required', 'string', 'in:text,number,select'],
            'fields.*.required' => ['nullable', 'boolean'],
            'fields.*.options' => ['nullable', 'array'],
            'fields.*.options.*.value' => ['required_with:fields.*.options', 'string', 'max:255'],
            'fields.*.options.*.label' => ['required_with:fields.*.options', 'string', 'max:255'],
            'rules' => ['nullable', 'array'],
        ]);

        if ($v->fails()) {
            throw new ValidationException($v);
        }

        // Ensure field IDs are unique.
        $ids = array_map(fn ($f) => (string) ($f['id'] ?? ''), $definition['fields'] ?? []);
        $unique = array_values(array_unique($ids));
        if (count($ids) !== count($unique)) {
            throw ValidationException::withMessages([
                'fields' => ['Field IDs must be unique.'],
            ]);
        }
    }

    /**
     * Applies supported rule actions and returns derived constraints for rendering/validation.
     *
     * @return array{allowedOptions: array<string, array<string, true>>}
     */
    public function deriveConstraints(array $definition, array $payload): array
    {
        $allowedOptions = [];

        foreach (($definition['rules'] ?? []) as $rule) {
            if (!$this->ruleMatches($rule, $payload)) {
                continue;
            }

            foreach (($rule['then'] ?? []) as $action) {
                if (($action['type'] ?? null) === 'restrictOptions') {
                    $targetField = (string) ($action['field'] ?? '');
                    $allowedValues = (array) ($action['allowedValues'] ?? []);

                    if ($targetField === '') {
                        continue;
                    }

                    $set = [];
                    foreach ($allowedValues as $val) {
                        $set[(string) $val] = true;
                    }

                    // Multiple matching rules intersect allowed values.
                    if (!isset($allowedOptions[$targetField])) {
                        $allowedOptions[$targetField] = $set;
                    } else {
                        $allowedOptions[$targetField] = array_intersect_key($allowedOptions[$targetField], $set);
                    }
                }
            }
        }

        return ['allowedOptions' => $allowedOptions];
    }

    /**
     * Validates the user payload against field types and supported rules.
     * Throws ValidationException on errors.
     */
    public function validateSubmission(array $definition, array $payload): void
    {
        $fields = (array) ($definition['fields'] ?? []);
        $byId = [];
        foreach ($fields as $f) {
            if (!isset($f['id'])) {
                continue;
            }
            $byId[(string) $f['id']] = $f;
        }

        $constraints = $this->deriveConstraints($definition, $payload);
        $allowedOptions = $constraints['allowedOptions'];

        $rules = [];
        foreach ($byId as $id => $field) {
            $type = $field['type'] ?? 'text';
            $required = (bool) ($field['required'] ?? false);

            $base = [];
            if ($required) {
                $base[] = 'required';
            } else {
                $base[] = 'nullable';
            }

            if ($type === 'text') {
                $base[] = 'string';
                $base[] = 'max:2000';
            } elseif ($type === 'number') {
                $base[] = 'numeric';
            } elseif ($type === 'select') {
                $base[] = 'string';
                $opts = Arr::pluck(($field['options'] ?? []), 'value');
                $opts = array_map('strval', $opts);

                // Apply restriction rules (if present) by intersecting with base options.
                if (isset($allowedOptions[$id])) {
                    $opts = array_values(array_intersect($opts, array_keys($allowedOptions[$id])));
                }

                if (count($opts) > 0) {
                    $base[] = 'in:'.implode(',', array_map(fn ($v) => str_replace(',', '\\,', $v), $opts));
                }
            }

            $rules[$id] = $base;
        }

        $v = Validator::make($payload, $rules, [
            'in' => 'Selected value is not allowed by form rules.',
        ]);

        if ($v->fails()) {
            throw new ValidationException($v);
        }
    }

    private function ruleMatches(array $rule, array $payload): bool
    {
        $when = (array) ($rule['when'] ?? []);
        $fieldId = (string) ($when['field'] ?? '');
        $op = (string) ($when['operator'] ?? 'equals');
        $value = $when['value'] ?? null;

        if ($fieldId === '') {
            return false;
        }

        $actual = $payload[$fieldId] ?? null;

        if ($op === 'equals') {
            return (string) $actual === (string) $value;
        }

        return false;
    }
}

