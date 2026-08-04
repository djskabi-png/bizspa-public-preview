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
        var setWorldSwitcher = function (isOpen, restoreFocus) {
            worldSwitcherToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            worldSwitcher.classList.toggle('is-open', isOpen);
            worldSwitcherPanel.hidden = !isOpen;
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
