(function() {
  'use strict';

  if (typeof window.__app === 'undefined') {
    window.__app = {};
  }

  var app = window.__app;

  function debounce(fn, delay) {
    var timer = null;
    return function() {
      var context = this;
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function() {
        fn.apply(context, args);
      }, delay);
    };
  }

  function throttle(fn, delay) {
    var last = 0;
    return function() {
      var now = Date.now();
      if (now - last >= delay) {
        last = now;
        fn.apply(this, arguments);
      }
    };
  }

  function initBurgerMenu() {
    if (app.burgerInit) return;
    app.burgerInit = true;

    var toggle = document.querySelector('.navbar-toggler, .c-nav__toggle');
    var navbarCollapse = document.querySelector('.navbar-collapse');
    var navLinks = document.querySelectorAll('.nav-link, .c-nav__link');

    if (!toggle || !navbarCollapse) return;

    var isOpen = false;

    function openMenu() {
      isOpen = true;
      navbarCollapse.classList.add('show');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('u-no-scroll');
    }

    function closeMenu() {
      isOpen = false;
      navbarCollapse.classList.remove('show');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('u-no-scroll');
    }

    function toggleMenu() {
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      toggleMenu();
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isOpen) {
        closeMenu();
        toggle.focus();
      }
    });

    document.addEventListener('click', function(e) {
      if (isOpen && !navbarCollapse.contains(e.target) && !toggle.contains(e.target)) {
        closeMenu();
      }
    });

    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener('click', function() {
        closeMenu();
      });
    }

    var resizeHandler = debounce(function() {
      if (window.innerWidth >= 1024 && isOpen) {
        closeMenu();
      }
    }, 200);

    window.addEventListener('resize', resizeHandler);
  }

  function initSmoothScroll() {
    if (app.smoothScrollInit) return;
    app.smoothScrollInit = true;

    function getHeaderHeight() {
      var header = document.querySelector('header, .l-header');
      return header ? header.offsetHeight : 80;
    }

    document.addEventListener('click', function(e) {
      var target = e.target;
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }

      if (!target) return;

      var href = target.getAttribute('href');
      if (!href || !href.startsWith('#') || href === '#' || href === '#!') return;

      var targetId = href.substring(1);
      var targetElement = document.getElementById(targetId);

      if (targetElement) {
        e.preventDefault();
        var headerHeight = getHeaderHeight();
        var elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
        var offsetPosition = elementPosition - headerHeight;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  }

  function initScrollSpy() {
    if (app.scrollSpyInit) return;
    app.scrollSpyInit = true;

    var sections = document.querySelectorAll('[id]');
    var navLinks = document.querySelectorAll('.nav-link[href^="#"], .c-nav__link[href^="#"]');

    if (sections.length === 0 || navLinks.length === 0) return;

    var sectionMap = {};
    for (var i = 0; i < sections.length; i++) {
      var id = sections[i].id;
      if (id) {
        sectionMap['#' + id] = sections[i];
      }
    }

    function updateActiveLink() {
      var scrollPosition = window.pageYOffset + 100;

      var activeSection = null;
      for (var hash in sectionMap) {
        var section = sectionMap[hash];
        var sectionTop = section.offsetTop;
        var sectionBottom = sectionTop + section.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          activeSection = hash;
        }
      }

      for (var j = 0; j < navLinks.length; j++) {
        var link = navLinks[j];
        var linkHref = link.getAttribute('href');

        if (linkHref === activeSection) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        } else {
          link.classList.remove('active');
          link.removeAttribute('aria-current');
        }
      }
    }

    var scrollHandler = throttle(updateActiveLink, 100);
    window.addEventListener('scroll', scrollHandler);
    updateActiveLink();
  }

  function initActiveMenuState() {
    if (app.activeMenuInit) return;
    app.activeMenuInit = true;

    var currentPath = window.location.pathname;
    var navLinks = document.querySelectorAll('.nav-link, .c-nav__link');

    for (var i = 0; i < navLinks.length; i++) {
      var link = navLinks[i];
      var linkPath = link.getAttribute('href');

      if (!linkPath || linkPath.startsWith('#')) continue;

      link.classList.remove('active');
      link.removeAttribute('aria-current');

      if (linkPath === currentPath || 
          (currentPath === '/' && linkPath === '/index.html') ||
          (currentPath === '/index.html' && linkPath === '/')) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('active');
      }
    }
  }

  function initFormValidation() {
    if (app.formValidationInit) return;
    app.formValidationInit = true;

    var contactForm = document.querySelector('.c-form');
    if (!contactForm) return;

    var nameInput = document.getElementById('contact-name');
    var emailInput = document.getElementById('contact-email');
    var phoneInput = document.getElementById('contact-phone');
    var messageInput = document.getElementById('contact-message');
    var privacyInput = document.getElementById('contact-privacy');
    var submitBtn = contactForm.querySelector('button[type="submit"]');

    function showError(input, message) {
      var parent = input.closest('.mb-3, .c-form__group') || input.parentElement;
      var errorElement = parent.querySelector('.invalid-feedback, .c-form__error');
      
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'invalid-feedback';
        parent.appendChild(errorElement);
      }
      
      errorElement.textContent = message;
      errorElement.style.display = 'block';
      input.classList.add('is-invalid');
    }

    function clearError(input) {
      var parent = input.closest('.mb-3, .c-form__group') || input.parentElement;
      var errorElement = parent.querySelector('.invalid-feedback, .c-form__error');
      
      if (errorElement) {
        errorElement.style.display = 'none';
      }
      input.classList.remove('is-invalid');
    }

    function validateName(value) {
      if (!value || value.trim().length < 2) {
        return 'Lūdzu, ievadiet derīgu vārdu (vismaz 2 rakstzīmes)';
      }
      if (!/^[a-zA-ZÀ-ÿs\u0100-\u017F\u0400-\u04FF\-']+$/.test(value)) {
        return 'Vārds satur nederīgas rakstzīmes';
      }
      return null;
    }

    function validateEmail(value) {
      if (!value || value.trim().length === 0) {
        return 'E-pasta adrese ir obligāta';
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Lūdzu, ievadiet derīgu e-pasta adresi';
      }
      return null;
    }

    function validatePhone(value) {
      if (!value || value.trim().length === 0) {
        return 'Telefona numurs ir obligāts';
      }
      if (!/^[\+\d\s\(\)\-]{7,20}$/.test(value)) {
        return 'Lūdzu, ievadiet derīgu telefona numuru';
      }
      return null;
    }

    function validateMessage(value) {
      if (!value || value.trim().length < 10) {
        return 'Ziņojumam jābūt vismaz 10 rakstzīmēm garam';
      }
      return null;
    }

    function validatePrivacy(checked) {
      if (!checked) {
        return 'Jums jāpiekrīt privātuma politikai';
      }
      return null;
    }

    if (nameInput) {
      nameInput.addEventListener('blur', function() {
        var error = validateName(nameInput.value);
        if (error) {
          showError(nameInput, error);
        } else {
          clearError(nameInput);
        }
      });
    }

    if (emailInput) {
      emailInput.addEventListener('blur', function() {
        var error = validateEmail(emailInput.value);
        if (error) {
          showError(emailInput, error);
        } else {
          clearError(emailInput);
        }
      });
    }

    if (phoneInput) {
      phoneInput.addEventListener('blur', function() {
        var error = validatePhone(phoneInput.value);
        if (error) {
          showError(phoneInput, error);
        } else {
          clearError(phoneInput);
        }
      });
    }

    if (messageInput) {
      messageInput.addEventListener('blur', function() {
        var error = validateMessage(messageInput.value);
        if (error) {
          showError(messageInput, error);
        } else {
          clearError(messageInput);
        }
      });
    }

    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      e.stopPropagation();

      var hasError = false;

      if (nameInput) {
        var nameError = validateName(nameInput.value);
        if (nameError) {
          showError(nameInput, nameError);
          hasError = true;
        } else {
          clearError(nameInput);
        }
      }

      if (emailInput) {
        var emailError = validateEmail(emailInput.value);
        if (emailError) {
          showError(emailInput, emailError);
          hasError = true;
        } else {
          clearError(emailInput);
        }
      }

      if (phoneInput) {
        var phoneError = validatePhone(phoneInput.value);
        if (phoneError) {
          showError(phoneInput, phoneError);
          hasError = true;
        } else {
          clearError(phoneInput);
        }
      }

      if (messageInput) {
        var messageError = validateMessage(messageInput.value);
        if (messageError) {
          showError(messageInput, messageError);
          hasError = true;
        } else {
          clearError(messageInput);
        }
      }

      if (privacyInput) {
        var privacyError = validatePrivacy(privacyInput.checked);
        if (privacyError) {
          showError(privacyInput, privacyError);
          hasError = true;
        } else {
          clearError(privacyInput);
        }
      }

      if (hasError) return;

      if (submitBtn) {
        submitBtn.disabled = true;
        var originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Sūta...';

        setTimeout(function() {
          window.location.href = 'thank_you.html';
        }, 800);
      }
    });
  }

  function initImageHandling() {
    if (app.imagesInit) return;
    app.imagesInit = true;

    var images = document.querySelectorAll('img');

    for (var i = 0; i < images.length; i++) {
      var img = images[i];

      if (!img.hasAttribute('loading') && 
          !img.classList.contains('c-logo__img')) {
        img.setAttribute('loading', 'lazy');
      }

      img.addEventListener('error', function(e) {
        var failedImg = e.target;
        var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="#f0f0f0"/><text x="50" y="50" font-family="Arial" font-size="14" fill="#999" text-anchor="middle" dominant-baseline="middle">Image</text></svg>';
        var svgBlob = new Blob([svg], { type: 'image/svg+xml' });
        var url = URL.createObjectURL(svgBlob);
        failedImg.src = url;
      });
    }
  }

  function initScrollToTop() {
    if (app.scrollToTopInit) return;
    app.scrollToTopInit = true;

    var scrollTopBtn = document.createElement('button');
    scrollTopBtn.className = 'c-button c-button--primary';
    scrollTopBtn.style.position = 'fixed';
    scrollTopBtn.style.bottom = '20px';
    scrollTopBtn.style.right = '20px';
    scrollTopBtn.style.zIndex = '1000';
    scrollTopBtn.style.display = 'none';
    scrollTopBtn.setAttribute('aria-label', 'Atgriezties augšā');
    scrollTopBtn.innerHTML = '↑';
    document.body.appendChild(scrollTopBtn);

    function toggleButton() {
      if (window.pageYOffset > 300) {
        scrollTopBtn.style.display = 'flex';
      } else {
        scrollTopBtn.style.display = 'none';
      }
    }

    scrollTopBtn.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    var scrollHandler = throttle(toggleButton, 200);
    window.addEventListener('scroll', scrollHandler);
    toggleButton();
  }

  function initNotificationSystem() {
    if (app.notificationInit) return;
    app.notificationInit = true;

    app.notify = function(message, type) {
      var container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
      }

      var toast = document.createElement('div');
      toast.className = 'alert alert-' + (type || 'info');
      toast.setAttribute('role', 'alert');
      toast.style.minWidth = '250px';
      toast.style.marginBottom = '10px';
      toast.textContent = message;

      container.appendChild(toast);

      setTimeout(function() {
        toast.style.opacity = '0';
        setTimeout(function() {
          if (container.contains(toast)) {
            container.removeChild(toast);
          }
        }, 300);
      }, 5000);
    };
  }

  app.init = function() {
    initBurgerMenu();
    initSmoothScroll();
    initScrollSpy();
    initActiveMenuState();
    initFormValidation();
    initImageHandling();
    initScrollToTop();
    initNotificationSystem();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', app.init);
  } else {
    app.init();
  }

})();