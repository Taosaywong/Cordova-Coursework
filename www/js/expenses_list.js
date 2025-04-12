document.addEventListener('deviceready', function () {
    // Open SQLite Database
    var db = window.sqlitePlugin.openDatabase({ name: 'expensesDB.db', location: 'default' });

    document.getElementById('addExpenseForm').onsubmit = function (event) {
        event.preventDefault(); // Prevent form submission
        addExpense();
    }
    
    loadExpenses(localStorage.getItem('userId')); // Load expenses for the logged-in user

    // Add Expense Function
    function addExpense() {

        alert('Adding Expense...');

        var title = document.getElementById('expenseTitle').value;
        var userId = localStorage.getItem('userId');
        if (!userId) {
            alert('User ID is missing. Please log in.');
            return;
        }
        var destination = document.getElementById('expenseDestination').value;
        var amount = parseFloat(document.getElementById('expenseAmount').value);
        var date = document.getElementById('expenseDate').value;
        var category = document.getElementById('expenseCategory').value;
        var paymentMethod = document.getElementById('paymentMethod').value;
        var description = document.getElementById('expenseDescription').value;

        db.transaction(function (tx) {
            tx.executeSql(`
                INSERT INTO trip_expenses (title, userId, destination, amount, date, category, paymentMethod, description)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [title, userId, destination, amount, date, category, paymentMethod, description], function () {
                console.log('Expense added successfully');
                loadExpenses(userId);
                closeModal();
            }, function (error) {
                console.error('Error adding expense:', error.message);
            });
        });
    }

    function loadExpenses(userId) {
        var expensesList = document.getElementById('expensesList');
        expensesList.innerHTML = ''; // Clear the list before reloading
        
        db.transaction(function (tx) {
            tx.executeSql('SELECT * FROM trip_expenses WHERE userId = ?', [userId], function (tx, res) {
                if (res.rows.length === 0) {
                    expensesList.innerHTML = '<p class="text-center">No expenses found.</p>';
                    return;
                }
    
                for (var i = 0; i < res.rows.length; i++) {
                    var expense = res.rows.item(i);
                    var expenseItem = document.createElement('div');
                    expenseItem.className = 'col-12 col-md-4';
    
                    expenseItem.innerHTML = `
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">${expense.title}</h5>
                                <p class="card-text">
                                    Destination: ${expense.destination}<br>
                                    Amount: ${expense.amount}<br>
                                    Date: ${formatDate(expense.date)}<br>
                                    Category: ${expense.category}<br>
                                    Payment Method: ${expense.paymentMethod}<br>
                                    Description: ${expense.description}
                                </p>
                                <div class="container">
                                    <div class="row">
                                        <div class="col">
                                            <button class="btn btn-primary w-100" onclick="openEditExpenseModal(${expense.id})">Edit</button>
                                        </div>
                                        <div class="col">
                                            <button class="btn btn-danger w-100" onclick="deleteExpense(${expense.id})">Delete</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    expensesList.appendChild(expenseItem);
                }
            }, function (error) {
                console.error('Error fetching expenses:', error.message);
            });
        });
    }

    document.getElementById('searchExpense').addEventListener('input', function () {
        const filter = this.value.trim().toLowerCase();
        const expenseItems = document.querySelectorAll('#expensesList .card');
    
        expenseItems.forEach(function (expense) {
            const text = expense.innerText.toLowerCase();
            if (text.includes(filter)) {
                expense.style.display = 'block';
            } else {
                expense.style.display = 'none';
            }
        });
    });
    
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    // Helper Functions
    function closeModal() {
        var modal = bootstrap.Modal.getInstance(document.getElementById('ManageExpenseModal'));
        modal.hide();
    }

    function resetExpenseForm() {
        document.getElementById('expenseId').value = '';
        document.getElementById('expenseTitle').value = '';
        document.getElementById('expenseDestination').value = '';
        document.getElementById('expenseAmount').value = '';
        document.getElementById('expenseDate').value = '';
        document.getElementById('expenseCategory').value = 'Food';
        document.getElementById('paymentMethod').value = 'cards';
        document.getElementById('expenseDescription').value = '';
    }

    // Open Modal
    window.openAddExpenseModal = function () {
        resetExpenseForm();
        document.getElementById('modalTitle').innerText = 'Add Expense';
        var addModal = new bootstrap.Modal(document.getElementById('ManageExpenseModal'));
        addModal.show();
    };

    window.openEditExpenseModal = function (expenseId) {
        db.transaction(function (tx) {
            tx.executeSql('SELECT * FROM trip_expenses WHERE id = ?', [expenseId], function (tx, res) {
                if (res.rows.length > 0) {
                    var expense = res.rows.item(0);
                    document.getElementById('expenseId').value = expense.id;
                    document.getElementById('expenseTitle').value = expense.title;
                    document.getElementById('expenseDestination').value = expense.destination;
                    document.getElementById('expenseAmount').value = expense.amount;
                    document.getElementById('expenseDate').value = expense.date;
                    document.getElementById('expenseCategory').value = expense.category;
                    document.getElementById('paymentMethod').value = expense.paymentMethod;
                    document.getElementById('expenseDescription').value = expense.description;

                    document.getElementById('modalTitle').innerText = 'Edit Expense';
                    var editModal = new bootstrap.Modal(document.getElementById('ManageExpenseModal'));
                    editModal.show();
                }
            }, function (error) {
                console.error('Error fetching expense details:', error.message);
            });
        });
    };


    // Delete Expense
    window.deleteExpense = function (expenseId) {
        db.transaction(function (tx) {
            tx.executeSql('DELETE FROM trip_expenses WHERE id = ?', [expenseId], function () {
                console.log('Expense deleted successfully');
                loadExpenses(localStorage.getItem('userId'));
            }, function (error) {
                console.error('Error deleting expense:', error.message);
            });
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        const userId = localStorage.getItem('userId'); // Retrieve user ID
        if (userId) {
            loadExpenses(userId); // Load expenses for the logged-in user
        } else {
            console.error('No user ID found. Redirecting to login.');
            window.location.href = "login.html"; // Redirect if no user ID
        }
    });
});