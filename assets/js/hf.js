  function toggleMenu() {
    const nav = document.getElementById('nav');
    nav.classList.toggle('show');
  }
  

/// hire me btn
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
    const waURL = `https://wa.me/918292870142?text=${encodeURIComponent(
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
///SCROLL BTN
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('scrollTopBtn');
    if (!btn) {
      console.error('scroll-top: #scrollTopBtn not found in DOM');
      return;
    }
    // console.log('scroll-top initialized');

    // Determine the element we should scroll (works for normal pages and many SPA setups)
    const scrollEl = document.scrollingElement || document.documentElement || document.body;

    // show/hide logic
    const SHOW_AFTER = 200;
    function updateVisibility() {
      const y = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
      if (y > SHOW_AFTER) btn.classList.add('show');
      else btn.classList.remove('show');
    }

    // attach listeners
    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });

    btn.addEventListener('click', function (e) {
      e.preventDefault();

      // If your page uses a special scroll container (not window), you'll need to replace scrollEl below
      try {
        scrollEl.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {
        // fallback simple
        window.scrollTo(0, 0);
      }
    });
  });
})();

