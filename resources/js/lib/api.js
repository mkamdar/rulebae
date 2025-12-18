import axios from 'axios';

export async function getAdminCurrentForm() {
    const { data } = await axios.get('/api/admin/forms/current');
    return data;
}

export async function saveAdminCurrentForm({ name, definition }) {
    const { data } = await axios.put('/api/admin/forms/current', { name, definition });
    return data;
}

export async function getCurrentForm() {
    const { data } = await axios.get('/api/forms/current');
    return data;
}

export async function submitCurrentForm(payload) {
    const { data } = await axios.post('/api/forms/current/submissions', { payload });
    return data;
}

