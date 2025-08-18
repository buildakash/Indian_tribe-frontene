// Global App Configuration
;(function() {
  if (!window.AppConfig) window.AppConfig = {};
  const existing = window.AppConfig;
  window.AppConfig = {
    apiBaseUrl: existing.apiBaseUrl || (window.API_BASE_URL || 'http://localhost:8000/routes/auth'),
    modalDelayMs: typeof existing.modalDelayMs === 'number' ? existing.modalDelayMs : 2000,
    // Debug and mock toggles can be overridden at runtime: window.DEBUG_AUTH / window.USE_MOCK_AUTH
    debugAuth: typeof window.DEBUG_AUTH === 'boolean' ? window.DEBUG_AUTH : !!existing.debugAuth,
    useMockAuth: typeof window.USE_MOCK_AUTH === 'boolean' ? window.USE_MOCK_AUTH : !!existing.useMockAuth,
  };
})();



