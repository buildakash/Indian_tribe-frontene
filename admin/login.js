document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    try {
      const res = await fetch("http://localhost/Indian%20Tribe/Indian_tribe-Backend/routes/admin/login_admin.php", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      console.log("Login response:", data);

      if (data.success) {
        localStorage.setItem("admin", JSON.stringify(data.user));
        // Redirect after short delay
        window.location.replace("index.html");
      } else {
        alert("❌ " + data.message);
      } 
    } catch (err) {
      console.error("Login error:", err);
      alert("⚠️ Server error. Please try again later.");
    }
  });
});
