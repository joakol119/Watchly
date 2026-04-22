const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error en la solicitud');
  return data;
}

export const api = {
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getTrending: () => request('/tmdb/trending'),
  search: (q) => request(`/tmdb/search?q=${encodeURIComponent(q)}`),
  getMovie: (id) => request(`/tmdb/movie/${id}`),
  getTv: (id) => request(`/tmdb/tv/${id}`),
  getRandom: (type, genre_id, min_rating) => {
    const params = new URLSearchParams({ type });
    if (genre_id) params.append('genre_id', genre_id);
    if (min_rating) params.append('min_rating', min_rating);
    return request(`/tmdb/random?${params.toString()}`);
  },
  getWatchlist: () => request('/watchlist'),
  addToWatchlist: (data) => request('/watchlist', { method: 'POST', body: JSON.stringify(data) }),
  updateWatchlist: (id, status) => request(`/watchlist/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  reorderWatchlist: (items) => request('/watchlist/reorder', { method: 'PATCH', body: JSON.stringify({ items }) }),
  removeFromWatchlist: (id) => request(`/watchlist/${id}`, { method: 'DELETE' }),
};
