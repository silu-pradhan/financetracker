(function () {
  const { categories } = window.FinanceTracker.config;
  const { formatCompact, formatCurrency } = window.FinanceTracker.formatters;

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
    if (elements.monthlyChart) elements.monthlyChart.replaceChildren();

    renderDonut(elements, entries, totalValue);
    renderMonthlyBars(elements, items);

    if (!entries.length) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.innerHTML = "<strong>No expense data yet</strong><span>Add expenses to see category bars.</span>";
      elements.chart.append(empty);
      return;
    }

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

  function renderDonut(elements, entries, totalValue) {
    if (!elements.categoryDonut || !elements.donutCenter || !elements.donutHint) return;

    if (!entries.length || totalValue <= 0) {
      elements.categoryDonut.style.background = "conic-gradient(var(--surface-soft) 0deg 360deg)";
      elements.donutCenter.textContent = "0%";
      elements.donutHint.textContent = "No expense data yet";
      return;
    }

    let current = 0;
    const segments = entries
      .map(([category, value]) => {
        const start = current;
        const sweep = (value / totalValue) * 360;
        current += sweep;
        return `${categories[category] || categories.Other} ${start}deg ${current}deg`;
      })
      .join(", ");
    const topShare = Math.round((Math.max(...entries.map(([, value]) => value)) / totalValue) * 100);

    elements.categoryDonut.style.background = `conic-gradient(${segments})`;
    elements.donutCenter.textContent = `${topShare}%`;
    elements.donutHint.textContent = `${formatCurrency(totalValue)} tracked`;
  }

  function renderMonthlyBars(elements, items) {
    if (!elements.monthlyChart) return;

    const now = new Date();
    const monthKeys = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      return {
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
        label: date.toLocaleDateString("en-IN", { month: "short" }),
        total: 0,
      };
    });

    items.forEach((expense) => {
      const key = expense.date.slice(0, 7);
      const month = monthKeys.find((item) => item.key === key);
      if (month) month.total += expense.amount;
    });

    const maxMonth = Math.max(...monthKeys.map((month) => month.total), 0);

    monthKeys.forEach((month) => {
      const height = maxMonth > 0 ? Math.max(5, (month.total / maxMonth) * 100) : 5;
      const bar = document.createElement("div");
      bar.className = "month-bar";
      bar.innerHTML = `
        <div class="month-track">
          <div class="month-fill" style="height: ${height}%;"></div>
        </div>
        <span class="month-value">${month.total ? formatCompact(month.total) : "Rs 0"}</span>
        <span>${month.label}</span>
      `;
      elements.monthlyChart.append(bar);
    });
  }

  window.FinanceTracker.spendingChart = {
    drawChart,
  };
})();
