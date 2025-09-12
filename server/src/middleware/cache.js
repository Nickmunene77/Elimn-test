// server/src/middleware/cache.js
const store = new Map();

export function cacheGet(key) {
  const entry = store.get(key);
  if (!entry) return null;
  const { value, expires } = entry;
  if (Date.now() > expires) {
    store.delete(key);
    return null;
  }
  return value;
}

export function cacheSet(key, value, ttlMs = 30000) {
  store.set(key, { value, expires: Date.now() + ttlMs });
}

export function cacheInvalidate(key) {
  store.delete(key);
}

export function cacheMiddleware(req, res, next) {
  if (req.method !== 'GET') return next();

  const key = `GET:${req.originalUrl}`;
  const cached = cacheGet(key);
  if (cached) return res.json(cached);

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    cacheSet(key, body);
    return originalJson(body);
  };

  next();
}
