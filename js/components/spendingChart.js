(function () {
  const { categories } = window.FinanceTracker.config;
  const { formatCompact, formatCurrency, shortenLabel } = window.FinanceTracker.formatters;

  function drawChart(elements, items) {
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

  window.FinanceTracker.spendingChart = {
    drawChart,
  };
})();
