(function () {
  window.FinanceTracker = window.FinanceTracker || {};

  window.FinanceTracker.config = {
    storageKeys: {
      expenses: "financeTracker.expenses",
      budget: "financeTracker.budget",
      theme: "financeTracker.theme",
    },
    categories: {
      Food: "#176b87",
      Travel: "#7c5cdb",
      Shopping: "#df8b37",
      Bills: "#c24135",
      Health: "#15835b",
      Education: "#2b74c7",
      Entertainment: "#b24b8a",
      Other: "#667084",
    },
  };
})();
