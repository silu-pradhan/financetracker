(function () {
  const { categories } = window.FinanceTracker.config;
  const { formatCompact, formatCurrency, shortenLabel } = window.FinanceTracker.formatters;

  function drawChart(elements, items) {
    const canvas = elements.chart;
    const context = canvas.getContext("2d");
    const chartWrap = canvas.parentElement;
    const rect = canvas.getBoundingClientRect();
    const cssWidth = Math.max(320, Math.floor(rect.width || chartWrap.clientWidth || 640));
    const sideBySide = cssWidth > 760;
    const cssHeight = sideBySide ? 340 : 300 + Math.max(items.length, 1) * 38;
    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = Math.floor(cssWidth * pixelRatio);
    canvas.height = Math.floor(cssHeight * pixelRatio);
    canvas.style.height = `${cssHeight}px`;
    context.scale(pixelRatio, pixelRatio);

    const categoryTotals = items.reduce((totals, expense) => {
      totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
      return totals;
    }, {});

    const entries = Object.entries(categoryTotals).filter(([, value]) => value > 0);
    elements.chartEmpty.classList.toggle("hidden", entries.length > 0);
    elements.chartLegend.replaceChildren();
    context.clearRect(0, 0, cssWidth, cssHeight);

    if (!entries.length) return;

    const total = entries.reduce((sum, [, value]) => sum + value, 0);
    const donutCenterX = sideBySide ? Math.min(150, cssWidth * 0.28) : cssWidth / 2;
    const donutCenterY = 155;
    const donutRadius = sideBySide ? Math.min(92, cssWidth * 0.2) : Math.min(82, cssWidth * 0.24);
    const donutLineWidth = 26;
    const barStartX = sideBySide ? 310 : 32;
    const barStartY = sideBySide ? 62 : 290;
    const barWidth = sideBySide ? cssWidth - barStartX - 34 : cssWidth - 64;
    const barHeight = 12;
    const barGap = 38;
    const maxValue = Math.max(...entries.map(([, value]) => value));

    drawDonut(context, entries, total, donutCenterX, donutCenterY, donutRadius, donutLineWidth);
    drawDonutLabel(context, total, donutCenterX, donutCenterY);

    context.textAlign = "left";
    context.textBaseline = "middle";
    context.font = "12px Arial";

    entries.forEach(([category, value], index) => {
      const x = barStartX;
      const y = barStartY + index * barGap;
      const filledWidth = Math.max(12, (value / maxValue) * barWidth);
      const color = categories[category] || categories.Other;
      const percent = Math.round((value / total) * 100);

      context.fillStyle = getCSSValue("--muted");
      context.fillText(shortenLabel(category), x, y - 14);
      context.textAlign = "right";
      context.fillText(`${formatCurrency(value)} (${percent}%)`, x + barWidth, y - 14);
      context.textAlign = "left";

      context.fillStyle = getCSSValue("--surface-soft");
      roundRect(context, x, y, barWidth, barHeight, 999);
      context.fill();

      context.fillStyle = color;
      roundRect(context, x, y, filledWidth, barHeight, 999);
      context.fill();

      const legendItem = document.createElement("span");
      legendItem.className = "legend-item";
      legendItem.innerHTML = `<span class="legend-dot" style="background:${color}"></span>${category} ${formatCompact(value)}`;
      elements.chartLegend.append(legendItem);
    });
  }

  function drawDonut(context, entries, total, centerX, centerY, radius, lineWidth) {
    let startAngle = -Math.PI / 2;

    context.lineWidth = lineWidth;
    context.lineCap = "round";

    entries.forEach(([category, value]) => {
      const angle = (value / total) * Math.PI * 2;
      const endAngle = startAngle + angle;

      context.beginPath();
      context.strokeStyle = categories[category] || categories.Other;
      context.arc(centerX, centerY, radius, startAngle, endAngle);
      context.stroke();
      startAngle = endAngle;
    });
  }

  function drawDonutLabel(context, total, centerX, centerY) {
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = getCSSValue("--muted");
    context.font = "12px Arial";
    context.fillText("Total", centerX, centerY - 12);

    context.fillStyle = getCSSValue("--text");
    context.font = "700 20px Arial";
    context.fillText(formatCompact(total), centerX, centerY + 12);
  }

  function getCSSValue(variableName) {
    return getComputedStyle(document.body).getPropertyValue(variableName).trim();
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
