(function () {
  const {
    budgetManager,
    expenseForm,
    expenseList,
    formatters,
    spendingChart,
    storage,
    summaryCards,
  } = window.FinanceTracker;

  let expenses = storage.getExpenses();
  let monthlyBudget = storage.getBudget();
  let editingId = null;

  const elements = {
    totalExpenses: document.querySelector("#totalExpenses"),
    monthlyBudget: document.querySelector("#monthlyBudget"),
    remainingBudget: document.querySelector("#remainingBudget"),
    transactionCount: document.querySelector("#transactionCount"),
    budgetForm: document.querySelector("#budgetForm"),
    budgetInput: document.querySelector("#budgetInput"),
    budgetMeterFill: document.querySelector("#budgetMeterFill"),
    budgetHint: document.querySelector("#budgetHint"),
    expenseForm: document.querySelector("#expenseForm"),
    expenseTitle: document.querySelector("#expenseTitle"),
    expenseAmount: document.querySelector("#expenseAmount"),
    expenseCategory: document.querySelector("#expenseCategory"),
    expenseDate: document.querySelector("#expenseDate"),
    formError: document.querySelector("#formError"),
    formTitle: document.querySelector("#formTitle"),
    submitExpense: document.querySelector("#submitExpense"),
    cancelEdit: document.querySelector("#cancelEdit"),
    searchInput: document.querySelector("#searchInput"),
    categoryFilter: document.querySelector("#categoryFilter"),
    expenseList: document.querySelector("#expenseList"),
    emptyState: document.querySelector("#emptyState"),
    resultCount: document.querySelector("#resultCount"),
    chart: document.querySelector("#categoryChart"),
    chartLegend: document.querySelector("#chartLegend"),
    exportButton: document.querySelector("#exportButton"),
    themeToggle: document.querySelector("#themeToggle"),
    themeIcon: document.querySelector("#themeIcon"),
  };

  init();

  function init() {
    elements.expenseDate.valueAsDate = new Date();
    elements.budgetInput.value = monthlyBudget || "";
    applySavedTheme();
    bindEvents();
    render();
  }

  function bindEvents() {
    elements.budgetForm.addEventListener("submit", handleBudgetSubmit);
    elements.expenseForm.addEventListener("submit", handleExpenseSubmit);
    elements.cancelEdit.addEventListener("click", handleCancelEdit);
    elements.searchInput.addEventListener("input", render);
    elements.categoryFilter.addEventListener("change", render);
    elements.exportButton.addEventListener("click", exportCSV);
    elements.themeToggle.addEventListener("click", toggleTheme);
    window.addEventListener("resize", () => spendingChart.drawChart(elements, getVisibleExpenses()));

    elements.expenseList.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-action]");
      if (!button) return;

      const id = button.dataset.id;
      if (button.dataset.action === "edit") startEdit(id);
      if (button.dataset.action === "delete") deleteExpense(id);
    });
  }

  function handleBudgetSubmit(event) {
    event.preventDefault();
    const value = Number(elements.budgetInput.value);
    monthlyBudget = Number.isFinite(value) && value > 0 ? value : 0;
    storage.saveBudget(monthlyBudget);
    render();
  }

  function handleExpenseSubmit(event) {
    event.preventDefault();
    elements.formError.textContent = "";

    const expense = expenseForm.readExpenseForm(elements, editingId, formatters.createId);
    if (!expenseForm.validateExpense(expense)) {
      elements.formError.textContent = "Please enter a title, valid amount, category, and date.";
      return;
    }

    if (editingId) {
      expenses = expenses.map((item) => (item.id === editingId ? expense : item));
    } else {
      expenses = [expense, ...expenses];
    }

    storage.saveExpenses(expenses);
    editingId = null;
    expenseForm.resetExpenseForm(elements);
    render();
  }

  function startEdit(id) {
    const expense = expenses.find((item) => item.id === id);
    if (!expense) return;

    editingId = id;
    expenseForm.fillExpenseForm(elements, expense);
  }

  function deleteExpense(id) {
    expenses = expenses.filter((item) => item.id !== id);
    storage.saveExpenses(expenses);

    if (editingId === id) {
      handleCancelEdit();
    }

    render();
  }

  function handleCancelEdit() {
    editingId = null;
    expenseForm.resetExpenseForm(elements);
  }

  function render() {
    const visibleExpenses = getVisibleExpenses();
    const summary = summaryCards.renderSummaryCards(elements, expenses, monthlyBudget);

    budgetManager.renderBudgetStatus(elements, summary.total, monthlyBudget);
    expenseList.renderExpenseList(elements, visibleExpenses);
    spendingChart.drawChart(elements, visibleExpenses);
  }

  function getVisibleExpenses() {
    const searchTerm = elements.searchInput.value.trim().toLowerCase();
    const selectedCategory = elements.categoryFilter.value;

    return expenses.filter((expense) => {
      const matchesCategory = selectedCategory === "All" || expense.category === selectedCategory;
      const matchesSearch =
        !searchTerm ||
        expense.title.toLowerCase().includes(searchTerm) ||
        expense.category.toLowerCase().includes(searchTerm);

      return matchesCategory && matchesSearch;
    });
  }

  function exportCSV() {
    if (!expenses.length) {
      elements.formError.textContent = "Add at least one expense before exporting.";
      return;
    }

    const headers = ["Title", "Amount", "Category", "Date"];
    const rows = expenses.map((expense) => [
      formatters.escapeCSV(expense.title),
      expense.amount,
      expense.category,
      expense.date,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "finance-tracker-expenses.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function toggleTheme() {
    const isDark = document.body.classList.toggle("dark");
    storage.saveTheme(isDark ? "dark" : "light");
    elements.themeIcon.textContent = isDark ? "Light" : "Dark";
    spendingChart.drawChart(elements, getVisibleExpenses());
  }

  function applySavedTheme() {
    const savedTheme = storage.getTheme();
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const useDark = savedTheme ? savedTheme === "dark" : prefersDark;

    document.body.classList.toggle("dark", useDark);
    elements.themeIcon.textContent = useDark ? "Light" : "Dark";
  }
})();
