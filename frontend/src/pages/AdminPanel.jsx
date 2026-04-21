import React, { useEffect, useState } from 'react';
import { adminService } from '../api';

export default function AdminPanel() {
  const [providers, setProviders] = useState([]);
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState({ name: '', description: '' });
  const [service, setService] = useState({ title: '', description: '', price: 0, durationMinutes: 60, categoryId: '' });

  const load = async () => {
    const res = await adminService.providers();
    setProviders(res.data);
  };

  useEffect(() => {
    load().catch(() => setMessage('Failed to load admin data'));
  }, []);

  const toggleVerify = async (userId, current) => {
    await adminService.verifyProvider(userId, !current);
    await load();
  };

  const createCategory = async (e) => {
    e.preventDefault();
    try {
      await adminService.createCategory(category);
      setMessage('Category created');
      setCategory({ name: '', description: '' });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create category');
    }
  };

  const createService = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: service.title,
        description: service.description,
        price: service.price,
        durationMinutes: service.durationMinutes,
        category: { id: Number(service.categoryId) },
      };
      await adminService.createService(payload);
      setMessage('Service created');
      setService({ title: '', description: '', price: 0, durationMinutes: 60, categoryId: '' });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create service');
    }
  };

  return (
    <div className="space-y-8">
      <header className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white/70 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-indigo-50 to-transparent" />
        <div className="relative p-6 sm:p-7">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 border border-slate-100 w-fit">
            <span className="h-2.5 w-2.5 rounded-full bg-primary-600" />
            Admin Panel
          </div>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">Manage providers and catalog</h1>
          <p className="text-slate-600 mt-2">Verify providers and update your service categories.</p>
        </div>
      </header>

      {message && <div className="p-4 bg-blue-50 text-blue-700 rounded-lg">{message}</div>}

      <section className="card p-6">
        <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-4">Verify Providers</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Provider</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Verified</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {providers.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 text-sm text-slate-800">{p.user?.name} ({p.user?.email})</td>
                  <td className="px-4 py-3 text-sm">{p.verifiedStatus ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="btn-secondary py-1.5 text-sm" onClick={() => toggleVerify(p.user.id, p.verifiedStatus)}>
                      {p.verifiedStatus ? 'Unverify' : 'Verify'}
                    </button>
                  </td>
                </tr>
              ))}
              {providers.length === 0 && (
                <tr><td colSpan="3" className="px-4 py-6 text-center text-sm text-slate-500">No providers</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="card p-6">
          <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-4">Create Category</h2>
          <form onSubmit={createCategory} className="space-y-3">
            <input className="input-field" placeholder="Name" value={category.name} onChange={(e) => setCategory({ ...category, name: e.target.value })} />
            <textarea className="input-field" placeholder="Description" value={category.description} onChange={(e) => setCategory({ ...category, description: e.target.value })} />
            <button className="btn-primary">Create</button>
          </form>
        </section>

        <section className="card p-6">
          <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-4">Create Service</h2>
          <form onSubmit={createService} className="space-y-3">
            <input className="input-field" placeholder="Title" value={service.title} onChange={(e) => setService({ ...service, title: e.target.value })} />
            <textarea className="input-field" placeholder="Description" value={service.description} onChange={(e) => setService({ ...service, description: e.target.value })} />
            <div className="grid grid-cols-3 gap-2">
              <input type="number" className="input-field" placeholder="Category ID" value={service.categoryId} onChange={(e) => setService({ ...service, categoryId: e.target.value })} />
              <input type="number" className="input-field" placeholder="Price" value={service.price} onChange={(e) => setService({ ...service, price: Number(e.target.value) })} />
              <input type="number" className="input-field" placeholder="Duration (min)" value={service.durationMinutes} onChange={(e) => setService({ ...service, durationMinutes: Number(e.target.value) })} />
            </div>
            <button className="btn-primary">Create</button>
          </form>
          <p className="text-xs text-slate-500 mt-2">Tip: create a category first, then use its ID here.</p>
        </section>
      </div>
    </div>
  );
}

