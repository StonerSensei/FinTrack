document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
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

    // DOM Elements
    const logoutBtn = document.getElementById('logoutBtn');
    const transactionForm = document.getElementById('transactionForm');
    const groupSelect = document.getElementById('group');

    // Set default date to today
    document.getElementById('date').valueAsDate = new Date();

    // Fetch groups from API
    fetchGroups();

    // Event Listeners
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('authToken');
        window.location.href = 'index.html';
    });

    transactionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        createTransaction();
    });

    // Functions
    async function fetchGroups() {
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
            populateGroupDropdown(groups);
        } catch (error) {
            console.error('Error fetching groups:', error);
            alert('Failed to load groups. Please try again.');
        }
    }

    function populateGroupDropdown(groups) {
        groupSelect.innerHTML = '<option value="">Select a group</option>';

        groups.forEach(group => {
            const option = document.createElement('option');
            option.value = group.id;
            option.textContent = group.name;
            groupSelect.appendChild(option);
        });
    }

    async function createTransaction() {
        const amount = document.getElementById('amount').value;
        const type = document.querySelector('input[name="type"]:checked').value;
        const category = document.getElementById('category').value;
        const groupId = document.getElementById('group').value;
        const date = document.getElementById('date').value;
        const note = document.getElementById('note').value;

        if (!groupId) {
            alert('Please select a group');
            return;
        }

        const transactionData = {
            amount: parseFloat(amount),
            type,
            category,
            groupId: parseInt(groupId),
            date,
            note
        };

        try {
            const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(transactionData)
            });

            if (!response.ok) {
                throw new Error('Failed to create transaction');
            }

            const result = await response.json();
            alert('Transaction created successfully!');
            window.location.href = `transactions.html?groupId=${groupId}`; // Redirect to transactions page
        } catch (error) {
            console.error('Error creating transaction:', error);
            alert('Failed to create transaction. Please try again.');
        }
    }
});