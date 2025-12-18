import React, { useState, useEffect } from 'react';

function RuleBuilder({ rule, fields, onSave, onClose }) {
    const [formData, setFormData] = useState({
        condition_field_id: '',
        condition_operator: 'equals',
        condition_value: '',
        action_type: 'show',
        target_field_id: '',
        action_value: null,
    });

    useEffect(() => {
        if (rule) {
            setFormData({
                condition_field_id: rule.condition_field_id || '',
                condition_operator: rule.condition_operator || 'equals',
                condition_value: rule.condition_value || '',
                action_type: rule.action_type || 'show',
                target_field_id: rule.target_field_id || '',
                action_value: rule.action_value || null,
            });
        }
    }, [rule]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleActionValueChange = (e) => {
        if (formData.action_type === 'set_options') {
            const options = e.target.value.split('\n').filter((opt) => opt.trim());
            setFormData((prev) => ({
                ...prev,
                action_value: { options },
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const conditionField = fields.find((f) => f.id === parseInt(formData.condition_field_id));
    const targetField = fields.find((f) => f.id === parseInt(formData.target_field_id));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">
                    {rule ? 'Edit Rule' : 'Add Rule'}
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Condition Field
                            </label>
                            <select
                                name="condition_field_id"
                                value={formData.condition_field_id}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2"
                                required
                            >
                                <option value="">Select a field</option>
                                {fields.map((field) => (
                                    <option key={field.id} value={field.id}>
                                        {field.label} ({field.type})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Condition Operator
                            </label>
                            <select
                                name="condition_operator"
                                value={formData.condition_operator}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2"
                                required
                            >
                                <option value="equals">Equals</option>
                                <option value="not_equals">Not Equals</option>
                                <option value="contains">Contains</option>
                                <option value="not_contains">Not Contains</option>
                                <option value="greater_than">Greater Than</option>
                                <option value="less_than">Less Than</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Condition Value
                            </label>
                            {conditionField && (conditionField.type === 'select' || conditionField.type === 'radio') ? (
                                <select
                                    name="condition_value"
                                    value={formData.condition_value}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-3 py-2"
                                    required
                                >
                                    <option value="">Select a value</option>
                                    {conditionField.options?.map((opt, idx) => (
                                        <option key={idx} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    name="condition_value"
                                    value={formData.condition_value}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-3 py-2"
                                    required
                                />
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Target Field
                            </label>
                            <select
                                name="target_field_id"
                                value={formData.target_field_id}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2"
                                required
                            >
                                <option value="">Select a field</option>
                                {fields.map((field) => (
                                    <option key={field.id} value={field.id}>
                                        {field.label} ({field.type})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Action Type
                            </label>
                            <select
                                name="action_type"
                                value={formData.action_type}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2"
                                required
                            >
                                <option value="show">Show</option>
                                <option value="hide">Hide</option>
                                <option value="enable">Enable</option>
                                <option value="disable">Disable</option>
                                <option value="set_options">Set Options</option>
                            </select>
                        </div>
                        {formData.action_type === 'set_options' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Allowed Options (one per line)
                                </label>
                                <textarea
                                    value={formData.action_value?.options?.join('\n') || ''}
                                    onChange={handleActionValueChange}
                                    className="w-full border rounded-lg px-3 py-2"
                                    rows="4"
                                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                                />
                            </div>
                        )}
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
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default RuleBuilder;
