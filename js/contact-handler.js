// js/contact-handler.js
import { submitContact } from './api.js';
import { logDebug } from './debug-utils.js';

export const setupContactForm = () => {
  const contactForm = document.getElementById('contact-form');
  
  if (!contactForm) {
    logDebug('Contact form not found', 'warning');
    return;
  }
  
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    
    logDebug('Contact form submitted');
    
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
      
      logDebug(`Form data: ${JSON.stringify(formData)}`);
      
      const response = await submitContact(formData);
      logDebug(`Contact API response: ${JSON.stringify(response)}`);
      
      if (response.status === 'success') {
        logDebug('Message sent successfully', 'success');
        alert('Message sent successfully! I\'ll get back to you soon.');
        form.reset();
      } else {
        const errorMsg = response.error || 'Failed to send message';
        logDebug(`API error: ${errorMsg}`, 'error');
        throw new Error(errorMsg);
      }
    } catch (error) {
      logDebug(`Form submission error: ${error.message}`, 'error');
      alert('Failed to send message. Please try again or email me directly at anshumansingh3697@gmail.com');
    } finally {
      // Restore button
      submitBtn.innerHTML = originalBtnText;
      submitBtn.disabled = false;
    }
  });
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  logDebug('Contact page loaded');
  setupContactForm();
});