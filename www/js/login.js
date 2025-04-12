document.addEventListener('deviceready', function () {
    var db = window.sqlitePlugin.openDatabase({ name: 'expensesDB.db', location: 'default' });


    // Handle login when the form is submitted
    document.getElementById('loginForm').addEventListener('submit', function (e) {
        e.preventDefault();

        var email = document.getElementById('loginEmail').value.trim();
        var password = document.getElementById('loginPassword').value;

        // Call the loginUser function
        loginUser(email, password);
    });

    function loginUser(email, password) {
        db.transaction(function (tx) {
            tx.executeSql(
                'SELECT * FROM user WHERE email = ? AND password = ?',
                [email, password],
                function (tx, res) {
                    if (res.rows.length > 0) {
                        var user = res.rows.item(0);
                        localStorage.setItem('userId', user.id); // Store user ID in local storage
                        alert("Login successful! Welcome " + user.username);
                        window.location.href = "./home.html"; // Redirects to expenses page
                    } else {
                        alert('Invalid email or password.');
                    }
                },
                function (error) {
                    console.error("Error during login: " + error.message);
                    alert('Error during login, please try again.');
                }
            );
        });
    }
    
    

    // Helper function to show alert messages using Bootstrap modal
    function showAlert(message) {
        alert(message);
    }    
});
