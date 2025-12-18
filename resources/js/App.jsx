import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import FormDesigner from './components/FormDesigner';
import FormViewer from './components/FormViewer';
import FormList from './components/FormList';

function App() {
    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <Link to="/" className="flex items-center px-4 text-xl font-bold text-gray-900">
                                Dynamic Form Builder
                            </Link>
                        </div>
                        <div className="flex space-x-4">
                            <Link to="/" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                                Forms
                            </Link>
                            <Link to="/designer" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                                Designer
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
            <Routes>
                <Route path="/" element={<FormList />} />
                <Route path="/designer" element={<FormDesigner />} />
                <Route path="/designer/:id" element={<FormDesigner />} />
                <Route path="/form/:id" element={<FormViewer />} />
            </Routes>
        </div>
    );
}

export default App;
