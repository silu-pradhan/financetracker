(function () {
  const currencyFormatter = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  });

  function formatCurrency(value) {
    return `Rs ${currencyFormatter.format(value)}`;
  }

  function formatDate(dateString) {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(`${dateString}T00:00:00`));
  }

  function formatCompact(value) {
    if (value >= 100000) return `Rs ${Math.round(value / 1000)}k`;
    if (value >= 1000) return `Rs ${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
    return `Rs ${Math.round(value)}`;
  }

  function shortenLabel(label) {
    return label.length > 10 ? `${label.slice(0, 9)}...` : label;
  }

  function escapeCSV(value) {
    const text = String(value).replaceAll('"', '""');
    return /[",\n]/.test(text) ? `"${text}"` : text;
  }

  function createId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }

    return `expense-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  window.FinanceTracker.formatters = {
    createId,
    escapeCSV,
    formatCompact,
    formatCurrency,
    formatDate,
    shortenLabel,
  };
})();
