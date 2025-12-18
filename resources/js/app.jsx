import './bootstrap';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, Route, Routes, Navigate } from 'react-router-dom';

import AdminDesigner from './pages/AdminDesigner';
import UserForm from './pages/UserForm';

function Home() {
    return (
        <div className="mx-auto max-w-5xl p-6">
            <h1 className="text-2xl font-semibold">Dynamic Form Builder</h1>
            <p className="mt-2 text-slate-600">
                Admins design a form (fields + rules). Users fill the latest published form with rule-based validation.
            </p>

            <div className="mt-6 flex gap-3">
                <Link
                    to="/admin/designer"
                    className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
                >
                    Open Admin Designer
                </Link>
                <Link to="/form" className="rounded border border-slate-300 px-4 py-2 hover:bg-white">
                    Open User Form
                </Link>
            </div>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/admin/designer" element={<AdminDesigner />} />
                <Route path="/form" element={<UserForm />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

const el = document.getElementById('app');
if (el) {
    createRoot(el).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    );
}

