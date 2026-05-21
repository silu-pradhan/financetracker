(function () {
  const { storageKeys } = window.FinanceTracker.config;

  function readJSON(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch {
      return fallback;
    }
  }

  function getExpenses() {
    return readJSON(storageKeys.expenses, []);
  }

  function saveExpenses(expenses) {
    localStorage.setItem(storageKeys.expenses, JSON.stringify(expenses));
  }

  function getBudget() {
    return Number(localStorage.getItem(storageKeys.budget)) || 0;
  }

  function saveBudget(budget) {
    localStorage.setItem(storageKeys.budget, String(budget));
  }

  function getTheme() {
    return localStorage.getItem(storageKeys.theme);
  }

  function saveTheme(theme) {
    localStorage.setItem(storageKeys.theme, theme);
  }

  window.FinanceTracker.storage = {
    getBudget,
    getExpenses,
    getTheme,
    saveBudget,
    saveExpenses,
    saveTheme,
  };
})();
