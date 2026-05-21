(function () {
  const { formatCurrency } = window.FinanceTracker.formatters;

  function renderBudgetStatus(elements, total, monthlyBudget) {
    const remaining = monthlyBudget - total;
    const usedPercent = monthlyBudget > 0 ? Math.min((total / monthlyBudget) * 100, 100) : 0;

    elements.budgetMeterFill.style.width = `${usedPercent}%`;
    elements.budgetMeterFill.classList.toggle("warning", usedPercent >= 75 && usedPercent < 100);
    elements.budgetMeterFill.classList.toggle("over", total > monthlyBudget && monthlyBudget > 0);

    if (elements.budgetPercent) {
      elements.budgetPercent.textContent = `${usedPercent.toFixed(1)}%`;
    }

    if (!monthlyBudget) {
      elements.budgetHint.textContent = "Add your monthly budget to track spending.";
    } else if (remaining < 0) {
      elements.budgetHint.textContent = `You are over budget by ${formatCurrency(Math.abs(remaining))}.`;
    } else {
      elements.budgetHint.textContent = `${formatCurrency(remaining)} left from this month's budget.`;
    }
  }

  window.FinanceTracker.budgetManager = {
    renderBudgetStatus,
  };
})();
