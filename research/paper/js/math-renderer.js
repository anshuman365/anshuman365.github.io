/**
 * Math Renderer for Research Papers
 * Enhanced mathematical equation rendering with MathJax and custom styling
 */

class MathRenderer {
    constructor() {
        this.mathElements = [];
        this.equationCount = 0;
        this.isMathJaxLoaded = false;
        this.config = {
            tex: {
                inlineMath: [['$', '$'], ['\\(', '\\)']],
                displayMath: [['$$', '$$'], ['\\[', '\\]']],
                packages: ['base', 'ams', 'autoload'],
                macros: {
                    bra: ["\\langle #1 |", 1],
                    ket: ["| #1 \\rangle", 1],
                    braket: ["\\langle #1 | #2 \\rangle", 2],
                    expected: ["\\langle #1 \\rangle", 1],
                    matrix: ["\\begin{bmatrix} #1 \\end{bmatrix}", 1],
                    pmatrix: ["\\begin{pmatrix} #1 \\end{pmatrix}", 1],
                    bmatrix: ["\\begin{bmatrix} #1 \\end{bmatrix}", 1],
                    vmatrix: ["\\begin{vmatrix} #1 \\end{vmatrix}", 1],
                    partial: ["\\frac{\\partial #1}{\\partial #2}", 2],
                    grad: ["\\nabla #1", 1],
                    div: ["\\nabla \\cdot #1", 1],
                    curl: ["\\nabla \\times #1", 1],
                    norm: ["\\left\\lVert #1 \\right\\rVert", 1],
                    abs: ["\\left\\lvert #1 \\right\\rvert", 1],
                    floor: ["\\left\\lfloor #1 \\right\\rfloor", 1],
                    ceil: ["\\left\\lceil #1 \\right\\rceil", 1],
                    trace: ["\\operatorname{Tr}\\left(#1\\right)", 1],
                    det: ["\\det\\left(#1\\right)", 1],
                    rank: ["\\operatorname{rank}\\left(#1\\right)", 1],
                    span: ["\\operatorname{span}\\left(#1\\right)", 1],
                    dim: ["\\dim\\left(#1\\right)", 1],
                    ker: ["\\ker\\left(#1\\right)", 1],
                    im: ["\\operatorname{Im}\\left(#1\\right)", 1],
                    re: ["\\operatorname{Re}\\left(#1\\right)", 1],
                    im: ["\\operatorname{Im}\\left(#1\\right)", 1],
                    arg: ["\\arg\\left(#1\\right)", 1],
                    log: ["\\log\\left(#1\\right)", 1],
                    ln: ["\\ln\\left(#1\\right)", 1],
                    exp: ["\\exp\\left(#1\\right)", 1],
                    sin: ["\\sin\\left(#1\\right)", 1],
                    cos: ["\\cos\\left(#1\\right)", 1],
                    tan: ["\\tan\\left(#1\\right)", 1],
                    sec: ["\\sec\\left(#1\\right)", 1],
                    csc: ["\\csc\\left(#1\\right)", 1],
                    cot: ["\\cot\\left(#1\\right)", 1],
                    arcsin: ["\\arcsin\\left(#1\\right)", 1],
                    arccos: ["\\arccos\\left(#1\\right)", 1],
                    arctan: ["\\arctan\\left(#1\\right)", 1],
                    sinh: ["\\sinh\\left(#1\\right)", 1],
                    cosh: ["\\cosh\\left(#1\\right)", 1],
                    tanh: ["\\tanh\\left(#1\\right)", 1],
                    coth: ["\\coth\\left(#1\\right)", 1],
                    sech: ["\\operatorname{sech}\\left(#1\\right)", 1],
                    csch: ["\\operatorname{csch}\\left(#1\\right)", 1],
                    arsinh: ["\\operatorname{arsinh}\\left(#1\\right)", 1],
                    arcosh: ["\\operatorname{arcosh}\\left(#1\\right)", 1],
                    artanh: ["\\operatorname{artanh}\\left(#1\\right)", 1],
                    sinc: ["\\operatorname{sinc}\\left(#1\\right)", 1],
                    diag: ["\\operatorname{diag}\\left(#1\\right)", 1],
                    sgn: ["\\operatorname{sgn}\\left(#1\\right)", 1],
                    erf: ["\\operatorname{erf}\\left(#1\\right)", 1],
                    erfc: ["\\operatorname{erfc}\\left(#1\\right)", 1],
                    Res: ["\\operatorname{Res}\\left(#1\\right)", 1],
                    Var: ["\\operatorname{Var}\\left(#1\\right)", 1],
                    Cov: ["\\operatorname{Cov}\\left(#1\\right)", 1],
                    E: ["\\mathbb{E}\\left[#1\\right]", 1],
                    P: ["\\mathbb{P}\\left(#1\\right)", 1],
                    N: ["\\mathcal{N}\\left(#1\\right)", 1],
                    R: ["\\mathbb{R}", 0],
                    C: ["\\mathbb{C}", 0],
                    Q: ["\\mathbb{Q}", 0],
                    Z: ["\\mathbb{Z}", 0],
                    N: ["\\mathbb{N}", 0],
                    H: ["\\mathbb{H}", 0],
                    F: ["\\mathbb{F}", 0],
                    A: ["\\mathcal{A}", 0],
                    B: ["\\mathcal{B}", 0],
                    L: ["\\mathcal{L}", 0],
                    M: ["\\mathcal{M}", 0],
                    O: ["\\mathcal{O}", 0],
                    S: ["\\mathcal{S}", 0],
                    T: ["\\mathcal{T}", 0],
                    U: ["\\mathcal{U}", 0],
                    V: ["\\mathcal{V}", 0],
                    W: ["\\mathcal{W}", 0],
                    X: ["\\mathcal{X}", 0],
                    Y: ["\\mathcal{Y}", 0],
                    Z: ["\\mathcal{Z}", 0],
                    alpha: "\\alpha",
                    beta: "\\beta",
                    gamma: "\\gamma",
                    Gamma: "\\Gamma",
                    delta: "\\delta",
                    Delta: "\\Delta",
                    epsilon: "\\epsilon",
                    varepsilon: "\\varepsilon",
                    zeta: "\\zeta",
                    eta: "\\eta",
                    theta: "\\theta",
                    vartheta: "\\vartheta",
                    Theta: "\\Theta",
                    iota: "\\iota",
                    kappa: "\\kappa",
                    lambda: "\\lambda",
                    Lambda: "\\Lambda",
                    mu: "\\mu",
                    nu: "\\nu",
                    xi: "\\xi",
                    Xi: "\\Xi",
                    pi: "\\pi",
                    varpi: "\\varpi",
                    Pi: "\\Pi",
                    rho: "\\rho",
                    varrho: "\\varrho",
                    sigma: "\\sigma",
                    varsigma: "\\varsigma",
                    Sigma: "\\Sigma",
                    tau: "\\tau",
                    upsilon: "\\upsilon",
                    Upsilon: "\\Upsilon",
                    phi: "\\phi",
                    varphi: "\\varphi",
                    Phi: "\\Phi",
                    chi: "\\chi",
                    psi: "\\psi",
                    Psi: "\\Psi",
                    omega: "\\omega",
                    Omega: "\\Omega",
                    partial: "\\partial",
                    nabla: "\\nabla",
                    hbar: "\\hbar",
                    ell: "\\ell",
                    Re: "\\Re",
                    Im: "\\Im",
                    wp: "\\wp",
                    aleph: "\\aleph",
                    beth: "\\beth",
                    gimel: "\\gimel",
                    daleth: "\\daleth",
                    eth: "\\eth",
                    hbar: "\\hbar",
                    hslash: "\\hslash",
                    matheth: "\\eth",
                    mathring: "\\mathring",
                    oiint: "\\oiint",
                    oiiint: "\\oiiint",
                    oint: "\\oint",
                    surd: "\\surd",
                    top: "\\top",
                    bot: "\\bot",
                    vdash: "\\vdash",
                    dashv: "\\dashv",
                    Vdash: "\\Vdash",
                    vDash: "\\vDash",
                    Vvash: "\\Vvash",
                    forces: "\\Vdash",
                    models: "\\models",
                    lVert: "\\lVert",
                    rVert: "\\rVert",
                    lvert: "\\lvert",
                    rvert: "\\rvert",
                    langle: "\\langle",
                    rangle: "\\rangle",
                    lfloor: "\\lfloor",
                    rfloor: "\\rfloor",
                    lceil: "\\lceil",
                    rceil: "\\rceil",
                    ulcorner: "\\ulcorner",
                    urcorner: "\\urcorner",
                    llcorner: "\\llcorner",
                    lrcorner: "\\lrcorner",
                    leftrightarrow: "\\leftrightarrow",
                    Leftrightarrow: "\\Leftrightarrow",
                    rightleftharpoons: "\\rightleftharpoons",
                    leftharpoonup: "\\leftharpoonup",
                    leftharpoondown: "\\leftharpoondown",
                    rightharpoonup: "\\rightharpoonup",
                    rightharpoondown: "\\rightharpoondown",
                    hookleftarrow: "\\hookleftarrow",
                    hookrightarrow: "\\hookrightarrow",
                    longleftarrow: "\\longleftarrow",
                    Longleftarrow: "\\Longleftarrow",
                    longrightarrow: "\\longrightarrow",
                    Longrightarrow: "\\Longrightarrow",
                    longleftrightarrow: "\\longleftrightarrow",
                    Longleftrightarrow: "\\Longleftrightarrow",
                    mapsto: "\\mapsto",
                    longmapsto: "\\longmapsto",
                    nearrow: "\\nearrow",
                    searrow: "\\searrow",
                    swarrow: "\\swarrow",
                    nwarrow: "\\nwarrow",
                    leadsto: "\\leadsto",
                    gets: "\\gets",
                    to: "\\to",
                    leftarrow: "\\leftarrow",
                    Leftarrow: "\\Leftarrow",
                    rightarrow: "\\rightarrow",
                    Rightarrow: "\\Rightarrow",
                    uparrow: "\\uparrow",
                    Uparrow: "\\Uparrow",
                    downarrow: "\\downarrow",
                    Downarrow: "\\Downarrow",
                    updownarrow: "\\updownarrow",
                    Updownarrow: "\\Updownarrow",
                    backslash: "\\backslash",
                    vert: "\\vert",
                    Vert: "\\Vert",
                    mid: "\\mid",
                    nmid: "\\nmid",
                    parallel: "\\parallel",
                    nparallel: "\\nparallel",
                    shortmid: "\\shortmid",
                    nshortmid: "\\nshortmid",
                    shortparallel: "\\shortparallel",
                    nshortparallel: "\\nshortparallel",
                    smallsetminus: "\\smallsetminus",
                    thinspace: "\\,",
                    medspace: "\\:",
                    thickspace: "\\;",
                    quad: "\\quad",
                    qquad: "\\qquad",
                    neg: "\\neg",
                    nexists: "\\nexists",
                    empty: "\\empty",
                    varnothing: "\\varnothing",
                    triangle: "\\triangle",
                    bigtriangleup: "\\bigtriangleup",
                    bigtriangledown: "\\bigtriangledown",
                    triangleleft: "\\triangleleft",
                    triangleright: "\\triangleright",
                    bigcirc: "\\bigcirc",
                    diamondsuit: "\\diamondsuit",
                    heartsuit: "\\heartsuit",
                    clubsuit: "\\clubsuit",
                    spadesuit: "\\spadesuit",
                    flat: "\\flat",
                    natural: "\\natural",
                    sharp: "\\sharp",
                    diagup: "\\diagup",
                    diagdown: "\\diagdown",
                    cent: "\\cent",
                    pounds: "\\pounds",
                    yen: "\\yen",
                    euro: "\\euro",
                    degree: "\\degree",
                    celsius: "\\celsius",
                    fahrenheit: "\\fahrenheit",
                    mathring: "\\mathring",
                    ang: "\\ang"
                }
            },
            svg: {
                fontCache: 'global',
                scale: 1,
                minScale: 0.5
            },
            startup: {
                ready: () => {
                    console.log('MathJax is ready');
                    this.isMathJaxLoaded = true;
                    this.processEquations();
                    this.addEquationNumbers();
                    this.addCopyButtons();
                }
            },
            options: {
                enableMenu: true,
                menuOptions: {
                    settings: {
                        zoom: 'Hover',
                        zscale: '200%',
                        renderer: 'SVG',
                        alt: false,
                        cmd: false,
                        ctrl: false,
                        shift: false,
                        scale: 1,
                        discoverable: true
                    },
                    semantics: false
                }
            }
        };
    }

    init() {
        // Load MathJax if not already loaded
        if (typeof MathJax === 'undefined') {
            this.loadMathJax();
        } else {
            this.configureMathJax();
        }

        // Find all math elements
        this.findMathElements();
        
        // Add custom styles
        this.addStyles();
        
        // Initialize equation tools
        this.initEquationTools();
        
        console.log('Math Renderer initialized. Equations found:', this.mathElements.length);
    }

    loadMathJax() {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
        script.async = true;
        
        script.onload = () => {
            this.configureMathJax();
        };
        
        script.onerror = () => {
            console.error('Failed to load MathJax. Using fallback rendering.');
            this.fallbackRendering();
        };
        
        document.head.appendChild(script);
    }

    configureMathJax() {
        if (window.MathJax) {
            window.MathJax = {
                ...window.MathJax,
                ...this.config
            };
            
            // Queue for processing
            window.MathJax.startup.promise.then(() => {
                this.isMathJaxLoaded = true;
                this.processEquations();
            });
        }
    }

    findMathElements() {
        // Find inline math
        const inlineMath = document.querySelectorAll('.equation-box, .math-inline, [data-math]');
        
        // Find display math
        const displayMath = document.querySelectorAll('pre.math, div.math, [data-math-display]');
        
        // Find LaTeX in text
        const textNodes = this.findTextNodes(document.body);
        
        this.mathElements = [...inlineMath, ...displayMath];
        console.log(`Found ${this.mathElements.length} math elements`);
    }

    findTextNodes(element) {
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        const nodes = [];
        let node;
        while (node = walker.nextNode()) {
            if (node.textContent.includes('$') || node.textContent.includes('\\(')) {
                nodes.push(node);
            }
        }
        
        return nodes;
    }

    processEquations() {
        if (!this.isMathJaxLoaded) return;

        this.mathElements.forEach((element, index) => {
            this.equationCount++;
            
            // Add equation wrapper
            const wrapper = document.createElement('div');
            wrapper.className = 'equation-wrapper';
            wrapper.dataset.equationId = `eq-${this.equationCount}`;
            
            // Wrap the element
            element.parentNode.insertBefore(wrapper, element);
            wrapper.appendChild(element);
            
            // Add equation number
            const number = document.createElement('div');
            number.className = 'equation-number';
            number.textContent = `(${this.equationCount})`;
            wrapper.appendChild(number);
            
            // Add copy button
            const copyBtn = document.createElement('button');
            copyBtn.className = 'equation-copy-btn';
            copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
            copyBtn.title = 'Copy equation to clipboard';
            copyBtn.onclick = () => this.copyEquation(element, this.equationCount);
            wrapper.appendChild(copyBtn);
            
            // Add zoom button
            const zoomBtn = document.createElement('button');
            zoomBtn.className = 'equation-zoom-btn';
            zoomBtn.innerHTML = '<i class="fas fa-search-plus"></i>';
            zoomBtn.title = 'Zoom equation';
            zoomBtn.onclick = () => this.zoomEquation(element);
            wrapper.appendChild(zoomBtn);
        });

        // Process with MathJax
        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise(this.mathElements).then(() => {
                console.log(`Rendered ${this.mathElements.length} equations`);
                this.addEquationNumbers();
                this.addCopyButtons();
            }).catch(error => {
                console.error('MathJax rendering error:', error);
                this.fallbackRendering();
            });
        }
    }

    fallbackRendering() {
        console.log('Using fallback equation rendering');
        
        this.mathElements.forEach((element, index) => {
            this.equationCount++;
            
            const tex = element.textContent.trim();
            const isDisplay = element.classList.contains('math-display') || 
                             element.parentElement.classList.contains('equation-box');
            
            // Simple rendering for common patterns
            let html = tex
                .replace(/\\frac{([^}]+)}{([^}]+)}/g, '<span class="frac"><span class="numerator">$1</span><span class="denominator">$2</span></span>')
                .replace(/\\sqrt{([^}]+)}/g, '<span class="sqrt">√<span class="radicand">$1</span></span>')
                .replace(/\\sum_({[^}]+})?\^{({[^}]+})?/g, '<span class="sum">∑</span>')
                .replace(/\\int/g, '<span class="integral">∫</span>')
                .replace(/\\partial/g, '<span class="partial">∂</span>')
                .replace(/\\nabla/g, '<span class="nabla">∇</span>')
                .replace(/\\alpha/g, 'α')
                .replace(/\\beta/g, 'β')
                .replace(/\\gamma/g, 'γ')
                .replace(/\\Gamma/g, 'Γ')
                .replace(/\\delta/g, 'δ')
                .replace(/\\Delta/g, 'Δ')
                .replace(/\\epsilon/g, 'ε')
                .replace(/\\varepsilon/g, 'ε')
                .replace(/\\zeta/g, 'ζ')
                .replace(/\\eta/g, 'η')
                .replace(/\\theta/g, 'θ')
                .replace(/\\Theta/g, 'Θ')
                .replace(/\\lambda/g, 'λ')
                .replace(/\\Lambda/g, 'Λ')
                .replace(/\\mu/g, 'μ')
                .replace(/\\nu/g, 'ν')
                .replace(/\\xi/g, 'ξ')
                .replace(/\\Xi/g, 'Ξ')
                .replace(/\\pi/g, 'π')
                .replace(/\\Pi/g, 'Π')
                .replace(/\\rho/g, 'ρ')
                .replace(/\\sigma/g, 'σ')
                .replace(/\\Sigma/g, 'Σ')
                .replace(/\\tau/g, 'τ')
                .replace(/\\phi/g, 'φ')
                .replace(/\\Phi/g, 'Φ')
                .replace(/\\chi/g, 'χ')
                .replace(/\\psi/g, 'ψ')
                .replace(/\\Psi/g, 'Ψ')
                .replace(/\\omega/g, 'ω')
                .replace(/\\Omega/g, 'Ω');
            
            element.innerHTML = html;
            element.classList.add('fallback-rendered');
            
            // Add wrapper
            const wrapper = document.createElement('div');
            wrapper.className = 'equation-wrapper fallback';
            wrapper.dataset.equationId = `eq-${this.equationCount}`;
            
            element.parentNode.insertBefore(wrapper, element);
            wrapper.appendChild(element);
            
            // Add equation number
            const number = document.createElement('div');
            number.className = 'equation-number';
            number.textContent = `(${this.equationCount})`;
            wrapper.appendChild(number);
        });
    }

    addEquationNumbers() {
        // MathJax adds equation numbers automatically, but we need to style them
        document.querySelectorAll('.MathJax_Display').forEach((element, index) => {
            const number = element.querySelector('.MathJax span');
            if (number && number.textContent.match(/^\([0-9]+\)$/)) {
                number.classList.add('equation-number');
                
                // Add copy button
                const copyBtn = document.createElement('button');
                copyBtn.className = 'equation-copy-btn';
                copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
                copyBtn.title = 'Copy equation to clipboard';
                copyBtn.onclick = () => this.copyEquation(element, index + 1);
                element.appendChild(copyBtn);
                
                // Add zoom button
                const zoomBtn = document.createElement('button');
                zoomBtn.className = 'equation-zoom-btn';
                zoomBtn.innerHTML = '<i class="fas fa-search-plus"></i>';
                zoomBtn.title = 'Zoom equation';
                zoomBtn.onclick = () => this.zoomEquation(element);
                element.appendChild(zoomBtn);
            }
        });
    }

    addCopyButtons() {
        // Already added in processEquations, but ensure all have them
        document.querySelectorAll('.equation-wrapper, .MathJax_Display').forEach((wrapper, index) => {
            if (!wrapper.querySelector('.equation-copy-btn')) {
                const copyBtn = document.createElement('button');
                copyBtn.className = 'equation-copy-btn';
                copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
                copyBtn.title = 'Copy equation to clipboard';
                copyBtn.onclick = () => this.copyEquation(wrapper, index + 1);
                wrapper.appendChild(copyBtn);
            }
            
            if (!wrapper.querySelector('.equation-zoom-btn')) {
                const zoomBtn = document.createElement('button');
                zoomBtn.className = 'equation-zoom-btn';
                zoomBtn.innerHTML = '<i class="fas fa-search-plus"></i>';
                zoomBtn.title = 'Zoom equation';
                zoomBtn.onclick = () => this.zoomEquation(wrapper);
                wrapper.appendChild(zoomBtn);
            }
        });
    }

    addStyles() {
        const styles = `
            .equation-wrapper {
                position: relative;
                margin: 2rem 0;
                padding: 1.5rem;
                background: rgba(30, 41, 59, 0.7);
                border-radius: 12px;
                border-left: 4px solid #6366F1;
                overflow: hidden;
            }
            
            .equation-wrapper:hover {
                background: rgba(30, 41, 59, 0.9);
            }
            
            .equation-number {
                position: absolute;
                right: 10px;
                top: 10px;
                color: #8B5CF6;
                font-weight: bold;
                font-size: 0.9rem;
                background: rgba(139, 92, 246, 0.1);
                padding: 2px 8px;
                border-radius: 4px;
            }
            
            .equation-copy-btn {
                position: absolute;
                left: 10px;
                top: 10px;
                background: rgba(99, 102, 241, 0.2);
                border: 1px solid rgba(99, 102, 241, 0.4);
                color: #6366F1;
                width: 32px;
                height: 32px;
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                opacity: 0;
            }
            
            .equation-zoom-btn {
                position: absolute;
                left: 50px;
                top: 10px;
                background: rgba(236, 72, 153, 0.2);
                border: 1px solid rgba(236, 72, 153, 0.4);
                color: #EC4899;
                width: 32px;
                height: 32px;
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                opacity: 0;
            }
            
            .equation-wrapper:hover .equation-copy-btn,
            .equation-wrapper:hover .equation-zoom-btn {
                opacity: 1;
            }
            
            .equation-copy-btn:hover {
                background: rgba(99, 102, 241, 0.4);
                transform: translateY(-2px);
            }
            
            .equation-zoom-btn:hover {
                background: rgba(236, 72, 153, 0.4);
                transform: translateY(-2px);
            }
            
            .mathjax-equation {
                overflow-x: auto;
                padding: 10px;
            }
            
            .MathJax_Display {
                overflow-x: auto !important;
                padding: 20px 0 !important;
                margin: 1.5rem 0 !important;
            }
            
            .MathJax {
                outline: none;
            }
            
            .equation-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .equation-modal.active {
                opacity: 1;
            }
            
            .equation-modal-content {
                background: #1e293b;
                padding: 2rem;
                border-radius: 16px;
                max-width: 90%;
                max-height: 90%;
                overflow: auto;
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }
            
            .equation-modal.active .equation-modal-content {
                transform: scale(1);
            }
            
            .equation-modal .MathJax_Display {
                transform: scale(1.5);
                transform-origin: center;
            }
            
            .equation-modal-close {
                position: absolute;
                top: 20px;
                right: 20px;
                background: #ef4444;
                color: white;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 1.5rem;
                border: none;
            }
            
            .fallback-rendered .frac {
                display: inline-block;
                text-align: center;
                vertical-align: middle;
            }
            
            .fallback-rendered .numerator {
                display: block;
                border-bottom: 1px solid;
                padding: 0 0.2em;
            }
            
            .fallback-rendered .denominator {
                display: block;
                padding: 0 0.2em;
            }
            
            .fallback-rendered .sqrt {
                position: relative;
                padding-left: 0.5em;
            }
            
            .fallback-rendered .sqrt:before {
                content: '√';
                position: absolute;
                left: 0;
                top: -0.1em;
            }
            
            .fallback-rendered .radicand {
                border-top: 1px solid;
                padding: 0 0.2em;
            }
            
            @media print {
                .equation-copy-btn,
                .equation-zoom-btn {
                    display: none !important;
                }
                
                .equation-wrapper {
                    break-inside: avoid;
                }
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    initEquationTools() {
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+C to copy focused equation
            if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                const focused = document.activeElement.closest('.equation-wrapper');
                if (focused) {
                    const eqNumber = focused.dataset.equationId?.replace('eq-', '');
                    this.copyEquation(focused, eqNumber);
                    e.preventDefault();
                }
            }
            
            // Ctrl+Shift+Z to zoom focused equation
            if (e.ctrlKey && e.shiftKey && e.key === 'Z') {
                const focused = document.activeElement.closest('.equation-wrapper');
                if (focused) {
                    this.zoomEquation(focused);
                    e.preventDefault();
                }
            }
            
            // Escape to close modal
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });

        // Add equation search functionality
        this.addEquationSearch();
    }

    addEquationSearch() {
        // Create search input if not exists
        if (!document.getElementById('equation-search')) {
            const searchDiv = document.createElement('div');
            searchDiv.className = 'fixed top-4 right-4 z-40 hidden print:hidden';
            searchDiv.id = 'equation-search-container';
            searchDiv.innerHTML = `
                <div class="bg-slate-800/90 backdrop-blur-sm p-3 rounded-lg shadow-xl">
                    <div class="flex items-center space-x-2">
                        <input type="text" 
                               id="equation-search" 
                               placeholder="Search equations..." 
                               class="bg-slate-900 text-white px-3 py-2 rounded-lg text-sm w-48 focus:outline-none focus:ring-2 focus:ring-quantum-primary">
                        <button id="equation-search-toggle" class="bg-quantum-primary text-white p-2 rounded-lg">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                    <div id="equation-results" class="mt-2 max-h-64 overflow-auto hidden"></div>
                </div>
            `;
            
            document.body.appendChild(searchDiv);
            
            // Add search functionality
            const searchInput = document.getElementById('equation-search');
            const resultsDiv = document.getElementById('equation-results');
            const toggleBtn = document.getElementById('equation-search-toggle');
            
            toggleBtn.addEventListener('click', () => {
                searchDiv.classList.toggle('hidden');
                if (!searchDiv.classList.contains('hidden')) {
                    searchInput.focus();
                }
            });
            
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                if (query.length < 2) {
                    resultsDiv.classList.add('hidden');
                    return;
                }
                
                const results = this.searchEquations(query);
                if (results.length > 0) {
                    resultsDiv.innerHTML = results.map(result => `
                        <div class="p-2 hover:bg-slate-700 rounded cursor-pointer equation-result" data-id="${result.id}">
                            <div class="text-sm font-medium">Equation (${result.number})</div>
                            <div class="text-xs text-slate-400 truncate">${result.text.substring(0, 60)}...</div>
                        </div>
                    `).join('');
                    
                    resultsDiv.classList.remove('hidden');
                    
                    // Add click handlers
                    resultsDiv.querySelectorAll('.equation-result').forEach(item => {
                        item.addEventListener('click', () => {
                            const eqId = item.dataset.id;
                            const equation = document.querySelector(`[data-equation-id="${eqId}"]`);
                            if (equation) {
                                equation.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                equation.style.animation = 'pulse 2s';
                                setTimeout(() => {
                                    equation.style.animation = '';
                                }, 2000);
                                searchDiv.classList.add('hidden');
                                searchInput.value = '';
                                resultsDiv.classList.add('hidden');
                            }
                        });
                    });
                } else {
                    resultsDiv.innerHTML = '<div class="p-2 text-slate-400 text-sm">No equations found</div>';
                    resultsDiv.classList.remove('hidden');
                }
            });
            
            // Close search when clicking outside
            document.addEventListener('click', (e) => {
                if (!searchDiv.contains(e.target) && !toggleBtn.contains(e.target)) {
                    searchDiv.classList.add('hidden');
                    resultsDiv.classList.add('hidden');
                }
            });
        }
    }

    searchEquations(query) {
        const results = [];
        
        document.querySelectorAll('.equation-wrapper').forEach(wrapper => {
            const text = wrapper.textContent.toLowerCase();
            const number = wrapper.dataset.equationId?.replace('eq-', '');
            
            if (text.includes(query) && number) {
                results.push({
                    id: wrapper.dataset.equationId,
                    number: number,
                    text: wrapper.textContent.replace(/\s+/g, ' ').trim()
                });
            }
        });
        
        return results;
    }

    copyEquation(element, equationNumber) {
        let tex = '';
        
        // Try to get MathJax source
        if (element.classList.contains('MathJax_Display')) {
            const mathJaxElement = element.querySelector('.MathJax');
            if (mathJaxElement && mathJaxElement.dataset.mathjax) {
                tex = mathJaxElement.dataset.mathjax;
            }
        }
        
        // Fallback to text content
        if (!tex) {
            tex = element.textContent.trim();
        }
        
        // Clean up the TeX
        tex = tex.replace(/^\s*\(\d+\)\s*/, '').trim();
        
        // Add equation number comment
        const texWithComment = `% Equation (${equationNumber})\n${tex}`;
        
        // Copy to clipboard
        navigator.clipboard.writeText(texWithComment).then(() => {
            // Show success message
            this.showCopySuccess(element, equationNumber);
            
            // Track analytics
            if (window.ResearchAnalytics) {
                window.ResearchAnalytics.trackCustomEvent('equation_copied', {
                    equation_number: equationNumber,
                    equation_text: tex.substring(0, 100)
                });
            }
        }).catch(err => {
            console.error('Failed to copy equation:', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = texWithComment;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            this.showCopySuccess(element, equationNumber);
        });
    }

    showCopySuccess(element, equationNumber) {
        // Create toast
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 left-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-slide-up';
        toast.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-check-circle mr-2"></i>
                <span>Equation (${equationNumber}) copied to clipboard!</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Highlight equation
        element.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.5)';
        element.style.transition = 'box-shadow 0.3s ease';
        
        // Remove toast and highlight after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => document.body.removeChild(toast), 300);
            
            element.style.boxShadow = '';
        }, 3000);
    }

    zoomEquation(element) {
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'equation-modal';
        modal.innerHTML = `
            <button class="equation-modal-close">
                <i class="fas fa-times"></i>
            </button>
            <div class="equation-modal-content">
                ${element.innerHTML}
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add active class after a frame
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        
        // Close button
        modal.querySelector('.equation-modal-close').addEventListener('click', () => {
            this.closeModal();
        });
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
        
        // Track analytics
        if (window.ResearchAnalytics) {
            window.ResearchAnalytics.trackCustomEvent('equation_zoomed', {
                equation_number: element.dataset.equationId?.replace('eq-', '')
            });
        }
    }

    closeModal() {
        const modal = document.querySelector('.equation-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        }
    }

    // Public API methods
    renderEquation(tex, display = true) {
        const element = document.createElement('div');
        element.textContent = tex;
        element.className = display ? 'math-display' : 'math-inline';
        
        // Create temporary container
        const container = document.createElement('div');
        container.appendChild(element);
        
        // Process with MathJax
        if (window.MathJax && window.MathJax.tex2chtmlPromise) {
            return window.MathJax.tex2chtmlPromise(tex, { display: display }).then((node) => {
                return node;
            });
        }
        
        return Promise.resolve(container.innerHTML);
    }

    getEquationCount() {
        return this.equationCount;
    }

    getAllEquations() {
        const equations = [];
        document.querySelectorAll('.equation-wrapper').forEach(wrapper => {
            equations.push({
                id: wrapper.dataset.equationId,
                number: wrapper.dataset.equationId?.replace('eq-', ''),
                html: wrapper.innerHTML,
                text: wrapper.textContent.replace(/\s+/g, ' ').trim()
            });
        });
        return equations;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.MathRenderer = new MathRenderer();
    window.MathRenderer.init();
    
    // Expose public methods
    window.renderMathEquation = (tex, display = true) => {
        return window.MathRenderer.renderEquation(tex, display);
    };
    
    window.getEquationStats = () => {
        return {
            total: window.MathRenderer.getEquationCount(),
            equations: window.MathRenderer.getAllEquations()
        };
    };
});

// Handle MathJax errors
window.addEventListener('MathJax-Error', (event) => {
    console.error('MathJax Error:', event.detail);
    
    if (window.MathRenderer) {
        window.MathRenderer.fallbackRendering();
    }
});