document.addEventListener("DOMContentLoaded", function() {
      new Typed('#typed-text', {
        strings: ["Hi, I'm Pradip Yadav", "Full Stack Developer"],
        typeSpeed: 50,
        backSpeed: 30,
        loop: true
      });
    });
/// about section
// Fade-in animation on scroll
  const aboutContent = document.querySelector('.about-content');
  window.addEventListener('scroll', () => {
    const rect = aboutContent.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      aboutContent.style.opacity = '1';
    }
  });
/// project section
 // Animation for project cards on scroll
    document.addEventListener('DOMContentLoaded', () => {
      const projectCards = document.querySelectorAll('.project-card');
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = 1;
            entry.target.style.transform = 'translateY(0)';
          }
        });
      }, { threshold: 0.1 });
      
      projectCards.forEach((card, index) => {
        card.style.opacity = 0;
        card.style.transform = 'translateY(20px)';
        card.style.transition = `opacity 0.5s ${index * 0.1}s ease, transform 0.5s ${index * 0.1}s ease`;
        observer.observe(card);
      });
    });