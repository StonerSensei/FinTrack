document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        window.location.href = 'index.html';
        return;
    }

    let incomeChartInstance = null;
    let expenseChartInstance = null;
    let monthlyChartInstance = null;

    const logoutBtn = document.getElementById('logoutBtn');
    const groupSelect = document.getElementById('groupSelect');
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    const generateReportBtn = document.getElementById('generateReportBtn');
    const reportContent = document.getElementById('reportContent');
    const loadingIndicator = document.getElementById('loadingIndicator');

    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    startDate.valueAsDate = firstDayOfMonth;
    endDate.valueAsDate = today;

    loadUserGroups();

    generateReportBtn.addEventListener('click', generateReport);
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('authToken');
        window.location.href = 'index.html';
    });

    loadUserData();

    async function loadUserData() {
        try {
            const response = await fetch('/api/user/me', {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }

            const userData = await response.json();
            document.querySelector('.user-profile span').textContent = userData.username;
            document.querySelector('.user-profile img').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.username)}&background=4361ee&color=fff`;
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    async function loadUserGroups() {
        try {
            const response = await fetch('/api/groups', {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch groups');
            }

            const groups = await response.json();
            populateGroupSelect(groups);
        } catch (error) {
            console.error('Error loading groups:', error);
        }
    }

    function populateGroupSelect(groups) {
        groupSelect.innerHTML = '<option value="all">All Groups</option>';
        groups.forEach(group => {
            const option = document.createElement('option');
            option.value = group.id;
            option.textContent = group.name;
            groupSelect.appendChild(option);
        });
    }

    async function generateReport() {
        const groupId = groupSelect.value === 'all' ? null : groupSelect.value;
        const start = startDate.value;
        const end = endDate.value;

        loadingIndicator.style.display = 'block';
        reportContent.style.display = 'none';

        try {
            const url = `/api/reports/summary?startDate=${start}&endDate=${end}` +
                        (groupId ? `&groupId=${groupId}` : '');

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to generate report');
            }

            const reportData = await response.json();
            renderReport(reportData);

            const monthlyResponse = await fetch('/api/reports/monthly?monthsBack=6', {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (monthlyResponse.ok) {
                const monthlyData = await monthlyResponse.json();
                renderMonthlyChart(monthlyData);
            }

        } catch (error) {
            console.error('Error generating report:', error);
            alert('Failed to generate report. Please try again.');
        } finally {
            loadingIndicator.style.display = 'none';
            reportContent.style.display = 'block';
        }
    }

    function renderReport(data) {
        animateValue('totalIncome', 0, data.totalIncome, 1000);
        animateValue('totalExpense', 0, data.totalExpense, 1000);
        animateValue('netBalance', 0, data.balance, 1000);

        const balanceCard = document.getElementById('balanceCard');
        if (data.balance >= 0) {
            balanceCard.classList.add('positive');
            balanceCard.classList.remove('negative');
        } else {
            balanceCard.classList.add('negative');
            balanceCard.classList.remove('positive');
        }

        renderPieChart('incomeChart', data.incomeByCategory, 'Income by Category', '#10b981');
        renderPieChart('expenseChart', data.expenseByCategory, 'Expenses by Category', '#ef4444');

        renderTransactionDetails(data.transactions);
    }

    function animateValue(id, start, end, duration) {
        const obj = document.getElementById(id);
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            obj.textContent = '$' + value.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    function renderPieChart(canvasId, data, title, color) {
        const ctx = document.getElementById(canvasId).getContext('2d');

        if (canvasId === 'incomeChart' && incomeChartInstance) {
            incomeChartInstance.destroy();
        } else if (canvasId === 'expenseChart' && expenseChartInstance) {
            expenseChartInstance.destroy();
        }

        const labels = Object.keys(data);
        const values = Object.values(data);
        const backgroundColors = generateColors(labels.length, color);

        const newChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: backgroundColors,
                    borderWidth: 1,
                    borderColor: '#fff'
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
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                family: 'Inter'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(30, 41, 59, 0.95)',
                        titleFont: {
                            family: 'Inter',
                            size: 14,
                            weight: '600'
                        },
                        bodyFont: {
                            family: 'Inter',
                            size: 13
                        },
                        padding: 12,
                        usePointStyle: true,
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                            }
                        }
                    },
                    title: {
                        display: false,
                        text: title
                    }
                },
                onClick: (evt, elements) => {
                    if (elements.length > 0) {
                        const index = elements[0].index;
                        const label = newChart.data.labels[index]; // Fixed: use newChart instead of this
                        console.log('Clicked on:', label);
                    }
                }
            }
        });

        if (canvasId === 'incomeChart') {
            incomeChartInstance = newChart;
        } else if (canvasId === 'expenseChart') {
            expenseChartInstance = newChart;
        }
    }

    function renderMonthlyChart(data) {
        const months = data.map(item => `${item.month} ${item.year}`);
        const incomeData = data.map(item => item.income);
        const expenseData = data.map(item => item.expense);

        if (monthlyChartInstance) {
            monthlyChartInstance.destroy();
        }

        const options = {
            series: [{
                name: 'Income',
                data: incomeData
            }, {
                name: 'Expense',
                data: expenseData
            }],
            chart: {
                type: 'bar',
                height: 350,
                stacked: true,
                toolbar: {
                    show: true
                },
                zoom: {
                    enabled: true
                },
                fontFamily: 'Inter'
            },
            responsive: [{
                breakpoint: 480,
                options: {
                    legend: {
                        position: 'bottom',
                        offsetX: -10,
                        offsetY: 0
                    }
                }
            }],
            plotOptions: {
                bar: {
                    horizontal: false,
                    borderRadius: 4,
                    columnWidth: '55%',
                },
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                show: true,
                width: 2,
                colors: ['transparent']
            },
            xaxis: {
                type: 'category',
                categories: months,
                labels: {
                    style: {
                        fontFamily: 'Inter'
                    }
                }
            },
            yaxis: {
                title: {
                    text: 'Amount ($)',
                    style: {
                        fontFamily: 'Inter'
                    }
                },
                labels: {
                    formatter: function (val) {
                        return "$" + val.toLocaleString();
                    },
                    style: {
                        fontFamily: 'Inter'
                    }
                }
            },
            legend: {
                position: 'right',
                offsetY: 40,
                fontFamily: 'Inter'
            },
            fill: {
                opacity: 1
            },
            colors: ['#10b981', '#ef4444'],
            tooltip: {
                y: {
                    formatter: function (val) {
                        return "$" + val.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        });
                    }
                },
                style: {
                    fontFamily: 'Inter'
                }
            }
        };

        monthlyChartInstance = new ApexCharts(document.querySelector("#monthlyChart"), options);
        monthlyChartInstance.render();
    }

    function renderTransactionDetails(transactions) {
        const tbody = document.getElementById('transactionDetails');
        tbody.innerHTML = '';

        if (transactions.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="5" class="text-center py-4 text-muted">No transactions found for the selected period</td>';
            tbody.appendChild(tr);
            return;
        }

        transactions.forEach(transaction => {
            const tr = document.createElement('tr');

            const date = new Date(transaction.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            const typeBadge = transaction.type === 'INCOME' ?
                '<span class="income-badge"><i class="fas fa-arrow-down"></i> Income</span>' :
                '<span class="expense-badge"><i class="fas fa-arrow-up"></i> Expense</span>';

            const amountClass = transaction.type === 'INCOME' ? 'text-success' : 'text-danger';
            const amountSign = transaction.type === 'INCOME' ? '+' : '-';

            tr.innerHTML = `
                <td>${date}</td>
                <td>${transaction.category}</td>
                <td>${transaction.note || '--'}</td>
                <td>${typeBadge}</td>
                <td class="${amountClass} fw-semibold">${amountSign}$${Math.abs(transaction.amount).toFixed(2)}</td>
            `;

            tbody.appendChild(tr);
        });
    }

    function generateColors(count, baseColor) {

        let r, g, b;
        if (baseColor.startsWith('rgb')) {
            [r, g, b] = baseColor.match(/\d+/g).map(Number);
        } else {
            const hex = baseColor.replace('#', '');
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        }

        const colors = [];
        for (let i = 0; i < count; i++) {
            const brightness = 0.7 + (0.3 * i / count);
            colors.push(
                `rgba(${Math.floor(r * brightness)}, ${Math.floor(g * brightness)}, ${Math.floor(b * brightness)}, 0.8)`
            );
        }
        return colors;
    }
});