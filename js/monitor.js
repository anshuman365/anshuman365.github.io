// monitor.js - Performance monitoring
(function() {
  'use strict';
  
  // Collect performance metrics
  function collectMetrics() {
    const metrics = {};
    
    // Navigation Timing
    if (window.performance && window.performance.timing) {
      const perf = window.performance.timing;
      metrics.pageLoad = perf.loadEventEnd - perf.navigationStart;
      metrics.domInteractive = perf.domInteractive - perf.navigationStart;
      metrics.contentLoad = perf.domContentLoadedEventEnd - perf.navigationStart;
    }
    
    // Paint Timing
    if (window.performance && window.performance.getEntriesByType) {
      const paints = performance.getEntriesByType('paint');
      paints.forEach(paint => {
        metrics[paint.name] = paint.startTime;
      });
    }
    
    // Largest Contentful Paint
    if (window.PerformanceObserver) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        metrics.lcp = lastEntry.startTime;
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
    
    // Log metrics
    console.log('Performance Metrics:', metrics);
    
    // Send to analytics (optional)
    if (typeof gtag !== 'undefined') {
      gtag('event', 'performance_metrics', metrics);
    }
    
    return metrics;
  }
  
  // Monitor Core Web Vitals
  function monitorWebVitals() {
    // First Contentful Paint
    if (window.performance && window.performance.getEntriesByType) {
      const fcpEntry = performance.getEntriesByType('paint').find(
        entry => entry.name === 'first-contentful-paint'
      );
      if (fcpEntry) {
        console.log('FCP:', fcpEntry.startTime);
      }
    }
    
    // Cumulative Layout Shift
    let cls = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          cls += entry.value;
        }
      }
      console.log('CLS:', cls);
    }).observe({ type: 'layout-shift', buffered: true });
  }
  
  // Initialize on load
  window.addEventListener('load', () => {
    setTimeout(() => {
      collectMetrics();
      monitorWebVitals();
    }, 1000);
  });
})();