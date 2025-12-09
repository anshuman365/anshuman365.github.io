/**
 * Portable Payment Module
 * Can be used from any page for any payment type
 */

const PaymentModule = (function() {
  // Configuration
  const config = {
    exchangeRate: 83, // Default fallback
    backendURL: 'https://nexoraindustries365.pythonanywhere.com/api',
    formspreeEndpoint: 'https://formspree.io/f/mdklpdpo',
    maxAmount: 10000,
    minAmount: 1,
    supportedCurrencies: ['INR', 'USD'],
    defaultCurrency: 'INR'
  };

  // State
  let state = {
    amount: 0,
    exchangeRate: config.exchangeRate,
    paymentPurpose: 'web_development',
    customerDetails: {},
    invoiceData: null,
    lastInvoicePDF: null
  };

  // Initialize payment module
  function init() {
    setupEventListeners();
    fetchExchangeRate();
    setupQuickPayments();
    updateSubmitButton();
    
    // Check for pre-filled data
    checkPreFilledData();
    
    console.log('Payment module initialized');
  }

  // Setup event listeners
  function setupEventListeners() {
    // Quick payment options
    document.querySelectorAll('.payment-option').forEach(option => {
      option.addEventListener('click', function() {
        const amount = parseFloat(this.dataset.amount);
        setAmount(amount);
      });
    });

    // Custom amount
    document.getElementById('set-custom-amount')?.addEventListener('click', setCustomAmount);
    
    // Change amount button
    document.getElementById('change-amount')?.addEventListener('click', function() {
      document.getElementById('amount-display').classList.add('hidden');
      document.getElementById('custom-amount').focus();
    });

    // Payment purpose radios
    document.querySelectorAll('input[name="payment-purpose"]').forEach(radio => {
      radio.addEventListener('change', function() {
        state.paymentPurpose = this.value;
        updateOrderSummary();
      });
    });

    // Form submission
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
      paymentForm.addEventListener('submit', handlePaymentSubmit);
    }

    // Form validation
    const formInputs = ['customer-name', 'customer-email', 'customer-phone'];
    formInputs.forEach(id => {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener('input', updateSubmitButton);
      }
    });

    // Terms agreement
    const termsCheckbox = document.getElementById('terms-agreement');
    if (termsCheckbox) {
      termsCheckbox.addEventListener('change', updateSubmitButton);
    }

    // Testing disclaimer
    const disclaimerCheckbox = document.getElementById('testing-disclaimer');
    if (disclaimerCheckbox) {
      disclaimerCheckbox.addEventListener('change', updateSubmitButton);
    }

    // Custom amount input
    const customAmountInput = document.getElementById('custom-amount');
    if (customAmountInput) {
      customAmountInput.addEventListener('input', function() {
        updateSubmitButton();
      });
    }

    // Success modal buttons
    document.getElementById('close-success')?.addEventListener('click', closeSuccessModal);
    document.getElementById('download-invoice-again')?.addEventListener('click', downloadInvoiceAgain);
  }

  // Setup quick payment buttons
  function setupQuickPayments() {
    const quickPayments = [
      { amount: 25, label: 'Basic Website' },
      { amount: 60, label: 'Standard Package' },
      { amount: 120, label: 'Premium Package' },
      { amount: 299, label: 'Enterprise AI' },
      { amount: 49, label: 'Consultation Hour' },
      { amount: 9.99, label: 'Donation' }
    ];

    // This would be populated by the HTML, but we can add more dynamically
  }

  // Check for pre-filled data
  function checkPreFilledData() {
    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    
    const amount = urlParams.get('amount');
    const purpose = urlParams.get('purpose');
    const email = urlParams.get('email');
    const name = urlParams.get('name');
    
    if (amount) {
      document.getElementById('custom-amount').value = amount;
      setCustomAmount();
    }
    
    if (purpose) {
      const purposeRadio = document.querySelector(`input[value="${purpose}"]`);
      if (purposeRadio) {
        purposeRadio.checked = true;
        state.paymentPurpose = purpose;
      }
    }
    
    if (email) {
      document.getElementById('customer-email').value = email;
    }
    
    if (name) {
      document.getElementById('customer-name').value = name;
    }
    
    // Check localStorage for saved customer info
    const savedCustomer = localStorage.getItem('payment_customer_info');
    if (savedCustomer) {
      try {
        const customer = JSON.parse(savedCustomer);
        if (customer.email && !document.getElementById('customer-email').value) {
          document.getElementById('customer-email').value = customer.email;
        }
        if (customer.name && !document.getElementById('customer-name').value) {
          document.getElementById('customer-name').value = customer.name;
        }
        if (customer.phone && !document.getElementById('customer-phone').value) {
          document.getElementById('customer-phone').value = customer.phone;
        }
      } catch (e) {
        console.error('Error loading saved customer info:', e);
      }
    }
  }

  // Fetch real-time exchange rate
  async function fetchExchangeRate() {
    try {
      showLoading();
      
      const apis = [
        'https://api.exchangerate-api.com/v4/latest/USD',
        'https://api.frankfurter.app/latest?from=USD&to=INR',
        'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json'
      ];

      let rate = null;
      
      for (const api of apis) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch(api, { signal: controller.signal });
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const data = await response.json();
            
            if (api.includes('exchangerate-api')) {
              rate = data.rates.INR;
            } else if (api.includes('frankfurter')) {
              rate = data.rates.INR;
            } else if (api.includes('currency-api')) {
              rate = data.usd.inr;
            }
            
            if (rate && rate > 0) {
              break;
            }
          }
        } catch (error) {
          console.log(`API ${api} failed:`, error);
          continue;
        }
      }

      if (rate && rate > 0) {
        state.exchangeRate = parseFloat(rate.toFixed(2));
        updateExchangeRateDisplay();
        showNotification(`Exchange rate updated: 1 USD = ${state.exchangeRate} INR`, 'success');
      } else {
        throw new Error('All exchange rate APIs failed');
      }
      
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
      showNotification('Using default exchange rate. Live rates unavailable.', 'info');
    } finally {
      hideLoading();
    }
  }

  // Set amount from quick payment
  function setAmount(amount) {
    if (amount >= config.minAmount && amount <= config.maxAmount) {
      state.amount = parseFloat(amount);
      updateAmountDisplay();
      updateOrderSummary();
      updateSubmitButton();
      highlightSelectedOption(amount);
    } else {
      showNotification(`Amount must be between $${config.minAmount} and $${config.maxAmount}`, 'error');
    }
  }

  // Set custom amount
  function setCustomAmount() {
    const customAmountInput = document.getElementById('custom-amount');
    if (!customAmountInput) return;
    
    const amount = parseFloat(customAmountInput.value);
    
    if (isNaN(amount) || amount < config.minAmount || amount > config.maxAmount) {
      showNotification(`Please enter a valid amount between $${config.minAmount} and $${config.maxAmount}`, 'error');
      customAmountInput.focus();
      return;
    }
    
    state.amount = amount;
    updateAmountDisplay();
    updateOrderSummary();
    updateSubmitButton();
    highlightSelectedOption(amount);
    
    // Auto-scroll to form
    document.getElementById('payment-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Update amount display
  function updateAmountDisplay() {
    const amountDisplay = document.getElementById('amount-display');
    const displayAmount = document.getElementById('display-amount');
    const submitAmount = document.getElementById('submit-amount');
    const submitText = document.getElementById('submit-text');
    
    if (amountDisplay && state.amount > 0) {
      amountDisplay.classList.remove('hidden');
      displayAmount.textContent = `$${state.amount.toFixed(2)}`;
      submitAmount.textContent = `($${state.amount.toFixed(2)})`;
      submitText.textContent = `Pay $${state.amount.toFixed(2)}`;
    }
    
    // Update INR equivalent
    updateINRDisplay();
  }

  // Update INR display
  function updateINRDisplay() {
    const inrAmount = state.amount * state.exchangeRate;
    const inrDisplay = document.getElementById('inr-amount');
    const totalAmountDisplay = document.getElementById('total-amount-display');
    
    if (inrDisplay) {
      inrDisplay.textContent = `₹${inrAmount.toFixed(2)}`;
    }
    
    if (totalAmountDisplay) {
      totalAmountDisplay.textContent = `$${state.amount.toFixed(2)}`;
    }
  }

  // Update exchange rate display
  function updateExchangeRateDisplay() {
    const exchangeRateElement = document.getElementById('exchange-rate');
    if (exchangeRateElement) {
      exchangeRateElement.textContent = state.exchangeRate.toFixed(2);
      updateINRDisplay();
    }
  }

  // Update order summary
  function updateOrderSummary() {
    const orderSummary = document.getElementById('order-summary');
    if (!orderSummary) return;
    
    if (state.amount === 0) {
      orderSummary.innerHTML = `
        <div class="text-center py-8 text-gray-400 dark:text-gray-500">
          <i class="fas fa-shopping-cart text-3xl mb-3"></i>
          <p>Select a payment amount to see details</p>
        </div>
      `;
      return;
    }
    
    const purposeLabels = {
      'web_development': 'Web Development Service',
      'ai_services': 'AI Integration Service',
      'consultation': 'Technical Consultation',
      'other': 'Other Service'
    };
    
    const purposeLabel = purposeLabels[state.paymentPurpose] || 'Service Payment';
    
    orderSummary.innerHTML = `
      <div class="space-y-3">
        <div class="flex justify-between items-center receipt-item p-2 rounded">
          <div>
            <div class="font-medium">${purposeLabel}</div>
            <div class="text-xs text-gray-500">Service Payment</div>
          </div>
          <div class="font-semibold text-primary">$${state.amount.toFixed(2)}</div>
        </div>
        
        <div class="flex justify-between items-center text-sm p-2">
          <span class="text-gray-600 dark:text-gray-300">Subtotal</span>
          <span class="font-medium">$${state.amount.toFixed(2)}</span>
        </div>
        
        <div class="flex justify-between items-center text-sm p-2">
          <span class="text-gray-600 dark:text-gray-300">Processing Fee</span>
          <span class="font-medium text-green-600">$0.00</span>
        </div>
        
        <div class="border-t border-gray-200 dark:border-gray-600 pt-3 mt-2">
          <div class="flex justify-between items-center">
            <span class="font-semibold">Total (USD)</span>
            <span class="text-lg font-bold text-primary">$${state.amount.toFixed(2)}</span>
          </div>
          <div class="text-right text-sm text-gray-500 dark:text-gray-400">
            ≈ ₹${(state.amount * state.exchangeRate).toFixed(2)} INR
          </div>
        </div>
      </div>
    `;
  }

  // Update submit button state
  function updateSubmitButton() {
    const submitButton = document.getElementById('submit-payment');
    if (!submitButton) return;
    
    const amountValid = state.amount > 0;
    const formValid = validateForm();
    const termsAgreed = document.getElementById('terms-agreement')?.checked;
    const disclaimerAgreed = document.getElementById('testing-disclaimer')?.checked;
    
    submitButton.disabled = !(amountValid && formValid && termsAgreed && disclaimerAgreed);
    
    if (submitButton.disabled) {
      submitButton.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
      submitButton.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  }

  // Validate form
  function validateForm() {
    const requiredFields = ['customer-name', 'customer-email', 'customer-phone'];
    
    for (const fieldId of requiredFields) {
      const field = document.getElementById(fieldId);
      if (!field || !field.value.trim()) {
        return false;
      }
    }
    
    return true;
  }

  // Highlight selected payment option
  function highlightSelectedOption(amount) {
    // Remove selection from all options
    document.querySelectorAll('.payment-option').forEach(option => {
      option.classList.remove('selected');
    });
    
    // Add selection to matching option
    const matchingOption = document.querySelector(`.payment-option[data-amount="${amount}"]`);
    if (matchingOption) {
      matchingOption.classList.add('selected');
    }
  }

  // Handle payment submission
  async function handlePaymentSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification('Please fill all required fields', 'error');
      return;
    }
    
    if (state.amount === 0) {
      showNotification('Please select or enter a payment amount', 'error');
      return;
    }
    
    // Collect customer details
    collectCustomerDetails();
    
    // Save customer info to localStorage for future use
    saveCustomerInfo();
    
    // Initiate payment
    try {
      await initiatePayment();
    } catch (error) {
      console.error('Payment failed:', error);
      showNotification(`Payment failed: ${error.message}`, 'error');
    }
  }

  // Collect customer details
  function collectCustomerDetails() {
    state.customerDetails = {
      name: document.getElementById('customer-name').value.trim(),
      email: document.getElementById('customer-email').value.trim(),
      phone: document.getElementById('customer-phone').value.trim(),
      country: document.getElementById('customer-country').value,
      address: document.getElementById('customer-address').value.trim(),
      company: document.getElementById('company-name')?.value.trim() || '',
      paymentPurpose: state.paymentPurpose,
      purposeDescription: document.getElementById('purpose-description').value.trim(),
      generateInvoice: document.getElementById('generate-invoice')?.checked || false
    };
  }

  // Save customer info to localStorage
  function saveCustomerInfo() {
    const customerInfo = {
      name: state.customerDetails.name,
      email: state.customerDetails.email,
      phone: state.customerDetails.phone,
      timestamp: new Date().toISOString()
    };
    
    try {
      localStorage.setItem('payment_customer_info', JSON.stringify(customerInfo));
    } catch (e) {
      console.error('Failed to save customer info:', e);
    }
  }

  // Initiate Razorpay payment
  async function initiatePayment() {
    showLoading();
    
    const amountINR = Math.round(state.amount * state.exchangeRate * 100); // Convert to paise
    
    try {
      // Get Razorpay configuration
      const configResponse = await fetch(`${config.backendURL}/config/razorpay`, {
        signal: AbortSignal.timeout(10000)
      });
      
      if (!configResponse.ok) {
        throw new Error(`Network error: ${configResponse.status}`);
      }
      
      const configData = await configResponse.json();
      
      if (configData.status !== 'success') {
        throw new Error('Failed to get payment configuration');
      }
      
      // Create order
      const orderResponse = await fetch(`${config.backendURL}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountINR,
          currency: 'INR'
        }),
        signal: AbortSignal.timeout(10000)
      });
      
      if (!orderResponse.ok) {
        throw new Error(`HTTP error! status: ${orderResponse.status}`);
      }
      
      const orderData = await orderResponse.json();
      
      if (orderData.status !== 'success') {
        throw new Error(orderData.message || 'Failed to create order');
      }
      
      // Razorpay options
      const options = {
        key: configData.api_key_id,
        amount: amountINR,
        currency: 'INR',
        name: 'Anshuman Singh - AI Developer',
        description: `${state.customerDetails.paymentPurpose} - Payment`,
        order_id: orderData.order.id,
        handler: async function(response) {
          await handlePaymentSuccess(response);
        },
        prefill: {
          name: state.customerDetails.name,
          email: state.customerDetails.email,
          contact: state.customerDetails.phone
        },
        notes: {
          service: state.customerDetails.paymentPurpose,
          customer_name: state.customerDetails.name,
          customer_email: state.customerDetails.email,
          purpose: state.customerDetails.purposeDescription
        },
        theme: {
          color: '#2563EB'
        },
        modal: {
          ondismiss: function() {
            showNotification('Payment cancelled', 'info');
          }
        }
      };
      
      const rzp = new Razorpay(options);
      
      // Error handling
      rzp.on('payment.failed', function(response) {
        console.error('Payment failed:', response.error);
        showNotification('Payment failed: ' + (response.error.description || 'Unknown error'), 'error');
      });
      
      rzp.open();
      
    } catch (error) {
      console.error('Payment initialization failed:', error);
      
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        throw new Error('Payment request timed out. Please try again.');
      } else {
        throw error;
      }
    } finally {
      hideLoading();
    }
  }

  // Handle successful payment
  async function handlePaymentSuccess(paymentResponse) {
    showLoading();
    
    try {
      // Prepare verification data
      const verificationData = {
        ...paymentResponse,
        amount: Math.round(state.amount * state.exchangeRate * 100),
        currency: 'INR',
        service_type: state.customerDetails.paymentPurpose,
        customer_name: state.customerDetails.name,
        customer_email: state.customerDetails.email,
        customer_phone: state.customerDetails.phone,
        customer_company: state.customerDetails.company,
        customer_address: state.customerDetails.address,
        customer_country: state.customerDetails.country,
        exchange_rate: state.exchangeRate,
        total_usd: state.amount,
        purpose_description: state.customerDetails.purposeDescription
      };
      
      // Verify payment
      const verifyResponse = await fetch(`${config.backendURL}/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verificationData),
        signal: AbortSignal.timeout(10000)
      });
      
      if (!verifyResponse.ok) {
        throw new Error(`HTTP error! status: ${verifyResponse.status}`);
      }
      
      const verification = await verifyResponse.json();
      
      if (verification.status === 'success') {
        // Store invoice data
        state.invoiceData = {
          paymentResponse,
          verification,
          timestamp: new Date().toISOString()
        };
        
        // Generate invoice if requested
        if (state.customerDetails.generateInvoice) {
          await generateAndDownloadInvoice(paymentResponse);
        }
        
        // Send notification to Formspree
        await sendPaymentNotification(paymentResponse);
        
        // Show success modal
        showSuccessModal(paymentResponse);
        
        // Reset form
        resetForm();
        
      } else {
        throw new Error(verification.message || 'Payment verification failed');
      }
      
    } catch (error) {
      console.error('Payment handling failed:', error);
      
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        showNotification('Payment verification timed out. Please contact support.', 'error');
      } else {
        showNotification('Payment verification failed: ' + error.message, 'error');
      }
    } finally {
      hideLoading();
    }
  }

  // Generate and download invoice
  async function generateAndDownloadInvoice(paymentResponse) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const totalUSD = state.amount;
    const totalINR = totalUSD * state.exchangeRate;
    
    // Simple invoice template
    let yPos = 20;
    
    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235); // Primary color
    doc.text('PAYMENT RECEIPT', 105, yPos, { align: 'center' });
    
    yPos += 15;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 128, 128);
    doc.text('Anshuman Singh - AI Developer', 105, yPos, { align: 'center' });
    
    yPos += 15;
    
    // Payment Details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Payment Details:', 20, yPos);
    
    yPos += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const details = [
      [`Payment ID:`, paymentResponse.razorpay_payment_id],
      [`Order ID:`, paymentResponse.razorpay_order_id],
      [`Date:`, new Date().toLocaleString('en-IN')],
      [`Amount:`, `$${totalUSD.toFixed(2)} (₹${totalINR.toFixed(2)})`],
      [`Purpose:`, state.customerDetails.paymentPurpose],
      [`Description:`, state.customerDetails.purposeDescription || 'N/A']
    ];
    
    details.forEach(([label, value]) => {
      doc.text(label, 20, yPos);
      doc.text(value, 80, yPos);
      yPos += 7;
    });
    
    yPos += 5;
    
    // Customer Details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Information:', 20, yPos);
    
    yPos += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const customerDetails = [
      [`Name:`, state.customerDetails.name],
      [`Email:`, state.customerDetails.email],
      [`Phone:`, state.customerDetails.phone],
      [`Company:`, state.customerDetails.company || 'N/A'],
      [`Country:`, state.customerDetails.country || 'N/A']
    ];
    
    customerDetails.forEach(([label, value]) => {
      doc.text(label, 20, yPos);
      doc.text(value, 60, yPos);
      yPos += 7;
    });
    
    yPos += 10;
    
    // Terms and Notes
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    const terms = [
      'Note: This is a testing receipt for demonstration purposes only.',
      'No actual money transfer has occurred. This receipt is not valid',
      'for any financial or tax purposes.',
      'For support: anshumansingh3697@gmail.com'
    ];
    
    terms.forEach(term => {
      doc.text(term, 20, yPos);
      yPos += 5;
    });
    
    // Footer
    yPos = 280;
    doc.setFontSize(8);
    doc.text('Thank you for your payment!', 105, yPos, { align: 'center' });
    
    // Save PDF
    const fileName = `receipt-${paymentResponse.razorpay_payment_id.slice(-8)}.pdf`;
    doc.save(fileName);
    
    // Store for re-download
    state.lastInvoicePDF = {
      fileName,
      data: doc.output('datauristring')
    };
    
    return fileName;
  }

  // Send payment notification to Formspree
  async function sendPaymentNotification(paymentResponse) {
    const formData = {
      _subject: `New Payment - ${state.customerDetails.paymentPurpose}`,
      amount_usd: state.amount,
      amount_inr: state.amount * state.exchangeRate,
      payment_id: paymentResponse.razorpay_payment_id,
      order_id: paymentResponse.razorpay_order_id,
      customer_name: state.customerDetails.name,
      customer_email: state.customerDetails.email,
      customer_phone: state.customerDetails.phone,
      purpose: state.customerDetails.paymentPurpose,
      description: state.customerDetails.purposeDescription,
      timestamp: new Date().toISOString(),
      exchange_rate: state.exchangeRate
    };
    
    try {
      await fetch(config.formspreeEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
      // Non-critical error
    }
  }

  // Show success modal
  function showSuccessModal(paymentResponse) {
    const modal = document.getElementById('success-modal');
    const successAmount = document.getElementById('success-amount');
    const successPaymentId = document.getElementById('success-payment-id');
    const successOrderId = document.getElementById('success-order-id');
    const successDate = document.getElementById('success-date');
    const invoiceFileName = document.getElementById('invoice-file-name');
    
    if (modal && successAmount && successPaymentId && successOrderId && successDate) {
      successAmount.textContent = `$${state.amount.toFixed(2)}`;
      successPaymentId.textContent = paymentResponse.razorpay_payment_id.slice(-8);
      successOrderId.textContent = paymentResponse.razorpay_order_id.slice(-8);
      successDate.textContent = new Date().toLocaleString('en-IN');
      
      if (invoiceFileName && state.lastInvoicePDF) {
        invoiceFileName.textContent = state.lastInvoicePDF.fileName;
      }
      
      modal.classList.remove('hidden');
    }
  }

  // Close success modal
  function closeSuccessModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  // Download invoice again
  function downloadInvoiceAgain() {
    if (state.lastInvoicePDF) {
      const link = document.createElement('a');
      link.href = state.lastInvoicePDF.data;
      link.download = state.lastInvoicePDF.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showNotification('Invoice downloaded again', 'success');
    } else {
      showNotification('No invoice available to download', 'error');
    }
  }

  // Reset form
  function resetForm() {
    // Reset amount
    state.amount = 0;
    document.getElementById('amount-display').classList.add('hidden');
    document.getElementById('custom-amount').value = '';
    
    // Reset form
    document.getElementById('payment-form').reset();
    
    // Reset order summary
    updateOrderSummary();
    
    // Reset submit button
    updateSubmitButton();
    
    // Remove selection from quick payment options
    document.querySelectorAll('.payment-option').forEach(option => {
      option.classList.remove('selected');
    });
  }

  // Public API for external use
  function createPayment(params) {
    // This function can be called from other pages to pre-fill and initiate payment
    if (params.amount) {
      setAmount(params.amount);
    }
    
    if (params.purpose) {
      state.paymentPurpose = params.purpose;
      const purposeRadio = document.querySelector(`input[value="${params.purpose}"]`);
      if (purposeRadio) purposeRadio.checked = true;
    }
    
    if (params.description) {
      document.getElementById('purpose-description').value = params.description;
    }
    
    if (params.customer) {
      if (params.customer.name) {
        document.getElementById('customer-name').value = params.customer.name;
      }
      if (params.customer.email) {
        document.getElementById('customer-email').value = params.customer.email;
      }
      if (params.customer.phone) {
        document.getElementById('customer-phone').value = params.customer.phone;
      }
    }
    
    updateOrderSummary();
    updateSubmitButton();
    
    // Return payment data for external use
    return {
      amount: state.amount,
      purpose: state.paymentPurpose,
      customer: state.customerDetails
    };
  }

  // Utility functions
  function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full ${
      type === 'error' ? 'bg-red-500 text-white' :
      type === 'success' ? 'bg-green-500 text-white' :
      'bg-blue-500 text-white'
    }`;
    
    notification.innerHTML = `
      <div class="flex items-center">
        <i class="fas ${
          type === 'error' ? 'fa-exclamation-triangle' :
          type === 'success' ? 'fa-check-circle' :
          'fa-info-circle'
        } mr-2"></i>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, 5000);
    
    // Allow manual close
    notification.addEventListener('click', () => {
      notification.classList.add('translate-x-full');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    });
  }

  function showLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.classList.remove('hidden');
    }
  }

  function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
    }
  }

  // Return public API
  return {
    init,
    createPayment,
    setAmount,
    getState: () => ({ ...state }),
    reset: resetForm,
    showNotification,
    showLoading,
    hideLoading
  };
})();

// Make available globally
window.PaymentModule = PaymentModule;

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    if (typeof PaymentModule !== 'undefined') {
      PaymentModule.init();
    }
  });
} else {
  if (typeof PaymentModule !== 'undefined') {
    PaymentModule.init();
  }
}

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PaymentModule;
}