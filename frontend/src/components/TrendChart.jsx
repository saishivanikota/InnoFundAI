import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TrendChart = ({ type = 'line', data, options, height = 300 }) => {
  // Common premium chart styling presets
  const getThemeColors = () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      gridColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
      textColor: isDark ? '#94a3b8' : '#64748b',
      tooltipBg: isDark ? '#0f172a' : '#ffffff',
      tooltipBorder: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(0, 0, 0, 0.1)',
      tooltipText: isDark ? '#f8fafc' : '#0f172a'
    };
  };

  const colors = getThemeColors();

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: colors.textColor,
          font: {
            family: 'Plus Jakarta Sans',
            weight: '500'
          },
          boxWidth: 12,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: colors.tooltipBg,
        titleColor: colors.textColor,
        bodyColor: colors.tooltipText,
        borderColor: colors.tooltipBorder,
        borderWidth: 1,
        titleFont: {
          family: 'Plus Jakarta Sans',
          weight: '600'
        },
        bodyFont: {
          family: 'Plus Jakarta Sans'
        },
        padding: 10,
        cornerRadius: 8,
        displayColors: true
      }
    },
    scales: type === 'line' || type === 'bar' ? {
      x: {
        grid: {
          color: colors.gridColor,
          drawBorder: false
        },
        ticks: {
          color: colors.textColor,
          font: {
            family: 'Plus Jakarta Sans'
          }
        }
      },
      y: {
        grid: {
          color: colors.gridColor,
          drawBorder: false
        },
        ticks: {
          color: colors.textColor,
          font: {
            family: 'Plus Jakarta Sans'
          }
        }
      }
    } : {}
  };

  const finalOptions = {
    ...defaultOptions,
    ...options,
    plugins: {
      ...defaultOptions.plugins,
      ...options?.plugins
    },
    scales: {
      ...defaultOptions.scales,
      ...options?.scales
    }
  };

  const renderChart = () => {
    switch (type.toLowerCase()) {
      case 'line':
        return <Line data={data} options={finalOptions} />;
      case 'bar':
        return <Bar data={data} options={finalOptions} />;
      case 'doughnut':
        return <Doughnut data={data} options={finalOptions} />;
      case 'pie':
        return <Pie data={data} options={finalOptions} />;
      default:
        return <Line data={data} options={finalOptions} />;
    }
  };

  return (
    <div style={{ height: `${height}px`, width: '100%', position: 'relative' }}>
      {renderChart()}
    </div>
  );
};

export default TrendChart;
