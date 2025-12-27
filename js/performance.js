// performance.js - Optimized loading strategy

(function() {
  'use strict';
  
  // Service Worker Registration
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('ServiceWorker registered:', registration.scope);
        })
        .catch(error => {
          console.log('ServiceWorker registration failed:', error);
        });
    });
  }
  
  // Load CSS with low priority
  function loadDeferredStyles() {
    const styles = [
      'css/main.css',
      'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
    ];
    
    styles.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.media = 'print';
      link.onload = () => { link.media = 'all'; };
      document.head.appendChild(link);
    });
  }
  
  // Lazy load images
  function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          if (img.dataset.srcset) img.srcset = img.dataset.srcset;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.1
    });
    
    images.forEach(img => imageObserver.observe(img));
  }
  
  // Defer non-critical JavaScript
  function loadDeferredScripts() {
    const scripts = [
      'js/include.js',
      'js/nav.js',
      'js/dark-mode.js',
      'js/translator.js',
      'js/chatbot.js'
    ];
    
    scripts.forEach(src => {
      const script = document.createElement('script');
      script.src = src;
      script.defer = true;
      document.body.appendChild(script);
    });
  }
  
  // Optimize AdSense loading
  function optimizeAds() {
    // Load AdSense only when user interacts or scrolls
    let adsLoaded = false;
    
    function loadAds() {
      if (adsLoaded) return;
      adsLoaded = true;
      
      const adScript = document.createElement('script');
      adScript.async = true;
      adScript.crossOrigin = 'anonymous';
      adScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2633513915753897';
      document.head.appendChild(adScript);
      
      setTimeout(() => {
        if (typeof adsbygoogle !== 'undefined') {
          (adsbygoogle = window.adsbygoogle || []).push({});
        }
      }, 1000);
    }
    
    // Load ads on user interaction
    ['click', 'scroll', 'touchstart', 'mousemove'].forEach(event => {
      window.addEventListener(event, loadAds, { once: true, passive: true });
    });
    
    // Or load after 5 seconds
    setTimeout(loadAds, 5000);
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  function init() {
    // Load deferred styles immediately
    loadDeferredStyles();
    
    // Initialize image lazy loading
    lazyLoadImages();
    
    // Load non-critical scripts after 1 second
    setTimeout(loadDeferredScripts, 1000);
    
    // Optimize ads loading
    optimizeAds();
    
    // Remove loading placeholders
    setTimeout(() => {
      const placeholders = document.querySelectorAll('#nav-placeholder, #footer-placeholder');
      placeholders.forEach(el => {
        if (el.innerHTML.trim() === '') {
          el.style.minHeight = '0';
        }
      });
    }, 2000);
  }
  
  // Web Vitals monitoring
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          console.log('FCP:', entry.startTime);
        }
        if (entry.name === 'largest-contentful-paint') {
          console.log('LCP:', entry.startTime);
        }
      }
    });
    
    observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
  }
})();