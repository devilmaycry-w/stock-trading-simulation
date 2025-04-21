// ===== Constants =====
//const API_BASE = 'https://68a8-2401-4900-7c15-f7d8-cd83-3f55-98c2-2164.ngrok-free.app/api';
const API_BASE = 'http://192.168.97.73:8080/api'// Backend API base URL
const DEMO_MODE = false; // Set to false for backend integration
const INITIAL_CASH = 10000; // Starting cash

// ===== State =====
let currentUser = null;
let selectedStock = null;
let stocks = [];
let portfolio = {
    cash: INITIAL_CASH,
    holdings: {},
    value: INITIAL_CASH
};
let watchlist = [];
let priceUpdateInterval = null;
let stockChart = null;
let socket = null;

// ===== DOM Elements =====
const themeToggle = document.getElementById('theme-toggle');
const stockSelect = document.getElementById('stock-select');
const currentPriceDisplay = document.getElementById('current-price');
const priceChangeDisplay = document.getElementById('price-change');
const orderQuantity = document.getElementById('order-quantity');
const orderType = document.getElementById('order-type');
const limitPriceGroup = document.getElementById('limit-price-group');
const limitPrice = document.getElementById('limit-price');
const buyBtn = document.getElementById('buy-btn');
const sellBtn = document.getElementById('sell-btn');
const portfolioValue = document.getElementById('portfolio-value');
const dailyChange = document.getElementById('daily-change');
const totalProfit = document.getElementById('total-profit');
const availableCash = document.getElementById('available-cash');
const userEmail = document.getElementById('user-email');
const userName = document.getElementById('user-name');
const userAvatar = document.getElementById('user-avatar');
const holdingsBody = document.getElementById('holdings-body');
const watchlistBody = document.getElementById('watchlist-body');
const globalToast = document.getElementById('global-toast');
const navDashboard = document.getElementById('nav-dashboard');
const navTrade = document.getElementById('nav-trade');
const navPortfolio = document.getElementById('nav-portfolio');
const navWatchlist = document.getElementById('nav-watchlist');
const navSettings = document.getElementById('nav-settings');
const dashboardView = document.getElementById('dashboard-view');
const watchlistView = document.getElementById('watchlist-view');
const settingsView = document.getElementById('settings-view');
const addWatchlistModal = document.getElementById('add-watchlist-modal');
const confirmAddWatchlist = document.getElementById('confirm-add-watchlist');
const closeModalButtons = document.querySelectorAll('.close-modal');
const stockSearch = document.getElementById('stock-search');
const watchlistSearch = document.getElementById('watchlist-search');
const addToWatchlistBtn = document.getElementById('add-to-watchlist');
const watchlistSymbol = document.getElementById('watchlist-symbol');
const timeFilters = document.querySelectorAll('.time-filters button');
const chartTypeButtons = document.querySelectorAll('.chart-btn');
const technicalIndicator = document.getElementById('technical-indicator');
const logoutBtn = document.getElementById('logout-btn');

// ===== Utility Functions =====
function showToast(message, type = 'success') {
    globalToast.textContent = message;
    globalToast.className = `toast ${type} show`;
    setTimeout(() => globalToast.classList.remove('show'), 3000);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatPercent(amount) {
    return new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 2 }).format(amount / 100);
}

function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return hsl(${hue}, 70%, 60%);
}

function toggleModal(modal, show) {
    if (show) {
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.add('show'), 10);
    } else {
        modal.classList.remove('show');
        setTimeout(() => modal.classList.add('hidden'), 200);
    }
}

function updateBadge(id, count) {
    const badge = document.getElementById(id);
    if (badge) {
        badge.textContent = count;
        badge.classList.toggle('active', count > 0);
    }
}

// ===== Auth Functions =====
async function loadCurrentUser() {
    const token = localStorage.getItem('jwt');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) {
        if (!DEMO_MODE) {
            showToast('User not logged in. Redirecting to login...', 'warning');
            setTimeout(() => window.location.href = 'login.html', 2000);
            return;
        }
        currentUser = {
            email: 'demo@tradepro.com',
            name: 'Demo User'
        };
        userEmail.textContent = currentUser.email;
        userName.textContent = currentUser.name;
        userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
        userAvatar.style.backgroundColor = stringToColor(currentUser.email);
        return;
    }

    try {
        currentUser = parseJwt(token);
        if (currentUser) {
            userEmail.textContent = currentUser.email;
            userName.textContent = currentUser.name;
            const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
            userAvatar.textContent = initials;
            userAvatar.style.backgroundColor = stringToColor(currentUser.email);
            console.log('User loaded:', currentUser);
        } else {
            throw new Error('Failed to parse JWT');
        }
    } catch (error) {
        console.error('Failed to parse user details from JWT:', error);
        showToast('Error loading user details. Please log in again.', 'error');
        setTimeout(() => window.location.href = 'login.html', 2000);
    }
}

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64).split('').map(c =>
                '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join('')
        );

        const payload = JSON.parse(jsonPayload);
        console.log('JWT payload:', payload);
        return {
            email: payload.sub,
            name: payload.sub.split('@')[0] || 'User',
            userId: payload.userId || localStorage.getItem('userId')
        };
    } catch (e) {
        console.error('Error parsing JWT:', e);
        return null;
    }
}

function handleLogout() {
    localStorage.removeItem('jwt');
    localStorage.removeItem('userId');
    localStorage.removeItem('portfolio');
    localStorage.removeItem('watchlist');
    showToast('Logged out successfully', 'success');
    setTimeout(() => window.location.href = 'login.html', 1000);
}

// ===== Data Service =====
const DataService = {
    async init() {
        await this.loadStocks();
        if (DEMO_MODE) {
            this.startPriceUpdates();
        } else {
            setInterval(() => this.loadStocks(), 60000);
        }
    },

    async loadStocks() {
        try {
            stocks = DEMO_MODE ? this.getDemoStocks() : await this.fetchStocks();
            if (stocks.length === 0) {
                showToast('No stocks retrieved from database', 'warning');
                return;
            }
            this.populateStockSelect();
            if (!selectedStock && stocks.length > 0) {
                selectedStock = stocks[0];
                this.updateStockDisplay(selectedStock);
                initStockChart();
            }
        } catch (error) {
            console.error('Error loading stocks:', error);
            showToast('Failed to load stock data', 'error');
        }
    },

    async fetchStocks() {
        const token = localStorage.getItem('jwt');
        if (!token && !DEMO_MODE) {
            showToast('Authentication required', 'error');
            return [];
        }

        try {
            console.log('Fetching stocks from:', ${API_BASE}/stocks);
            const response = await fetch(${API_BASE}/stocks, {
                headers: {
                    'Authorization': Bearer ${token},
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.text();
                showToast(Failed to fetch stocks: ${error}, 'error');
                return [];
            }

            const data = await response.json();
            if (!Array.isArray(data)) {
                showToast('Invalid stocks data received', 'error');
                return [];
            }

            const validStocks = data.filter(stock =>
                stock.symbol && stock.name && stock.price !== undefined
            );
            if (validStocks.length === 0) {
                showToast('No valid stocks found in response', 'warning');
            }
            return validStocks;
        } catch (error) {
            console.error('Error fetching stocks:', error);
            showToast('Network error while fetching stocks', 'error');
            return [];
        }
    },

    populateStockSelect() {
        stockSelect.innerHTML = '<option value="">Select Stock</option>';
        stocks.forEach(stock => {
            const option = document.createElement('option');
            option.value = stock.symbol;
            option.textContent = ${stock.symbol} - ${stock.name};
            stockSelect.appendChild(option);
        });
    },

    updateStockDisplay(stock) {
        if (!stock) return;
        const prevPrice = selectedStock?.price || stock.price;
        currentPriceDisplay.textContent = formatCurrency(stock.price);
        priceChangeDisplay.textContent = ${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}%;
        priceChangeDisplay.className = change ${stock.change >= 0 ? 'positive' : 'negative'};

        if (stock.price > prevPrice) {
            currentPriceDisplay.classList.add('pulse-up');
            setTimeout(() => currentPriceDisplay.classList.remove('pulse-up'), 500);
        } else if (stock.price < prevPrice) {
            currentPriceDisplay.classList.add('pulse-down');
            setTimeout(() => currentPriceDisplay.classList.remove('pulse-down'), 500);
        }

        if (stockChart && selectedStock && stock.symbol === selectedStock.symbol) {
            const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            stockChart.data.labels.push(now);
            stockChart.data.datasets[0].data.push(stock.price);
            if (stockChart.data.labels.length > 50) {
                stockChart.data.labels.shift();
                stockChart.data.datasets[0].data.shift();
            }
            stockChart.update();
        }
    },

    getStockBySymbol(symbol) {
        return stocks.find(stock => stock.symbol === symbol);
    },

    searchStocks(query) {
        if (!query) return stocks;
        const lowerQuery = query.toLowerCase();
        return stocks.filter(stock =>
            stock.symbol.toLowerCase().includes(lowerQuery) ||
            stock.name.toLowerCase().includes(lowerQuery)
        );
    },

    getDemoStocks() {
        return [
            { symbol: 'AAPL', name: 'Apple Inc.', price: 187.42, prevClose: 185.12, change: 1.24 },
            { symbol: 'MSFT', name: 'Microsoft Corp.', price: 328.39, prevClose: 325.71, change: 0.82 },
            { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.56, prevClose: 141.89, change: 0.47 },
            { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 128.45, prevClose: 127.12, change: 1.05 },
            { symbol: 'TSLA', name: 'Tesla Inc.', price: 172.63, prevClose: 170.89, change: 1.02 }
        ];
    },

    startPriceUpdates() {
        if (priceUpdateInterval) clearInterval(priceUpdateInterval);
        priceUpdateInterval = setInterval(() => {
            stocks.forEach(stock => {
                const change = (Math.random() - 0.5) * 2;
                stock.prevPrice = stock.price;
                stock.price = Math.max(1, stock.price + change);
                stock.change = ((stock.price - stock.prevClose) / stock.prevClose) * 100;

                if (selectedStock && selectedStock.symbol === stock.symbol) {
                    this.updateStockDisplay(stock);
                    selectedStock = { ...stock };
                }

                if (portfolio.holdings[stock.symbol]) {
                    PortfolioManager.updatePortfolio();
                }
            });
        }, 3000);
    }
};

// ===== Portfolio Manager =====
const PortfolioManager = {
    async init() {
        await this.loadPortfolio();
        this.updatePortfolio();
    },

    async loadPortfolio() {
        if (DEMO_MODE) {
            portfolio.holdings['AAPL'] = {
                shares: 10,
                avgCost: 150.00,
                currentPrice: 187.42,
                value: 10 * 187.42,
                profit: 10 * (187.42 - 150.00)
            };
            portfolio.holdings['MSFT'] = {
                shares: 5,
                avgCost: 300.00,
                currentPrice: 328.39,
                value: 5 * 328.39,
                profit: 5 * (328.39 - 300.00)
            };
            localStorage.setItem('portfolio', JSON.stringify(portfolio));
            this.updatePortfolio();
        } else {
            try {
                const token = localStorage.getItem('jwt');
                const userId = currentUser?.userId || localStorage.getItem('userId');
                if (!token || !userId) {
                    showToast('Authentication incomplete. Please log in again.', 'error');
                    setTimeout(() => window.location.href = 'login.html', 2000);
                    throw new Error('Missing token or userId');
                }
                console.log('Fetching portfolio for userId:', userId);
                const response = await fetch(${API_BASE}/users/${userId}/portfolio, {
                    headers: {
                        'Authorization': Bearer ${token},
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(Failed to fetch portfolio: ${errorText});
                }
                const data = await response.json(); // { holdings: { [symbol]: { quantity, averagePrice } } }
                console.log('Portfolio response:', data);
                const savedPortfolio = JSON.parse(localStorage.getItem('portfolio') || '{}');
                portfolio.cash = savedPortfolio.cash || INITIAL_CASH;
                portfolio.holdings = {};
                Object.keys(data.holdings || {}).forEach(symbol => {
                    const item = data.holdings[symbol];
                    if (item.quantity > 0) {
                        portfolio.holdings[symbol] = {
                            shares: item.quantity,
                            avgCost: item.averagePrice,
                            currentPrice: 0,
                            value: 0,
                            profit: 0,
                            dailyChange: 0
                        };
                    }
                });
                portfolio.value = portfolio.cash;
                localStorage.setItem('portfolio', JSON.stringify(portfolio));
                this.updatePortfolio();
            } catch (error) {
                console.error('Error loading portfolio:', error);
                showToast('Failed to load portfolio, using local data', 'warning');
                const savedPortfolio = localStorage.getItem('portfolio');
                if (savedPortfolio) {
                    portfolio = JSON.parse(savedPortfolio);
                } else {
                    portfolio = {
                        cash: INITIAL_CASH,
                        holdings: {},
                        value: INITIAL_CASH
                    };
                    localStorage.setItem('portfolio', JSON.stringify(portfolio));
                }
                this.updatePortfolio();
            }
        }
    },

    updatePortfolio() {
        let totalValue = portfolio.cash;
        let totalProfitValue = 0;
        let dailyChangeValue = 0;

        Object.keys(portfolio.holdings).forEach(symbol => {
            const stock = DataService.getStockBySymbol(symbol);
            if (stock) {
                const holding = portfolio.holdings[symbol];
                holding.currentPrice = stock.price;
                holding.value = holding.shares * stock.price;
                holding.profit = holding.shares * (stock.price - holding.avgCost);
                holding.dailyChange = holding.shares * (stock.price - (stock.prevClose || stock.price));

                totalValue += holding.value;
                totalProfitValue += holding.profit;
                dailyChangeValue += holding.dailyChange;
            }
        });

        portfolio.value = totalValue;
        const prevValue = totalValue - dailyChangeValue || totalValue;
        const dailyChangePercent = prevValue > 0 ? (dailyChangeValue / prevValue) * 100 : 0;

        portfolioValue.textContent = formatCurrency(totalValue);
        totalProfit.textContent = formatCurrency(totalProfitValue);
        availableCash.textContent = formatCurrency(portfolio.cash);
        dailyChange.textContent = ${dailyChangePercent >= 0 ? '+' : ''}${dailyChangePercent.toFixed(2)}%;
        dailyChange.className = metric ${dailyChangePercent >= 0 ? 'positive' : 'negative'};

        this.updateHoldingsTable();
    },

    updateHoldingsTable() {
        holdingsBody.innerHTML = '';
        Object.keys(portfolio.holdings).forEach(symbol => {
            const holding = portfolio.holdings[symbol];
            const stock = DataService.getStockBySymbol(symbol);
            if (!stock) return;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${symbol}</strong><br><small>${stock.name}</small></td>
                <td>${holding.shares}</td>
                <td>${formatCurrency(holding.avgCost)}</td>
                <td>${formatCurrency(stock.price)}</td>
                <td>${formatCurrency(holding.value)}</td>
                <td class="${holding.profit >= 0 ? 'positive-change' : 'negative-change'}">
                    ${formatCurrency(holding.profit)} (${formatPercent(holding.profit / (holding.shares * holding.avgCost) || 0)})
                </td>
                <td class="table-actions">
                    <button class="trade-btn" data-symbol="${symbol}" data-action="buy"><i class="fas fa-arrow-up"></i></button>
                    <button class="trade-btn" data-symbol="${symbol}" data-action="sell"><i class="fas fa-arrow-down"></i></button>
                    <button class="remove-btn" data-symbol="${symbol}"><i class="fas fa-trash"></i></button>
                </td>
            `;
            holdingsBody.appendChild(row);
        });

        document.querySelectorAll('.trade-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const symbol = e.target.closest('button').dataset.symbol;
                const action = e.target.closest('button').dataset.action;
                this.handleQuickTrade(symbol, action);
            });
        });

        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const symbol = e.target.closest('button').dataset.symbol;
                delete portfolio.holdings[symbol];
                localStorage.setItem('portfolio', JSON.stringify(portfolio));
                this.updatePortfolio();
                showToast(Removed ${symbol} from holdings, 'success');
            });
        });
    },

    async executeOrder(symbol, action, quantity, price, orderType = 'market') {
        if (!symbol || !quantity || quantity <= 0) {
            showToast('Invalid order parameters', 'error');
            return false;
        }

        const stock = DataService.getStockBySymbol(symbol);
        if (!stock) {
            showToast('Stock not found', 'error');
            return false;
        }

        const orderPrice = orderType === 'limit' ? parseFloat(price) : stock.price;
        if (orderType === 'limit' && (isNaN(orderPrice) || orderPrice <= 0)) {
            showToast('Invalid limit price', 'error');
            return false;
        }

        const totalCost = orderPrice * quantity;

        try {
            if (DEMO_MODE) {
                if (action === 'buy' && totalCost > portfolio.cash) {
                    showToast('Not enough cash for this order', 'error');
                    return false;
                }
                if (action === 'sell' && (!portfolio.holdings[symbol] || portfolio.holdings[symbol].shares < quantity)) {
                    showToast('Not enough shares to sell', 'error');
                    return false;
                }

                if (action === 'buy') {
                    portfolio.cash -= totalCost;
                    if (portfolio.holdings[symbol]) {
                        const current = portfolio.holdings[symbol];
                        const newAvg = ((current.avgCost * current.shares) + (orderPrice * quantity)) / (current.shares + quantity);
                        portfolio.holdings[symbol] = {
                            shares: current.shares + quantity,
                            avgCost: newAvg,
                            currentPrice: stock.price,
                            value: (current.shares + quantity) * stock.price,
                            profit: (current.shares + quantity) * (stock.price - newAvg)
                        };
                    } else {
                        portfolio.holdings[symbol] = {
                            shares: quantity,
                            avgCost: orderPrice,
                            currentPrice: stock.price,
                            value: quantity * stock.price,
                            profit: quantity * (stock.price - orderPrice)
                        };
                    }
                } else {
                    portfolio.cash += totalCost;
                    portfolio.holdings[symbol].shares -= quantity;
                    if (portfolio.holdings[symbol].shares <= 0) {
                        delete portfolio.holdings[symbol];
                    } else {
                        portfolio.holdings[symbol].value = portfolio.holdings[symbol].shares * stock.price;
                        portfolio.holdings[symbol].profit = portfolio.holdings[symbol].shares * (stock.price - portfolio.holdings[symbol].avgCost);
                    }
                }

                localStorage.setItem('portfolio', JSON.stringify(portfolio));
                this.updatePortfolio();
                showToast(Successfully ${action === 'buy' ? 'bought' : 'sold'} ${quantity} shares of ${symbol}, 'success');
                return true;
            } else {
                const userId = currentUser?.userId || localStorage.getItem('userId');
                if (!userId) {
                    showToast('User authentication incomplete. Please log in again.', 'error');
                    setTimeout(() => window.location.href = 'login.html', 2000);
                    return false;
                }
                const response = await fetch(${API_BASE}/orders, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': Bearer ${localStorage.getItem('jwt')}
                    },
                    body: JSON.stringify({
                        userId: userId,
                        stockSymbol: symbol,
                        quantity,
                        type: action.toUpperCase(),
                        price: orderPrice,
                        orderType: orderType.toUpperCase()
                    })
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Order failed');
                }

                // Update cash locally
                if (action === 'buy') {
                    portfolio.cash -= totalCost;
                } else {
                    portfolio.cash += totalCost;
                }
                localStorage.setItem('portfolio', JSON.stringify(portfolio));

                await this.loadPortfolio();
                this.updatePortfolio();
                showToast(Order executed: ${action} ${quantity} shares of ${symbol}, 'success');
                return true;
            }
        } catch (error) {
            console.error('Order error:', error);
            showToast(Order failed: ${error.message}, 'error');
            return false;
        }
    },

    handleQuickTrade(symbol, action) {
        const stock = DataService.getStockBySymbol(symbol);
        if (!stock) return;

        stockSelect.value = symbol;
        selectedStock = { ...stock };
        DataService.updateStockDisplay(selectedStock);
        initStockChart();

        orderQuantity.focus();
        orderQuantity.select();

        if (action === 'buy') {
            showToast(Ready to buy ${symbol}. Enter quantity and click Buy., 'success');
        } else {
            const maxShares = portfolio.holdings[symbol]?.shares || 0;
            orderQuantity.value = maxShares;
            showToast(Ready to sell ${symbol}. Adjust quantity if needed and click Sell., 'success');
        }
    }
};

// ===== Watchlist Manager =====
const WatchlistManager = {
    init() {
        this.loadWatchlist();
    },

    loadWatchlist() {
        const savedWatchlist = localStorage.getItem('watchlist');
        if (savedWatchlist) {
            watchlist = JSON.parse(savedWatchlist);
            this.updateWatchlistTable();
            updateBadge('watchlist-badge', watchlist.length);
        }
    },

    updateWatchlistTable() {
        watchlistBody.innerHTML = '';
        watchlist.forEach(symbol => {
            const stock = DataService.getStockBySymbol(symbol);
            if (!stock) return;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${symbol}</strong><br><small>${stock.name}</small></td>
                <td>${formatCurrency(stock.price)}</td>
                <td class="${stock.change >= 0 ? 'positive-change' : 'negative-change'}">
                    ${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}%
                </td>
                <td>${Math.floor(Math.random() * 10000000).toLocaleString()}</td>
                <td>${formatCurrency(Math.random() * 500000000000)}</td>
                <td class="table-actions">
                    <button class="trade-btn" data-symbol="${symbol}" data-action="buy"><i class="fas fa-arrow-up"></i></button>
                    <button class="remove-btn" data-symbol="${symbol}"><i class="fas fa-trash"></i></button>
                </td>
            `;
            watchlistBody.appendChild(row);
        });

        document.querySelectorAll('.trade-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const symbol = e.target.closest('button').dataset.symbol;
                const action = e.target.closest('button').dataset.action;
                PortfolioManager.handleQuickTrade(symbol, action);
            });
        });

        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const symbol = e.target.closest('button').dataset.symbol;
                this.removeFromWatchlist(symbol);
            });
        });
    },

    async addToWatchlist(symbol) {
        if (!symbol) {
            showToast('Please enter a stock symbol', 'error');
            return false;
        }

        symbol = symbol.toUpperCase();
        if (watchlist.includes(symbol)) {
            showToast(${symbol} is already in your watchlist, 'error');
            return false;
        }

        const stock = DataService.getStockBySymbol(symbol);
        if (!stock) {
            showToast(Could not find stock with symbol ${symbol}, 'error');
            return false;
        }

        try {
            if (DEMO_MODE) {
                watchlist.push(symbol);
                localStorage.setItem('watchlist', JSON.stringify(watchlist));
                this.updateWatchlistTable();
                updateBadge('watchlist-badge', watchlist.length);
                showToast(Added ${symbol} to watchlist, 'success');
                return true;
            } else {
                const response = await fetch(${API_BASE}/watchlist, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': Bearer ${localStorage.getItem('jwt')}
                    },
                    body: JSON.stringify({ symbol })
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to add to watchlist');
                }

                watchlist.push(symbol);
                localStorage.setItem('watchlist', JSON.stringify(watchlist));
                this.updateWatchlistTable();
                updateBadge('watchlist-badge', watchlist.length);
                showToast(Added ${symbol} to watchlist, 'success');
                return true;
            }
        } catch (error) {
            showToast(Failed to add to watchlist: ${error.message}, 'error');
            return false;
        }
    },

    async removeFromWatchlist(symbol) {
        try {
            if (DEMO_MODE) {
                watchlist = watchlist.filter(item => item !== symbol);
                localStorage.setItem('watchlist', JSON.stringify(watchlist));
                this.updateWatchlistTable();
                updateBadge('watchlist-badge', watchlist.length);
                showToast(Removed ${symbol} from watchlist, 'success');
                return true;
            } else {
                const response = await fetch(${API_BASE}/watchlist/${symbol}, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': Bearer ${localStorage.getItem('jwt')}
                    }
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to remove from watchlist');
                }

                watchlist = watchlist.filter(item => item !== symbol);
                localStorage.setItem('watchlist', JSON.stringify(watchlist));
                this.updateWatchlistTable();
                updateBadge('watchlist-badge', watchlist.length);
                showToast(Removed ${symbol} from watchlist, 'success');
                return true;
            }
        } catch (error) {
            showToast(Failed to remove from watchlist: ${error.message}, 'error');
            return false;
        }
    }
};

// ===== Theme Manager =====
const ThemeManager = {
    init() {
        this.loadTheme();
    },

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        if (themeToggle) {
            themeToggle.innerHTML = savedTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        }
        if (document.getElementById('theme-select')) {
            document.getElementById('theme-select').value = savedTheme;
        }
    },

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    },

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (themeToggle) {
            themeToggle.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        }
        if (stockChart) {
            stockChart.destroy();
            initStockChart();
        }
    }
};

// ===== Navigation Manager =====
const NavigationManager = {
    init() {
        this.setupEventListeners();
    },

    setupEventListeners() {
        navDashboard.addEventListener('click', (e) => {
            e.preventDefault();
            this.showView('dashboard');
        });

        navTrade.addEventListener('click', (e) => {
            e.preventDefault();
            this.showView('dashboard');
            document.querySelector('.trading-panel').scrollIntoView({ behavior: 'smooth' });
        });

        navPortfolio.addEventListener('click', (e) => {
            e.preventDefault();
            this.showView('dashboard');
            document.querySelector('.portfolio-holdings').scrollIntoView({ behavior: 'smooth' });
        });

        navWatchlist.addEventListener('click', (e) => {
            e.preventDefault();
            this.showView('watchlist');
        });

        navSettings.addEventListener('click', (e) => {
            e.preventDefault();
            this.showView('settings');
        });
    },

    showView(viewName) {
        dashboardView.style.display = 'none';
        watchlistView.style.display = 'none';
        settingsView.style.display = 'none';

        navDashboard.classList.remove('active');
        navTrade.classList.remove('active');
        navPortfolio.classList.remove('active');
        navWatchlist.classList.remove('active');
        navSettings.classList.remove('active');

        switch(viewName) {
            case 'dashboard':
                dashboardView.style.display = 'grid';
                navDashboard.classList.add('active');
                break;
            case 'watchlist':
                watchlistView.style.display = 'block';
                navWatchlist.classList.add('active');
                break;
            case 'settings':
                settingsView.style.display = 'block';
                navSettings.classList.add('active');
                break;
        }
    }
};

// ===== Chart Functions =====
function initStockChart() {
    const ctx = document.getElementById('stock-chart').getContext('2d');
    if (stockChart) {
        stockChart.destroy();
    }

    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    const chartType = document.querySelector('.chart-btn.active')?.dataset.type || 'line';

    stockChart = new Chart(ctx, {
        type: chartType === 'candlestick' ? 'line' : chartType, // Fallback to line if candlestick not supported
        data: {
            labels: selectedStock ? Array(20).fill('').map((_, i) => {
                const d = new Date();
                d.setMinutes(d.getMinutes() - 20 + i);
                return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }) : [],
            datasets: [{
                label: selectedStock ? ${selectedStock.symbol} Price : 'Price',
                data: selectedStock ? Array(20).fill(0).map(() => {
                    const base = selectedStock.price;
                    return base + (Math.random() - 0.5) * base * 0.05;
                }) : [],
                borderColor: isDarkMode ? '#4f46e5' : '#4f46e5',
                backgroundColor: isDarkMode ? 'rgba(79, 70, 229, 0.2)' : 'rgba(79, 70, 229, 0.1)',
                fill: chartType === 'line',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: isDarkMode ? '#94a3b8' : '#64748b' }
                },
                y: {
                    grid: { color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' },
                    ticks: {
                        color: isDarkMode ? '#94a3b8' : '#64748b',
                        callback: value => formatCurrency(value)
                    }
                }
            },
            plugins: {
                legend: { labels: { color: isDarkMode ? '#f8fafc' : '#1e293b' } },
                tooltip: {
                    callbacks: {
                        label: context => ${context.dataset.label}: ${formatCurrency(context.parsed.y)}
                    }
                }
            }
        }
    });

    const indicator = technicalIndicator.value;
    if (indicator) {
        showToast(Applied ${indicator.toUpperCase()} indicator, 'success');
    }
}

// ===== Event Listeners =====
function setupEventListeners() {
    themeToggle?.addEventListener('click', () => ThemeManager.toggleTheme());

    stockSelect?.addEventListener('change', (e) => {
        const symbol = e.target.value;
        selectedStock = DataService.getStockBySymbol(symbol);
        if (selectedStock) {
            DataService.updateStockDisplay(selectedStock);
            initStockChart();
        }
    });

    orderType?.addEventListener('change', (e) => {
        limitPriceGroup.style.display = e.target.value === 'limit' ? 'block' : 'none';
    });

    buyBtn?.addEventListener('click', async () => {
        const symbol = stockSelect.value;
        const quantity = parseInt(orderQuantity.value);
        const orderTypeValue = orderType.value;
        if (!symbol || !quantity) {
            showToast('Please select a stock and quantity', 'error');
            return;
        }
        await PortfolioManager.executeOrder(symbol, 'buy', quantity, limitPrice.value, orderTypeValue);
    });

    sellBtn?.addEventListener('click', async () => {
        const symbol = stockSelect.value;
        const quantity = parseInt(orderQuantity.value);
        const orderTypeValue = orderType.value;
        if (!symbol || !quantity) {
            showToast('Please select a stock and quantity', 'error');
            return;
        }
        await PortfolioManager.executeOrder(symbol, 'sell', quantity, limitPrice.value, orderTypeValue);
    });

    stockSearch?.addEventListener('input', (e) => {
        const query = e.target.value;
        const filteredStocks = DataService.searchStocks(query);
        stockSelect.innerHTML = '<option value="">Select Stock</option>';
        filteredStocks.forEach(stock => {
            const option = document.createElement('option');
            option.value = stock.symbol;
            option.textContent = ${stock.symbol} - ${stock.name};
            stockSelect.appendChild(option);
        });
    });

    watchlistSearch?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        watchlistBody.innerHTML = '';
        watchlist.filter(symbol => symbol.toLowerCase().includes(query)).forEach(symbol => {
            const stock = DataService.getStockBySymbol(symbol);
            if (stock) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><strong>${symbol}</strong><br><small>${stock.name}</small></td>
                    <td>${formatCurrency(stock.price)}</td>
                    <td class="${stock.change >= 0 ? 'positive-change' : 'negative-change'}">
                        ${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}%
                    </td>
                    <td>${Math.floor(Math.random() * 10000000).toLocaleString()}</td>
                    <td>${formatCurrency(Math.random() * 500000000000)}</td>
                    <td class="table-actions">
                        <button class="trade-btn" data-symbol="${symbol}" data-action="buy"><i class="fas fa-arrow-up"></i></button>
                        <button class="remove-btn" data-symbol="${symbol}"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                watchlistBody.appendChild(row);
            }
        });

        document.querySelectorAll('.trade-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const symbol = e.target.closest('button').dataset.symbol;
                const action = e.target.closest('button').dataset.action;
                PortfolioManager.handleQuickTrade(symbol, action);
            });
        });

        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const symbol = e.target.closest('button').dataset.symbol;
                WatchlistManager.removeFromWatchlist(symbol);
            });
        });
    });

    addToWatchlistBtn?.addEventListener('click', () => toggleModal(addWatchlistModal, true));

    confirmAddWatchlist?.addEventListener('click', async () => {
        const symbol = watchlistSymbol.value.trim();
        const success = await WatchlistManager.addToWatchlist(symbol);
        if (success) {
            toggleModal(addWatchlistModal, false);
            watchlistSymbol.value = '';
        }
    });

    closeModalButtons?.forEach(btn => {
        btn.addEventListener('click', () => toggleModal(addWatchlistModal, false));
    });

    timeFilters?.forEach(btn => {
        btn.addEventListener('click', (e) => {
            timeFilters.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            initStockChart(); // Re-render chart with new time range (placeholder)
        });
    });

    chartTypeButtons?.forEach(btn => {
        btn.addEventListener('click', (e) => {
            chartTypeButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            initStockChart();
        });
    });

    technicalIndicator?.addEventListener('change', () => {
        initStockChart();
    });

    logoutBtn?.addEventListener('click', handleLogout);
}

// ===== Initialization =====
async function init() {
    await loadCurrentUser();
    await DataService.init();
    await PortfolioManager.init();
    WatchlistManager.init();
    ThemeManager.init();
    NavigationManager.init();
    setupEventListeners();
}

document.addEventListener('DOMContentLoaded', init);