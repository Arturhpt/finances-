// js/charts.js

// Keep track of active chart instances to destroy them before re-rendering
let flowChartInstance = null;
let categoryChartInstance = null;

// Standard premium colors for categories
const CHART_COLORS = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#f97316', // Orange
  '#14b8a6', // Teal
  '#3b82f6'  // Blue
];

// Helper to get localized Month Name from YYYY-MM
const formatMonthLabel = (yearMonthStr) => {
  const [year, month] = yearMonthStr.split('-');
  const date = new Date(year, parseInt(month) - 1, 1);
  return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
             .replace('.', '')
             .replace(' de ', '/');
};

// Main function to render/update charts
export const renderCharts = (transactions, isDarkMode) => {
  renderFlowChart(transactions, isDarkMode);
  renderCategoryChart(transactions, isDarkMode);
};

// 1. CASH FLOW CHART (Bar Chart)
const renderFlowChart = (transactions, isDarkMode) => {
  const canvas = document.getElementById('chart-flow');
  if (!canvas) return;

  // Group transactions by month
  const monthlyData = {};
  
  // Sort chronologically first to ensure months are inserted in order
  const sortedTxs = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));

  sortedTxs.forEach(tx => {
    if (!tx.date) return;
    const monthKey = tx.date.substring(0, 7); // Gets YYYY-MM
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { income: 0, expense: 0 };
    }
    if (tx.type === 'income') {
      monthlyData[monthKey].income += tx.amount;
    } else if (tx.type === 'expense') {
      monthlyData[monthKey].expense += tx.amount;
    }
  });

  // Extract labels and dataset values (take last 6 months for clean UI)
  const allMonths = Object.keys(monthlyData).sort();
  const activeMonths = allMonths.slice(-6); 

  const labels = activeMonths.map(formatMonthLabel);
  const incomeData = activeMonths.map(m => monthlyData[m].income);
  const expenseData = activeMonths.map(m => monthlyData[m].expense);

  // If no data, show empty chart state
  if (activeMonths.length === 0) {
    labels.push('Sem Dados');
    incomeData.push(0);
    expenseData.push(0);
  }

  // Destroy previous instance
  if (flowChartInstance) {
    flowChartInstance.destroy();
  }

  // Theme settings
  const textColor = isDarkMode ? '#94a3b8' : '#475569';
  const gridColor = isDarkMode ? '#334155' : '#e2e8f0';

  flowChartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Receitas',
          data: incomeData,
          backgroundColor: 'rgba(22, 163, 74, 0.85)',
          borderColor: 'rgb(22, 163, 74)',
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: 'Despesas',
          data: expenseData,
          backgroundColor: 'rgba(239, 68, 68, 0.85)',
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 1,
          borderRadius: 4,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: textColor,
            font: { family: 'Inter', weight: 500 }
          }
        },
        tooltip: {
          padding: 12,
          cornerRadius: 8,
          bodyFont: { family: 'Inter' },
          titleFont: { family: 'Plus Jakarta Sans', weight: 'bold' }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: textColor, font: { family: 'Inter' } }
        },
        y: {
          grid: { color: gridColor },
          ticks: {
            color: textColor,
            font: { family: 'Inter' },
            callback: (val) => 'R$ ' + val.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
          }
        }
      }
    }
  });
};

// 2. EXPENSES BY CATEGORY CHART (Doughnut Chart)
const renderCategoryChart = (transactions, isDarkMode) => {
  const canvas = document.getElementById('chart-categories');
  if (!canvas) return;

  // Filter only expenses
  const expenses = transactions.filter(tx => tx.type === 'expense');

  // Group by category
  const categoriesData = {};
  expenses.forEach(tx => {
    const cat = tx.category || 'Outros';
    categoriesData[cat] = (categoriesData[cat] || 0) + tx.amount;
  });

  const labels = Object.keys(categoriesData);
  const data = Object.values(categoriesData);

  // If no expenses, show empty chart state
  if (labels.length === 0) {
    labels.push('Sem Despesas');
    data.push(1); // Placeholder value for doughnut
  }

  // Destroy previous instance
  if (categoryChartInstance) {
    categoryChartInstance.destroy();
  }

  const textColor = isDarkMode ? '#94a3b8' : '#475569';
  const noDataColor = isDarkMode ? 'rgba(51, 65, 85, 0.6)' : 'rgba(226, 232, 240, 0.8)';
  const bgColors = expenses.length > 0 
    ? labels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length])
    : [noDataColor];

  categoryChartInstance = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: bgColors,
        borderWidth: isDarkMode ? 2 : 1,
        borderColor: isDarkMode ? '#0f172a' : '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: textColor,
            font: { family: 'Inter', size: 12, weight: 500 },
            boxWidth: 12,
            padding: 12
          }
        },
        tooltip: {
          enabled: expenses.length > 0, // Disable tooltip if placeholder data
          padding: 12,
          cornerRadius: 8,
          bodyFont: { family: 'Inter' },
          titleFont: { family: 'Plus Jakarta Sans', weight: 'bold' },
          callbacks: {
            label: (context) => {
              const val = context.raw;
              return ` R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            }
          }
        }
      }
    }
  });
};
