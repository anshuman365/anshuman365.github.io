// Services Configuration
const servicePackages = {
    basic: {
        name: "Basic Package",
        price: 25,
        description: "Starter Website Plan",
        features: [
            "Website Development (Simple Layout)",
            "Basic SEO Setup", 
            "Free Hosting (GitHub Pages/Render)",
            "24×7 Basic Support"
        ],
        delivery: "2-4 days"
    },
    standard: {
        name: "Standard Package", 
        price: 60,
        description: "Growth Website Plan",
        features: [
            "Advanced Layout + UI/UX Design",
            "SEO + Keyword Optimization",
            "Personal Domain Setup Included",
            "SSL Certificate + Analytics",
            "Priority 24×7 Support", 
            "Monthly Management Included"
        ],
        delivery: "4-7 days"
    },
    premium: {
        name: "Premium Package",
        price: 120,
        description: "Business + SEO Pro",
        features: [
            "Custom Flask App / CMS Integration",
            "Advanced UI/UX + Full SEO",
            "Personal Domain + Hosting",
            "Monthly Management + Reports",
            "Direct Chat Support 24×7",
            "Maintenance & Security Updates"
        ],
        delivery: "7-10 days"
    }
};

const addOns = [
    { id: "domain", name: "Domain Setup", price: 10, description: "+ domain price" },
    { id: "hosting_migration", name: "Hosting Migration", price: 10, description: "" },
    { id: "monthly_basic", name: "Monthly Management (Basic)", price: 5, description: "/month" },
    { id: "monthly_advanced", name: "Monthly Management (Advanced)", price: 20, description: "/month" },
    { id: "extra_pages", name: "Extra Pages", price: 5, description: "per page" },
    { id: "custom_email", name: "Custom Email Setup", price: 10, description: "" },
    { id: "google_ads", name: "Google Ads / Marketing", price: 25, description: "" },
    { id: "advanced_seo", name: "Advanced SEO", price: 15, description: "" },
    { id: "blog_setup", name: "Blog Setup", price: 10, description: "" },
    { id: "multi_language", name: "Multi-language Support", price: 15, description: "" },
    { id: "digital_marketing", name: "Digital Marketing Setup", price: 20, description: "" }
];

// Global state
let selectedPackage = null;
let selectedAddOns = [];
let customRequirements = "";
let customerDetails = {};

// Exchange rate - will be updated with real-time data
let EXCHANGE_RATE = 83; // Default fallback rate

// Initialize services
document.addEventListener('DOMContentLoaded', function() {
    initializeAddOns();
    setupEventListeners();
    fetchExchangeRate(); // Fetch real exchange rate on load
});

// Fetch real-time USD to INR exchange rate
async function fetchExchangeRate() {
    try {
        showLoading();
        
        // Try multiple exchange rate APIs for reliability
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
            EXCHANGE_RATE = parseFloat(rate.toFixed(2));
            showNotification(`Exchange rate updated: 1 USD = ${EXCHANGE_RATE} INR`, 'success');
            
            // Update order summary if already displayed
            if (selectedPackage) {
                updateOrderSummary();
            }
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

function initializeAddOns() {
    const container = document.getElementById('addons-container');
    
    addOns.forEach(addon => {
        const addonElement = document.createElement('div');
        addonElement.className = 'flex items-center justify-between p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600';
        addonElement.innerHTML = `
            <div class="flex items-center space-x-3">
                <input type="checkbox" id="addon-${addon.id}" class="addon-checkbox hidden">
                <label for="addon-${addon.id}" class="custom-checkbox w-5 h-5 border-2 border-gray-300 dark:border-gray-500 rounded cursor-pointer transition-all duration-200"></label>
                <div>
                    <div class="font-semibold text-dark dark:text-white">${addon.name}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-300">${addon.description}</div>
                </div>
            </div>
            <div class="text-right">
                <div class="font-semibold text-primary dark:text-blue-300">$${addon.price}</div>
            </div>
        `;
        container.appendChild(addonElement);
        
        // Add click event for custom checkbox
        const checkbox = addonElement.querySelector(`#addon-${addon.id}`);
        const label = addonElement.querySelector('.custom-checkbox');
        
        label.addEventListener('click', function() {
            checkbox.checked = !checkbox.checked;
            if (checkbox.checked) {
                label.classList.add('bg-primary', 'border-primary');
                label.innerHTML = '<i class="fas fa-check text-white text-xs"></i>';
                selectedAddOns.push(addon);
            } else {
                label.classList.remove('bg-primary', 'border-primary');
                label.innerHTML = '';
                selectedAddOns = selectedAddOns.filter(a => a.id !== addon.id);
            }
            updateOrderSummary();
        });
    });
}

function setupEventListeners() {
    // Package selection
    document.querySelectorAll('.select-package').forEach(button => {
        button.addEventListener('click', function() {
            const packageType = this.dataset.package;
            selectPackage(packageType);
        });
    });
    
    // Package card click
    document.querySelectorAll('.package-card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.classList.contains('select-package')) {
                const packageType = this.dataset.package;
                selectPackage(packageType);
            }
        });
    });
    
    // Custom requirements
    document.getElementById('add-custom-requirements').addEventListener('click', function() {
        customRequirements = document.getElementById('custom-requirements').value;
        updateOrderSummary();
    });
    
    // Payment flow
    document.getElementById('proceed-customer-details').addEventListener('click', showCustomerDetails);
    document.getElementById('back-to-order').addEventListener('click', backToOrder);
    document.getElementById('customer-form').addEventListener('submit', handlePaymentSubmission);
    
    // Refresh exchange rate button
    const refreshRateBtn = document.createElement('button');
    refreshRateBtn.innerHTML = '<i class="fas fa-sync-alt mr-2"></i>Refresh Rate';
    refreshRateBtn.className = 'bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm ml-4';
    refreshRateBtn.addEventListener('click', fetchExchangeRate);
    
    // Add refresh button to order summary
    const orderSummary = document.getElementById('order-summary');
    if (orderSummary) {
        const totalSection = orderSummary.querySelector('.border-t');
        if (totalSection) {
            totalSection.parentNode.insertBefore(refreshRateBtn, totalSection.nextSibling);
        }
    }
}

function selectPackage(packageType) {
    selectedPackage = servicePackages[packageType];
    
    // Update UI
    document.querySelectorAll('.package-card').forEach(card => {
        card.classList.remove('border-primary', 'border-2');
        card.classList.add('border-gray-200', 'dark:border-gray-700');
    });
    
    const selectedCard = document.querySelector(`[data-package="${packageType}"]`);
    selectedCard.classList.remove('border-gray-200', 'dark:border-gray-700');
    selectedCard.classList.add('border-primary', 'border-2');
    
    updateOrderSummary();
    
    // Scroll to order summary
    document.getElementById('order-summary').classList.remove('hidden');
    document.getElementById('order-summary').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function updateOrderSummary() {
    const orderDetails = document.getElementById('order-details');
    const totalAmount = document.getElementById('total-amount');
    
    let total = 0;
    let html = '';
    
    if (selectedPackage) {
        total += selectedPackage.price;
        html += `
            <div class="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-600">
                <div>
                    <div class="font-semibold text-dark dark:text-white">${selectedPackage.name}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-300">${selectedPackage.description}</div>
                </div>
                <div class="font-semibold text-primary dark:text-blue-300">$${selectedPackage.price}</div>
            </div>
        `;
    }
    
    selectedAddOns.forEach(addon => {
        total += addon.price;
        html += `
            <div class="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-600">
                <div>
                    <div class="font-semibold text-dark dark:text-white">${addon.name}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-300">${addon.description}</div>
                </div>
                <div class="font-semibold text-primary dark:text-blue-300">$${addon.price}</div>
            </div>
        `;
    });
    
    if (customRequirements) {
        html += `
            <div class="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-600">
                <div>
                    <div class="font-semibold text-dark dark:text-white">Custom Requirements</div>
                    <div class="text-sm text-gray-600 dark:text-gray-300 max-w-md">${customRequirements}</div>
                </div>
                <div class="font-semibold text-yellow-600">Custom Quote</div>
            </div>
        `;
    }
    
    // Add conversion information
    const totalINR = total * EXCHANGE_RATE;
    html += `
        <div class="flex justify-between items-center py-4 border-t border-gray-300 dark:border-gray-600 mt-4">
            <div class="text-lg font-bold text-dark dark:text-white">Total (USD)</div>
            <div class="text-lg font-bold text-primary dark:text-blue-300">$${total.toFixed(2)}</div>
        </div>
        <div class="flex justify-between items-center py-2 bg-gray-50 dark:bg-gray-800 rounded-lg px-4">
            <div class="text-sm text-gray-600 dark:text-gray-300">Equivalent in INR</div>
            <div class="text-sm font-semibold text-gray-700 dark:text-gray-300">Rs. ${totalINR.toFixed(2)}</div>
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
            Exchange rate: 1 USD = ${EXCHANGE_RATE} INR
        </div>
    `;
    
    orderDetails.innerHTML = html;
    totalAmount.textContent = `$${total.toFixed(2)}`;
    
    // Update payment button state - FIXED: Updated to correct ID
    const proceedBtn = document.getElementById('proceed-customer-details');
    if (selectedPackage && proceedBtn) {
        proceedBtn.disabled = false;
        proceedBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    } else if (proceedBtn) {
        proceedBtn.disabled = true;
        proceedBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
}

function showCustomerDetails() {
    if (!selectedPackage) {
        showNotification('Please select a package first', 'error');
        return;
    }
    
    // Hide order summary and show customer details
    document.getElementById('order-summary').classList.add('hidden');
    document.getElementById('customer-details').classList.remove('hidden');
    document.getElementById('customer-details').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function backToOrder() {
    // Show order summary and hide customer details
    document.getElementById('customer-details').classList.add('hidden');
    document.getElementById('order-summary').classList.remove('hidden');
    document.getElementById('order-summary').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function handlePaymentSubmission(e) {
    e.preventDefault();
    
    // Show loading state
    showLoading();
    
    // Collect customer details
    const formData = new FormData(e.target);
    customerDetails = {
        name: formData.get('customer_name'),
        email: formData.get('customer_email'),
        phone: formData.get('customer_phone'),
        company: formData.get('customer_company'),
        address: formData.get('customer_address'),
        country: formData.get('customer_country'),
        tax_id: formData.get('customer_tax_id')
    };
    
    // Validate required fields
    if (!customerDetails.name || !customerDetails.email || !customerDetails.phone || !customerDetails.address || !customerDetails.country) {
        hideLoading();
        showNotification('Please fill all required fields marked with *', 'error');
        return;
    }
    
    if (!document.getElementById('terms-agreement').checked) {
        hideLoading();
        showNotification('Please agree to the Terms and Conditions to proceed', 'error');
        return;
    }
    
    try {
        await initiatePayment();
    } catch (error) {
        console.error('Payment failed:', error);
        showNotification('Payment initialization failed: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function initiatePayment() {
    const totalAmountUSD = calculateTotalAmount();
    const totalAmountINR = Math.round(totalAmountUSD * EXCHANGE_RATE * 100); // Convert to paise
    
    try {
        // Get Razorpay API keys with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const configResponse = await fetch('https://nexoraindustries365.pythonanywhere.com/api/config/razorpay', {
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!configResponse.ok) {
            throw new Error(`Network error: ${configResponse.status}`);
        }
        
        const config = await configResponse.json();
        
        if (config.status !== 'success') {
            throw new Error('Failed to get payment configuration');
        }
        
        // Create order in INR with timeout
        const orderController = new AbortController();
        const orderTimeoutId = setTimeout(() => orderController.abort(), 10000);
        
        const orderResponse = await fetch('https://nexoraindustries365.pythonanywhere.com/api/create-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: totalAmountINR, // Amount in paise
                currency: 'INR'
            }),
            signal: orderController.signal
        });
        clearTimeout(orderTimeoutId);
        
        if (!orderResponse.ok) {
            throw new Error(`HTTP error! status: ${orderResponse.status}`);
        }
        
        const orderData = await orderResponse.json();
        
        if (orderData.status !== 'success') {
            throw new Error(orderData.message || 'Failed to create order');
        }
        
        const options = {
            key: config.api_key_id,
            amount: totalAmountINR,
            currency: 'INR',
            name: 'Anshuman Singh - Web Development Services',
            description: `${selectedPackage.name} - Professional Web Development Service`,
            order_id: orderData.order.id,
            handler: async function(response) {
                await handlePaymentSuccess(response);
            },
            prefill: {
                name: customerDetails.name,
                email: customerDetails.email,
                contact: customerDetails.phone
            },
            notes: {
                service: 'web_development',
                package: selectedPackage.name,
                customer_name: customerDetails.name,
                customer_email: customerDetails.email
            },
            theme: {
                color: '#2563EB'
            },
            modal: {
                ondismiss: function() {
                    showNotification('Payment cancelled by user', 'info');
                }
            }
        };
        
        const rzp = new Razorpay(options);
        
        // Add error handling for Razorpay
        rzp.on('payment.failed', function(response) {
            console.error('Payment failed:', response.error);
            showNotification('Payment failed: ' + (response.error.description || 'Unknown error'), 'error');
        });
        
        rzp.open();
        
    } catch (error) {
        console.error('Payment initialization failed:', error);
        
        if (error.name === 'AbortError') {
            throw new Error('Payment request timed out. Please try again.');
        } else {
            throw error;
        }
    }
}

function calculateTotalAmount() {
    let total = selectedPackage ? selectedPackage.price : 0;
    selectedAddOns.forEach(addon => {
        total += addon.price;
    });
    return total;
}

async function handlePaymentSuccess(paymentResponse) {
    showLoading();
    
    try {
        // Prepare payment verification data
        const verificationData = {
            ...paymentResponse,
            amount: Math.round(calculateTotalAmount() * EXCHANGE_RATE * 100), // Amount in paise
            currency: 'INR',
            service_type: 'web_development',
            package_name: selectedPackage ? selectedPackage.name : 'Custom',
            addons: selectedAddOns.map(a => a.name),
            custom_requirements: customRequirements,
            customer_name: customerDetails.name,
            customer_email: customerDetails.email,
            customer_phone: customerDetails.phone,
            customer_company: customerDetails.company,
            customer_address: customerDetails.address,
            customer_country: customerDetails.country,
            customer_tax_id: customerDetails.tax_id,
            exchange_rate: EXCHANGE_RATE,
            total_usd: calculateTotalAmount()
        };
        
        // Verify payment with timeout
        const verifyController = new AbortController();
        const verifyTimeoutId = setTimeout(() => verifyController.abort(), 10000);
        
        const verifyResponse = await fetch('https://nexoraindustries365.pythonanywhere.com/api/verify-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(verificationData),
            signal: verifyController.signal
        });
        clearTimeout(verifyTimeoutId);
        
        if (!verifyResponse.ok) {
            throw new Error(`HTTP error! status: ${verifyResponse.status}`);
        }
        
        const verification = await verifyResponse.json();
        
        if (verification.status === 'success') {
            // Generate invoice
            await generateAndDownloadInvoice(paymentResponse);
            
            // Send data to Formspree
            await sendInvoiceToFormspree(paymentResponse);
            
            showNotification('Payment successful! Your invoice has been downloaded. We will contact you within 24 hours to start your project.', 'success');
            
            // Reset form
            resetServiceSelection();
            
        } else {
            throw new Error(verification.message || 'Payment verification failed');
        }
        
    } catch (error) {
        console.error('Payment handling failed:', error);
        
        if (error.name === 'AbortError') {
            showNotification('Payment verification timed out. Please contact support.', 'error');
        } else {
            showNotification('Payment verification failed: ' + error.message, 'error');
        }
    } finally {
        hideLoading();
    }
}

async function generateAndDownloadInvoice(paymentResponse) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const totalUSD = calculateTotalAmount();
    const totalINR = totalUSD * EXCHANGE_RATE;
    
    // Colors
    const primaryColor = [37, 99, 235]; // #2563EB
    const secondaryColor = [124, 58, 237]; // #7C3AED
    const accentColor = [5, 150, 105]; // #059669
    const darkColor = [30, 41, 59]; // #1E293B
    const lightColor = [248, 250, 252]; // #F8FAFC
    
    let currentY = 15; // Start position
    
    // Function to check if we need a new page
    const checkNewPage = (spaceNeeded = 20) => {
        if (currentY + spaceNeeded > 280) {
            doc.addPage();
            currentY = 15;
            return true;
        }
        return false;
    };
    
    // Function to add text with automatic line breaks and page checks
    const addText = (text, x, y, options = {}) => {
        const { maxWidth = 170, fontSize = 10, align = 'left', bold = false } = options;
        
        if (bold) {
            doc.setFont('helvetica', 'bold');
        } else {
            doc.setFont('helvetica', 'normal');
        }
        
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(text, maxWidth);
        
        // Check if we need new page for this text block
        const textHeight = lines.length * (fontSize * 0.35);
        checkNewPage(textHeight + 10);
        
        lines.forEach((line, index) => {
            if (currentY + (index * (fontSize * 0.35)) > 280) {
                doc.addPage();
                currentY = 15;
            }
            doc.text(line, x, currentY + (index * (fontSize * 0.35)), { align });
        });
        
        currentY += lines.length * (fontSize * 0.35) + 2;
        return lines.length;
    };
    
    // Header with gradient
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, currentY - 15, 210, 40, 'F');
    
    // Company Logo/Name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('ANSHUMAN SINGH', 105, currentY, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('AI-Powered Development Services', 105, currentY + 8, { align: 'center' });
    doc.text('Nexora Global Pvt. Ltd.', 105, currentY + 8, { align: 'center' });
    
    currentY += 25;
    
    // Invoice Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text('PROFESSIONAL SERVICE INVOICE', 105, currentY, { align: 'center' });
    
    currentY += 15;
    
    // Invoice Details Box
    doc.setFillColor(lightColor[0], lightColor[1], lightColor[2]);
    doc.roundedRect(15, currentY, 180, 25, 3, 3, 'F');
    doc.setDrawColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.roundedRect(15, currentY, 180, 25, 3, 3, 'S');
    
    doc.setFontSize(10);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    
    // Left column
    doc.text('Invoice Number:', 20, currentY + 8);
    doc.text('INV-' + paymentResponse.razorpay_payment_id.slice(-8).toUpperCase(), 60, currentY + 8);
    
    doc.text('Invoice Date:', 20, currentY + 16);
    doc.text(new Date().toLocaleDateString('en-IN'), 60, currentY + 16);
    
    // Right column
    doc.text('Payment Status:', 120, currentY + 8);
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text('PAID', 160, currentY + 8);
    
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text('Due Date:', 120, currentY + 16);
    doc.text(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'), 160, currentY + 16);
    
    currentY += 35;
    
    // Company and Client Details
    checkNewPage(50);
    
    // Two column layout for FROM and BILL TO
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('FROM:', 20, currentY);
    doc.text('BILL TO:', 120, currentY);
    
    currentY += 8;
    
    // FROM details
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    const fromDetails = [
        'Anshuman Singh - AI Developer',
        'Uttar Pradesh, India',
        'Email: anshumansingh3697@gmail.com',
        'Website: anshuman365.github.io'
    ];
    
    let fromY = currentY;
    fromDetails.forEach(line => {
        doc.text(line, 20, fromY);
        fromY += 5;
    });
    
    // BILL TO details
    const billToDetails = [
        customerDetails.name,
        ...(customerDetails.company ? [customerDetails.company] : []),
        customerDetails.email,
        customerDetails.phone
    ];
    
    let billToY = currentY;
    billToDetails.forEach(line => {
        doc.text(line, 120, billToY);
        billToY += 5;
    });
    
    // Address
    const addressLines = doc.splitTextToSize(customerDetails.address, 70);
    addressLines.forEach((line, index) => {
        doc.text(line, 120, billToY + (index * 5));
    });
    billToY += addressLines.length * 5;
    
    if (customerDetails.tax_id) {
        doc.text('Tax ID: ' + customerDetails.tax_id, 120, billToY + 5);
    }
    
    // Move currentY to the bottom of the taller column
    currentY = Math.max(fromY, billToY) + 15;
    
    // Service Details Table
    checkNewPage(100);
    
    // Table Header
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(15, currentY, 180, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('Description', 20, currentY + 5.5);
    doc.text('USD', 150, currentY + 5.5, { align: 'right' });
    doc.text('INR', 180, currentY + 5.5, { align: 'right' });
    
    currentY += 12;
    
    // Function to add a service row
    const addServiceRow = (description, usdPrice, isSubItem = false, isCustom = false) => {
        checkNewPage(20);
        
        const inrPrice = usdPrice * EXCHANGE_RATE;
        const indent = isSubItem ? 25 : 20;
        const fontSize = isSubItem ? 8 : 10;
        
        doc.setFontSize(fontSize);
        
        if (isSubItem) {
            doc.setFont('helvetica', 'normal');
        } else {
            doc.setFont('helvetica', 'bold');
        }
        
        doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
        
        // Handle description with line breaks
        const descLines = doc.splitTextToSize(description, isSubItem ? 100 : 95);
        const lineHeight = fontSize * 0.35;
        
        descLines.forEach((line, index) => {
            if (index === 0) {
                doc.text(line, indent, currentY + (index * lineHeight));
            } else {
                doc.text(line, indent + 5, currentY + (index * lineHeight));
            }
        });
        
        const descHeight = descLines.length * lineHeight;
        
        // USD Price
        if (usdPrice !== null && !isSubItem) {
            const usdText = isCustom ? 'Included' : `$${usdPrice.toFixed(2)}`;
            doc.text(usdText, 150, currentY + (descHeight / 2), { align: 'right' });
        }
        
        // INR Price
        if (usdPrice !== null && !isSubItem) {
            const inrText = isCustom ? 'Included' : `Rs. ${inrPrice.toFixed(2)}`;
            doc.text(inrText, 180, currentY + (descHeight / 2), { align: 'right' });
        }
        
        currentY += descHeight + 3;
        return descHeight;
    };
    
    // Selected Package
    if (selectedPackage) {
        addServiceRow(selectedPackage.name, selectedPackage.price);
        
        // Package features
        selectedPackage.features.forEach(feature => {
            addServiceRow(`• ${feature}`, null, true);
        });
        currentY += 5;
    }
    
    // Add-ons
    selectedAddOns.forEach(addon => {
        addServiceRow(addon.name, addon.price);
    });
    
    // Custom Requirements
    if (customRequirements) {
        currentY += 5;
        addServiceRow('Custom Requirements', null, false, true);
        
        doc.setFontSize(8);
        const customLines = doc.splitTextToSize(customRequirements, 140);
        customLines.forEach(line => {
            addServiceRow(line, null, true);
        });
        doc.setFontSize(10);
        currentY += 5;
    }
    
    // Total Section
    checkNewPage(30);
    currentY += 5;
    
    doc.setDrawColor(200, 200, 200);
    doc.line(15, currentY, 195, currentY);
    currentY += 8;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    
    // Subtotal
    doc.text('Subtotal:', 90, currentY);
    doc.text(`$${totalUSD.toFixed(2)}`, 150, currentY, { align: 'right' });
    doc.text(`Rs. ${totalINR.toFixed(2)}`, 180, currentY, { align: 'right' });
    
    currentY += 8;
    
    // Total Amount
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text('TOTAL AMOUNT:', 90, currentY);
    doc.text(`$${totalUSD.toFixed(2)}`, 150, currentY, { align: 'right' });
    doc.text(`Rs. ${totalINR.toFixed(2)}`, 180, currentY, { align: 'right' });
    
    currentY += 15;
    
    // Exchange Rate Note
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Exchange Rate: 1 USD = ${EXCHANGE_RATE} INR (Real-time rate)`, 105, currentY, { align: 'center' });
    
    currentY += 10;
    
    // Payment Details
    checkNewPage(40);
    doc.setFontSize(10);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Details:', 20, currentY);
    doc.setFont('helvetica', 'normal');
    currentY += 7;
    doc.text(`Payment ID: ${paymentResponse.razorpay_payment_id}`, 25, currentY);
    currentY += 5;
    doc.text(`Order ID: ${paymentResponse.razorpay_order_id}`, 25, currentY);
    currentY += 5;
    doc.text(`Payment Date: ${new Date().toLocaleString('en-IN')}`, 25, currentY);
    currentY += 5;
    doc.text(`Payment Method: Razorpay (INR)`, 25, currentY);
    
    currentY += 10;
    
    // Terms and Conditions Section
    checkNewPage(100);
    
    doc.setFillColor(lightColor[0], lightColor[1], lightColor[2]);
    const termsHeight = 80;
    doc.roundedRect(15, currentY, 180, termsHeight, 3, 3, 'F');
    doc.setDrawColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.roundedRect(15, currentY, 180, termsHeight, 3, 3, 'S');
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('TERMS & CONDITIONS', 20, currentY + 7);
    
    doc.setFontSize(8);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFont('helvetica', 'normal');
    
    const terms = [
        'This is a testing invoice. No real payment or money transfer will occur. This invoice is generated only for development and demonstration purposes and is not valid for any financial transactions.',
        '1. All payments are final and non-refundable once project development has commenced.',
        '2. Service delivery timeline starts after payment confirmation and requirement finalization.',
        '3. Client is responsible for providing all necessary content and assets for the project.',
        '4. Additional charges may apply for scope changes after project commencement.',
        '5. Monthly management services auto-renew unless cancelled with 30 days notice.',
        '6. All intellectual property rights transfer to client upon full payment.',
        '7. Anshuman Singh retains the right to display completed work in portfolio.',
        '8. Client agrees to provide timely feedback and approvals to maintain project timeline.',
        '9. Hosting and domain services are subject to third-party provider terms.',
        '10. This agreement is governed by the laws of India.'
    ];
    
    let termsY = currentY + 15;
    terms.forEach(term => {
        checkNewPage(10);
        const termLines = doc.splitTextToSize(term, 170);
        termLines.forEach(line => {
            if (termsY > currentY + termsHeight - 5) {
                // If terms don't fit, continue on next page
                doc.addPage();
                currentY = 15;
                termsY = currentY + 10;
                
                // Redraw terms box on new page
                doc.setFillColor(lightColor[0], lightColor[1], lightColor[2]);
                doc.roundedRect(15, currentY, 180, termsHeight, 3, 3, 'F');
                doc.setDrawColor(darkColor[0], darkColor[1], darkColor[2]);
                doc.roundedRect(15, currentY, 180, termsHeight, 3, 3, 'S');
                
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                doc.text('TERMS & CONDITIONS (Continued)', 20, currentY + 7);
                doc.setFontSize(8);
                doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
                doc.setFont('helvetica', 'normal');
                
                termsY = currentY + 15;
            }
            doc.text(line, 20, termsY);
            termsY += 4;
        });
        termsY += 2;
    });
    
    currentY = termsY + 10;
    
    // Footer
    checkNewPage(20);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('This is a computer-generated invoice and does not require a physical signature.', 105, currentY, { align: 'center' });
    currentY += 4;
    doc.text('Thank you for choosing Anshuman Singh - AI Powered Development Services', 105, currentY, { align: 'center' });
    currentY += 4;
    doc.text('For support, contact: anshumansingh3697@gmail.com | anshuman365.github.io', 105, currentY, { align: 'center' });
    
    // Download invoice
    const fileName = `invoice-${paymentResponse.razorpay_payment_id.slice(-8)}.pdf`;
    doc.save(fileName);
    
    return fileName;
}

async function sendInvoiceToFormspree(paymentResponse) {
    const formData = {
        _subject: `New Service Payment - ${selectedPackage.name}`,
        package: selectedPackage ? selectedPackage.name : 'Custom',
        addons: selectedAddOns.map(a => a.name).join(', '),
        custom_requirements: customRequirements,
        total_amount_usd: calculateTotalAmount(),
        total_amount_inr: calculateTotalAmount() * EXCHANGE_RATE,
        payment_id: paymentResponse.razorpay_payment_id,
        order_id: paymentResponse.razorpay_order_id,
        signature: paymentResponse.razorpay_signature,
        customer_name: customerDetails.name,
        customer_email: customerDetails.email,
        customer_phone: customerDetails.phone,
        customer_company: customerDetails.company,
        customer_address: customerDetails.address,
        customer_country: customerDetails.country,
        customer_tax_id: customerDetails.tax_id,
        timestamp: new Date().toISOString(),
        service_type: 'web_development',
        exchange_rate: EXCHANGE_RATE
    };
    
    try {
        await fetch('https://formspree.io/f/mdklpdpo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        });
    } catch (error) {
        console.error('Failed to send invoice to Formspree:', error);
        // Non-critical error, don't show to user
    }
}

function resetServiceSelection() {
    selectedPackage = null;
    selectedAddOns = [];
    customRequirements = "";
    customerDetails = {};
    
    // Reset UI
    document.querySelectorAll('.package-card').forEach(card => {
        card.classList.remove('border-primary', 'border-2');
        card.classList.add('border-gray-200', 'dark:border-gray-700');
    });
    
    document.querySelectorAll('.addon-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    document.querySelectorAll('.custom-checkbox').forEach(label => {
        label.classList.remove('bg-primary', 'border-primary');
        label.innerHTML = '';
    });
    
    document.getElementById('custom-requirements').value = '';
    document.getElementById('customer-form').reset();
    document.getElementById('order-summary').classList.add('hidden');
    document.getElementById('customer-details').classList.add('hidden');
}

// Helper functions for notifications and loading
function showNotification(message, type = 'info') {
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
    } else {
        // Fallback if global function doesn't exist
        alert(message);
    }
}

function showLoading() {
    if (typeof window.showLoading === 'function') {
        window.showLoading();
    } else {
        // Fallback if global function doesn't exist
        console.log('Loading...');
    }
}

function hideLoading() {
    if (typeof window.hideLoading === 'function') {
        window.hideLoading();
    } else {
        // Fallback if global function doesn't exist
        console.log('Loading complete');
    }
}
