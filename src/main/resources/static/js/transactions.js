document.addEventListener('DOMContentLoaded', function() {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        window.location.href = 'index.html';
        return;
    }

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

    const logoutBtn = document.getElementById('logoutBtn');
    const transactionsList = document.getElementById('transactionsList');
    const emptyState = document.getElementById('emptyState');
    const filterType = document.getElementById('filterType');
    const groupName = document.getElementById('groupName');
    const totalIncome = document.getElementById('totalIncome');
    const totalExpenses = document.getElementById('totalExpenses');
    const balance = document.getElementById('balance');

    const urlParams = new URLSearchParams(window.location.search);
    const groupId = urlParams.get('groupId');

    console.log('Group ID from URL:', groupId); // Debug log

    if (groupId) {
        loadGroupTransactions(groupId);
    } else {
        console.error('No group ID provided in URL');
        emptyState.style.display = 'block';
        transactionsList.style.display = 'none';
    }

    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('authToken');
        window.location.href = 'index.html';
    });

    if (filterType) {
        filterType.addEventListener('change', function() {
            if (groupId) {
                loadGroupTransactions(groupId);
            }
        });
    }

    async function loadGroupTransactions(groupId) {
        try {
            console.log('Loading transactions for group:', groupId); // Debug log

            const response = await fetch(`/api/transactions/group/${groupId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response status:', response.status); // Debug log

            if (!response.ok) {
                throw new Error(`Failed to fetch transactions: ${response.status}`);
            }

            const transactions = await response.json();
            console.log('Received transactions:', transactions); // Debug log

            displayTransactions(transactions);
            calculateSummary(transactions);

            if (transactions.length > 0 && transactions[0].group) {
                groupName.textContent = transactions[0].group.name;
            } else {
                await loadGroupName(groupId);
            }
        } catch (error) {
            console.error('Error loading transactions:', error);
            if (emptyState) {
                emptyState.innerHTML = `
                    <div class="empty-illustration">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3>Error Loading Transactions</h3>
                    <p>There was an error loading transactions. Please try again.</p>
                `;
                emptyState.style.display = 'block';
            }
            if (transactionsList) {
                transactionsList.style.display = 'none';
            }
        }
    }

    async function loadGroupName(groupId) {
        try {
            const response = await fetch(`/api/groups`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const groups = await response.json();
                const group = groups.find(g => g.id == groupId);
                if (group && groupName) {
                    groupName.textContent = group.name;
                }
            }
        } catch (error) {
            console.error('Error loading group name:', error);
        }
    }

    function displayTransactions(transactions) {
        const filterValue = filterType ? filterType.value : 'ALL';
        const filteredTransactions = filterValue === 'ALL'
            ? transactions
            : transactions.filter(t => t.type === filterValue);

        console.log('Filtered transactions:', filteredTransactions); // Debug log

        if (filteredTransactions.length === 0) {
            if (emptyState) {
                emptyState.style.display = 'block';
            }
            if (transactionsList) {
                transactionsList.style.display = 'none';
            }
            return;
        }

        if (emptyState) {
            emptyState.style.display = 'none';
        }
        if (transactionsList) {
            transactionsList.style.display = 'table-row-group';
            transactionsList.innerHTML = '';

            filteredTransactions.forEach(transaction => {
                const row = document.createElement('tr');

                const transactionDate = new Date(transaction.date);
                const formattedDate = transactionDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });

                const groupName = transaction.group ? transaction.group.name : 'Unknown Group';

                row.innerHTML = `
                    <td>
                        <div class="transaction-category">
                            <div class="category-icon">
                                <i class="fas ${getCategoryIcon(transaction.category)}"></i>
                            </div>
                            <div>
                                <div>${transaction.category}</div>
                                <small class="text-muted">${groupName}</small>
                            </div>
                        </div>
                    </td>
                    <td>${transaction.note || '-'}</td>
                    <td>${formattedDate}</td>
                    <td class="transaction-amount ${transaction.type.toLowerCase()}">
                        ${transaction.type === 'EXPENSE' ? '-' : ''}₹${transaction.amount.toFixed(2)}
                    </td>
                    <td>
                        <div class="transaction-actions">
                            <button class="action-btn edit" data-id="${transaction.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete" data-id="${transaction.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                `;

                transactionsList.appendChild(row);
            });

            document.querySelectorAll('.action-btn.edit').forEach(btn => {
                btn.addEventListener('click', function() {
                    const transactionId = this.getAttribute('data-id');
                    console.log('Edit transaction:', transactionId);
                });
            });

            document.querySelectorAll('.action-btn.delete').forEach(btn => {
                btn.addEventListener('click', function() {
                    const transactionId = this.getAttribute('data-id');
                    deleteTransaction(transactionId);
                });
            });
        }
    }

    function calculateSummary(transactions) {
        let incomeTotal = 0;
        let expensesTotal = 0;

        transactions.forEach(transaction => {
            if (transaction.type === 'INCOME') {
                incomeTotal += transaction.amount;
            } else {
                expensesTotal += transaction.amount;
            }
        });

        const balanceTotal = incomeTotal - expensesTotal;

        if (totalIncome) totalIncome.textContent = `₹${incomeTotal.toFixed(2)}`;
        if (totalExpenses) totalExpenses.textContent = `₹${expensesTotal.toFixed(2)}`;
        if (balance) balance.textContent = `₹${balanceTotal.toFixed(2)}`;
    }

    function getCategoryIcon(category) {
        const icons = {
            'Salary': 'fa-money-bill-wave',
            'Freelance': 'fa-laptop-code',
            'Rent': 'fa-home',
            'Groceries': 'fa-shopping-basket',
            'Transport': 'fa-bus',
            'Entertainment': 'fa-film',
            'Utilities': 'fa-bolt',
            'Healthcare': 'fa-heartbeat',
            'Education': 'fa-graduation-cap',
            'Other': 'fa-ellipsis-h'
        };

        return icons[category] || 'fa-dollar-sign';
    }

    async function deleteTransaction(transactionId) {
        if (!confirm('Are you sure you want to delete this transaction?')) {
            return;
        }

        try {
            const response = await fetch(`/api/transactions/${transactionId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete transaction');
            }

            if (groupId) {
                loadGroupTransactions(groupId);
            }
        } catch (error) {
            console.error('Error deleting transaction:', error);
            alert('Failed to delete transaction. Please try again.');
        }
    }

    document.getElementById('downloadPdfBtn')?.addEventListener('click', () => downloadReport('pdf'));
    document.getElementById('downloadCsvBtn')?.addEventListener('click', () => downloadReport('csv'));

    async function downloadReport(format) {
        if (!groupId) {
            alert('No group selected');
            return;
        }

        try {
            const response = await fetch(`/api/transactions/group/${groupId}/export?format=${format}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to download ${format} report`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `transactions_${groupName.textContent}_${new Date().toISOString().split('T')[0]}.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(`Error downloading ${format} report:`, error);
            alert(`Failed to download ${format} report. Please try again.`);
        }
    }
});