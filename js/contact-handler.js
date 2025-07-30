// js/contact-handler.js
import { submitContact } from './api.js';

export const setupContactForm = () => {
  const contactForm = document.getElementById('contact-form');
  
  if (!contactForm) return;
  
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Save original button text
    const originalBtnText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Sending...';
    submitBtn.disabled = true;
    
    try {
      const formData = {
        name: form.name.value,
        email: form.email.value,
        subject: form.subject.value,
        message: form.message.value,
        timestamp: new Date().toISOString()
      };
      
      const response = await submitContact(formData);
      
      if (response.status === 'success') {
        // Show success message
        alert('Message sent successfully! I\'ll get back to you soon.');
        form.reset();
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Form Submission Error:', error);
      alert('Failed to send message. Please try again or email me directly at anshumansingh3697@gmail.com');
    } finally {
      // Restore button
      submitBtn.innerHTML = originalBtnText;
      submitBtn.disabled = false;
    }
  });
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', setupContactForm);