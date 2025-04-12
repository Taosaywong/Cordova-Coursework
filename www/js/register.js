document.addEventListener('deviceready', function () {
    var db = window.sqlitePlugin.openDatabase({ name: 'expensesDB.db', location: 'default' });

    // Create the user table if it doesn't exist
    db.transaction(function (tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS user (id INTEGER PRIMARY KEY, username TEXT, email TEXT, password TEXT)');
    }, function (error) {
        console.error('Database setup failed: ' + error.message);
        alert('Database setup failed!');
    }, function () {
        console.log('Database setup complete');
    });

    // Handle form submission
    document.getElementById('registerForm').addEventListener('submit', function (e) {
        e.preventDefault();

        var username = document.getElementById('registerUsername').value.trim();
        var email = document.getElementById('registerEmail').value.trim();
        var password = document.getElementById('registerPassword').value;
        var confirmPassword = document.getElementById('confirmPassword').value;

        // Validate fields
        if (!username || !email || !password || !confirmPassword) {
            alert('All fields are required.');
            return;
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        // Check if email is already registered
        checkEmailExistence(email, function (exists) {
            if (exists) {
                alert('This email is already registered.');
            } else {
                registerUser(username, email, password);
            }
        });
    });

    // Function to check if email exists in the database
    function checkEmailExistence(email, callback) {
        db.transaction(function (tx) {
            tx.executeSql('SELECT * FROM user WHERE email = ?', [email], function (tx, res) {
                callback(res.rows.length > 0);
            }, function (error) {
                console.error("Email check error: " + error.message);
                callback(false);
            });
        });
    }

    // Function to register the new user
    function registerUser(username, email, password) {
        db.transaction(function (tx) {
            tx.executeSql('INSERT INTO user (username, email, password) VALUES (?, ?, ?)', [username, email, password], function () {
                alert('Registration successful! Please log in.');
                document.getElementById('registerForm').reset(); // Clears the form inputs
                window.location.href = 'index.html'; // Redirect to login page
            }, function (error) {
                console.error("Registration error: " + error.message);
                alert('Registration failed. Try again.');
            });
        });
    }
});
