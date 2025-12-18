import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { getCurrentForm, submitCurrentForm } from '../lib/api';
import { deriveConstraints, getEffectiveOptions, isValueAllowedForField } from '../lib/dynamicFormEngine';

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

function Button({ className = '', ...props }) {
    return (
        <button
            className={`rounded bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
            {...props}
        />
    );
}

function normalizeDefinition(def) {
    return {
        title: def?.title ?? 'Form',
        fields: Array.isArray(def?.fields) ? def.fields : [],
        rules: Array.isArray(def?.rules) ? def.rules : [],
    };
}

export default function UserForm() {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [definition, setDefinition] = useState(() => normalizeDefinition({}));
    const [values, setValues] = useState({});
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const data = await getCurrentForm();
                if (!mounted) return;
                const def = normalizeDefinition(data?.definition ?? {});
                setDefinition(def);
                // initialize values
                const initial = {};
                for (const f of def.fields) initial[f.id] = '';
                setValues(initial);
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

    const constraints = useMemo(() => deriveConstraints(definition, values), [definition, values]);

    // If a rule makes a selected dropdown value invalid, clear it.
    useEffect(() => {
        let changed = false;
        const next = { ...values };
        for (const f of definition.fields ?? []) {
            if (f.type !== 'select') continue;
            if (!isValueAllowedForField(f, next[f.id], constraints)) {
                next[f.id] = '';
                changed = true;
            }
        }
        if (changed) setValues(next);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [constraints]);

    async function onSubmit(e) {
        e.preventDefault();
        setError('');
        setSuccess('');
        setFieldErrors({});
        setSubmitting(true);
        try {
            const payload = { ...values };
            const res = await submitCurrentForm(payload);
            setSuccess(`Submitted (submission id: ${res.id})`);
        } catch (e2) {
            const data = e2?.response?.data;
            if (data?.errors) {
                setFieldErrors(Object.fromEntries(Object.entries(data.errors).map(([k, v]) => [k, v?.[0] ?? String(v)])));
                setError('Please fix the highlighted fields.');
            } else {
                setError(data?.message ?? e2?.message ?? 'Submit failed.');
            }
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="mx-auto max-w-3xl p-6">
                <Link to="/" className="text-sm text-slate-600 hover:underline">
                    ← Home
                </Link>
                <div className="mt-4 text-slate-700">Loading…</div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-3xl p-6">
            <Link to="/" className="text-sm text-slate-600 hover:underline">
                ← Home
            </Link>
            <h1 className="mt-2 text-2xl font-semibold">{definition.title}</h1>
            <p className="mt-1 text-sm text-slate-600">
                This is the latest published form. Dropdown dependencies are enforced as you edit.
            </p>

            {error ? (
                <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>
            ) : null}
            {success ? (
                <div className="mt-4 rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                    {success}
                </div>
            ) : null}

            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
                {(definition.fields ?? []).map((field) => {
                    const value = values[field.id] ?? '';
                    const effectiveOptions = field.type === 'select' ? getEffectiveOptions(field, constraints) : null;
                    const err = fieldErrors[field.id];

                    return (
                        <div key={field.id} className="rounded border border-slate-200 bg-white p-4">
                            <label className="block text-sm font-medium text-slate-900">
                                {field.label}{' '}
                                {field.required ? <span className="text-red-600">*</span> : null}
                            </label>
                            <div className="mt-2">
                                {field.type === 'text' ? (
                                    <Input
                                        value={value}
                                        onChange={(e) => setValues({ ...values, [field.id]: e.target.value })}
                                        placeholder="Enter text…"
                                    />
                                ) : null}
                                {field.type === 'number' ? (
                                    <Input
                                        type="number"
                                        value={value}
                                        onChange={(e) => setValues({ ...values, [field.id]: e.target.value })}
                                        placeholder="Enter number…"
                                    />
                                ) : null}
                                {field.type === 'select' ? (
                                    <Select
                                        value={value}
                                        onChange={(e) => setValues({ ...values, [field.id]: e.target.value })}
                                    >
                                        <option value="">(choose)</option>
                                        {(effectiveOptions ?? []).map((o) => (
                                            <option key={o.value} value={o.value}>
                                                {o.label}
                                            </option>
                                        ))}
                                    </Select>
                                ) : null}
                            </div>

                            {field.type === 'select' && constraints.allowedOptions[field.id] ? (
                                <div className="mt-2 text-xs text-slate-500">
                                    Options are restricted by rules based on other field values.
                                </div>
                            ) : null}

                            {err ? <div className="mt-2 text-sm text-red-700">{err}</div> : null}
                        </div>
                    );
                })}

                <div className="flex items-center gap-3">
                    <Button type="submit" disabled={submitting}>
                        {submitting ? 'Submitting…' : 'Submit'}
                    </Button>
                    <Link to="/admin/designer" className="text-sm text-slate-600 hover:underline">
                        Admin designer
                    </Link>
                </div>
            </form>
        </div>
    );
}

