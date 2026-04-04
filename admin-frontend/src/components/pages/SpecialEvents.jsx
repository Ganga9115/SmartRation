// admin-frontend/src/components/pages/SpecialEvents.jsx
import { useEffect, useState } from "react";
import {
  Plus, Edit, Trash2, Users, Calendar, X, Save,
  RefreshCw, Eye, Gift, Clock, MapPin, AlertCircle
} from "lucide-react";
import { adminShopsAPI, adminEventsAPI } from "../../utils/api";

const EMPTY_FORM = {
  name: '', description: '', shop_id: '',
  start_date: '', end_date: '',
  open_time: '09:00', close_time: '17:00',
  tokens_per_day: 50, slot_duration_mins: 30,
};

export function SpecialEvents() {
  const [events, setEvents]             = useState([]);
  const [shops, setShops]               = useState([]);
  const [shopsLoading, setShopsLoading] = useState(true);
  const [loading, setLoading]           = useState(true);
  const [showModal, setShowModal]       = useState(false);
  const [editEvent, setEditEvent]       = useState(null);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [saving, setSaving]             = useState(false);
  const [formError, setFormError]       = useState('');
  const [viewEvent, setViewEvent]       = useState(null);
  const [tokens, setTokens]             = useState([]);
  const [tokensLoading, setTokensLoading] = useState(false);
  const [filterDate, setFilterDate]     = useState('');

  // ── Fetch shops once on mount ─────────────────────────
  useEffect(() => {
    adminShopsAPI.getAll()
      .then(r => setShops(r.data.shops || []))
      .catch(err => console.error('Failed to load shops:', err.message))
      .finally(() => setShopsLoading(false));
  }, []);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await adminEventsAPI.getAll();
      setEvents(res.data.events || []);
    } catch (err) {
      console.error('fetchAll events error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Open create modal — wait for shops if still loading ─
  const openCreate = () => {
    setEditEvent(null);
    setForm({
      ...EMPTY_FORM,
      // Pre-select first shop if already loaded
      shop_id: shops.length > 0 ? shops[0].id : '',
    });
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (e) => {
    setEditEvent(e);
    setForm({
      name:               e.name,
      description:        e.description || '',
      shop_id:            e.shop_id,
      start_date:         e.start_date,
      end_date:           e.end_date,
      open_time:          e.open_time?.slice(0, 5) || '09:00',
      close_time:         e.close_time?.slice(0, 5) || '17:00',
      tokens_per_day:     e.tokens_per_day,
      slot_duration_mins: e.slot_duration_mins,
    });
    setFormError('');
    setShowModal(true);
  };

  const openTokenView = async (event) => {
    setViewEvent(event);
    setFilterDate('');
    setTokensLoading(true);
    try {
      const res = await adminEventsAPI.getTokens(event.id, {});
      setTokens(res.data.tokens || []);
    } catch (err) {
      console.error('getTokens error:', err.message);
    } finally {
      setTokensLoading(false);
    }
  };

  const handleSave = async () => {
    setFormError('');
    if (!form.name?.trim())   return setFormError('Event name is required');
    if (!form.shop_id)        return setFormError('Please select a shop');
    if (!form.start_date)     return setFormError('Start date is required');
    if (!form.end_date)       return setFormError('End date is required');
    if (form.end_date < form.start_date)
      return setFormError('End date must be after start date');

    setSaving(true);
    try {
      const payload = {
        ...form,
        shop_id:            parseInt(form.shop_id),
        tokens_per_day:     parseInt(form.tokens_per_day) || 50,
        slot_duration_mins: parseInt(form.slot_duration_mins) || 30,
      };
      if (editEvent) {
        await adminEventsAPI.update(editEvent.id, payload);
      } else {
        await adminEventsAPI.create(payload);
      }
      setShowModal(false);
      await fetchAll();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? All tokens will also be deleted.`)) return;
    try {
      await adminEventsAPI.delete(id);
      setEvents(ev => ev.filter(e => e.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleToggleActive = async (event) => {
    try {
      await adminEventsAPI.update(event.id, { is_active: !event.is_active });
      setEvents(ev => ev.map(e => e.id === event.id ? { ...e, is_active: !e.is_active } : e));
    } catch {
      alert('Failed to update event status');
    }
  };

  const handleMarkUsed = async (token) => {
    try {
      await adminEventsAPI.markUsed(viewEvent.id, token.id);
      setTokens(ts => ts.map(t => t.id === token.id ? { ...t, status: 'used' } : t));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark as used');
    }
  };

  const getEventStatus = (event) => {
    const today = new Date().toISOString().split('T')[0];
    if (!event.is_active)       return { label: 'Inactive', color: 'bg-gray-100 text-gray-500' };
    if (today < event.start_date) return { label: 'Upcoming', color: 'bg-blue-50 text-blue-700' };
    if (today > event.end_date)   return { label: 'Ended',    color: 'bg-gray-100 text-gray-500' };
    return { label: 'Active', color: 'bg-green-50 text-green-700' };
  };

  const getDayCount = (event) => {
    const start = new Date(event.start_date);
    const end   = new Date(event.end_date);
    let count = 0;
    const cur = new Date(start);
    while (cur <= end) {
      if (cur.getDay() !== 0) count++;
      cur.setDate(cur.getDate() + 1);
    }
    return count || 1;
  };

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="space-y-6">

      {/* ── Header ────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Gift className="w-6 h-6 text-[#5E4075]" />
            Special Events
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage Pongal, festivals and special distribution events
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchAll}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openCreate}
            disabled={shopsLoading}
            className="flex items-center gap-2 bg-[#5E4075] text-white px-4 py-2 rounded-lg hover:bg-[#4a2f5c] disabled:bg-gray-300 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            {shopsLoading ? 'Loading...' : 'Create Event'}
          </button>
        </div>
      </div>

      {/* Shops not loaded warning */}
      {!shopsLoading && shops.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-center">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800 font-medium">
            No shops found. Please create shops first before creating events.
          </p>
        </div>
      )}

      {/* ── Events grid ───────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border h-52 animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-xl border p-16 text-center">
          <Gift className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No events created yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Create your first special event like Pongal distribution
          </p>
          <button onClick={openCreate}
            className="mt-4 text-[#5E4075] font-semibold text-sm hover:underline">
            Create Event →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {events.map(event => {
            const status  = getEventStatus(event);
            const dayCount = getDayCount(event);
            const totalCap = event.tokens_per_day * dayCount;
            const fillPct  = totalCap > 0
              ? Math.min(100, Math.round(((event.token_count || 0) / totalCap) * 100))
              : 0;

            return (
              <div key={event.id}
                className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                {/* Top colour strip */}
                <div className="h-1.5 bg-gradient-to-r from-[#5E4075] to-[#8B6FA8]" />

                <div className="p-5">
                  {/* Title + status */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-gray-900 text-base leading-tight flex-1">
                      {event.name}
                    </h3>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${status.color}`}>
                      {status.label}
                    </span>
                  </div>

                  {/* Shop */}
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    {event.Shop?.name || '—'}
                  </div>

                  {/* Date range */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-[#5E4075]" />
                    {event.start_date} → {event.end_date}
                    <span className="text-gray-400">({dayCount} days)</span>
                  </div>

                  {/* Time + slots */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-4">
                    <Clock className="w-3.5 h-3.5 text-[#5E4075]" />
                    {event.open_time?.slice(0,5)} – {event.close_time?.slice(0,5)}
                    <span className="text-gray-400">· {event.tokens_per_day}/day</span>
                  </div>

                  {/* Capacity bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {event.token_count || 0} / {totalCap} tokens issued
                      </span>
                      <span>{fillPct}% full</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          fillPct > 80 ? 'bg-red-500' : 'bg-[#5E4075]'
                        }`}
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-1.5 flex-wrap">
                    <button onClick={() => openTokenView(event)}
                      className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-[#E1D2FF] text-[#5E4075] rounded-lg hover:bg-[#d4c4f5] font-medium">
                      <Eye className="w-3 h-3" /> Tokens ({event.token_count || 0})
                    </button>
                    <button onClick={() => openEdit(event)}
                      className="flex items-center gap-1 text-xs px-2.5 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 font-medium">
                      <Edit className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => handleToggleActive(event)}
                      className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-medium ${
                        event.is_active
                          ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}>
                      {event.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => handleDelete(event.id, event.name)}
                      className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══ Create / Edit Modal ══════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
              <h3 className="font-bold text-gray-900 text-lg">
                {editEvent ? 'Edit Event' : 'Create Special Event'}
              </h3>
              <button onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {formError}
                </div>
              )}

              {/* Event Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Event Name *
                </label>
                <input
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="e.g. Pongal 2025 Special Distribution"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5E4075] transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  rows={2}
                  placeholder="Optional details about the event"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5E4075] resize-none transition-colors"
                />
              </div>

              {/* Shop — THIS was the broken part: now uses shops state properly */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Shop *
                </label>
                {shopsLoading ? (
                  <div className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-400 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Loading shops...
                  </div>
                ) : shops.length === 0 ? (
                  <div className="w-full border-2 border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-600 bg-red-50">
                    No shops available — please create shops first
                  </div>
                ) : (
                  <select
                    value={form.shop_id}
                    onChange={e => set('shop_id', parseInt(e.target.value))}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5E4075] bg-white transition-colors"
                  >
                    <option value="">— Select a shop —</option>
                    {shops.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Date range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={e => set('start_date', e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5E4075] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={e => set('end_date', e.target.value)}
                    min={form.start_date}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5E4075] transition-colors"
                  />
                </div>
              </div>

              {/* Time range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Open Time
                  </label>
                  <input
                    type="time"
                    value={form.open_time}
                    onChange={e => set('open_time', e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5E4075] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Close Time
                  </label>
                  <input
                    type="time"
                    value={form.close_time}
                    onChange={e => set('close_time', e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5E4075] transition-colors"
                  />
                </div>
              </div>

              {/* Tokens + slot duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Tokens Per Day
                  </label>
                  <input
                    type="number"
                    value={form.tokens_per_day}
                    onChange={e => set('tokens_per_day', e.target.value)}
                    min={1} max={1000}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5E4075] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Slot Duration
                  </label>
                  <select
                    value={form.slot_duration_mins}
                    onChange={e => set('slot_duration_mins', parseInt(e.target.value))}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5E4075] bg-white transition-colors"
                  >
                    {[15, 20, 30, 45, 60].map(d => (
                      <option key={d} value={d}>{d} minutes</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Capacity preview */}
              {form.start_date && form.end_date && form.tokens_per_day && (
                <div className="bg-[#F5F0FF] rounded-xl p-3 text-sm">
                  <p className="text-[#5E4075] font-semibold">Event Capacity Preview</p>
                  <p className="text-gray-600 text-xs mt-1">
                    {form.start_date} → {form.end_date} ·{' '}
                    <span className="font-medium text-[#5E4075]">
                      ~{parseInt(form.tokens_per_day) * Math.max(1, getDayCountFromForm(form))} total tokens
                    </span>
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t flex gap-3 justify-end sticky bottom-0 bg-white">
              <button onClick={() => setShowModal(false)}
                className="px-5 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || shops.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#5E4075] text-white rounded-xl text-sm font-semibold hover:bg-[#4a2f5c] disabled:bg-gray-300 transition-colors"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : editEvent ? 'Save Changes' : 'Create Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Token List Modal ══════════════════════════════ */}
      {viewEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{viewEvent.name}</h3>
                <p className="text-gray-500 text-sm mt-0.5">
                  {viewEvent.Shop?.name} · {tokens.length} tokens
                </p>
              </div>
              <button onClick={() => setViewEvent(null)}
                className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Date filter */}
            <div className="px-6 py-3 border-b flex items-center gap-3">
              <label className="text-sm text-gray-600 font-medium whitespace-nowrap">Filter by date:</label>
              <input
                type="date"
                value={filterDate}
                onChange={async e => {
                  setFilterDate(e.target.value);
                  setTokensLoading(true);
                  try {
                    const res = await adminEventsAPI.getTokens(
                      viewEvent.id,
                      e.target.value ? { date: e.target.value } : {}
                    );
                    setTokens(res.data.tokens || []);
                  } finally { setTokensLoading(false); }
                }}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#5E4075]"
              />
              {filterDate && (
                <button
                  onClick={async () => {
                    setFilterDate('');
                    setTokensLoading(true);
                    try {
                      const res = await adminEventsAPI.getTokens(viewEvent.id, {});
                      setTokens(res.data.tokens || []);
                    } finally { setTokensLoading(false); }
                  }}
                  className="text-sm text-[#5E4075] hover:underline"
                >
                  Clear
                </button>
              )}
              <span className="text-sm text-gray-400 ml-auto">{tokens.length} results</span>
            </div>

            <div className="flex-1 overflow-y-auto">
              {tokensLoading ? (
                <div className="p-8 text-center">
                  <RefreshCw className="w-5 h-5 animate-spin text-[#5E4075] mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Loading tokens...</p>
                </div>
              ) : tokens.length === 0 ? (
                <div className="p-12 text-center text-gray-400 text-sm">
                  No tokens issued for this event yet
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b sticky top-0">
                    <tr>
                      {['Token', 'User', 'Card No.', 'Date', 'Slot', 'Status', 'Action'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {tokens.map(t => (
                      <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-bold text-[#5E4075] text-base">
                          #{t.token_number}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">{t.User?.name}</p>
                          <p className="text-xs text-gray-400">{t.User?.phone}</p>
                        </td>
                        <td className="px-4 py-3">
                          <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                            {t.RationCard?.card_number}
                          </code>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{t.assigned_date}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{t.slot_time?.slice(0, 5)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            t.status === 'used'      ? 'bg-green-50 text-green-700' :
                            t.status === 'cancelled' ? 'bg-gray-100 text-gray-500' :
                            t.status === 'no_show'   ? 'bg-red-50 text-red-600'   :
                            'bg-blue-50 text-blue-700'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {t.status === 'active' && (
                            <button
                              onClick={() => handleMarkUsed(t)}
                              className="text-xs bg-green-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-green-700 font-medium transition-colors"
                            >
                              Mark Used
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper — compute working days from form dates
function getDayCountFromForm(form) {
  if (!form.start_date || !form.end_date) return 1;
  const start = new Date(form.start_date);
  const end   = new Date(form.end_date);
  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    if (cur.getDay() !== 0) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count || 1;
}