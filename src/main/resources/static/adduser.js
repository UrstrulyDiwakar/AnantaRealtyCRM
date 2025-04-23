document.addEventListener("DOMContentLoaded", function () {
            console.log("JavaScript Loaded Successfully!");

            document.getElementById("userForm").addEventListener("submit", function (event) {
                event.preventDefault(); // Prevent page reload

                console.log("Save button clicked!");

                let userData = {
                    userid: document.getElementById("userId").value,
                    email: document.getElementById("email").value,
                    username: document.getElementById("name").value,
                    mobile: document.getElementById("mobile").value,
                    password: document.getElementById("password").value,
                    userStatus: document.getElementById("user_status").value,
                    profile: document.getElementById("profile").value,
                    loginAllowed: document.getElementById("login_allowed").value,
                    reportingTo: document.getElementById("reporting_to").value
                };

                let apiUrl = "http://localhost:8085/api/saveUser";

                // Show alert before sending the request
                alert("User Data: " + JSON.stringify(userData));
                alert("API URL: " + apiUrl);

                console.log("Sending Data to Server:", userData);
                console.log("API URL: ", apiUrl);

                fetch(apiUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(userData)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Failed to save user. Server returned " + response.status);
                    }
                    return response.text();
                })
                .then(data => {
                    console.log("User saved successfully:", data);

                    alert("User saved successfully!");

                    // Show success popup message
                    let popup = document.getElementById("popup");
                    popup.style.display = "block";
                    
                    // Hide popup after 3 seconds
                    setTimeout(() => {
                        popup.style.display = "none";
                    }, 3000);

                    // Reset form fields
                    document.getElementById("userForm").reset();
                })
                .catch(error => {
                    console.error("Error saving user:", error);
                    alert("Error: " + error.message);

                    // Show error popup message
                    let errorPopup = document.getElementById("errorPopup");
                    errorPopup.innerText = "❌ " + error.message;
                    errorPopup.style.display = "block";

                    // Hide error popup after 3 seconds
                    setTimeout(() => {
                        errorPopup.style.display = "none";
                    }, 3000);
                });
            });
        });