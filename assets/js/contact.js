(function () {
  function openForm() {
    document.getElementById('quickFormModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeForm() {
    document.getElementById('quickFormModal').style.display = 'none';
    document.body.style.overflow = 'auto';
  }

  function redirectToWhatsApp(formData) {
    const waURL = `https://wa.me/918005677079?text=${encodeURIComponent(
      `*New Enquiry**` +
      `*Name:* ${formData.name}*` +
      `*Mobile:* ${formData.mobile}*` +
      `*Email:* ${formData.email || 'Not provided'}*` +
      `*Service:* ${formData.service || 'Not specified'}*` +
      `*Message:* ${formData.message || 'No message'}`
    )}`;

    const link = document.createElement('a');
    link.href = waURL;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function initQuickFormModal() {
    const form = document.getElementById('contactFormQuick');

    if (form) {
      const newForm = form.cloneNode(true);
      form.parentNode.replaceChild(newForm, form);

      newForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = {
          name: newForm.querySelector('#fullname')?.value.trim(),
          mobile: newForm.querySelector('#mobile')?.value.trim(),
          email: newForm.querySelector('#email')?.value.trim(),
          message: newForm.querySelector('#message')?.value.trim(),
          service: newForm.querySelector('#services')?.value.trim()
        };

        if (!formData.name || !formData.mobile) {
          alert('Please fill at least name and mobile number');
          return;
        }

        if (!/^[0-9]{10}$/.test(formData.mobile)) {
          alert('Please enter a valid 10-digit mobile number');
          return;
        }

        redirectToWhatsApp(formData);
        closeForm();
        newForm.reset();
      });
    }
  }

  function initializeWhenReady() {
    const checkElements = setInterval(() => {
      const form = document.getElementById('contactFormQuick');
      const modal = document.getElementById('quickFormModal');

      if (form && modal) {
        initQuickFormModal();
        window.openForm = openForm;
        window.closeForm = closeForm;
        clearInterval(checkElements);
      }
    }, 100);
  }

  if (document.readyState === 'complete') {
    initializeWhenReady();
  } else {
    document.addEventListener('DOMContentLoaded', initializeWhenReady);
  }
})();
/// form & recapcha logic
// Generate Captcha
function generateCaptcha() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"; // Removed confusing characters
  let captcha = "";
  for (let i = 0; i < 6; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  document.getElementById("captchaCode").textContent = captcha;
}

// On page load, generate captcha
window.onload = generateCaptcha;

// Regenerate captcha on click
document.getElementById("captchaCode").addEventListener("click", generateCaptcha);

// Handle form submission
document.getElementById("contactForm").addEventListener("submit", function (e) {
  e.preventDefault();

  // Get form values
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const subject = document.getElementById("subject").value.trim();
  const message = document.getElementById("message").value.trim();
  const userCaptcha = document.getElementById("captchaInput").value.trim().toUpperCase();
  const generatedCaptcha = document.getElementById("captchaCode").textContent.trim().toUpperCase();

  // Basic validation
  if (!name || !email || !phone || !subject || !message) {
    alert("Please fill in all fields.");
    return;
  }

  // Captcha match check (case-insensitive)
  if (userCaptcha !== generatedCaptcha) {
    alert("Captcha does not match. Please try again.");
    generateCaptcha(); // Regenerate captcha
    return;
  }

  // Create WhatsApp message
  const whatsappMsg = `Hi, I am ${name}%0AEmail: ${email}%0APhone: ${phone}%0ASubject: ${subject}%0AMessage: ${message}`;
  const whatsappURL = `https://wa.me/918292870142?text=${whatsappMsg}`;

  // Open WhatsApp in new tab
  window.open(whatsappURL, "_blank");

  // Optionally clear form and regenerate captcha
  document.getElementById("contactForm").reset();
  generateCaptcha();
});

