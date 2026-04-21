import React, { useEffect, useState } from 'react';
import { adminService, platformService } from '../../api';

export default function AdminCatalog() {
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [message, setMessage] = useState('');

  const [category, setCategory] = useState({ name: '', description: '' });
  const [service, setService] = useState({
    title: '',
    description: '',
    price: 0,
    durationMinutes: 60,
    categoryId: '',
  });

  const load = async () => {
    const catRes = await platformService.getCategories();
    setCategories(catRes.data || []);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const createCategory = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await adminService.createCategory(category);
      setCategory({ name: '', description: '' });
      await load();
      setMessage('Category created successfully');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create category');
    }
  };

  const createService = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await adminService.createService({
        title: service.title,
        description: service.description,
        price: service.price,
        durationMinutes: service.durationMinutes,
        category: { id: Number(service.categoryId) },
      });
      setService({ title: '', description: '', price: 0, durationMinutes: 60, categoryId: '' });
      setMessage('Service created successfully');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create service');
    }
  };

  return (
    <div className="page">
      <header className="pageHeader">
        <div className="pageHeaderInner">
          <div className="pagePill">
            <span className="pagePillDot" />
            Catalog
          </div>
          <h1 className="pageTitle">Categories & services</h1>
          <p className="pageSubtitle">Add services to the catalog. Providers can then offer them.</p>
        </div>
      </header>

      {message && (
        <div className="alert alert--info">{message}</div>
      )}

      <div className="grid2">
        <section className="panel">
          <h2 className="panelTitle">Create category</h2>
          <p className="panelDesc">Used to group services.</p>

          <form onSubmit={createCategory} className="authForm" style={{ marginTop: 14 }}>
            <input
              className="authInput"
              placeholder="Category name"
              value={category.name}
              onChange={(e) => setCategory({ ...category, name: e.target.value })}
              required
            />
            <textarea
              className="authInput"
              placeholder="Description (optional)"
              rows={3}
              value={category.description}
              onChange={(e) => setCategory({ ...category, description: e.target.value })}
            />
            <div className="authActions">
              <button className="btn-primary btnSmall" type="submit">Create category</button>
            </div>
          </form>

          <div style={{ marginTop: 16 }}>
            <div className="panelDesc" style={{ margin: 0, fontWeight: 900, color: '#334155' }}>Existing categories</div>
            <div className="pillRow" style={{ marginTop: 10 }}>
              {categories.map((c) => (
                <span key={c.id} className="badge badge--info">
                  {c.name}
                </span>
              ))}
              {categories.length === 0 && <div className="panelDesc">No categories yet.</div>}
            </div>
          </div>
        </section>

        <section className="panel">
          <h2 className="panelTitle">Create service</h2>
          <p className="panelDesc">Choose a category and define the service.</p>

          <form onSubmit={createService} className="authForm" style={{ marginTop: 14 }}>
            <input
              className="authInput"
              placeholder="Title"
              value={service.title}
              onChange={(e) => setService({ ...service, title: e.target.value })}
              required
            />
            <textarea
              className="authInput"
              placeholder="Description (optional)"
              rows={3}
              value={service.description}
              onChange={(e) => setService({ ...service, description: e.target.value })}
            />
            <div className="authRow">
              <select
                className="authInput authSelect"
                value={service.categoryId}
                onChange={(e) => setService({ ...service, categoryId: e.target.value })}
                required
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <input
                type="number"
                className="authInput"
                placeholder="Price"
                value={service.price}
                onChange={(e) => setService({ ...service, price: Number(e.target.value) })}
                required
                min="0"
              />
            </div>
            <input
              type="number"
              className="authInput"
              placeholder="Duration (minutes)"
              value={service.durationMinutes}
              onChange={(e) => setService({ ...service, durationMinutes: Number(e.target.value) })}
              required
              min="1"
            />
            <div className="authActions">
              <button className="btn-primary btnSmall" type="submit">Create service</button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

