(function () {
  const { categories } = window.FinanceTracker.config;
  const { formatCurrency, formatDate } = window.FinanceTracker.formatters;

  function renderExpenseList(elements, items) {
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

  window.FinanceTracker.expenseList = {
    renderExpenseList,
  };
})();
