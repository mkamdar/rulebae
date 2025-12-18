import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

function FormViewer() {
    const { id } = useParams();
    const [form, setForm] = useState(null);
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [fieldVisibility, setFieldVisibility] = useState({});
    const [fieldOptions, setFieldOptions] = useState({});
    const [fieldDisabled, setFieldDisabled] = useState({});

    useEffect(() => {
        fetchForm();
    }, [id]);

    useEffect(() => {
        if (form) {
            applyRules();
        }
    }, [formData, form]);

    const fetchForm = async () => {
        try {
            const response = await api.get(`/forms/${id}`);
            setForm(response.data);
            // Initialize form data
            const initialData = {};
            response.data.fields?.forEach((field) => {
                initialData[field.name] = '';
            });
            setFormData(initialData);
        } catch (error) {
            console.error('Error fetching form:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyRules = () => {
        if (!form || !form.rules) return;

        const visibility = {};
        const options = {};
        const disabled = {};

        form.fields?.forEach((field) => {
            visibility[field.name] = true;
            disabled[field.name] = false;
            options[field.name] = field.options || [];
        });

        form.rules.forEach((rule) => {
            const conditionValue = formData[rule.condition_field?.name] || '';
            let conditionMet = false;

            switch (rule.condition_operator) {
                case 'equals':
                    conditionMet = String(conditionValue) === String(rule.condition_value);
                    break;
                case 'not_equals':
                    conditionMet = String(conditionValue) !== String(rule.condition_value);
                    break;
                case 'contains':
                    conditionMet = String(conditionValue).includes(String(rule.condition_value));
                    break;
                case 'not_contains':
                    conditionMet = !String(conditionValue).includes(String(rule.condition_value));
                    break;
                case 'greater_than':
                    conditionMet = parseFloat(conditionValue) > parseFloat(rule.condition_value);
                    break;
                case 'less_than':
                    conditionMet = parseFloat(conditionValue) < parseFloat(rule.condition_value);
                    break;
            }

            if (conditionMet) {
                const targetFieldName = rule.target_field?.name;
                if (!targetFieldName) return;

                switch (rule.action_type) {
                    case 'show':
                        visibility[targetFieldName] = true;
                        break;
                    case 'hide':
                        visibility[targetFieldName] = false;
                        break;
                    case 'enable':
                        disabled[targetFieldName] = false;
                        break;
                    case 'disable':
                        disabled[targetFieldName] = true;
                        break;
                    case 'set_options':
                        if (rule.action_value?.options) {
                            options[targetFieldName] = rule.action_value.options;
                        }
                        break;
                }
            }
        });

        setFieldVisibility(visibility);
        setFieldOptions(options);
        setFieldDisabled(disabled);
    };

    const handleChange = (fieldName, value) => {
        setFormData((prev) => ({
            ...prev,
            [fieldName]: value,
        }));
        setErrors((prev) => ({
            ...prev,
            [fieldName]: null,
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        form.fields?.forEach((field) => {
            const value = formData[field.name];
            const isVisible = fieldVisibility[field.name] !== false;

            if (field.required && isVisible && !value) {
                newErrors[field.name] = `${field.label} is required`;
            }

            if (value && field.type === 'email' && !/\S+@\S+\.\S+/.test(value)) {
                newErrors[field.name] = 'Please enter a valid email';
            }

            if (value && field.type === 'number' && isNaN(value)) {
                newErrors[field.name] = 'Please enter a valid number';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            await api.post(`/forms/${id}/submissions`, formData);
            setSubmitted(true);
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                alert('Error submitting form');
            }
        }
    };

    const renderField = (field) => {
        const isVisible = fieldVisibility[field.name] !== false;
        const isDisabled = fieldDisabled[field.name] === true;
        const options = fieldOptions[field.name] || field.options || [];

        if (!isVisible) {
            return null;
        }

        const fieldError = errors[field.name];
        const value = formData[field.name] || '';

        return (
            <div key={field.id} className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.type === 'textarea' ? (
                    <textarea
                        value={value}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        className={`w-full border rounded-lg px-3 py-2 ${
                            fieldError ? 'border-red-500' : ''
                        }`}
                        placeholder={field.placeholder}
                        disabled={isDisabled}
                        required={field.required}
                    />
                ) : field.type === 'select' ? (
                    <select
                        value={value}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        className={`w-full border rounded-lg px-3 py-2 ${
                            fieldError ? 'border-red-500' : ''
                        }`}
                        disabled={isDisabled}
                        required={field.required}
                    >
                        <option value="">Select...</option>
                        {options.map((option, idx) => (
                            <option key={idx} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                ) : field.type === 'radio' ? (
                    <div className="space-y-2">
                        {options.map((option, idx) => (
                            <label key={idx} className="flex items-center">
                                <input
                                    type="radio"
                                    name={field.name}
                                    value={option}
                                    checked={value === option}
                                    onChange={(e) => handleChange(field.name, e.target.value)}
                                    className="mr-2"
                                    disabled={isDisabled}
                                    required={field.required}
                                />
                                {option}
                            </label>
                        ))}
                    </div>
                ) : field.type === 'checkbox' ? (
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={value === '1' || value === true}
                            onChange={(e) => handleChange(field.name, e.target.checked ? '1' : '0')}
                            className="mr-2"
                            disabled={isDisabled}
                        />
                        {field.help_text || 'Check this box'}
                    </label>
                ) : (
                    <input
                        type={field.type}
                        value={value}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        className={`w-full border rounded-lg px-3 py-2 ${
                            fieldError ? 'border-red-500' : ''
                        }`}
                        placeholder={field.placeholder}
                        disabled={isDisabled}
                        required={field.required}
                    />
                )}
                {fieldError && (
                    <p className="text-red-500 text-sm mt-1">{fieldError}</p>
                )}
                {field.help_text && !fieldError && (
                    <p className="text-gray-500 text-sm mt-1">{field.help_text}</p>
                )}
            </div>
        );
    };

    if (loading) {
        return <div className="max-w-2xl mx-auto px-4 py-8">Loading...</div>;
    }

    if (!form) {
        return <div className="max-w-2xl mx-auto px-4 py-8">Form not found</div>;
    }

    if (submitted) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-8">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <h2 className="text-2xl font-bold text-green-800 mb-2">Form Submitted Successfully!</h2>
                    <p className="text-green-600">Thank you for your submission.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-2">{form.name}</h1>
            {form.description && (
                <p className="text-gray-600 mb-6">{form.description}</p>
            )}
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
                {form.fields?.map((field) => renderField(field))}
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    Submit
                </button>
            </form>
        </div>
    );
}

export default FormViewer;
