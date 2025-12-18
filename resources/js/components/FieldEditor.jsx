import React, { useState, useEffect } from 'react';

function FieldEditor({ field, fields, onSave, onClose }) {
    const [formData, setFormData] = useState({
        label: '',
        name: '',
        type: 'text',
        options: [],
        validation_rules: [],
        required: false,
        placeholder: '',
        help_text: '',
    });

    useEffect(() => {
        if (field) {
            setFormData({
                label: field.label || '',
                name: field.name || '',
                type: field.type || 'text',
                options: field.options || [],
                validation_rules: field.validation_rules || [],
                required: field.required || false,
                placeholder: field.placeholder || '',
                help_text: field.help_text || '',
            });
        }
    }, [field]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleOptionsChange = (e) => {
        const options = e.target.value.split('\n').filter((opt) => opt.trim());
        setFormData((prev) => ({
            ...prev,
            options: options,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">
                    {field ? 'Edit Field' : 'Add Field'}
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Label
                            </label>
                            <input
                                type="text"
                                name="label"
                                value={formData.label}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Field Name (for form submission)
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2"
                                required
                                pattern="[a-z0-9_]+"
                                title="Only lowercase letters, numbers, and underscores"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Field Type
                            </label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2"
                            >
                                <option value="text">Text</option>
                                <option value="email">Email</option>
                                <option value="number">Number</option>
                                <option value="textarea">Textarea</option>
                                <option value="select">Select/Dropdown</option>
                                <option value="radio">Radio</option>
                                <option value="checkbox">Checkbox</option>
                                <option value="date">Date</option>
                            </select>
                        </div>
                        {(formData.type === 'select' || formData.type === 'radio') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Options (one per line)
                                </label>
                                <textarea
                                    value={formData.options.join('\n')}
                                    onChange={handleOptionsChange}
                                    className="w-full border rounded-lg px-3 py-2"
                                    rows="4"
                                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                                />
                            </div>
                        )}
                        <div>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="required"
                                    checked={formData.required}
                                    onChange={handleChange}
                                    className="mr-2"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    Required Field
                                </span>
                            </label>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Placeholder
                            </label>
                            <input
                                type="text"
                                name="placeholder"
                                value={formData.placeholder}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Help Text
                            </label>
                            <input
                                type="text"
                                name="help_text"
                                value={formData.help_text}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default FieldEditor;
