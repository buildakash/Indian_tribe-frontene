// Generic utilities used across the site
;(function() {
  const Utils = {
    qs(selector, scope = document) { return scope.querySelector(selector); },
    qsa(selector, scope = document) { return Array.from(scope.querySelectorAll(selector)); },
    setLoading(button, text) {
      if (!button) return;
      button.disabled = true;
      button.dataset.originalText = button.innerHTML;
      button.innerHTML = `<div class="flex items-center justify-center"><div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>${text}</div>`;
    },
    clearLoading(button) {
      if (!button) return;
      button.disabled = false;
      if (button.dataset.originalText) button.innerHTML = button.dataset.originalText;
    },
    isValidEmail(email) {
      if (!email || !email.includes('@')) return false;
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    },
    toFormData(obj) {
      const fd = new FormData();
      Object.entries(obj).forEach(([k, v]) => fd.append(k, v));
      return fd;
    }
  };

  window.Utils = Utils;
})();



