const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export async function apiRequest(path, { token, ...options } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = Array.isArray(data.detail) ? data.detail.map((x) => x.msg).join(', ') : data.detail;
    throw new Error(detail || `Request failed (${response.status})`);
  }
  return data;
}

export const api = {
  register: (body) => apiRequest('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => apiRequest('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  listVehicles: () => apiRequest('/api/vehicles?available_only=false'),
  searchVehicles: (params) => apiRequest(`/api/vehicles/search?${params.toString()}&available_only=false`),
  createVehicle: (body, token) => apiRequest('/api/vehicles', { method: 'POST', body: JSON.stringify(body), token }),
  updateVehicle: (id, body, token) => apiRequest(`/api/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(body), token }),
  deleteVehicle: (id, token) => apiRequest(`/api/vehicles/${id}`, { method: 'DELETE', token }),
  purchase: (id, token) => apiRequest(`/api/vehicles/${id}/purchase`, { method: 'POST', token }),
  restock: (id, quantity, token) => apiRequest(`/api/vehicles/${id}/restock`, { method: 'POST', body: JSON.stringify({ quantity }), token }),
};
