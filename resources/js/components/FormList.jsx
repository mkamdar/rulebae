import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function FormList() {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchForms();
    }, []);

    const fetchForms = async () => {
        try {
            const response = await api.get('/forms');
            setForms(response.data);
        } catch (error) {
            console.error('Error fetching forms:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Forms</h1>
                <Link
                    to="/designer"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    Create New Form
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {forms.map((form) => (
                    <div key={form.id} className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-2">{form.name}</h2>
                        <p className="text-gray-600 mb-4">{form.description || 'No description'}</p>
                        <div className="flex space-x-2">
                            <Link
                                to={`/designer/${form.id}`}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                                Edit
                            </Link>
                            <Link
                                to={`/form/${form.id}`}
                                className="text-green-600 hover:text-green-800 text-sm"
                            >
                                View
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default FormList;
