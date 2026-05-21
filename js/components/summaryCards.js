(function () {
  const { formatCurrency } = window.FinanceTracker.formatters;

  function renderSummaryCards(elements, expenses, monthlyBudget) {
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const remaining = monthlyBudget - total;

    elements.totalExpenses.textContent = formatCurrency(total);
    elements.monthlyBudget.textContent = formatCurrency(monthlyBudget);
    elements.remainingBudget.textContent = formatCurrency(remaining);
    elements.transactionCount.textContent = `${expenses.length} ${expenses.length === 1 ? "entry" : "entries"}`;

    if (elements.monthlySavings) {
      const savingsPercent = monthlyBudget > 0 ? Math.max(0, Math.round((remaining / monthlyBudget) * 100)) : 0;
      elements.monthlySavings.textContent = `${savingsPercent}%`;
    }

    const balanceCard = elements.remainingBudget.closest(".balance-card");
    balanceCard.classList.toggle("negative", remaining < 0);
    balanceCard.classList.toggle("positive", remaining >= 0 && monthlyBudget > 0);

    return { remaining, total };
  }

  window.FinanceTracker.summaryCards = {
    renderSummaryCards,
  };
})();
