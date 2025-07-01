document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        window.location.href = 'index.html';
        return;
    }

    // DOM Elements
    const createGroupBtn = document.getElementById('createGroupBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const createTransactionBtn = document.getElementById('createTransactionBtn');
    const generateReportBtn = document.getElementById('generateReportBtn');
    const viewAllBtn = document.getElementById('viewAllBtn');
    const groupSelectionModal = document.getElementById('groupSelectionModal');
    const groupList = document.getElementById('groupList');
    const closeModal = document.querySelector('.close-modal');

    createGroupBtn.addEventListener('click', function() {
        window.location.href = 'groups.html';
    });

    createTransactionBtn.addEventListener('click', function() {
        window.location.href = 'create-transaction.html';
    });

    generateReportBtn.addEventListener('click', function() {
        window.location.href = 'reports.html';
    });

    viewAllBtn.addEventListener('click', async function() {
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

            if (groups.length === 0) {
                alert('No groups available. Please create a group first.');
                window.location.href = 'groups.html';
                return;
            }

            groupList.innerHTML = '';
            groups.forEach(group => {
                const li = document.createElement('li');
                li.innerHTML = `<i class="fas fa-folder"></i> ${group.name}`;
                li.addEventListener('click', function() {
                    window.location.href = `transactions.html?groupId=${group.id}`;
                });
                groupList.appendChild(li);
            });

            groupSelectionModal.style.display = 'block';

        } catch (error) {
            console.error('Error:', error);
            alert('Failed to load groups. Please try again.');
        }
    });

    closeModal.addEventListener('click', function() {
        groupSelectionModal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === groupSelectionModal) {
            groupSelectionModal.style.display = 'none';
        }
    });

    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('authToken');
        window.location.href = 'index.html';
    });

    loadDashboardData();
});

async function loadDashboardData() {
    try {
        const authToken = localStorage.getItem('authToken');

        const userResponse = await fetch('/api/user/me', {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!userResponse.ok) {
            throw new Error('Failed to fetch user data');
        }

        const userData = await userResponse.json();

        document.querySelector('.user-profile span').textContent = userData.username;
        document.querySelector('.user-profile img').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.username)}&background=4361ee&color=fff`;

        const transactionsResponse = await fetch('/api/transactions/recent', {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!transactionsResponse.ok) {
            throw new Error('Failed to fetch recent transactions');
        }

        const transactions = await transactionsResponse.json();
        displayRecentTransactions(transactions);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

function displayRecentTransactions(transactions) {
    const activityList = document.querySelector('.activity-list');

    if (transactions.length === 0) {
        activityList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exchange-alt"></i>
                <h3>No Recent Transactions</h3>
                <p>Your recent transactions will appear here. Start by adding your first transaction.</p>
            </div>
        `;
        return;
    }

    let html = '';
    transactions.forEach(transaction => {
        const colorClass = transaction.type === 'EXPENSE' ? 'expense' : 'income';
        const sign = transaction.type === 'EXPENSE' ? '-' : '+';
        const icon = transaction.type === 'EXPENSE' ? 'fa-arrow-up' : 'fa-arrow-down';
        const date = new Date(transaction.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });

        html += `
            <div class="transaction-item ${colorClass}">
                <div class="transaction-info">
                    <span class="transaction-category">
                        <i class="fas ${icon}"></i>
                        ${transaction.category}
                    </span>
                    <span class="transaction-note">${transaction.note || ''}</span>
                    <span class="transaction-date">${date}</span>
                </div>
                <div class="transaction-amount">
                    ${sign}$${Math.abs(transaction.amount).toFixed(2)}
                </div>
            </div>
        `;
    });

    activityList.innerHTML = html;
}