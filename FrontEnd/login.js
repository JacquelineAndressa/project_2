const form = document.getElementById("login-form");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  
  document.getElementById("error-message").textContent = "";

  if (!email || !password) {
  document.getElementById("error-message").textContent =
    "Please fill all fields";
  return;
}

  try {
    const response = await fetch("http://localhost:5678/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const data = await response.json();

    // save token
    localStorage.setItem("token", data.token);

    // redirect
    window.location.href = "index.html";
  } catch (error) {
    document.getElementById("error-message").textContent =
      "Invalid email or password";
  }
});