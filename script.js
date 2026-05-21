const STORAGE_KEYS = {
  expenses: "financeTracker.expenses",
  budget: "financeTracker.budget",
  theme: "financeTracker.theme",
};

const categories = {
  Food: "#176b87",
  Travel: "#7c5cdb",
  Shopping: "#df8b37",
  Bills: "#c24135",
  Health: "#15835b",
  Education: "#2b74c7",
  Entertainment: "#b24b8a",
  Other: "#667084",
};

let expenses = readJSON(STORAGE_KEYS.expenses, []);
let monthlyBudget = Number(localStorage.getItem(STORAGE_KEYS.budget)) || 0;
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
  chartEmpty: document.querySelector("#chartEmpty"),
  chartLegend: document.querySelector("#chartLegend"),
  exportButton: document.querySelector("#exportButton"),
  themeToggle: document.querySelector("#themeToggle"),
  themeIcon: document.querySelector("#themeIcon"),
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

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
  elements.cancelEdit.addEventListener("click", resetExpenseForm);
  elements.searchInput.addEventListener("input", render);
  elements.categoryFilter.addEventListener("change", render);
  elements.exportButton.addEventListener("click", exportCSV);
  elements.themeToggle.addEventListener("click", toggleTheme);
  window.addEventListener("resize", () => drawChart(getVisibleExpenses()));

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
  localStorage.setItem(STORAGE_KEYS.budget, String(monthlyBudget));
  render();
}

function handleExpenseSubmit(event) {
  event.preventDefault();
  elements.formError.textContent = "";

  const title = elements.expenseTitle.value.trim();
  const amount = Number(elements.expenseAmount.value);
  const category = elements.expenseCategory.value;
  const date = elements.expenseDate.value;

  if (!title || !category || !date || !Number.isFinite(amount) || amount <= 0) {
    elements.formError.textContent = "Please enter a title, valid amount, category, and date.";
    return;
  }

  const expense = {
    id: editingId || createId(),
    title,
    amount,
    category,
    date,
  };

  if (editingId) {
    expenses = expenses.map((item) => (item.id === editingId ? expense : item));
  } else {
    expenses = [expense, ...expenses];
  }

  saveExpenses();
  resetExpenseForm();
  render();
}

function startEdit(id) {
  const expense = expenses.find((item) => item.id === id);
  if (!expense) return;

  editingId = id;
  elements.expenseTitle.value = expense.title;
  elements.expenseAmount.value = expense.amount;
  elements.expenseCategory.value = expense.category;
  elements.expenseDate.value = expense.date;
  elements.formTitle.textContent = "Edit Expense";
  elements.submitExpense.textContent = "Update Expense";
  elements.cancelEdit.classList.remove("hidden");
  elements.formError.textContent = "";
  elements.expenseTitle.focus();
}

function deleteExpense(id) {
  expenses = expenses.filter((item) => item.id !== id);
  saveExpenses();
  if (editingId === id) resetExpenseForm();
  render();
}

function resetExpenseForm() {
  editingId = null;
  elements.expenseForm.reset();
  elements.expenseDate.valueAsDate = new Date();
  elements.formTitle.textContent = "Add Expense";
  elements.submitExpense.textContent = "Add Expense";
  elements.cancelEdit.classList.add("hidden");
  elements.formError.textContent = "";
}

function render() {
  const visibleExpenses = getVisibleExpenses();
  renderSummary();
  renderExpenseList(visibleExpenses);
  drawChart(visibleExpenses);
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

function renderSummary() {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remaining = monthlyBudget - total;
  const usedPercent = monthlyBudget > 0 ? Math.min((total / monthlyBudget) * 100, 100) : 0;

  elements.totalExpenses.textContent = formatCurrency(total);
  elements.monthlyBudget.textContent = formatCurrency(monthlyBudget);
  elements.remainingBudget.textContent = formatCurrency(remaining);
  elements.transactionCount.textContent = String(expenses.length);

  const balanceCard = elements.remainingBudget.closest(".balance-card");
  balanceCard.classList.toggle("negative", remaining < 0);
  balanceCard.classList.toggle("positive", remaining >= 0 && monthlyBudget > 0);

  elements.budgetMeterFill.style.width = `${usedPercent}%`;
  elements.budgetMeterFill.classList.toggle("warning", usedPercent >= 75 && usedPercent < 100);
  elements.budgetMeterFill.classList.toggle("over", total > monthlyBudget && monthlyBudget > 0);

  if (!monthlyBudget) {
    elements.budgetHint.textContent = "Add your monthly budget to track spending.";
  } else if (remaining < 0) {
    elements.budgetHint.textContent = `You are over budget by ${formatCurrency(Math.abs(remaining))}.`;
  } else {
    elements.budgetHint.textContent = `${formatCurrency(remaining)} left from this month's budget.`;
  }
}

function renderExpenseList(items) {
  elements.expenseList.replaceChildren();
  elements.resultCount.textContent = `${items.length} shown`;
  elements.emptyState.classList.toggle("hidden", items.length > 0);

  const fragment = document.createDocumentFragment();

  items.forEach((expense) => {
    const row = document.createElement("article");
    row.className = "expense-item";

    const main = document.createElement("div");
    main.className = "expense-main";

    const titleLine = document.createElement("div");
    titleLine.className = "expense-title";

    const title = document.createElement("strong");
    title.textContent = expense.title;

    const category = document.createElement("span");
    category.className = "category-pill";
    category.style.backgroundColor = categories[expense.category] || categories.Other;
    category.textContent = expense.category;

    const meta = document.createElement("div");
    meta.className = "expense-meta";
    meta.textContent = formatDate(expense.date);

    titleLine.append(title, category);
    main.append(titleLine, meta);

    const side = document.createElement("div");
    const amount = document.createElement("div");
    amount.className = "expense-amount";
    amount.textContent = formatCurrency(expense.amount);

    const actions = document.createElement("div");
    actions.className = "item-actions";
    actions.innerHTML = `
      <button class="small-button" type="button" data-action="edit" data-id="${expense.id}">Edit</button>
      <button class="small-button delete-button" type="button" data-action="delete" data-id="${expense.id}">Delete</button>
    `;

    side.append(amount, actions);
    row.append(main, side);
    fragment.append(row);
  });

  elements.expenseList.append(fragment);
}

function drawChart(items) {
  const canvas = elements.chart;
  const context = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const pixelRatio = window.devicePixelRatio || 1;

  canvas.width = Math.max(1, Math.floor(rect.width * pixelRatio));
  canvas.height = Math.floor(320 * pixelRatio);
  context.scale(pixelRatio, pixelRatio);

  const categoryTotals = items.reduce((totals, expense) => {
    totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
    return totals;
  }, {});

  const entries = Object.entries(categoryTotals).filter(([, value]) => value > 0);
  elements.chartEmpty.classList.toggle("hidden", entries.length > 0);
  elements.chartLegend.replaceChildren();
  context.clearRect(0, 0, rect.width, 320);

  if (!entries.length) return;

  const chartWidth = rect.width;
  const chartHeight = 280;
  const padding = 28;
  const barGap = 12;
  const maxValue = Math.max(...entries.map(([, value]) => value));
  const barWidth = Math.max(26, (chartWidth - padding * 2 - barGap * (entries.length - 1)) / entries.length);

  context.textBaseline = "middle";
  context.font = "12px Arial";

  entries.forEach(([category, value], index) => {
    const barHeight = Math.max(8, (value / maxValue) * 190);
    const x = padding + index * (barWidth + barGap);
    const y = chartHeight - barHeight;
    const color = categories[category] || categories.Other;

    context.fillStyle = color;
    roundRect(context, x, y, barWidth, barHeight, 7);
    context.fill();

    context.fillStyle = getComputedStyle(document.body).getPropertyValue("--muted").trim();
    context.textAlign = "center";
    context.fillText(shortenLabel(category), x + barWidth / 2, chartHeight + 18);
    context.fillText(formatCompact(value), x + barWidth / 2, y - 12);

    const legendItem = document.createElement("span");
    legendItem.className = "legend-item";
    legendItem.innerHTML = `<span class="legend-dot" style="background:${color}"></span>${category} ${formatCurrency(value)}`;
    elements.chartLegend.append(legendItem);
  });
}

function roundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

function exportCSV() {
  if (!expenses.length) {
    elements.formError.textContent = "Add at least one expense before exporting.";
    return;
  }

  const headers = ["Title", "Amount", "Category", "Date"];
  const rows = expenses.map((expense) => [
    escapeCSV(expense.title),
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
  localStorage.setItem(STORAGE_KEYS.theme, isDark ? "dark" : "light");
  elements.themeIcon.textContent = isDark ? "☀" : "☾";
  drawChart(getVisibleExpenses());
}

function applySavedTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const useDark = savedTheme ? savedTheme === "dark" : prefersDark;
  document.body.classList.toggle("dark", useDark);
  elements.themeIcon.textContent = useDark ? "☀" : "☾";
}

function saveExpenses() {
  localStorage.setItem(STORAGE_KEYS.expenses, JSON.stringify(expenses));
}

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `expense-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function formatCurrency(value) {
  return currencyFormatter.format(value);
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${dateString}T00:00:00`));
}

function formatCompact(value) {
  if (value >= 100000) return `₹${Math.round(value / 1000)}k`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
  return `₹${Math.round(value)}`;
}

function shortenLabel(label) {
  return label.length > 10 ? `${label.slice(0, 9)}...` : label;
}

function escapeCSV(value) {
  const text = String(value).replaceAll('"', '""');
  return /[",\n]/.test(text) ? `"${text}"` : text;
}
