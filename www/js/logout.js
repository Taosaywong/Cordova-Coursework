// Function to handle user logout
function logoutUser() {
    // Clear the username from localStorage
    localStorage.removeItem("username");
    console.log("Username cleared from localStorage.");

    // Optionally clear other session data if needed (like a user session token, etc.)
    // localStorage.removeItem("userLoggedIn");

    // Redirect to the login page after logout
    window.location.href = 'login.html';  // Redirect to login page
}

// Call the logout function when the page is ready
document.addEventListener('DOMContentLoaded', function () {
    logoutUser();
});
