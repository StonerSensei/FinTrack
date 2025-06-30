document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const createGroupBtn = document.getElementById('createGroupBtn');
    const groupModal = document.getElementById('groupModal');
    const closeModal = document.getElementById('closeModal');
    const cancelGroup = document.getElementById('cancelGroup');
    const groupForm = document.getElementById('groupForm');
    const groupsContainer = document.getElementById('groupsContainer');
    const deleteModal = document.getElementById('deleteModal');
    const closeDeleteModal = document.getElementById('closeDeleteModal');
    const cancelDelete = document.getElementById('cancelDelete');
    const confirmDelete = document.getElementById('confirmDelete');
    const toast = document.getElementById('toast');
    const logoutBtn = document.getElementById('logoutBtn');

    // Current group to be deleted
    let currentGroupId = null;

    // Event Listeners
    createGroupBtn.addEventListener('click', () => {
        groupModal.classList.add('active');
    });

    closeModal.addEventListener('click', () => {
        groupModal.classList.remove('active');
    });

    cancelGroup.addEventListener('click', () => {
        groupModal.classList.remove('active');
    });

    closeDeleteModal.addEventListener('click', () => {
        deleteModal.classList.remove('active');
    });

    cancelDelete.addEventListener('click', () => {
        deleteModal.classList.remove('active');
    });

    logoutBtn.addEventListener('click', handleLogout);

    // Load groups when page loads
    loadGroups();

    // Form Submission
    groupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const groupName = document.getElementById('groupName').value.trim();

        if (groupName) {
            createGroup(groupName);
        }
    });

    // Functions
    function loadGroups() {
        const authToken = localStorage.getItem('authToken');

        if (!authToken) {
            window.location.href = 'index.html';
            return;
        }

        fetch('/api/groups', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load groups');
            }
            return response.json();
        })
        .then(groups => {
            renderGroups(groups);
        })
        .catch(error => {
            showToast('Failed to load groups', 'error');
            console.error('Error:', error);
        });
    }

    function renderGroups(groups) {
        if (groups.length === 0) {
            groupsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <h3>No Groups Found</h3>
                    <p>You haven't created any transaction groups yet. Create your first group to organize your transactions.</p>
                    <button class="btn btn-primary" id="createFirstGroup">
                        <i class="fas fa-plus"></i> Create Group
                    </button>
                </div>
            `;

            document.getElementById('createFirstGroup').addEventListener('click', () => {
                groupModal.classList.add('active');
            });
            return;
        }

        let html = '<div class="groups-grid">';

        groups.forEach(group => {
            html += `
                <div class="group-card" data-id="${group.id}">
                    <div class="group-name">${group.name}</div>
                    <div class="group-actions">
                        <button class="btn btn-sm btn-outline edit-group" data-id="${group.id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-danger delete-group" data-id="${group.id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        groupsContainer.innerHTML = html;

        // Add event listeners to action buttons
        document.querySelectorAll('.edit-group').forEach(btn => {
            btn.addEventListener('click', function() {
                const groupId = this.getAttribute('data-id');
                editGroup(groupId);
            });
        });

        document.querySelectorAll('.delete-group').forEach(btn => {
            btn.addEventListener('click', function() {
                const groupId = this.getAttribute('data-id');
                showDeleteModal(groupId);
            });
        });
    }

    function createGroup(name) {
        const authToken = localStorage.getItem('authToken');
        const submitBtn = groupForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;

        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
        submitBtn.disabled = true;

        fetch('/api/groups?name=' + encodeURIComponent(name), {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to create group');
            }
            return response.json();
        })
        .then(group => {
            showToast('Group created successfully', 'success');
            groupModal.classList.remove('active');
            groupForm.reset();
            loadGroups();
        })
        .catch(error => {
            showToast('Failed to create group', 'error');
            console.error('Error:', error);
        })
        .finally(() => {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        });
    }

    function editGroup(groupId) {
        const groupCard = document.querySelector(`.group-card[data-id="${groupId}"]`);
        const currentName = groupCard.querySelector('.group-name').textContent;

        // Set current name in modal
        document.getElementById('groupName').value = currentName;
        groupModal.classList.add('active');

        // Change modal to edit mode
        const modalTitle = document.querySelector('.modal-title');
        const submitBtn = groupForm.querySelector('button[type="submit"]');

        modalTitle.textContent = 'Edit Group';
        submitBtn.textContent = 'Update Group';

        // Change form submission to update
        groupForm.onsubmit = function(e) {
            e.preventDefault();
            const newName = document.getElementById('groupName').value.trim();

            if (newName && newName !== currentName) {
                updateGroup(groupId, newName);
            } else {
                groupModal.classList.remove('active');
            }
        };
    }

    function updateGroup(groupId, name) {
        const authToken = localStorage.getItem('authToken');
        const submitBtn = groupForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;

        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
        submitBtn.disabled = true;

        fetch(`/api/groups/${groupId}?name=${encodeURIComponent(name)}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update group');
            }
            return response.json();
        })
        .then(updatedGroup => {
            showToast('Group updated successfully', 'success');
            groupModal.classList.remove('active');
            groupForm.reset();
            loadGroups();

            // Reset form to create mode
            const modalTitle = document.querySelector('.modal-title');
            const submitBtn = groupForm.querySelector('button[type="submit"]');

            modalTitle.textContent = 'Create New Group';
            submitBtn.textContent = 'Create Group';
            groupForm.onsubmit = function(e) {
                e.preventDefault();
                const groupName = document.getElementById('groupName').value.trim();
                if (groupName) {
                    createGroup(groupName);
                }
            };
        })
        .catch(error => {
            showToast('Failed to update group', 'error');
            console.error('Error:', error);
        })
        .finally(() => {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        });
    }

    function showDeleteModal(groupId) {
        currentGroupId = groupId;
        deleteModal.classList.add('active');
    }

    confirmDelete.addEventListener('click', function() {
        deleteGroup(currentGroupId);
    });

    function deleteGroup(groupId) {
        const authToken = localStorage.getItem('authToken');
        const deleteBtn = document.getElementById('confirmDelete');
        const originalBtnText = deleteBtn.innerHTML;

        deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
        deleteBtn.disabled = true;

        fetch(`/api/groups/${groupId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete group');
            }
            return response.json();
        })
        .then(() => {
            showToast('Group deleted successfully', 'success');
            deleteModal.classList.remove('active');
            loadGroups();
        })
        .catch(error => {
            showToast('Failed to delete group', 'error');
            console.error('Error:', error);
        })
        .finally(() => {
            deleteBtn.innerHTML = originalBtnText;
            deleteBtn.disabled = false;
        });
    }

    function showToast(message, type = 'success') {
        toast.textContent = message;
        toast.className = 'toast';
        toast.classList.add(type, 'show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    function handleLogout() {
        localStorage.removeItem('authToken');
        window.location.href = 'index.html';
    }

    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === groupModal) {
            groupModal.classList.remove('active');
        }
        if (e.target === deleteModal) {
            deleteModal.classList.remove('active');
        }
    });
});