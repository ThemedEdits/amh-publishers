/**
 * AMH PUBLISHERS - OFFICIAL MODERN LUXURY LANDING PAGE
 * Lenis Smooth Scroll, Liquid Navigation, Custom Form Controls,
 * Typewriter, Interactive 3D Book, Calculator, Portfolio & Theme System
 */

document.addEventListener('DOMContentLoaded', () => {

  /* --------------------------------------------------------------------------
     1. INITIALIZE LENIS MOMENTUM SMOOTH SCROLLING (INSTANT & BUTTERY SMOOTH)
     -------------------------------------------------------------------------- */
  let lenisInstance = null;
  const isMobile = window.innerWidth <= 860 || ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

  // On mobile touch devices, let the browser's hardware-accelerated 120fps native touch scroll handle scrolling
  if (typeof Lenis !== 'undefined' && !isMobile) {
    lenisInstance = new Lenis({
      lerp: 0.12,          // Responsive instant 1:1 tracking without latency
      wheelMultiplier: 1.0,
      touchMultiplier: 1.0,
      smoothWheel: true,
      syncTouch: false,
      autoRaf: true,
    });

    // Ensure smooth frame synchronization
    function raf(time) {
      if (lenisInstance && !lenisInstance.isStopped) {
        lenisInstance.raf(time);
      }
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Pause scroll while preloader is visible
    lenisInstance.stop();
  }

  /* --------------------------------------------------------------------------
     2. INITIALIZE LUCIDE SVG ICONS
     -------------------------------------------------------------------------- */
  if (window.lucide) {
    lucide.createIcons();
  }

  /* --------------------------------------------------------------------------
     3. PRELOADER ANIMATION (TURNING PAGES & PROGRESS)
     -------------------------------------------------------------------------- */
  const preloader = document.getElementById('preloader');
  const progressBar = document.getElementById('preloader-progress');
  const counter = document.getElementById('preloader-counter');

  let loadProgress = 0;
  const progressInterval = setInterval(() => {
    loadProgress += Math.floor(Math.random() * 12) + 8;
    if (loadProgress >= 100) {
      loadProgress = 100;
      clearInterval(progressInterval);

      if (progressBar) progressBar.style.width = '100%';
      if (counter) counter.textContent = '100%';

      setTimeout(() => {
        if (preloader) {
          preloader.classList.add('fade-out');
          // Resume buttery smooth scrolling
          if (lenisInstance) lenisInstance.start();
          setTimeout(() => {
            preloader.style.display = 'none';
          }, 700);
        } else {
          if (lenisInstance) lenisInstance.start();
        }
      }, 250);
    } else {
      if (progressBar) progressBar.style.width = loadProgress + '%';
      if (counter) counter.textContent = loadProgress + '%';
    }
  }, 35);

  /* --------------------------------------------------------------------------
     3. THEME SYSTEM (LIGHT & DARK MODE TOGGLER)
     -------------------------------------------------------------------------- */
  const themeToggleBtn = document.getElementById('theme-toggle');
  const htmlRoot = document.documentElement;

  // Retrieve saved theme or default to system or light
  const savedTheme = localStorage.getItem('amh_theme') || 
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  setTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlRoot.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
    });
  }

  function setTheme(theme) {
    htmlRoot.setAttribute('data-theme', theme);
    localStorage.setItem('amh_theme', theme);
    if (themeToggleBtn) {
      themeToggleBtn.setAttribute('aria-checked', theme === 'dark' ? 'true' : 'false');
    }
  }

  /* --------------------------------------------------------------------------
     4. SMOOTH ANCHOR LINK NAVIGATION
     -------------------------------------------------------------------------- */

  // Smooth anchor scrolling handling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();

        // Close mobile liquid menu if open
        closeMobileMenu();

        if (lenisInstance) {
          lenisInstance.scrollTo(targetEl, {
            offset: -75,
            duration: 0.8,
          });
        } else {
          targetEl.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  /* --------------------------------------------------------------------------
     5. UNIFIED SCROLL METRICS & OBSERVERS (ZERO FORCED REFLOW)
     -------------------------------------------------------------------------- */
  const siteHeader = document.getElementById('site-header');
  const sections = document.querySelectorAll('section[id]');
  const desktopNavLinks = document.querySelectorAll('.nav-menu .nav-link');
  const backToTopBtn = document.getElementById('back-to-top');
  const progressBarCircle = document.getElementById('progress-bar-circle');
  const circumference = 2 * Math.PI * 23; // ~144.51

  function updateScrollMetrics(currentY, progressRatio) {
    // 1. Header blur/glass transition
    if (currentY > 40) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }

    // 2. Back to top visibility
    if (currentY > 320) {
      if (backToTopBtn) backToTopBtn.classList.add('is-visible');
    } else {
      if (backToTopBtn) backToTopBtn.classList.remove('is-visible');
    }

    // 3. Circular SVG scroll progress
    if (progressBarCircle) {
      const offset = circumference - (progressRatio * circumference);
      progressBarCircle.style.strokeDashoffset = Math.max(0, Math.min(circumference, offset));
    }
  }

  if (lenisInstance) {
    lenisInstance.on('scroll', (e) => {
      updateScrollMetrics(e.scroll, e.progress);
    });
  } else {
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;
      updateScrollMetrics(scrollTop, progress);
    }, { passive: true });
  }

  // Active navigation highlight via asynchronous IntersectionObserver
  const navSectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        desktopNavLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, {
    rootMargin: '-20% 0px -65% 0px',
    threshold: 0
  });

  sections.forEach(sec => navSectionObserver.observe(sec));

  /* --------------------------------------------------------------------------
     6. LIQUID MATERIAL MOBILE MENU (EXPANDS FROM TOP RIGHT)
     -------------------------------------------------------------------------- */
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const liquidMobileMenu = document.getElementById('liquid-mobile-menu');

  if (hamburgerBtn && liquidMobileMenu) {
    hamburgerBtn.addEventListener('click', () => {
      const isOpen = liquidMobileMenu.classList.contains('is-open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  function openMobileMenu() {
    if (!hamburgerBtn || !liquidMobileMenu) return;
    hamburgerBtn.classList.add('is-active');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    liquidMobileMenu.classList.add('is-open');
    liquidMobileMenu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Lock background scroll
    if (lenisInstance) lenisInstance.stop();
  }

  function closeMobileMenu() {
    if (!hamburgerBtn || !liquidMobileMenu) return;
    hamburgerBtn.classList.remove('is-active');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    liquidMobileMenu.classList.remove('is-open');
    liquidMobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // Restore background scroll
    if (lenisInstance) lenisInstance.start();
  }

  // Close liquid menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && liquidMobileMenu && liquidMobileMenu.classList.contains('is-open')) {
      closeMobileMenu();
    }
  });

  /* --------------------------------------------------------------------------
     7. HERO TYPEWRITER EFFECT (ROCK-SOLID HEIGHT & ZERO SHIFT)
     -------------------------------------------------------------------------- */
  const typewriterTarget = document.getElementById('typewriter-target');
  const wordsToType = [
    'Ghostwriting',
    'Book Publishing',
    'Editorial Polish',
    'Bespoke Cover Art',
    'Audiobook Narration',
    'Bestseller Launch'
  ];

  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typeSpeed = 85;

  function runTypewriter() {
    if (!typewriterTarget) return;

    const currentWord = wordsToType[wordIndex];

    if (isDeleting) {
      if (charIndex > 1) {
        typewriterTarget.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
      } else {
        // Keep non-breaking space when empty so height & baseline NEVER collapse!
        typewriterTarget.textContent = '\u00A0';
        charIndex = 0;
      }
      typeSpeed = 40;
    } else {
      typewriterTarget.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
      typeSpeed = 85;
    }

    if (!isDeleting && charIndex === currentWord.length) {
      typeSpeed = 2200; // Pause at full word
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % wordsToType.length;
      typeSpeed = 400; // Pause before new word
    }

    setTimeout(runTypewriter, typeSpeed);
  }

  setTimeout(runTypewriter, 1000);

  /* --------------------------------------------------------------------------
     8. HERO PARTICLE CONSTELLATION CANVAS
     -------------------------------------------------------------------------- */
  const heroCanvas = document.getElementById('hero-canvas');
  if (heroCanvas) {
    const ctx = heroCanvas.getContext('2d');
    let width = (heroCanvas.width = heroCanvas.offsetWidth);
    let height = (heroCanvas.height = heroCanvas.offsetHeight);

    window.addEventListener('resize', () => {
      if (heroCanvas) {
        width = heroCanvas.width = heroCanvas.offsetWidth;
        height = heroCanvas.height = heroCanvas.offsetHeight;
      }
    });

    const particles = [];
    // Optimize particle count for mobile screens to ensure 60fps performance
    const particleCount = isMobile ? 18 : 45;
    const maxLineDist = isMobile ? 80 : 110;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.2 + 0.8,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        alpha: Math.random() * 0.5 + 0.2,
      });
    }

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(247, 127, 0, ${p.alpha})`;
        ctx.fill();

        // Connect nearby particles with subtle literary constellation line
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < maxLineDist) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(252, 191, 73, ${0.15 * (1 - dist / maxLineDist)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      });

      requestAnimationFrame(animateParticles);
    }

    animateParticles();
  }

  /* --------------------------------------------------------------------------
     9. HERO 3D BOOK PARALLAX TILT INTERACTION
     -------------------------------------------------------------------------- */
  const tiltContainer = document.getElementById('hero-tilt-container');
  const bookCard = document.getElementById('hero-book-card');

  // Only enable mouse-move 3D parallax on desktop to keep mobile layout static & performant
  if (tiltContainer && bookCard && !isMobile) {
    tiltContainer.addEventListener('mousemove', (e) => {
      const rect = tiltContainer.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const rotateY = (x / (rect.width / 2)) * 18 - 14;
      const rotateX = -(y / (rect.height / 2)) * 14 + 6;

      bookCard.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(1.03)`;
    });

    tiltContainer.addEventListener('mouseleave', () => {
      bookCard.style.transform = `rotateY(-22deg) rotateX(10deg) scale(1)`;
    });
  }

  /* --------------------------------------------------------------------------
     10. INTERACTIVE PUBLISHING COST & ROYALTY ESTIMATOR
     -------------------------------------------------------------------------- */
  const genreGrid = document.getElementById('calc-genre-grid');
  const wordSlider = document.getElementById('calc-word-slider');
  const sliderDisplay = document.getElementById('slider-count-display');
  const formatChecks = document.querySelectorAll('.calc-format-check');

  const resultPages = document.getElementById('calc-result-pages');
  const resultTurnaround = document.getElementById('calc-result-turnaround');
  const resultSuite = document.getElementById('calc-result-suite');
  const calcProposalBtn = document.getElementById('calc-proposal-btn');

  let selectedGenre = 'Business & Tech';

  if (genreGrid) {
    genreGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.genre-pill-btn');
      if (!btn) return;

      genreGrid.querySelectorAll('.genre-pill-btn').forEach(b => b.classList.remove('is-selected'));
      btn.classList.add('is-selected');
      selectedGenre = btn.textContent.trim();
      recalculateEstimator();
    });
  }

  if (wordSlider) {
    wordSlider.addEventListener('input', () => {
      if (sliderDisplay) {
        sliderDisplay.textContent = Number(wordSlider.value).toLocaleString() + ' Words';
      }
      recalculateEstimator();
    });
  }

  formatChecks.forEach(ch => {
    ch.addEventListener('change', recalculateEstimator);
  });

  function recalculateEstimator() {
    if (!wordSlider) return;

    const words = parseInt(wordSlider.value, 10);
    // Estimated book pages at ~250 words per standard 6x9 trade page
    const pages = Math.round(words / 250);
    if (resultPages) {
      resultPages.textContent = `~${pages} Pages (Trade 6x9)`;
    }

    // Turnaround estimation
    let turnaround = '30 - 45 Days';
    if (words <= 25000) {
      turnaround = '20 - 30 Days';
    } else if (words > 75000) {
      turnaround = '45 - 60 Days';
    }
    if (resultTurnaround) {
      resultTurnaround.textContent = turnaround;
    }

    // Recommended package logic based on selected formats & word count
    let hasHardcover = false;
    let hasAudio = false;

    formatChecks.forEach(ch => {
      if (ch.checked && ch.value === 'hardcover') hasHardcover = true;
      if (ch.checked && ch.value === 'audiobook') hasAudio = true;
    });

    let suite = 'Bestseller Showcase';
    if (hasAudio || words > 80000) {
      suite = 'Executive Suite & PR';
    } else if (!hasHardcover && !hasAudio && words < 35000) {
      suite = 'Essential Author Launch';
    }

    if (resultSuite) {
      resultSuite.textContent = suite;
    }
  }

  if (calcProposalBtn) {
    calcProposalBtn.addEventListener('click', () => {
      const words = wordSlider ? wordSlider.value : '45000';
      const suite = resultSuite ? resultSuite.textContent : 'Bestseller Showcase';
      openConsultationModal(`Calculated Proposal: ${selectedGenre} (${words} Words) - ${suite}`);
    });
  }

  /* --------------------------------------------------------------------------
     11. PORTFOLIO FILTER & SYNOPSIS MODAL
     -------------------------------------------------------------------------- */
  const filterButtons = document.querySelectorAll('.portfolio-filter-btn');
  const portfolioCards = document.querySelectorAll('.book-portfolio-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');

      portfolioCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filterVal === 'all' || cat === filterVal) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Portfolio books data
  const portfolioData = [
    {
      title: "The Sovereign Leader",
      author: "Harrison Cole",
      genre: "Business & Leadership",
      rating: "5.0 / 5.0 (142 Amazon Reviews)",
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
      synopsis: "A masterclass on sovereign leadership in the era of artificial intelligence and decentralization. Developed and ghostwritten through AMH's Executive Suite, this book skyrocketed to #1 in Amazon Business Management within 48 hours of release.",
      pages: "264 Pages",
      formats: "Hardcover, Paperback, Kindle, Audible Audiobook"
    },
    {
      title: "Echoes of the Silent Mind",
      author: "Elena Rostova",
      genre: "Psychological Thriller",
      rating: "4.9 / 5.0 (218 Amazon Reviews)",
      image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
      synopsis: "A gripping psychological noir delving into human memory, deceit, and redemption in the frozen fjords of Norway. Complete developmental editing and custom 3D cover illustration produced by AMH Publishers.",
      pages: "340 Pages",
      formats: "Paperback, Kindle, Apple Books"
    },
    {
      title: "Beyond the Horizon",
      author: "Captain David Hayes",
      genre: "Personal Memoir & Adventure",
      rating: "5.0 / 5.0 (96 Amazon Reviews)",
      image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
      synopsis: "The extraordinary true journey of a deep-sea navigator battling fierce storms and personal grief across five oceans. Written in collaboration with AMH's senior biographical ghostwriter.",
      pages: "288 Pages",
      formats: "Hardcover Foil Edition, Paperback, Audiobook"
    },
    {
      title: "Unshakable Calm",
      author: "Dr. Cheryl Brooks",
      genre: "Mindfulness & Peak Performance",
      rating: "4.9 / 5.0 (180 Amazon Reviews)",
      image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80",
      synopsis: "A neuroscience-backed toolkit for maintaining executive clarity and inner peace in high-stress corporate environments. Formatted and distributed to over 40,000 libraries via IngramSpark.",
      pages: "210 Pages",
      formats: "Paperback, Kindle eBook"
    },
    {
      title: "The Quantum Rift",
      author: "Kenneth Wright",
      genre: "Sci-Fi & Speculative Fiction",
      rating: "4.8 / 5.0 (310 Amazon Reviews)",
      image: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=600&q=80",
      synopsis: "When a wormhole anomaly fractures temporal reality, three physicists must rebuild the laws of astrophysics before the universe collapses. Custom cover typography and full audiobook production by AMH.",
      pages: "410 Pages",
      formats: "Hardcover, Paperback, Audible"
    },
    {
      title: "Digital Currency Frontier",
      author: "Amanda Sterling",
      genre: "FinTech & Modern Economics",
      rating: "5.0 / 5.0 (88 Amazon Reviews)",
      image: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=600&q=80",
      synopsis: "An incisive look into tokenomics, sovereign blockchain networks, and the future of global commerce. Featured across Forbes and Times Square digital billboards during launch month.",
      pages: "230 Pages",
      formats: "Paperback, eBook, Audiobook"
    }
  ];

  window.openBookModal = function(index) {
    const book = portfolioData[index];
    if (!book) return;

    const modal = document.getElementById('book-modal');
    const content = document.getElementById('book-modal-content');

    if (!modal || !content) return;

    content.innerHTML = `
      <div style="display: flex; gap: 24px; align-items: flex-start; flex-wrap: wrap;">
        <img src="${book.image}" alt="${book.title}" style="width: 140px; height: 200px; object-fit: cover; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); flex-shrink: 0;" />
        <div style="flex: 1; min-width: 240px;">
          <div class="section-tag" style="margin-bottom: 8px;"><i data-lucide="award"></i> ${book.genre}</div>
          <h3 class="section-title" style="font-size: 1.6rem; margin-bottom: 6px;">${book.title}</h3>
          <div style="font-weight: 600; color: var(--accent-orange); margin-bottom: 12px;">by ${book.author}</div>
          <div style="font-size: 0.88rem; color: var(--accent-gold); margin-bottom: 16px; font-weight: 600;">
            ${book.rating}
          </div>
        </div>
      </div>
      <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border-color);">
        <h4 style="font-size: 1.05rem; font-family: var(--font-serif); margin-bottom: 8px;">Book Synopsis</h4>
        <p style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.7; margin-bottom: 20px;">
          ${book.synopsis}
        </p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 24px;">
          <div><strong>Length:</strong> ${book.pages}</div>
          <div><strong>Formats:</strong> ${book.formats}</div>
        </div>
        <button type="button" class="btn btn-primary btn-glow" style="width: 100%; justify-content: center;" onclick="closeBookModal(); openConsultationModal('Publish Similar to: ${book.title}');">
          <span>Publish A Book Like This</span>
          <i data-lucide="sparkles"></i>
        </button>
      </div>
    `;

    if (window.lucide) {
      lucide.createIcons();
    }

    modal.classList.add('is-active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  window.closeBookModal = function() {
    const modal = document.getElementById('book-modal');
    if (!modal) return;
    modal.classList.remove('is-active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  // Close modal when clicking on backdrop
  const bookModal = document.getElementById('book-modal');
  if (bookModal) {
    bookModal.addEventListener('click', (e) => {
      if (e.target === bookModal) {
        window.closeBookModal();
      }
    });
  }

  /* --------------------------------------------------------------------------
     12. GENERAL CONSULTATION QUOTE MODAL
     -------------------------------------------------------------------------- */
  const consultationModal = document.getElementById('consultation-modal');

  window.openConsultationModal = function(serviceTitle) {
    const modal = document.getElementById('consultation-modal');
    const modalTitle = document.getElementById('modal-service-title');

    if (!modal) return;

    if (modalTitle && serviceTitle) {
      modalTitle.textContent = serviceTitle;
    }

    modal.classList.add('is-active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  window.closeConsultationModal = function() {
    const modal = document.getElementById('consultation-modal');
    if (!modal) return;
    modal.classList.remove('is-active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  if (consultationModal) {
    consultationModal.addEventListener('click', (e) => {
      if (e.target === consultationModal) {
        window.closeConsultationModal();
      }
    });
  }

  window.handleModalSubmit = function(e) {
    e.preventDefault();
    alert('Thank you! Your publishing consultation request has been received. Our Senior Publishing Director will contact you within 24 hours.');
    window.closeConsultationModal();
    const form = document.getElementById('modal-quick-form');
    if (form) form.reset();
  };

  // Ensure wheel scrolling inside modal dialogs operates seamlessly
  document.querySelectorAll('.modal-dialog-box').forEach(dialog => {
    dialog.addEventListener('wheel', (e) => {
      e.stopPropagation();
    }, { passive: true });
  });

  /* --------------------------------------------------------------------------
     13. CUSTOM DROPDOWNS (ZERO CHROME DEFAULT SELECTS)
     -------------------------------------------------------------------------- */
  function initCustomDropdown(wrapperId) {
    const wrap = document.getElementById(wrapperId);
    if (!wrap) return;

    const trigger = wrap.querySelector('.custom-dropdown-trigger');
    const menu = wrap.querySelector('.custom-dropdown-menu');
    const hiddenInput = wrap.querySelector('input[type="hidden"]');
    const selectedText = wrap.querySelector('.dropdown-selected-text');
    const options = wrap.querySelectorAll('.dropdown-option');

    // Ensure mouse wheel scrolling inside dropdown options list works naturally
    if (menu) {
      menu.addEventListener('wheel', (e) => {
        e.stopPropagation();
      }, { passive: true });
    }

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      // Close other dropdowns first
      document.querySelectorAll('.custom-dropdown-wrap').forEach(w => {
        if (w !== wrap) w.classList.remove('is-open');
      });
      wrap.classList.toggle('is-open');
    });

    options.forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const val = opt.getAttribute('data-val');
        if (hiddenInput) hiddenInput.value = val;
        if (selectedText) selectedText.textContent = opt.textContent.trim();

        options.forEach(o => o.classList.remove('is-selected'));
        opt.classList.add('is-selected');

        wrap.classList.remove('is-open');
      });
    });
  }

  initCustomDropdown('dropdown-service');
  initCustomDropdown('dropdown-stage');
  initCustomDropdown('dropdown-timeline');

  // Close custom dropdowns on outside click
  document.addEventListener('click', () => {
    document.querySelectorAll('.custom-dropdown-wrap').forEach(w => {
      w.classList.remove('is-open');
    });
  });

  /* --------------------------------------------------------------------------
     14. FAQ ACCORDION INTERACTIVITY
     -------------------------------------------------------------------------- */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const headerBtn = item.querySelector('.faq-header-btn');
    const collapseBody = item.querySelector('.faq-body-collapse');

    headerBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('is-active');

      // Close other open FAQ items
      faqItems.forEach(other => {
        other.classList.remove('is-active');
        const otherBody = other.querySelector('.faq-body-collapse');
        if (otherBody) otherBody.style.maxHeight = null;
      });

      if (!isActive) {
        item.classList.add('is-active');
        collapseBody.style.maxHeight = collapseBody.scrollHeight + 'px';
      }
    });
  });

  /* --------------------------------------------------------------------------
     15. MAIN LEAD CONSULTATION FORM SUBMISSION
     -------------------------------------------------------------------------- */
  const leadForm = document.getElementById('lead-consultation-form');
  const formFeedback = document.getElementById('form-feedback');
  const formSubmitBtn = document.getElementById('form-submit-btn');

  if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('author-name').value.trim();
      const email = document.getElementById('author-email').value.trim();
      const phone = document.getElementById('author-phone').value.trim();

      if (!name || !email || !phone) {
        alert('Please fill in your name, email, and phone number so we can prepare your proposal.');
        return;
      }

      if (formSubmitBtn) {
        formSubmitBtn.disabled = true;
        formSubmitBtn.innerHTML = `<span>Submitting Proposal...</span> <i data-lucide="loader-2" class="spin-icon"></i>`;
        if (window.lucide) lucide.createIcons();
      }

      // Simulate instantaneous API request
      setTimeout(() => {
        if (formFeedback) {
          formFeedback.classList.add('is-visible');
        }

        if (formSubmitBtn) {
          formSubmitBtn.disabled = false;
          formSubmitBtn.innerHTML = `<span>Proposal Submitted Successfully</span> <i data-lucide="check"></i>`;
          if (window.lucide) lucide.createIcons();
        }

        leadForm.reset();

        setTimeout(() => {
          if (formFeedback) formFeedback.classList.remove('is-visible');
          if (formSubmitBtn) {
            formSubmitBtn.innerHTML = `<span>Submit For Free Review</span> <i data-lucide="send"></i>`;
            if (window.lucide) lucide.createIcons();
          }
        }, 5000);
      }, 900);
    });
  }

  /* --------------------------------------------------------------------------
     16. SCROLL REVEAL (INTERSECTION OBSERVER)
     -------------------------------------------------------------------------- */
  const revealElements = document.querySelectorAll('.reveal-on-scroll');

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  /* --------------------------------------------------------------------------
     17. BACK TO TOP BUTTON CLICK ACTION
     -------------------------------------------------------------------------- */
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      if (lenisInstance) {
        lenisInstance.scrollTo(0, { duration: 0.8 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  /* --------------------------------------------------------------------------
     18. DYNAMIC COPYRIGHT YEAR
     -------------------------------------------------------------------------- */
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

});
