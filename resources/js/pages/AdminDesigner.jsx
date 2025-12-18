import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { getAdminCurrentForm, saveAdminCurrentForm } from '../lib/api';

function Button({ className = '', ...props }) {
    return (
        <button
            className={`rounded bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
            {...props}
        />
    );
}

function SecondaryButton({ className = '', ...props }) {
    return (
        <button
            className={`rounded border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
            {...props}
        />
    );
}

function Input({ className = '', ...props }) {
    return (
        <input
            className={`w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 ${className}`}
            {...props}
        />
    );
}

function Select({ className = '', ...props }) {
    return (
        <select
            className={`w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 ${className}`}
            {...props}
        />
    );
}

function Card({ className = '', children }) {
    return <div className={`rounded border border-slate-200 bg-white ${className}`}>{children}</div>;
}

function SectionTitle({ children }) {
    return <div className="text-sm font-semibold text-slate-900">{children}</div>;
}

function nanoId() {
    return globalThis.crypto?.randomUUID ? crypto.randomUUID() : `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function SortableFieldRow({ field, isSelected, onSelect, onRemove }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: field.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.7 : 1,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <div
                className={`flex items-center gap-2 rounded border px-3 py-2 ${
                    isSelected ? 'border-slate-400 bg-slate-50' : 'border-slate-200 bg-white'
                }`}
            >
                <button
                    type="button"
                    className="cursor-grab select-none rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
                    title="Drag"
                    {...attributes}
                    {...listeners}
                >
                    ↕
                </button>

                <button type="button" className="flex-1 text-left" onClick={onSelect}>
                    <div className="text-sm font-medium text-slate-900">{field.label || '(no label)'}</div>
                    <div className="text-xs text-slate-500">
                        <span className="font-mono">{field.id}</span> · {field.type}
                        {field.required ? ' · required' : ''}
                    </div>
                </button>

                <button
                    type="button"
                    className="rounded border border-red-200 bg-white px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                    onClick={onRemove}
                    title="Remove field"
                >
                    Remove
                </button>
            </div>
        </div>
    );
}

function ensureDefinitionShape(def) {
    return {
        version: def?.version ?? 1,
        title: def?.title ?? 'Untitled',
        fields: Array.isArray(def?.fields) ? def.fields : [],
        rules: Array.isArray(def?.rules) ? def.rules : [],
    };
}

function FieldEditor({ field, allFields, onChange }) {
    const isSelect = field.type === 'select';
    return (
        <div className="space-y-3">
            <div>
                <div className="mb-1 text-xs font-medium text-slate-700">Label</div>
                <Input value={field.label ?? ''} onChange={(e) => onChange({ ...field, label: e.target.value })} />
            </div>
            <div>
                <div className="mb-1 text-xs font-medium text-slate-700">Field ID (unique)</div>
                <Input value={field.id ?? ''} onChange={(e) => onChange({ ...field, id: e.target.value })} />
                <div className="mt-1 text-xs text-slate-500">
                    Used by rules and for submission payload keys.
                </div>
            </div>
            <div>
                <div className="mb-1 text-xs font-medium text-slate-700">Type</div>
                <Select
                    value={field.type}
                    onChange={(e) => {
                        const nextType = e.target.value;
                        onChange({
                            ...field,
                            type: nextType,
                            options: nextType === 'select' ? field.options ?? [{ value: 'opt1', label: 'Option 1' }] : undefined,
                        });
                    }}
                >
                    <option value="text">text</option>
                    <option value="number">number</option>
                    <option value="select">select</option>
                </Select>
            </div>
            <label className="flex items-center gap-2 text-sm">
                <input
                    type="checkbox"
                    checked={Boolean(field.required)}
                    onChange={(e) => onChange({ ...field, required: e.target.checked })}
                />
                Required
            </label>

            {isSelect ? (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="text-xs font-medium text-slate-700">Options</div>
                        <SecondaryButton
                            type="button"
                            onClick={() => onChange({ ...field, options: [...(field.options ?? []), { value: nanoId(), label: 'New option' }] })}
                        >
                            + Add option
                        </SecondaryButton>
                    </div>
                    <div className="space-y-2">
                        {(field.options ?? []).map((opt, idx) => (
                            <div key={`${opt.value}_${idx}`} className="grid grid-cols-2 gap-2">
                                <Input
                                    placeholder="value"
                                    value={opt.value ?? ''}
                                    onChange={(e) => {
                                        const next = [...(field.options ?? [])];
                                        next[idx] = { ...next[idx], value: e.target.value };
                                        onChange({ ...field, options: next });
                                    }}
                                />
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="label"
                                        value={opt.label ?? ''}
                                        onChange={(e) => {
                                            const next = [...(field.options ?? [])];
                                            next[idx] = { ...next[idx], label: e.target.value };
                                            onChange({ ...field, options: next });
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="rounded border border-slate-200 bg-white px-2 text-xs hover:bg-slate-50"
                                        onClick={() => {
                                            const next = [...(field.options ?? [])];
                                            next.splice(idx, 1);
                                            onChange({ ...field, options: next });
                                        }}
                                        title="Remove option"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-xs text-slate-500">
                        Rules can restrict which options are available based on another field’s value.
                    </div>
                </div>
            ) : null}

            <div className="rounded border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                <div className="font-medium">Quick sanity:</div>
                <div className="mt-1">
                    ID uniqueness: {allFields.filter((f) => f.id === field.id).length > 1 ? <span className="text-red-700">duplicate</span> : <span className="text-emerald-700">ok</span>}
                </div>
            </div>
        </div>
    );
}

function RulesEditor({ definition, setDefinition }) {
    const fields = definition.fields ?? [];
    const selectableFields = fields.filter((f) => f.type === 'select');

    function addRule() {
        const source = selectableFields[0]?.id ?? fields[0]?.id ?? 'field1';
        const target = selectableFields[1]?.id ?? selectableFields[0]?.id ?? 'field2';
        setDefinition({
            ...definition,
            rules: [
                ...(definition.rules ?? []),
                {
                    id: nanoId(),
                    when: { field: source, operator: 'equals', value: '' },
                    then: [{ type: 'restrictOptions', field: target, allowedValues: [] }],
                },
            ],
        });
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <SectionTitle>Rules</SectionTitle>
                <SecondaryButton type="button" onClick={addRule}>
                    + Add rule
                </SecondaryButton>
            </div>

            {(definition.rules ?? []).length === 0 ? (
                <div className="rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                    No rules yet. Add one to restrict dropdown options based on another field.
                </div>
            ) : null}

            <div className="space-y-3">
                {(definition.rules ?? []).map((rule, idx) => {
                    const whenField = fields.find((f) => f.id === rule?.when?.field);
                    const targetAction = (rule?.then ?? []).find((a) => a?.type === 'restrictOptions') ?? { type: 'restrictOptions' };
                    const targetField = fields.find((f) => f.id === targetAction.field);

                    return (
                        <Card key={rule.id ?? idx} className="p-3">
                            <div className="flex items-center justify-between">
                                <div className="text-sm font-medium text-slate-900">Rule {idx + 1}</div>
                                <button
                                    type="button"
                                    className="rounded border border-red-200 bg-white px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                                    onClick={() => {
                                        const next = [...(definition.rules ?? [])];
                                        next.splice(idx, 1);
                                        setDefinition({ ...definition, rules: next });
                                    }}
                                >
                                    Remove
                                </button>
                            </div>

                            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                                <div>
                                    <div className="mb-1 text-xs font-medium text-slate-700">When field</div>
                                    <Select
                                        value={rule?.when?.field ?? ''}
                                        onChange={(e) => {
                                            const next = [...(definition.rules ?? [])];
                                            next[idx] = { ...rule, when: { ...(rule.when ?? {}), field: e.target.value } };
                                            setDefinition({ ...definition, rules: next });
                                        }}
                                    >
                                        {fields.map((f) => (
                                            <option key={f.id} value={f.id}>
                                                {f.label} ({f.id})
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                                <div>
                                    <div className="mb-1 text-xs font-medium text-slate-700">Equals value</div>
                                    {whenField?.type === 'select' ? (
                                        <Select
                                            value={rule?.when?.value ?? ''}
                                            onChange={(e) => {
                                                const next = [...(definition.rules ?? [])];
                                                next[idx] = { ...rule, when: { ...(rule.when ?? {}), value: e.target.value } };
                                                setDefinition({ ...definition, rules: next });
                                            }}
                                        >
                                            <option value="">(choose)</option>
                                            {(whenField.options ?? []).map((o) => (
                                                <option key={o.value} value={o.value}>
                                                    {o.label} ({o.value})
                                                </option>
                                            ))}
                                        </Select>
                                    ) : (
                                        <Input
                                            value={rule?.when?.value ?? ''}
                                            onChange={(e) => {
                                                const next = [...(definition.rules ?? [])];
                                                next[idx] = { ...rule, when: { ...(rule.when ?? {}), value: e.target.value } };
                                                setDefinition({ ...definition, rules: next });
                                            }}
                                        />
                                    )}
                                </div>
                                <div>
                                    <div className="mb-1 text-xs font-medium text-slate-700">Then restrict options for</div>
                                    <Select
                                        value={targetAction.field ?? ''}
                                        onChange={(e) => {
                                            const next = [...(definition.rules ?? [])];
                                            const then = [...(rule.then ?? [])];
                                            const i = then.findIndex((a) => a?.type === 'restrictOptions');
                                            const base = { ...(i >= 0 ? then[i] : { type: 'restrictOptions' }) };
                                            base.field = e.target.value;
                                            base.allowedValues = [];
                                            if (i >= 0) then[i] = base;
                                            else then.push(base);
                                            next[idx] = { ...rule, then };
                                            setDefinition({ ...definition, rules: next });
                                        }}
                                    >
                                        {selectableFields.map((f) => (
                                            <option key={f.id} value={f.id}>
                                                {f.label} ({f.id})
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                            </div>

                            <div className="mt-3">
                                <div className="mb-2 text-xs font-medium text-slate-700">Allowed values</div>
                                {targetField?.type !== 'select' ? (
                                    <div className="rounded border border-amber-200 bg-amber-50 p-2 text-sm text-amber-800">
                                        Target must be a select field.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                        {(targetField.options ?? []).map((opt) => {
                                            const checked = (targetAction.allowedValues ?? []).includes(opt.value);
                                            return (
                                                <label key={opt.value} className="flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2 text-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={(e) => {
                                                            const next = [...(definition.rules ?? [])];
                                                            const then = [...(rule.then ?? [])];
                                                            const i = then.findIndex((a) => a?.type === 'restrictOptions');
                                                            const base = { ...(i >= 0 ? then[i] : { type: 'restrictOptions', field: targetField.id, allowedValues: [] }) };
                                                            const list = new Set(base.allowedValues ?? []);
                                                            if (e.target.checked) list.add(opt.value);
                                                            else list.delete(opt.value);
                                                            base.allowedValues = [...list];
                                                            if (i >= 0) then[i] = base;
                                                            else then.push(base);
                                                            next[idx] = { ...rule, then };
                                                            setDefinition({ ...definition, rules: next });
                                                        }}
                                                    />
                                                    <span>
                                                        {opt.label} <span className="font-mono text-xs text-slate-500">({opt.value})</span>
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

export default function AdminDesigner() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [saveNotice, setSaveNotice] = useState('');

    const [formName, setFormName] = useState('Dynamic Form');
    const [definition, setDefinition] = useState(() => ensureDefinitionShape({}));
    const [selectedFieldId, setSelectedFieldId] = useState(null);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const data = await getAdminCurrentForm();
                if (!mounted) return;
                setFormName(data?.name ?? 'Dynamic Form');
                setDefinition(ensureDefinitionShape(data?.definition ?? {}));
                setSelectedFieldId((data?.definition?.fields?.[0]?.id ?? null) || null);
            } catch (e) {
                if (!mounted) return;
                setError(e?.response?.data?.message ?? e?.message ?? 'Failed to load form.');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const fields = definition.fields ?? [];
    const selectedField = useMemo(() => fields.find((f) => f.id === selectedFieldId) ?? null, [fields, selectedFieldId]);

    function addField(type) {
        const id = `${type}_${nanoId().slice(0, 8)}`;
        const next = {
            id,
            label: type === 'select' ? 'New dropdown' : type === 'number' ? 'New number' : 'New text',
            type,
            required: false,
        };
        if (type === 'select') {
            next.options = [
                { value: 'opt1', label: 'Option 1' },
                { value: 'opt2', label: 'Option 2' },
            ];
        }

        setDefinition({ ...definition, fields: [...fields, next] });
        setSelectedFieldId(id);
    }

    function updateField(nextField) {
        const nextFields = fields.map((f) => (f.id === selectedFieldId ? nextField : f));
        setDefinition({ ...definition, fields: nextFields });

        // If the user changed the ID, keep selection in sync.
        if (nextField.id !== selectedFieldId) {
            setSelectedFieldId(nextField.id);
        }
    }

    async function save() {
        setError('');
        setSaveNotice('');
        setSaving(true);
        try {
            const result = await saveAdminCurrentForm({ name: formName, definition });
            setSaveNotice(`Saved (id: ${result.id})`);
        } catch (e) {
            const data = e?.response?.data;
            if (data?.errors) {
                setError(Object.entries(data.errors).map(([k, v]) => `${k}: ${v?.[0] ?? v}`).join('\n'));
            } else {
                setError(data?.message ?? e?.message ?? 'Save failed.');
            }
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="mx-auto max-w-5xl p-6">
                <Link to="/" className="text-sm text-slate-600 hover:underline">
                    ← Home
                </Link>
                <div className="mt-4 text-slate-700">Loading…</div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <Link to="/" className="text-sm text-slate-600 hover:underline">
                        ← Home
                    </Link>
                    <h1 className="mt-2 text-2xl font-semibold">Admin Form Designer</h1>
                    <p className="mt-1 text-sm text-slate-600">
                        Drag-and-drop fields, edit properties, and add dropdown dependency rules.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {saveNotice ? <div className="text-sm text-emerald-700">{saveNotice}</div> : null}
                    <Button type="button" onClick={save} disabled={saving}>
                        {saving ? 'Saving…' : 'Save & Publish'}
                    </Button>
                </div>
            </div>

            {error ? (
                <div className="mb-4 whitespace-pre-wrap rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                    {error}
                </div>
            ) : null}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                <div className="lg:col-span-4 space-y-3">
                    <Card className="p-4">
                        <SectionTitle>Form</SectionTitle>
                        <div className="mt-2">
                            <div className="mb-1 text-xs font-medium text-slate-700">Name</div>
                            <Input value={formName} onChange={(e) => setFormName(e.target.value)} />
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <SecondaryButton type="button" onClick={() => addField('text')}>
                                + Text
                            </SecondaryButton>
                            <SecondaryButton type="button" onClick={() => addField('number')}>
                                + Number
                            </SecondaryButton>
                            <SecondaryButton type="button" onClick={() => addField('select')}>
                                + Dropdown
                            </SecondaryButton>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <SectionTitle>Fields (drag to reorder)</SectionTitle>
                        <div className="mt-3 space-y-2">
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={(event) => {
                                    const { active, over } = event;
                                    if (!over || active.id === over.id) return;
                                    const oldIndex = fields.findIndex((f) => f.id === active.id);
                                    const newIndex = fields.findIndex((f) => f.id === over.id);
                                    setDefinition({ ...definition, fields: arrayMove(fields, oldIndex, newIndex) });
                                }}
                            >
                                <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                                    {fields.map((f) => (
                                        <SortableFieldRow
                                            key={f.id}
                                            field={f}
                                            isSelected={f.id === selectedFieldId}
                                            onSelect={() => setSelectedFieldId(f.id)}
                                            onRemove={() => {
                                                const nextFields = fields.filter((x) => x.id !== f.id);
                                                setDefinition({ ...definition, fields: nextFields });
                                                if (selectedFieldId === f.id) setSelectedFieldId(nextFields[0]?.id ?? null);
                                            }}
                                        />
                                    ))}
                                </SortableContext>
                            </DndContext>
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-4 space-y-3">
                    <Card className="p-4">
                        <SectionTitle>Field editor</SectionTitle>
                        <div className="mt-3">
                            {!selectedField ? (
                                <div className="rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                                    Select a field to edit.
                                </div>
                            ) : (
                                <FieldEditor field={selectedField} allFields={fields} onChange={updateField} />
                            )}
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-4 space-y-3">
                    <Card className="p-4">
                        <RulesEditor definition={definition} setDefinition={setDefinition} />
                    </Card>
                    <Card className="p-4">
                        <SectionTitle>Preview link</SectionTitle>
                        <div className="mt-2 text-sm text-slate-600">
                            After saving, open the user view:
                        </div>
                        <div className="mt-2">
                            <Link to="/form" className="text-sm font-medium text-slate-900 underline">
                                /form
                            </Link>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

