(function () {
    'use strict';

    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-menu]');
    var header = document.querySelector('[data-header]');

    if (toggle && menu) {
        var closeMenu = function (restoreFocus) {
            toggle.setAttribute('aria-expanded', 'false');
            menu.classList.remove('is-open');
            if (restoreFocus) {
                toggle.focus();
            }
        };

        toggle.addEventListener('click', function () {
            var isOpen = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
            menu.classList.toggle('is-open', !isOpen);
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
                closeMenu(true);
            }
        });

        menu.addEventListener('click', function (event) {
            if (event.target.closest('a')) {
                closeMenu(false);
            }
        });

        window.addEventListener('resize', function () {
            if (window.innerWidth > 1050 && toggle.getAttribute('aria-expanded') === 'true') {
                closeMenu(false);
            }
        });
    }

    if (header) {
        window.addEventListener('scroll', function () {
            header.classList.toggle('is-scrolled', window.scrollY > 16);
        }, { passive: true });
    }

    var worldSwitcher = document.querySelector('[data-world-switcher]');
    var worldSwitcherToggle = document.querySelector('[data-world-switcher-toggle]');
    var worldSwitcherPanel = document.querySelector('[data-world-switcher-panel]');
    var worldSwitcherClose = document.querySelector('[data-world-switcher-close]');

    if (worldSwitcher && worldSwitcherToggle && worldSwitcherPanel) {
        var updateWorldSwitcherMode = function () {
            var shouldCompact = window.scrollY > 280 || window.innerWidth <= 720;
            worldSwitcher.classList.toggle('is-compact', shouldCompact && worldSwitcherToggle.getAttribute('aria-expanded') !== 'true');
        };

        var setWorldSwitcher = function (isOpen, restoreFocus) {
            worldSwitcherToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            worldSwitcher.classList.toggle('is-open', isOpen);
            worldSwitcherPanel.hidden = !isOpen;
            updateWorldSwitcherMode();
            if (restoreFocus) {
                worldSwitcherToggle.focus();
            }
        };

        worldSwitcherToggle.addEventListener('click', function () {
            setWorldSwitcher(worldSwitcherToggle.getAttribute('aria-expanded') !== 'true', false);
        });

        if (worldSwitcherClose) {
            worldSwitcherClose.addEventListener('click', function () {
                setWorldSwitcher(false, true);
            });
        }

        document.addEventListener('click', function (event) {
            if (!worldSwitcher.contains(event.target) && worldSwitcherToggle.getAttribute('aria-expanded') === 'true') {
                setWorldSwitcher(false, false);
            }
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && worldSwitcherToggle.getAttribute('aria-expanded') === 'true') {
                setWorldSwitcher(false, true);
            }
        });

        window.addEventListener('scroll', updateWorldSwitcherMode, { passive: true });
        window.addEventListener('resize', updateWorldSwitcherMode);
        updateWorldSwitcherMode();
    }

    var productCarousel = document.querySelector('[data-product-carousel]');
    if (productCarousel) {
        var productTabs = productCarousel.querySelectorAll('[data-product-tab]');
        var productSlides = productCarousel.querySelectorAll('[data-product-slide]');
        var productCounter = productCarousel.querySelector('[data-product-counter]');
        var productIndex = 0;
        var productTimer = null;
        var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        var showProductSlide = function (nextIndex, moveFocus) {
            productIndex = (nextIndex + productSlides.length) % productSlides.length;
            Array.prototype.forEach.call(productSlides, function (slide, index) {
                var isActive = index === productIndex;
                slide.classList.toggle('is-active', isActive);
                slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
            });
            Array.prototype.forEach.call(productTabs, function (tab, index) {
                var isActive = index === productIndex;
                tab.classList.toggle('is-active', isActive);
                tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
                tab.setAttribute('tabindex', isActive ? '0' : '-1');
                if (isActive && moveFocus) {
                    tab.focus();
                }
            });
            if (productCounter) {
                productCounter.textContent = ('0' + (productIndex + 1)).slice(-2) + ' / 04';
            }
        };

        var stopProductCarousel = function () {
            if (productTimer) {
                window.clearInterval(productTimer);
                productTimer = null;
            }
        };

        var startProductCarousel = function () {
            stopProductCarousel();
            if (!reduceMotion && !document.hidden) {
                productTimer = window.setInterval(function () {
                    showProductSlide(productIndex + 1, false);
                }, 5200);
            }
        };

        Array.prototype.forEach.call(productTabs, function (tab, index) {
            tab.addEventListener('click', function () {
                showProductSlide(index, false);
                startProductCarousel();
            });
            tab.addEventListener('keydown', function (event) {
                if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                    event.preventDefault();
                    var direction = event.key === 'ArrowRight' ? 1 : -1;
                    showProductSlide(productIndex + direction, true);
                }
            });
        });

        productCarousel.addEventListener('mouseenter', stopProductCarousel);
        productCarousel.addEventListener('mouseleave', startProductCarousel);
        productCarousel.addEventListener('focusin', stopProductCarousel);
        productCarousel.addEventListener('focusout', function (event) {
            if (!productCarousel.contains(event.relatedTarget)) {
                startProductCarousel();
            }
        });
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                stopProductCarousel();
            } else {
                startProductCarousel();
            }
        });
        showProductSlide(0, false);
        startProductCarousel();
    }

    var forms = document.querySelectorAll('[data-lead-form]');
    Array.prototype.forEach.call(forms, function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();

            var status = form.querySelector('[data-form-status]');
            var submit = form.querySelector('button[type="submit"]');
            var localeInput = form.querySelector('input[name="locale"]');
            var isHebrew = localeInput && localeInput.value === 'he';

            if (!form.checkValidity()) {
                form.reportValidity();
                if (status) {
                    status.textContent = isHebrew ? 'יש להשלים את שדות החובה.' : 'Please complete the required fields.';
                }
                return;
            }

            if (submit) {
                submit.disabled = true;
            }
            if (status) {
                status.textContent = isHebrew ? 'שולחים את הפרטים...' : 'Sending your details...';
            }

            fetch('/api/lead.php', {
                method: 'POST',
                body: new FormData(form),
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            })
                .then(function (response) {
                    return response.json().then(function (payload) {
                        return { ok: response.ok, payload: payload };
                    });
                })
                .then(function (result) {
                    if (!result.ok || !result.payload.ok) {
                        throw new Error(result.payload.message || 'Request failed');
                    }
                    form.reset();
                    if (status) {
                        status.textContent = result.payload.message;
                        status.classList.add('is-success');
                    }
                })
                .catch(function (error) {
                    if (status) {
                        status.textContent = error.message || (isHebrew ? 'לא הצלחנו לשלוח את הפרטים.' : 'We could not send your details.');
                        status.classList.remove('is-success');
                    }
                })
                .then(function () {
                    if (submit) {
                        submit.disabled = false;
                    }
                });
        });
    });
}());
