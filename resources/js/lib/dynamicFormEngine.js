export function defaultDefinition() {
    return {
        version: 1,
        title: 'Example Dynamic Form',
        fields: [
            {
                id: 'dropdown1',
                label: 'Dropdown 1',
                type: 'select',
                required: true,
                options: [
                    { value: '1', label: 'One' },
                    { value: '2', label: 'Two' },
                ],
            },
            {
                id: 'dropdown2',
                label: 'Dropdown 2',
                type: 'select',
                required: true,
                options: [
                    { value: 'a', label: 'A' },
                    { value: 'b', label: 'B' },
                    { value: 'c', label: 'C' },
                ],
            },
        ],
        rules: [
            {
                id: 'r1',
                when: { field: 'dropdown1', operator: 'equals', value: '1' },
                then: [{ type: 'restrictOptions', field: 'dropdown2', allowedValues: ['a', 'b'] }],
            },
        ],
    };
}

function ruleMatches(rule, values) {
    const when = rule?.when ?? {};
    const fieldId = when.field;
    const op = when.operator ?? 'equals';
    const expected = when.value;

    if (!fieldId) return false;

    const actual = values?.[fieldId];

    if (op === 'equals') {
        return String(actual ?? '') === String(expected ?? '');
    }

    return false;
}

/**
 * @returns {{ allowedOptions: Record<string, Set<string>> }}
 */
export function deriveConstraints(definition, values) {
    /** @type {Record<string, Set<string>>} */
    const allowedOptions = {};

    for (const rule of definition?.rules ?? []) {
        if (!ruleMatches(rule, values)) continue;
        for (const action of rule?.then ?? []) {
            if (action?.type !== 'restrictOptions') continue;
            const targetField = action.field;
            const allowedValues = (action.allowedValues ?? []).map((v) => String(v));
            if (!targetField) continue;

            const next = new Set(allowedValues);
            if (!allowedOptions[targetField]) {
                allowedOptions[targetField] = next;
            } else {
                const current = allowedOptions[targetField];
                allowedOptions[targetField] = new Set([...current].filter((v) => next.has(v)));
            }
        }
    }

    return { allowedOptions };
}

export function getEffectiveOptions(field, constraints) {
    const opts = field?.options ?? [];
    if (field?.type !== 'select') return opts;

    const allowed = constraints?.allowedOptions?.[field.id];
    if (!allowed) return opts;

    return opts.filter((o) => allowed.has(String(o.value)));
}

export function isValueAllowedForField(field, value, constraints) {
    if (field?.type !== 'select') return true;
    if (value == null || value === '') return true;
    const allowedOpts = getEffectiveOptions(field, constraints).map((o) => String(o.value));
    return allowedOpts.includes(String(value));
}

