const { LRUCache } = require('lru-cache');

// Lightweight LRU cache with TTL; safe for in-process caching.
// Keep capacity modest to stay memory-safe in small instances.
const options = {
  max: 500,
  ttl: 1000 * 60 * 5, // default 5 minutes
};

const cache = new LRUCache(options);

function get(key) {
  return cache.get(key);
}

function set(key, value, ttl) {
  if (ttl) cache.set(key, value, { ttl });
  else cache.set(key, value);
}

function del(key) {
  cache.delete(key);
}

function clear() {
  cache.clear();
}

module.exports = { get, set, del, clear };
