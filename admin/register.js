// Toast notification function
function showToast(message, type = "info") {
  const toastContainer = document.getElementById("toastContainer");
  const toastId = "toast-" + Date.now();

  const bgClass =
    type === "success"
      ? "bg-success"
      : type === "error"
      ? "bg-danger"
      : type === "warning"
      ? "bg-warning"
      : "bg-info";

  const toastHTML = `
    <div id="${toastId}" class="toast ${bgClass} text-white" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header ${bgClass} text-white border-0">
        <strong class="me-auto">
          ${
            type === "success"
              ? "✅ Success"
              : type === "error"
              ? "❌ Error"
              : type === "warning"
              ? "⚠️ Warning"
              : "ℹ️ Info"
          }
        </strong>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        ${message}
      </div>
    </div>
  `;

  toastContainer.insertAdjacentHTML("beforeend", toastHTML);

  const toastElement = document.getElementById(toastId);
  const toast = new bootstrap.Toast(toastElement, {
    autohide: true,
    delay: type === "error" ? 5000 : 3000,
  });

  toast.show();

  // Remove toast element after it's hidden
  toastElement.addEventListener("hidden.bs.toast", () => {
    toastElement.remove();
  });
}

// Form validation functions
function validateName(name) {
  if (!name || name.trim().length < 2) {
    return "Name must be at least 2 characters long";
  }
  if (name.length > 50) {
    return "Name must be less than 50 characters";
  }
  if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
    return "Name can only contain letters and spaces";
  }
  return null;
}

function validatePhone(phone) {
  if (!phone || phone.trim().length < 10) {
    return "Phone number must be at least 10 digits";
  }
  if (phone.length > 15) {
    return "Phone number must be less than 15 digits";
  }
  if (!/^[0-9]+$/.test(phone.trim())) {
    return "Phone number can only contain digits";
  }
  return null;
}

function validateEmail(email) {
  if (!email || email.trim().length === 0) {
    return "Email address is required";
  }
  if (email.length > 100) {
    return "Email address is too long";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return "Please enter a valid email address";
  }
  return null;
}

function validatePassword(password) {
  if (!password || password.length < 6) {
    return "Password must be at least 6 characters long";
  }
  if (password.length > 50) {
    return "Password must be less than 50 characters";
  }
  return null;
}

function validateShopName(shopName) {
  if (!shopName || shopName.trim().length < 2) {
    return "Shop name must be at least 2 characters long";
  }
  if (shopName.length > 100) {
    return "Shop name must be less than 100 characters";
  }
  return null;
}

function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorDiv = document.getElementById(fieldId + "-error");

  field.classList.add("is-invalid");
  errorDiv.textContent = message;
}

function clearFieldError(fieldId) {
  const field = document.getElementById(fieldId);
  const errorDiv = document.getElementById(fieldId + "-error");

  field.classList.remove("is-invalid");
  errorDiv.textContent = "";
}

function clearAllErrors() {
  const fields = ["name", "phone", "email", "password", "shop_name"];
  fields.forEach((fieldId) => clearFieldError(fieldId));
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const submitBtn = document.getElementById("submitBtn");

  // Real-time validation on input
  const fields = ["name", "phone", "email", "password", "shop_name"];
  fields.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    field.addEventListener("blur", () => {
      validateField(fieldId);
    });
    field.addEventListener("input", () => {
      clearFieldError(fieldId);
    });
  });

  function validateField(fieldId) {
    const field = document.getElementById(fieldId);
    const value = field.value.trim();
    let error = null;

    switch (fieldId) {
      case "name":
        error = validateName(value);
        break;
      case "phone":
        error = validatePhone(value);
        break;
      case "email":
        error = validateEmail(value);
        break;
      case "password":
        error = validatePassword(value);
        break;
      case "shop_name":
        error = validateShopName(value);
        break;
    }

    if (error) {
      showFieldError(fieldId, error);
      return false;
    } else {
      clearFieldError(fieldId);
      return true;
    }
  }

  function validateForm() {
    clearAllErrors();
    let isValid = true;

    fields.forEach((fieldId) => {
      if (!validateField(fieldId)) {
        isValid = false;
      }
    });

    return isValid;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      showToast(
        "❌ Please fix the errors in the form before submitting.",
        "error"
      );
      return;
    }

    // Disable submit button to prevent double submission
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Registering...";

    const formData = new FormData(form);

    try {
      const response = await fetch(
        "http://localhost:8080/routes/admin/register_admin.php",
        {
          method: "POST",
          body: formData,
        }
      );

      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Registration response:", result);

      if (result.success) {
        showToast(result.message, "success");
        // Redirect after a short delay to show the success message
        setTimeout(() => {
          window.location.href = "login.html";
        }, 1500);
      } else {
        // Handle specific backend errors
        if (result.message && result.message.includes("email")) {
          showFieldError("email", "This email address is already registered");
          showToast("❌ " + result.message, "error");
        } else if (result.message && result.message.includes("phone")) {
          showFieldError("phone", "This phone number is already registered");
          showToast("❌ " + result.message, "error");
        } else if (result.message && result.message.includes("shop")) {
          showFieldError("shop_name", "A shop with this name already exists");
          showToast("❌ " + result.message, "error");
        } else {
          showToast("❌ " + (result.message || "Registration failed"), "error");
        }
      }
    } catch (error) {
      console.error("Register error:", error);

      if (error.name === "TypeError" && error.message.includes("fetch")) {
        showToast(
          "❌ Cannot connect to server. Please check your internet connection or try again later.",
          "error"
        );
      } else if (error.message.includes("404")) {
        showToast(
          "❌ Registration service not found. Please contact administrator.",
          "error"
        );
      } else if (error.message.includes("500")) {
        showToast("❌ Server error occurred. Please try again later.", "error");
      } else if (error.message.includes("403")) {
        showToast("❌ Access denied. Please check your permissions.", "error");
      } else if (error.message.includes("400")) {
        showToast("❌ Invalid request. Please check your input data.", "error");
      } else {
        showToast(
          "⚠️ An unexpected error occurred. Please try again later.",
          "error"
        );
      }
    } finally {
      // Re-enable submit button
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
});
