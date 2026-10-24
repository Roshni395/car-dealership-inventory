import { useCallback, useEffect, useMemo, useState } from 'react';
import { CarFront, Search, LogIn, LogOut, Plus, RefreshCw, Trash2, Pencil, X, ShieldCheck, Gauge, Fuel, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from './api';

const money = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

function Field({ label, ...props }) {
  return <label className="field-label">{label}<input className="field-input" {...props} /></label>;
}

function AuthPanel({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', full_name: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      if (mode === 'register') {
        await api.register({ email: form.email, password: form.password, full_name: form.full_name });
      }
      const result = await api.login({ email: form.email, password: form.password });
      onAuthenticated(result);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return <div className="auth-shell">
    <div className="auth-art">
      <div className="brand"><span className="brand-icon"><CarFront size={23}/></span> MOTORI</div>
      <div className="art-copy"><span className="eyebrow">DRIVE YOUR NEXT CHAPTER</span><h1>Every great journey starts with the right car.</h1><p>A clear view of your inventory. A smarter way to find your next drive.</p></div>
      <div className="art-car"><CarFront size={160} strokeWidth={0.7}/></div>
      <div className="art-footer">INVENTORY, REIMAGINED <span>01 / 03</span></div>
    </div>
    <div className="auth-main">
      <div className="auth-top"><span>DEALERSHIP PORTAL</span><span className="status-dot">● SYSTEM ONLINE</span></div>
      <form className="auth-card" onSubmit={submit}>
        <div className="section-tag">WELCOME TO MOTORI</div>
        <h2>{mode === 'login' ? 'Welcome back.' : 'Create your account.'}</h2>
        <p className="muted">{mode === 'login' ? 'Sign in to explore the inventory.' : 'Register to start exploring available vehicles.'}</p>
        {mode === 'register' && <Field label="Full name" name="full_name" autoComplete="name" required minLength="2" value={form.full_name} onChange={change} placeholder="Your full name"/>}
        <Field label="Email address" name="email" type="email" autoComplete="email" required value={form.email} onChange={change} placeholder="you@example.com"/>
        <Field label="Password" name="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength="8" value={form.password} onChange={change} placeholder="At least 8 characters"/>
        {error && <div className="alert error"><AlertCircle size={16}/>{error}</div>}
        <button className="btn btn-primary full" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'} <span>→</span></button>
        <div className="switch-auth">{mode === 'login' ? 'New to Motori?' : 'Already have an account?'} <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>{mode === 'login' ? 'Create account' : 'Sign in'}</button></div>
      </form>
      <div className="auth-legal">SECURE ACCESS · JWT AUTHENTICATION</div>
    </div>
  </div>;
}

function VehicleForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || { make: '', model: '', category: 'Sedan', price: '', quantity: 1 });
  const [error, setError] = useState('');
  function update(e) { setForm({ ...form, [e.target.name]: e.target.value }); }
  async function submit(e) {
    e.preventDefault(); setError('');
    try {
      await onSave({ ...form, price: Number(form.price), quantity: Number(form.quantity) });
      onClose();
    } catch (err) { setError(err.message); }
  }
  return <div className="modal-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <form className="modal" onSubmit={submit}>
      <div className="modal-head"><div><span className="section-tag">INVENTORY CONTROL</span><h2>{initial ? 'Edit vehicle' : 'Add a vehicle'}</h2></div><button className="icon-button" type="button" onClick={onClose} aria-label="Close"><X/></button></div>
      <div className="form-grid">
        <Field label="Make" name="make" value={form.make} onChange={update} required placeholder="Toyota"/>
        <Field label="Model" name="model" value={form.model} onChange={update} required placeholder="Camry"/>
        <label className="field-label">Category<select className="field-input" name="category" value={form.category} onChange={update}><option>Sedan</option><option>SUV</option><option>Hatchback</option><option>Coupe</option><option>Electric</option><option>Luxury</option><option>Pickup</option></select></label>
        <Field label="Price (INR)" name="price" type="number" min="0" step="1" value={form.price} onChange={update} required/>
        <Field label="Quantity in stock" name="quantity" type="number" min="0" step="1" value={form.quantity} onChange={update} required/>
      </div>
      {error && <div className="alert error">{error}</div>}
      <div className="modal-actions"><button type="button" className="btn btn-quiet" onClick={onClose}>Cancel</button><button className="btn btn-primary">{initial ? 'Save changes' : 'Add vehicle'} <span>→</span></button></div>
    </form>
  </div>;
}

function VehicleCard({ vehicle, isAdmin, onPurchase, onEdit, onDelete, busy }) {
  const initials = `${vehicle.make[0] || ''}${vehicle.model[0] || ''}`.toUpperCase();
  return <article className="vehicle-card">
    <div className={`vehicle-visual visual-${vehicle.id % 4}`}>
      <div className="visual-top"><span className="vehicle-category">{vehicle.category}</span><span className={vehicle.quantity > 0 ? 'stock-pill' : 'stock-pill sold'}>{vehicle.quantity > 0 ? 'AVAILABLE' : 'SOLD OUT'}</span></div>
      <div className="vehicle-silhouette"><CarFront size={104} strokeWidth={0.8}/><span>{initials}</span></div>
      <div className="visual-number">VEHICLE / {String(vehicle.id).padStart(3, '0')}</div>
    </div>
    <div className="vehicle-info">
      <div className="vehicle-title"><div><div className="vehicle-make">{vehicle.make}</div><h3>{vehicle.model}</h3></div><div className="vehicle-price">{money(vehicle.price)}</div></div>
      <div className="vehicle-specs"><span><Gauge size={14}/> {vehicle.category}</span><span><Fuel size={14}/> Stock: {vehicle.quantity}</span></div>
      <div className="vehicle-actions">
        <button className="btn btn-primary purchase-btn" disabled={vehicle.quantity === 0 || busy} onClick={() => onPurchase(vehicle)}>{busy ? 'Processing…' : vehicle.quantity === 0 ? 'Out of stock' : 'Purchase vehicle'} <span>→</span></button>
        {isAdmin && <><button className="icon-button" title="Edit vehicle" aria-label={`Edit ${vehicle.make} ${vehicle.model}`} onClick={() => onEdit(vehicle)}><Pencil size={16}/></button><button className="icon-button danger-icon" title="Delete vehicle" aria-label={`Delete ${vehicle.make} ${vehicle.model}`} onClick={() => onDelete(vehicle)}><Trash2 size={16}/></button></>}
      </div>
    </div>
  </article>;
}

export default function App() {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('motori-session') || 'null'); } catch { return null; }
  });
  const [vehicles, setVehicles] = useState([]);
  const [filters, setFilters] = useState({ query: '', category: '', min_price: '', max_price: '' });
  const [modal, setModal] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(false);
  const isAdmin = session?.user?.role === 'admin';

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const hasFilters = filters.query.trim() || filters.category || filters.min_price !== '' || filters.max_price !== '';
      let result;
      if (hasFilters) {
        const params = new URLSearchParams();
        if (filters.query.trim()) { params.set('make', filters.query.trim()); params.set('model', filters.query.trim()); }
        if (filters.category) params.set('category', filters.category);
        if (filters.min_price !== '') params.set('min_price', filters.min_price);
        if (filters.max_price !== '') params.set('max_price', filters.max_price);
        // Search API supports each field independently. Merge make/model matches for a single search box.
        const [byMake, byModel] = filters.query.trim()
          ? await Promise.all([
              api.searchVehicles(new URLSearchParams([...params.entries()].filter(([k]) => k !== 'model'))),
              api.searchVehicles(new URLSearchParams([...params.entries()].filter(([k]) => k !== 'make'))),
            ])
          : [await api.searchVehicles(params), []];
        result = [...new Map([...byMake, ...byModel].map((v) => [v.id, v])).values()];
      } else result = await api.listVehicles();
      setVehicles(result);
    } catch (err) { setNotice({ type: 'error', text: err.message }); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { if (session) refresh(); }, [session, refresh]);
  const stats = useMemo(() => ({
    total: vehicles.length,
    units: vehicles.reduce((sum, v) => sum + v.quantity, 0),
    makes: new Set(vehicles.map((v) => v.make)).size,
  }), [vehicles]);

  function authenticate(result) {
    const next = { access_token: result.access_token, user: result.user };
    sessionStorage.setItem('motori-session', JSON.stringify(next));
    setSession(next);
  }
  function logout() { sessionStorage.removeItem('motori-session'); setSession(null); setVehicles([]); }
  async function purchase(vehicle) {
    setBusyId(vehicle.id); setNotice(null);
    try {
      const result = await api.purchase(vehicle.id, session.access_token);
      setNotice({ type: 'success', text: `${vehicle.make} ${vehicle.model} purchased successfully.` });
      await refresh();
    } catch (err) { setNotice({ type: 'error', text: err.message }); }
    finally { setBusyId(null); }
  }
  async function saveVehicle(payload) {
    if (modal?.vehicle) await api.updateVehicle(modal.vehicle.id, payload, session.access_token);
    else await api.createVehicle(payload, session.access_token);
    setNotice({ type: 'success', text: modal?.vehicle ? 'Vehicle updated.' : 'Vehicle added to inventory.' });
    await refresh();
  }
  async function deleteVehicle(vehicle) {
    if (!window.confirm(`Delete ${vehicle.make} ${vehicle.model}? This cannot be undone.`)) return;
    try {
      await api.deleteVehicle(vehicle.id, session.access_token);
      setNotice({ type: 'success', text: 'Vehicle deleted.' });
      await refresh();
    } catch (err) { setNotice({ type: 'error', text: err.message }); }
  }
  async function restock(vehicle) {
    const raw = window.prompt(`How many units of ${vehicle.make} ${vehicle.model} should be added?`, '1');
    if (raw === null) return;
    const quantity = Number(raw);
    if (!Number.isInteger(quantity) || quantity <= 0) { setNotice({ type: 'error', text: 'Enter a whole number greater than zero.' }); return; }
    try {
      await api.restock(vehicle.id, quantity, session.access_token);
      setNotice({ type: 'success', text: 'Inventory restocked.' });
      await refresh();
    } catch (err) { setNotice({ type: 'error', text: err.message }); }
  }

  if (!session) return <AuthPanel onAuthenticated={authenticate}/>;

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-icon"><CarFront size={23}/></span> MOTORI</div>
      <div className="side-caption">WORKSPACE</div>
      <div className="nav-item active"><span className="nav-mark">▦</span> Inventory <span className="nav-count">{vehicles.length}</span></div>
      <div className="side-caption side-caption-bottom">ACCOUNT</div>
      <div className="user-card"><div className="avatar">{session.user.full_name.split(' ').map((x) => x[0]).join('').slice(0,2).toUpperCase()}</div><div className="user-meta"><strong>{session.user.full_name}</strong><span>{isAdmin ? 'Administrator' : 'Customer'}</span></div><button className="icon-button logout" onClick={logout} aria-label="Sign out" title="Sign out"><LogOut size={17}/></button></div>
      <div className="sidebar-foot"><ShieldCheck size={15}/> Secure inventory access</div>
    </aside>
    <main className="main-content">
      <header className="topbar"><div><span className="breadcrumb">WORKSPACE / INVENTORY</span><h1>Vehicle inventory</h1></div><div className="top-actions"><span className="live-pill"><i/> LIVE INVENTORY</span>{isAdmin && <button className="btn btn-primary" onClick={() => setModal({ vehicle: null })}><Plus size={17}/> Add vehicle</button>}</div></header>
      <section className="welcome-row"><div><h2>Find your next drive.</h2><p>Explore the collection. Every detail, all in one place.</p></div><div className="date-label">MOTORI <span>·</span> INVENTORY MANAGEMENT</div></section>
      <section className="stats-grid">
        <div className="stat-card"><span className="stat-label">VEHICLE MODELS</span><div className="stat-value">{stats.total}<span className="stat-icon"><CarFront size={18}/></span></div><span className="stat-foot">Models in current view</span></div>
        <div className="stat-card"><span className="stat-label">TOTAL UNITS</span><div className="stat-value">{stats.units}<span className="stat-icon"><Gauge size={18}/></span></div><span className="stat-foot">Available inventory units</span></div>
        <div className="stat-card"><span className="stat-label">MANUFACTURERS</span><div className="stat-value">{stats.makes}<span className="stat-icon"><ShieldCheck size={18}/></span></div><span className="stat-foot">Distinct vehicle makes</span></div>
      </section>
      {notice && <div className={`alert ${notice.type}`} role="status">{notice.type === 'success' ? <CheckCircle2 size={17}/> : <AlertCircle size={17}/>}<span>{notice.text}</span><button onClick={() => setNotice(null)} aria-label="Dismiss notification"><X size={15}/></button></div>}
      <section className="inventory-section">
        <div className="inventory-heading"><div><h2>All vehicles <span>{vehicles.length}</span></h2><p>Browse, compare and manage the current collection.</p></div><button className="btn btn-quiet" onClick={refresh} disabled={loading}><RefreshCw size={15} className={loading ? 'spin' : ''}/> Refresh</button></div>
        <div className="filters">
          <label className="search-box"><Search size={17}/><input aria-label="Search vehicles" placeholder="Search make or model…" value={filters.query} onChange={(e) => setFilters({ ...filters, query: e.target.value })}/>{filters.query && <button onClick={() => setFilters({ ...filters, query: '' })} aria-label="Clear search"><X size={15}/></button>}</label>
          <select aria-label="Filter category" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}><option value="">All categories</option><option>Sedan</option><option>SUV</option><option>Hatchback</option><option>Coupe</option><option>Electric</option><option>Luxury</option><option>Pickup</option></select>
          <input aria-label="Minimum price" type="number" min="0" placeholder="Min price" value={filters.min_price} onChange={(e) => setFilters({ ...filters, min_price: e.target.value })}/>
          <input aria-label="Maximum price" type="number" min="0" placeholder="Max price" value={filters.max_price} onChange={(e) => setFilters({ ...filters, max_price: e.target.value })}/>
          <button className="btn btn-quiet clear-btn" onClick={() => setFilters({ query: '', category: '', min_price: '', max_price: '' })}>Clear</button>
        </div>
        {loading && vehicles.length === 0 ? <div className="empty-state">Loading inventory…</div> : vehicles.length === 0 ? <div className="empty-state"><CarFront size={38}/><h3>No vehicles found</h3><p>Try changing your search or filters.</p>{isAdmin && <button className="btn btn-primary" onClick={() => setModal({ vehicle: null })}><Plus size={16}/> Add your first vehicle</button>}</div> :
          <div className="vehicle-grid">{vehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} isAdmin={isAdmin} busy={busyId === vehicle.id} onPurchase={purchase} onEdit={(v) => setModal({ vehicle: v })} onDelete={deleteVehicle}/>)}</div>}
      </section>
      <footer className="main-footer"><span>© 2026 MOTORI INVENTORY SYSTEM</span><span>BUILT FOR BETTER DRIVES <span className="footer-dot">●</span></span></footer>
    </main>
    {isAdmin && <div className="admin-quick-actions" aria-label="Admin inventory tools">{vehicles.filter((v) => v.quantity === 0).slice(0, 2).map((v) => <button key={v.id} onClick={() => restock(v)}>Restock {v.make} {v.model}</button>)}</div>}
    {modal && isAdmin && <VehicleForm initial={modal.vehicle ? { ...modal.vehicle } : null} onSave={saveVehicle} onClose={() => setModal(null)}/>}
  </div>;
}
