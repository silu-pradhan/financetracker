(function () {
  const { categories } = window.FinanceTracker.config;
  const { formatCurrency } = window.FinanceTracker.formatters;

  function drawChart(elements, items) {
    const categoryTotals = items.reduce((totals, expense) => {
      totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
      return totals;
    }, {});

    const entries = Object.entries(categoryTotals).filter(([, value]) => value > 0);
    const totalValue = entries.reduce((sum, [, value]) => sum + value, 0);
    const maxValue = Math.max(...entries.map(([, value]) => value), 0);

    elements.chart.replaceChildren();
    elements.chartLegend.replaceChildren();

    if (!entries.length) return;

    entries.forEach(([category, value]) => {
      const color = categories[category] || categories.Other;
      const barPercent = maxValue > 0 ? Math.max(8, (value / maxValue) * 100) : 0;
      const sharePercent = totalValue > 0 ? Math.round((value / totalValue) * 100) : 0;

      const barItem = document.createElement("div");
      barItem.className = "bar-chart-item";
      barItem.innerHTML = `
        <div class="bar-chart-row">
          <span class="bar-category">
            <span class="bar-dot" style="background: ${color};"></span>
            ${category}
          </span>
          <span class="bar-value">
            <strong>${formatCurrency(value)}</strong>
            <em>${sharePercent}%</em>
          </span>
        </div>
        <div class="bar-track">
          <div class="bar-fill" style="width: ${barPercent}%; background: ${color};"></div>
        </div>
      `;

      const legendItem = document.createElement("span");
      legendItem.className = "legend-item";
      legendItem.innerHTML = `<span class="legend-dot" style="background:${color}"></span>${category}`;

      elements.chart.append(barItem);
      elements.chartLegend.append(legendItem);
    });
  }

  window.FinanceTracker.spendingChart = {
    drawChart,
  };
})();
