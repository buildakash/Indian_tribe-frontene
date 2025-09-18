document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    try {
      const response = await fetch("http://localhost/Indian%20Tribe/Indian_tribe-Backend/routes/admin/register_admin.php", {
        method: "POST",
        body: formData
      });

      const result = await response.json();
      console.log("Raw response:", result);

      if (result.success) {
        alert("✅ " + result.message);
        window.location.href = "login.html";
      } else {
        alert("❌ " + result.message);
      }
    } catch (error) {
      console.error("Register error:", error);
      alert("⚠️ Server error. Please try again later.");
    }
  });
});
