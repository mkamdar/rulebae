import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '../api';
import FieldEditor from './FieldEditor';
import RuleBuilder from './RuleBuilder';

function SortableField({ field, onEdit, onDelete }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: field.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white border rounded-lg p-4 mb-2 cursor-move"
        >
            <div className="flex justify-between items-center">
                <div className="flex-1">
                    <div className="flex items-center space-x-2">
                        <div {...attributes} {...listeners} className="cursor-grab">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                            </svg>
                        </div>
                        <div>
                            <span className="font-semibold">{field.label}</span>
                            <span className="text-gray-500 ml-2">({field.type})</span>
                        </div>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => onEdit(field)}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(field.id)}
                        className="text-red-600 hover:text-red-800"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

function FormDesigner() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState(null);
    const [fields, setFields] = useState([]);
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFieldEditor, setShowFieldEditor] = useState(false);
    const [showRuleBuilder, setShowRuleBuilder] = useState(false);
    const [editingField, setEditingField] = useState(null);
    const [editingRule, setEditingRule] = useState(null);
    const [formName, setFormName] = useState('');
    const [formDescription, setFormDescription] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (id) {
            fetchForm();
        } else {
            setLoading(false);
        }
    }, [id]);

    const fetchForm = async () => {
        try {
            const response = await api.get(`/forms/${id}`);
            const formData = response.data;
            setForm(formData);
            setFormName(formData.name);
            setFormDescription(formData.description || '');
            setFields(formData.fields || []);
            setRules(formData.rules || []);
        } catch (error) {
            console.error('Error fetching form:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = fields.findIndex((field) => field.id === active.id);
            const newIndex = fields.findIndex((field) => field.id === over.id);

            const newFields = arrayMove(fields, oldIndex, newIndex);
            setFields(newFields);

            // Update order on server
            if (id) {
                try {
                    await api.post(`/forms/${id}/fields/reorder`, {
                        fields: newFields.map((field, index) => ({
                            id: field.id,
                            order: index,
                        })),
                    });
                } catch (error) {
                    console.error('Error reordering fields:', error);
                }
            }
        }
    };

    const handleSaveForm = async () => {
        try {
            if (id) {
                await api.put(`/forms/${id}`, {
                    name: formName,
                    description: formDescription,
                });
            } else {
                const response = await api.post('/forms', {
                    name: formName,
                    description: formDescription,
                });
                navigate(`/designer/${response.data.id}`);
                return;
            }
            alert('Form saved successfully!');
        } catch (error) {
            console.error('Error saving form:', error);
            alert('Error saving form');
        }
    };

    const handleSaveField = async (fieldData) => {
        try {
            if (editingField) {
                await api.put(`/forms/${id}/fields/${editingField.id}`, {
                    ...fieldData,
                    order: editingField.order,
                });
            } else {
                const response = await api.post(`/forms/${id}/fields`, {
                    ...fieldData,
                    order: fields.length,
                });
                setFields([...fields, response.data]);
            }
            setShowFieldEditor(false);
            setEditingField(null);
            fetchForm();
        } catch (error) {
            console.error('Error saving field:', error);
            alert('Error saving field');
        }
    };

    const handleDeleteField = async (fieldId) => {
        if (!confirm('Are you sure you want to delete this field?')) return;

        try {
            await api.delete(`/forms/${id}/fields/${fieldId}`);
            setFields(fields.filter((f) => f.id !== fieldId));
        } catch (error) {
            console.error('Error deleting field:', error);
            alert('Error deleting field');
        }
    };

    const handleSaveRule = async (ruleData) => {
        try {
            if (editingRule) {
                await api.put(`/forms/${id}/rules/${editingRule.id}`, ruleData);
            } else {
                await api.post(`/forms/${id}/rules`, ruleData);
            }
            setShowRuleBuilder(false);
            setEditingRule(null);
            fetchForm();
        } catch (error) {
            console.error('Error saving rule:', error);
            alert('Error saving rule');
        }
    };

    const handleDeleteRule = async (ruleId) => {
        if (!confirm('Are you sure you want to delete this rule?')) return;

        try {
            await api.delete(`/forms/${id}/rules/${ruleId}`);
            setRules(rules.filter((r) => r.id !== ruleId));
        } catch (error) {
            console.error('Error deleting rule:', error);
            alert('Error deleting rule');
        }
    };

    if (loading) {
        return <div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>;
    }

    if (!id) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Create New Form</h1>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Form Name
                        </label>
                        <input
                            type="text"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2"
                            placeholder="Enter form name"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formDescription}
                            onChange={(e) => setFormDescription(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2"
                            rows="3"
                            placeholder="Enter form description"
                        />
                    </div>
                    <button
                        onClick={handleSaveForm}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        disabled={!formName}
                    >
                        Create Form
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-4">Form Designer</h1>
                <div className="bg-white rounded-lg shadow p-4 mb-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Form Name
                            </label>
                            <input
                                type="text"
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                className="w-full border rounded-lg px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <input
                                type="text"
                                value={formDescription}
                                onChange={(e) => setFormDescription(e.target.value)}
                                className="w-full border rounded-lg px-3 py-2"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleSaveForm}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Save Form
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold">Fields</h2>
                        <button
                            onClick={() => {
                                setEditingField(null);
                                setShowFieldEditor(true);
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                        >
                            Add Field
                        </button>
                    </div>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={fields.map((f) => f.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-2">
                                {fields.map((field) => (
                                    <SortableField
                                        key={field.id}
                                        field={field}
                                        onEdit={(field) => {
                                            setEditingField(field);
                                            setShowFieldEditor(true);
                                        }}
                                        onDelete={handleDeleteField}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold">Rules</h2>
                        <button
                            onClick={() => {
                                setEditingRule(null);
                                setShowRuleBuilder(true);
                            }}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                        >
                            Add Rule
                        </button>
                    </div>
                    <div className="space-y-2">
                        {rules.map((rule) => (
                            <div key={rule.id} className="bg-white border rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold">
                                            If {rule.condition_field?.label} {rule.condition_operator} "{rule.condition_value}"
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Then {rule.action_type} {rule.target_field?.label}
                                        </p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => {
                                                setEditingRule(rule);
                                                setShowRuleBuilder(true);
                                            }}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteRule(rule.id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showFieldEditor && (
                <FieldEditor
                    field={editingField}
                    fields={fields}
                    onSave={handleSaveField}
                    onClose={() => {
                        setShowFieldEditor(false);
                        setEditingField(null);
                    }}
                />
            )}

            {showRuleBuilder && (
                <RuleBuilder
                    rule={editingRule}
                    fields={fields}
                    onSave={handleSaveRule}
                    onClose={() => {
                        setShowRuleBuilder(false);
                        setEditingRule(null);
                    }}
                />
            )}
        </div>
    );
}

export default FormDesigner;
