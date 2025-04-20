// chart.js - Advanced Stock Chart Implementation

// Chart configuration
const ChartConfig = {
    // Color schemes for light/dark themes
    colors: {
        light: {
            up: '#10b981',       // Green for positive changes
            down: '#ef4444',     // Red for negative changes
            unchanged: '#64748b', // Gray for no change
            background: '#ffffff',
            grid: 'rgba(0, 0, 0, 0.1)',
            text: '#1e293b'
        },
        dark: {
            up: '#34d399',
            down: '#f87171',
            unchanged: '#94a3b8',
            background: '#1e293b',
            grid: 'rgba(255, 255, 255, 0.1)',
            text: '#f8fafc'
        }
    },

    // Get current theme colors
    getThemeColors: () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        return isDark ? ChartConfig.colors.dark : ChartConfig.colors.light;
    }
};

// Main chart instance
let stockChart = null;
let volumeChart = null;
let currentSymbol = '';
let historicalData = [];

// Initialize the chart
function initStockChart(symbol = 'AAPL') {
    currentSymbol = symbol;

    // Get canvas elements
    const priceCtx = document.getElementById('stock-chart').getContext('2d');

    // Destroy existing charts if they exist
    if (stockChart) stockChart.destroy();

    // Generate sample data (in a real app, this would come from an API)
    historicalData = generateHistoricalData(symbol);

    // Create the main price chart
    stockChart = new Chart(priceCtx, {
        type: 'candlestick',
        data: getChartData(),
        options: getChartOptions()
    });

    // Update the chart header
    updateChartHeader();

    // Connect time filter buttons
    connectTimeFilters();

    // Connect chart type buttons
    connectChartTypeButtons();
}

// Generate sample historical data
function generateHistoricalData(symbol, days = 30) {
    const data = [];
    const basePrice = getBasePriceForSymbol(symbol);
    const volatility = 0.02; // 2% daily volatility

    const now = new Date();
    for (let i = days; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        // Generate OHLC values with some random variation
        const open = i === days ? basePrice : data[data.length-1].close;
        const high = open * (1 + Math.random() * volatility);
        const low = open * (1 - Math.random() * volatility);
        const close = (high + low) / 2 + (Math.random() - 0.5) * volatility * open;

        // Generate volume with some random variation
        const volume = Math.floor(Math.random() * 1000000) + 500000;

        data.push({
            date: date,
            timestamp: date.getTime(),
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(close.toFixed(2)),
            volume: volume
        });
    }

    return data;
}

// Get base price for symbol (demo values)
function getBasePriceForSymbol(symbol) {
    const demoPrices = {
        'AAPL': 187.42,
        'MSFT': 328.39,
        'GOOGL': 142.56,
        'AMZN': 175.89,
        'TSLA': 172.63,
        'META': 485.58,
        'NVDA': 903.63,
        'JPM': 198.78,
        'V': 279.34,
        'WMT': 59.83
    };
    return demoPrices[symbol] || 100;
}

// Prepare chart data structure
function getChartData() {
    const colors = ChartConfig.getThemeColors();

    return {
        labels: historicalData.map(item => item.date),
        datasets: [
            {
                label: currentSymbol,
                data: historicalData.map(item => ({
                    x: item.date,
                    o: item.open,
                    h: item.high,
                    l: item.low,
                    c: item.close
                })),
                color: {
                    up: colors.up,
                    down: colors.down,
                    unchanged: colors.unchanged
                }
            },
            {
                label: '20 Day MA',
                data: calculateSMA(historicalData.map(item => item.close), 20),
                borderColor: '#f59e0b',
                borderWidth: 1.5,
                pointRadius: 0,
                borderDash: [3, 3],
                fill: false
            },
            {
                label: '50 Day MA',
                data: calculateSMA(historicalData.map(item => item.close), 50),
                borderColor: '#ef4444',
                borderWidth: 1.5,
                pointRadius: 0,
                borderDash: [3, 3],
                fill: false
            }
        ]
    };
}

// Calculate Simple Moving Average
function calculateSMA(data, window) {
    const result = [];

    // Fill with null for the first window-1 points
    for (let i = 0; i < window - 1; i++) {
        result.push(null);
    }

    // Calculate SMA for the rest
    for (let i = window - 1; i < data.length; i++) {
        let sum = 0;
        for (let j = 0; j < window; j++) {
            sum += data[i - j];
        }
        result.push(sum / window);
    }

    return result;
}

// Get chart options
function getChartOptions() {
    const colors = ChartConfig.getThemeColors();

    // Calculate price range for better y-axis scaling
    const allPrices = historicalData.flatMap(item => [item.high, item.low]);
    const minPrice = Math.min(...allPrices) * 0.99;
    const maxPrice = Math.max(...allPrices) * 1.01;

    return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false
        },
        plugins: {
            tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += formatCurrency(context.parsed.y);
                        }
                        return label;
                    }
                }
            },
            legend: {
                display: true,
                position: 'top',
                labels: {
                    color: colors.text,
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            annotation: {
                annotations: {
                    line1: {
                        type: 'line',
                        yMin: historicalData[historicalData.length-1].open,
                        yMax: historicalData[historicalData.length-1].open,
                        borderColor: colors.text,
                        borderWidth: 1,
                        borderDash: [3, 3]
                    }
                }
            }
        },
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'day',
                    displayFormats: {
                        day: 'MMM d'
                    }
                },
                grid: {
                    display: false
                },
                ticks: {
                    color: colors.text,
                    maxRotation: 0
                }
            },
            y: {
                position: 'right',
                min: minPrice,
                max: maxPrice,
                grid: {
                    color: colors.grid
                },
                ticks: {
                    color: colors.text,
                    callback: function(value) {
                        return formatCurrency(value);
                    }
                }
            }
        }
    };
}

// Update chart header with current price info
function updateChartHeader() {
    if (historicalData.length === 0) return;

    const lastDataPoint = historicalData[historicalData.length-1];
    const prevDataPoint = historicalData[historicalData.length-2];
    const priceChange = lastDataPoint.close - prevDataPoint.close;
    const percentChange = (priceChange / prevDataPoint.close) * 100;
    const changeClass = percentChange >= 0 ? 'positive' : 'negative';

    document.getElementById('stock-symbol').textContent = currentSymbol;
    document.getElementById('stock-price-change').innerHTML =
        `${formatCurrency(lastDataPoint.close)} <span class="${changeClass}">${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(2)}%</span>`;
}

// Connect time filter buttons
function connectTimeFilters() {
    const timeButtons = document.querySelectorAll('.time-filters button');

    timeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            timeButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to clicked button
            this.classList.add('active');

            // Get time range
            const range = this.textContent;

            // Generate appropriate data based on range
            let days;
            switch (range) {
                case '1D': days = 1; break;
                case '1W': days = 7; break;
                case '1M': days = 30; break;
                case '3M': days = 90; break;
                case '1Y': days = 365; break;
                case 'ALL': days = 1095; break; // ~3 years
                default: days = 30;
            }

            // Update chart with new data
            updateChartTimeframe(days);
        });
    });
}

// Connect chart type buttons
function connectChartTypeButtons() {
    const chartTypeButtons = document.querySelectorAll('.chart-btn');

    chartTypeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            chartTypeButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to clicked button
            this.classList.add('active');

            // Change chart type
            const chartType = this.dataset.type;
            stockChart.config.type = chartType;
            stockChart.update();
        });
    });
}

// Update chart with new timeframe
function updateChartTimeframe(days) {
    historicalData = generateHistoricalData(currentSymbol, days);

    // Update chart data
    stockChart.data = getChartData();
    stockChart.options = getChartOptions();
    stockChart.update();

    // Update header
    updateChartHeader();
}

// Format currency
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

// Handle theme changes
function handleThemeChange() {
    if (stockChart) {
        stockChart.data = getChartData();
        stockChart.options = getChartOptions();
        stockChart.update();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize with default symbol
    initStockChart('AAPL');

    // Watch for theme changes
    document.documentElement.addEventListener('themeChanged', handleThemeChange);
});

// Export for use in app.js
export { initStockChart, updateChartTimeframe, handleThemeChange };