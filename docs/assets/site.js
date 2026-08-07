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
        var productToggle = productCarousel.querySelector('[data-product-toggle]');
        var productIndex = 0;
        var productTimer = null;
        var productManualPause = false;

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
            productCarousel.classList.add('is-paused');
            if (productTimer) {
                window.clearInterval(productTimer);
                productTimer = null;
            }
        };

        var startProductCarousel = function () {
            stopProductCarousel();
            if (!productManualPause && !document.hidden) {
                productCarousel.classList.remove('is-paused');
                productTimer = window.setInterval(function () {
                    showProductSlide(productIndex + 1, false);
                }, 5000);
            }
        };

        var updateProductToggle = function () {
            if (!productToggle) {
                return;
            }
            productToggle.setAttribute('aria-pressed', productManualPause ? 'true' : 'false');
            productToggle.textContent = productManualPause ? productToggle.getAttribute('data-play-label') : productToggle.getAttribute('data-pause-label');
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

        if (productToggle) {
            productToggle.addEventListener('click', function () {
                productManualPause = !productManualPause;
                if (productManualPause) {
                    stopProductCarousel();
                } else {
                    startProductCarousel();
                }
                updateProductToggle();
            });
        }

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
        updateProductToggle();
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

    var demoBooking = document.querySelector('[data-demo-booking]');
    if (demoBooking) {
        var demoForm = demoBooking.querySelector('[data-demo-booking-form]');
        var localeField = demoForm.querySelector('input[name="locale"]');
        var demoHebrew = localeField && localeField.value === 'he';
        var instructorField = demoForm.querySelector('input[name="instructor_id"]');
        var startsAtField = demoForm.querySelector('input[name="starts_at"]');
        var worldGroupField = demoForm.querySelector('input[name="world_group"]');
        var visitorField = demoForm.querySelector('input[name="visitor_token"]');
        var sessionField = demoForm.querySelector('input[name="session_token"]');
        var instructorBox = demoBooking.querySelector('[data-demo-instructors]');
        var dateBox = demoBooking.querySelector('[data-demo-dates]');
        var timeBox = demoBooking.querySelector('[data-demo-times]');
        var availabilityStatus = demoBooking.querySelector('[data-demo-availability-status]');
        var availabilityCopy = demoBooking.querySelector('[data-demo-availability-copy]');
        var nextButton = demoBooking.querySelector('[data-booking-next]');
        var backButton = demoBooking.querySelector('[data-booking-back]');
        var bookingStatus = demoBooking.querySelector('[data-demo-booking-status]');
        var worldPicker = demoBooking.querySelector('[data-demo-world-picker]');
        var worldButtons = demoBooking.querySelectorAll('[data-demo-world]');
        var worldContext = demoBooking.querySelector('[data-demo-world-context]');
        var worldChange = demoBooking.querySelector('[data-demo-world-change]');
        var teamContent = demoBooking.querySelector('[data-demo-team-content]');
        var businessTypeSelect = demoForm.querySelector('select[name="business_type"]');
        var enteredAt = new Date().toISOString();
        var selectedInstructor = null;
        var selectedDate = '';
        var selectedSlot = null;
        var instructors = [];
        var selectedWorldGroup = '';
        var availabilityRequest = 0;

        var randomToken = function () {
            if (window.crypto && typeof window.crypto.randomUUID === 'function') {
                return window.crypto.randomUUID() + window.crypto.randomUUID();
            }
            return String(Date.now()) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
        };
        var visitorToken = '';
        try {
            visitorToken = window.localStorage.getItem('bizonline_demo_visitor') || randomToken();
            window.localStorage.setItem('bizonline_demo_visitor', visitorToken);
        } catch (ignored) {
            visitorToken = randomToken();
        }
        visitorField.value = visitorToken;
        sessionField.value = randomToken();

        var trackJourney = function (eventType, data) {
            var consent = demoForm.querySelector('input[name="privacy_consent"]');
            if (!consent || !consent.checked) {
                return Promise.resolve();
            }
            var payload = new FormData();
            payload.append('csrf', demoForm.querySelector('input[name="csrf"]').value);
            payload.append('visitor_token', visitorField.value);
            payload.append('session_token', sessionField.value);
            payload.append('event_type', eventType);
            payload.append('event_data', JSON.stringify(data || {}));
            return fetch('/api/demo-journey.php', { method: 'POST', body: payload, headers: { 'X-Requested-With': 'XMLHttpRequest' } }).catch(function () {});
        };

        var setStep = function (stepNumber) {
            var steps = demoBooking.querySelectorAll('[data-booking-step]');
            var progress = demoBooking.querySelectorAll('.demo-booking-progress span');
            Array.prototype.forEach.call(steps, function (step) {
                var active = Number(step.getAttribute('data-booking-step')) === stepNumber;
                step.hidden = !active;
                step.classList.toggle('is-active', active);
            });
            Array.prototype.forEach.call(progress, function (item, index) {
                item.classList.toggle('is-active', index + 1 <= stepNumber);
            });
            demoBooking.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
        };

        var formatDate = function (dateValue, options) {
            return new Intl.DateTimeFormat(demoHebrew ? 'he-IL' : 'en-GB', options).format(new Date(dateValue + 'T12:00:00'));
        };

        var slotsForSelection = function () {
            if (!selectedInstructor) {
                return [];
            }
            return selectedInstructor.slots.filter(function (slot) { return !selectedDate || slot.date === selectedDate; });
        };

        var renderTimes = function () {
            timeBox.innerHTML = '';
            var slots = slotsForSelection();
            if (!selectedInstructor || !selectedDate) {
                return;
            }
            if (!slots.length) {
                timeBox.innerHTML = '<p>' + (demoHebrew ? 'אין שעות פנויות ביום הזה.' : 'No available times on this day.') + '</p>';
                return;
            }
            slots.forEach(function (slot) {
                var button = document.createElement('button');
                button.type = 'button';
                button.className = 'demo-time-button';
                button.textContent = slot.time;
                button.setAttribute('aria-pressed', selectedSlot && selectedSlot.starts_at === slot.starts_at ? 'true' : 'false');
                button.addEventListener('click', function () {
                    selectedSlot = slot;
                    startsAtField.value = slot.starts_at;
                    Array.prototype.forEach.call(timeBox.querySelectorAll('button'), function (item) { item.setAttribute('aria-pressed', 'false'); });
                    button.setAttribute('aria-pressed', 'true');
                    nextButton.disabled = false;
                });
                timeBox.appendChild(button);
            });
        };

        var renderDates = function () {
            dateBox.innerHTML = '';
            if (!selectedInstructor) {
                return;
            }
            var dates = [];
            selectedInstructor.slots.forEach(function (slot) { if (dates.indexOf(slot.date) === -1) dates.push(slot.date); });
            dates.slice(0, 14).forEach(function (date) {
                var button = document.createElement('button');
                button.type = 'button';
                button.className = 'demo-date-button';
                button.innerHTML = '<span>' + formatDate(date, { weekday: 'short' }) + '</span><b>' + formatDate(date, { day: 'numeric' }) + '</b><small>' + formatDate(date, { month: 'short' }) + '</small>';
                button.setAttribute('aria-pressed', selectedDate === date ? 'true' : 'false');
                button.addEventListener('click', function () {
                    selectedDate = date;
                    selectedSlot = null;
                    startsAtField.value = '';
                    nextButton.disabled = true;
                    Array.prototype.forEach.call(dateBox.querySelectorAll('button'), function (item) { item.setAttribute('aria-pressed', 'false'); });
                    button.setAttribute('aria-pressed', 'true');
                    renderTimes();
                });
                dateBox.appendChild(button);
            });
            if (dates.length) {
                selectedDate = selectedDate || dates[0];
                var first = dateBox.querySelector('button');
                if (first) first.setAttribute('aria-pressed', 'true');
                renderTimes();
            }
        };

        var renderInstructors = function () {
            instructorBox.innerHTML = '';
            instructors.forEach(function (instructor) {
                var button = document.createElement('button');
                button.type = 'button';
                button.className = 'demo-instructor-button';
                button.innerHTML = '<span>' + instructor.name.slice(0, 1) + '</span><strong>' + instructor.name + '</strong><small>' + instructor.duration + ' ' + (demoHebrew ? 'דקות' : 'minutes') + '</small>';
                button.setAttribute('aria-pressed', selectedInstructor && selectedInstructor.id === instructor.id ? 'true' : 'false');
                button.addEventListener('click', function () {
                    selectedInstructor = instructor;
                    selectedDate = '';
                    selectedSlot = null;
                    instructorField.value = String(instructor.id);
                    startsAtField.value = '';
                    nextButton.disabled = true;
                    Array.prototype.forEach.call(instructorBox.querySelectorAll('button'), function (item) { item.setAttribute('aria-pressed', 'false'); });
                    button.setAttribute('aria-pressed', 'true');
                    renderDates();
                });
                instructorBox.appendChild(button);
            });
            if (instructors.length) {
                selectedInstructor = instructors[0];
                instructorField.value = String(selectedInstructor.id);
                var first = instructorBox.querySelector('button');
                if (first) first.setAttribute('aria-pressed', 'true');
                renderDates();
            }
        };

        var buildPreviewInstructors = function () {
            var previewDates = [];
            var cursor = new Date();
            while (previewDates.length < 5) {
                cursor.setDate(cursor.getDate() + 1);
                if (cursor.getDay() !== 6) previewDates.push(new Date(cursor.getTime()));
            }
            var toDateValue = function (date) {
                var year = date.getFullYear();
                var month = String(date.getMonth() + 1).padStart(2, '0');
                var day = String(date.getDate()).padStart(2, '0');
                return year + '-' + month + '-' + day;
            };
            var createSlots = function (hours) {
                var slots = [];
                previewDates.forEach(function (date, dateIndex) {
                    hours.forEach(function (time, timeIndex) {
                        if ((dateIndex + timeIndex) % 4 === 3) return;
                        var dateValue = toDateValue(date);
                        slots.push({ date: dateValue, time: time, starts_at: dateValue + 'T' + time + ':00+03:00' });
                    });
                });
                return slots;
            };
            return [
                { id: 901, name: demoHebrew ? 'שולי' : 'Shuli', duration: 45, worlds: ['care'], slots: createSlots(['09:00', '11:00', '14:00']) },
                { id: 902, name: demoHebrew ? 'רבקה' : 'Rivka', duration: 45, worlds: ['care'], slots: createSlots(['10:00', '12:30', '16:00']) },
                { id: 903, name: demoHebrew ? 'לירן' : 'Liran', duration: 45, worlds: ['hospitality'], slots: createSlots(['09:30', '13:00', '16:30']) },
                { id: 904, name: demoHebrew ? 'שירן' : 'Shiran', duration: 45, worlds: ['hospitality'], slots: createSlots(['10:30', '13:30', '17:00']) },
                { id: 905, name: demoHebrew ? 'ענת' : 'Anat', duration: 45, worlds: ['hospitality'], slots: createSlots(['09:00', '12:00', '15:00']) },
                { id: 906, name: demoHebrew ? 'קארין' : 'Karin', duration: 45, worlds: ['hospitality'], slots: createSlots(['11:00', '14:00', '17:30']) }
            ];
        };
        var staticBookingHosts = ['127.0.0.1', 'localhost', 'bizonline.spaplus.co'];
        var isStaticPreview = staticBookingHosts.indexOf(window.location.hostname) !== -1 || /\.(github\.io|pages\.dev)$/i.test(window.location.hostname);

        var worldLabels = {
            care: demoHebrew ? 'ספא וקליניקות' : 'Spa and clinics',
            hospitality: demoHebrew ? 'אירוח, נופש ואירועים' : 'Hospitality, vacation and events'
        };
        var worldBusinessTypes = {
            care: ['spa', 'clinic'],
            hospitality: ['hospitality', 'venue']
        };
        var resetSelection = function () {
            selectedInstructor = null;
            selectedDate = '';
            selectedSlot = null;
            instructorField.value = '';
            startsAtField.value = '';
            nextButton.disabled = true;
            instructorBox.innerHTML = '';
            dateBox.innerHTML = '';
            timeBox.innerHTML = '';
        };
        var limitBusinessTypes = function (group) {
            var allowed = worldBusinessTypes[group] || [];
            Array.prototype.forEach.call(businessTypeSelect.options, function (option) {
                var visible = option.value === '' || allowed.indexOf(option.value) !== -1;
                option.hidden = !visible;
                option.disabled = !visible;
            });
            if (allowed.indexOf(businessTypeSelect.value) === -1) {
                businessTypeSelect.value = '';
            }
        };
        var detectWorldGroup = function () {
            var requested = new URLSearchParams(window.location.search).get('world') || '';
            if (/^(care|spa|clinic|wellness)$/i.test(requested)) return 'care';
            if (/^(hospitality|accommodation|vacation|venue|event|events)$/i.test(requested)) return 'hospitality';
            if (!document.referrer) return '';
            try {
                var referrer = new URL(document.referrer);
                if (referrer.origin !== window.location.origin) return '';
                var path = referrer.pathname.toLowerCase();
                if (/(spa|clinic|wellness|hammam|massage|treatment|therapist|practitioner|physio)/.test(path)) return 'care';
                if (/(hospitality|accommodation|hotel|guest|villa|vacation|venue|event|loft|glamping|resort|retreat|zimmer)/.test(path)) return 'hospitality';
            } catch (ignored) {}
            return '';
        };
        var loadAvailability = function (group) {
            var requestNumber = ++availabilityRequest;
            availabilityStatus.textContent = demoHebrew ? 'טוענים את המועדים של הצוות המתאים...' : 'Loading times for the matching team...';
            fetch('/api/demo-availability.php?locale=' + encodeURIComponent(demoHebrew ? 'he' : 'en') + '&world_group=' + encodeURIComponent(group))
                .then(function (response) {
                    var contentType = response.headers.get('content-type') || '';
                    if (contentType.indexOf('application/json') === -1) throw new Error('NON_JSON_RESPONSE');
                    return response.json().then(function (payload) { return { ok: response.ok, payload: payload }; });
                })
                .then(function (result) {
                    if (requestNumber !== availabilityRequest || selectedWorldGroup !== group) return;
                    if (!result.ok || !result.payload.ok) throw new Error(result.payload.message || 'Availability failed');
                    instructors = result.payload.instructors || [];
                    if (!instructors.length) throw new Error(demoHebrew ? 'עדיין לא הוגדרו מועדים פנויים לצוות הזה.' : 'No available times have been configured for this team yet.');
                    availabilityStatus.textContent = '';
                    renderInstructors();
                })
                .catch(function (error) {
                    if (requestNumber !== availabilityRequest || selectedWorldGroup !== group) return;
                    if (isStaticPreview) {
                        instructors = buildPreviewInstructors().filter(function (instructor) { return instructor.worlds.indexOf(group) !== -1; });
                        if (availabilityCopy) {
                            availabilityCopy.textContent = demoHebrew
                                ? 'בחרו מדריכה ומועד מתוך לוח ההמחשה. היומנים החיים יופעלו לאחר חיבור חשבונות הצוות.'
                                : 'Choose an instructor and time from the demonstration calendar. Live calendars activate after the team accounts are connected.';
                        }
                        availabilityStatus.textContent = demoHebrew
                            ? 'מוצג רק צוות ההדרכה של התחום שבחרתם. המועדים כעת הם להמחשה.'
                            : 'Only the training team for your selected field is shown. Times are currently illustrative.';
                        renderInstructors();
                        return;
                    }
                    availabilityStatus.textContent = error.message === 'NON_JSON_RESPONSE'
                        ? (demoHebrew ? 'לא ניתן לטעון כרגע את המועדים. נסו שוב בעוד מספר דקות.' : 'Available times cannot be loaded right now. Please try again in a few minutes.')
                        : error.message;
                });
        };
        var selectWorldGroup = function (group, inferred) {
            if (!worldBusinessTypes[group]) return;
            selectedWorldGroup = group;
            worldGroupField.value = group;
            resetSelection();
            limitBusinessTypes(group);
            Array.prototype.forEach.call(worldButtons, function (button) {
                button.setAttribute('aria-pressed', button.getAttribute('data-demo-world') === group ? 'true' : 'false');
            });
            teamContent.hidden = false;
            worldContext.hidden = false;
            worldContext.textContent = inferred
                ? (demoHebrew ? 'התאמנו את המסלול לפי העמוד שממנו הגעתם: ' + worldLabels[group] + '. אפשר לשנות את התחום בכל רגע.' : 'Matched from the page you came from: ' + worldLabels[group] + '. You can change the field at any time.')
                : (demoHebrew ? 'נבחר התחום: ' + worldLabels[group] + '. כעת מוצג רק צוות ההדרכה המתאים.' : 'Selected field: ' + worldLabels[group] + '. Only the matching training team is now shown.');
            loadAvailability(group);
        };
        Array.prototype.forEach.call(worldButtons, function (button) {
            button.addEventListener('click', function () { selectWorldGroup(button.getAttribute('data-demo-world'), false); });
        });
        worldChange.addEventListener('click', function () {
            teamContent.hidden = true;
            worldContext.hidden = true;
            selectedWorldGroup = '';
            worldGroupField.value = '';
            resetSelection();
            Array.prototype.forEach.call(worldButtons, function (button) { button.setAttribute('aria-pressed', 'false'); });
            worldPicker.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
        });
        var inferredWorldGroup = detectWorldGroup();
        if (inferredWorldGroup) selectWorldGroup(inferredWorldGroup, true);

        nextButton.addEventListener('click', function () {
            if (!selectedSlot || !selectedInstructor) return;
            var selectedSummary = demoBooking.querySelector('[data-demo-selected-slot]');
            selectedSummary.textContent = selectedInstructor.name + ', ' + formatDate(selectedSlot.date, { weekday: 'long', day: 'numeric', month: 'long' }) + ', ' + selectedSlot.time;
            setStep(2);
        });
        backButton.addEventListener('click', function () { setStep(1); });

        demoForm.addEventListener('submit', function (event) {
            event.preventDefault();
            if (!demoForm.checkValidity() || !selectedSlot) {
                demoForm.reportValidity();
                bookingStatus.textContent = demoHebrew ? 'יש להשלים את הפרטים ולבחור מועד.' : 'Please complete the details and select a time.';
                return;
            }
            if (isStaticPreview) {
                demoBooking.querySelector('[data-demo-success-message]').textContent = demoHebrew
                    ? 'זהו אישור המחשה בלבד. שליחת הזמנה וקישור לפגישה תופעל לאחר חיבור יומני הצוות.'
                    : 'This is a demonstration confirmation only. Invitation and meeting-link delivery will be activated after the team calendars are connected.';
                demoBooking.querySelector('[data-demo-confirmed-slot]').textContent = selectedInstructor.name + ', ' + formatDate(selectedSlot.date, { weekday: 'long', day: 'numeric', month: 'long' }) + ', ' + selectedSlot.time;
                var previewSuccessNote = demoBooking.querySelector('[data-demo-success-note]');
                if (previewSuccessNote) {
                    previewSuccessNote.textContent = demoHebrew
                        ? 'לא נשלחה הזמנה אמיתית מגרסת ההמחשה הציבורית.'
                        : 'No real invitation was sent from the public demonstration.';
                }
                setStep(3);
                return;
            }
            var submit = demoForm.querySelector('button[type="submit"]');
            submit.disabled = true;
            bookingStatus.textContent = demoHebrew ? 'בודקים את היומן ומאשרים את הפגישה...' : 'Checking the calendar and confirming your meeting...';
            trackJourney('booking_started', { entered_at: enteredAt, instructor_id: selectedInstructor.id, starts_at: selectedSlot.starts_at })
                .then(function () { return fetch('/api/demo-book.php', { method: 'POST', body: new FormData(demoForm), headers: { 'X-Requested-With': 'XMLHttpRequest' } }); })
                .then(function (response) { return response.json().then(function (payload) { return { ok: response.ok, payload: payload }; }); })
                .then(function (result) {
                    if (!result.ok || !result.payload.ok) throw new Error(result.payload.message || 'Booking failed');
                    demoBooking.querySelector('[data-demo-success-message]').textContent = result.payload.message;
                    demoBooking.querySelector('[data-demo-confirmed-slot]').textContent = selectedInstructor.name + ', ' + formatDate(selectedSlot.date, { weekday: 'long', day: 'numeric', month: 'long' }) + ', ' + selectedSlot.time;
                    setStep(3);
                })
                .catch(function (error) { bookingStatus.textContent = error.message; submit.disabled = false; });
        });
    }
    var featuresExperience = document.querySelector('[data-features-experience]');
    if (featuresExperience) {
        var groupsSource = document.querySelector('[data-feature-groups-json]');
        var featureGroups = {};
        try {
            featureGroups = JSON.parse(groupsSource ? groupsSource.textContent : '{}');
        } catch (ignored) {
            featureGroups = {};
        }
        var isFeaturesHebrew = document.documentElement.getAttribute('dir') === 'rtl';
        var goalTabs = featuresExperience.querySelectorAll('[data-feature-goal]');
        var goalLabel = featuresExperience.querySelector('[data-goal-label]');
        var goalTitle = featuresExperience.querySelector('[data-goal-title]');
        var goalDescription = featuresExperience.querySelector('[data-goal-description]');
        var goalModules = featuresExperience.querySelector('[data-goal-modules]');
        var goalCenter = featuresExperience.querySelector('[data-goal-center]');
        var goalResult = featuresExperience.querySelector('[data-goal-result]');
        var moduleCards = featuresExperience.querySelectorAll('[data-module-card]');
        var moduleFilters = featuresExperience.querySelectorAll('[data-module-filter]');
        var moduleEmpty = featuresExperience.querySelector('[data-module-empty]');
        var goalVisualWords = isFeaturesHebrew ? {
            growth: ['צמיחה', 'יותר הזמנות זמינות למכירה'],
            control: ['זמן', 'פחות פעולות ידניות לצוות'],
            insight: ['שליטה', 'החלטות על בסיס תמונה מלאה'],
            connect: ['חיבור', 'רצף עבודה אחד לכל העסק']
        } : {
            growth: ['Growth', 'More bookable availability'],
            control: ['Time', 'Fewer manual team actions'],
            insight: ['Control', 'Decisions based on the full picture'],
            connect: ['Connected', 'One workflow for the whole business']
        };

        var moduleTitle = function (slug) {
            var card = featuresExperience.querySelector('[data-module-slug="' + slug + '"]');
            var heading = card ? card.querySelector('h3') : null;
            return heading ? heading.textContent : slug;
        };

        var showGoal = function (key, moveFocus) {
            var group = featureGroups[key];
            if (!group) return;
            Array.prototype.forEach.call(goalTabs, function (tab) {
                var active = tab.getAttribute('data-feature-goal') === key;
                tab.setAttribute('aria-selected', active ? 'true' : 'false');
                tab.setAttribute('tabindex', active ? '0' : '-1');
                if (active && moveFocus) tab.focus();
            });
            goalLabel.textContent = group.label;
            goalTitle.textContent = group.title;
            goalDescription.textContent = group.description;
            goalModules.innerHTML = '';
            (group.slugs || []).slice(0, 5).forEach(function (slug) {
                var pill = document.createElement('span');
                pill.textContent = moduleTitle(slug);
                goalModules.appendChild(pill);
            });
            if (goalVisualWords[key]) {
                goalCenter.textContent = goalVisualWords[key][0];
                goalResult.textContent = goalVisualWords[key][1];
            }
        };

        Array.prototype.forEach.call(goalTabs, function (tab, index) {
            tab.addEventListener('click', function () { showGoal(tab.getAttribute('data-feature-goal'), false); });
            tab.addEventListener('keydown', function (event) {
                if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
                event.preventDefault();
                var direction = event.key === 'ArrowRight' ? 1 : -1;
                var nextIndex = (index + direction + goalTabs.length) % goalTabs.length;
                showGoal(goalTabs[nextIndex].getAttribute('data-feature-goal'), true);
            });
        });
        showGoal('growth', false);

        Array.prototype.forEach.call(moduleFilters, function (filter) {
            filter.addEventListener('click', function () {
                var key = filter.getAttribute('data-module-filter');
                var visibleCount = 0;
                Array.prototype.forEach.call(moduleFilters, function (item) { item.classList.toggle('is-active', item === filter); });
                Array.prototype.forEach.call(moduleCards, function (card) {
                    var visible = key === 'all' || (' ' + card.getAttribute('data-groups') + ' ').indexOf(' ' + key + ' ') !== -1;
                    card.hidden = !visible;
                    if (visible) visibleCount += 1;
                });
                if (moduleEmpty) moduleEmpty.hidden = visibleCount !== 0;
            });
        });

        var calculator = featuresExperience.querySelector('[data-impact-calculator]');
        if (calculator) {
            var bookingsInput = calculator.querySelector('[data-impact-bookings]');
            var ticketInput = calculator.querySelector('[data-impact-ticket]');
            var rateInput = calculator.querySelector('[data-impact-rate]');
            var bookingsOutput = calculator.querySelector('[data-impact-bookings-output]');
            var ticketOutput = calculator.querySelector('[data-impact-ticket-output]');
            var rateOutput = calculator.querySelector('[data-impact-rate-output]');
            var totalOutput = calculator.querySelector('[data-impact-total]');
            var moneyFormat = new Intl.NumberFormat(isFeaturesHebrew ? 'he-IL' : 'en-GB', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 });
            var setRangeProgress = function (input) {
                var progress = ((Number(input.value) - Number(input.min)) / (Number(input.max) - Number(input.min))) * 100;
                input.style.setProperty('--range-progress', progress + '%');
            };
            var updateImpact = function () {
                var bookings = Number(bookingsInput.value);
                var ticket = Number(ticketInput.value);
                var rate = Number(rateInput.value);
                var total = Math.round(bookings * ticket * (rate / 100) * 4.33);
                bookingsOutput.textContent = String(bookings);
                ticketOutput.textContent = moneyFormat.format(ticket);
                rateOutput.textContent = rate + '%';
                totalOutput.textContent = moneyFormat.format(total);
                [bookingsInput, ticketInput, rateInput].forEach(setRangeProgress);
            };
            [bookingsInput, ticketInput, rateInput].forEach(function (input) { input.addEventListener('input', updateImpact); });
            updateImpact();
        }
    }
    var capabilityDemos = document.querySelectorAll('[data-capability-demo]');
    Array.prototype.forEach.call(capabilityDemos, function (demo) {
        var demoTabs = demo.querySelectorAll('[data-capability-demo-tab]');
        var demoPanels = demo.querySelectorAll('[data-capability-demo-panel]');
        var demoCanvas = demo.querySelector('.live-demo-canvas');

        var activateCapabilityDemo = function (activeIndex, focusTab) {
            Array.prototype.forEach.call(demoTabs, function (tab, tabIndex) {
                var isActive = tabIndex === activeIndex;
                tab.classList.toggle('is-active', isActive);
                tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
                tab.setAttribute('tabindex', isActive ? '0' : '-1');
                if (isActive && focusTab) {
                    tab.focus();
                }
            });
            Array.prototype.forEach.call(demoPanels, function (panel, panelIndex) {
                panel.hidden = panelIndex !== activeIndex;
            });
            if (demoCanvas) {
                demoCanvas.setAttribute('data-demo-active', String(activeIndex));
            }
        };

        Array.prototype.forEach.call(demoTabs, function (tab, tabIndex) {
            tab.addEventListener('click', function () { activateCapabilityDemo(tabIndex, false); });
            tab.addEventListener('keydown', function (event) {
                if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
                    return;
                }
                event.preventDefault();
                var direction = event.key === 'ArrowRight' ? 1 : -1;
                var nextIndex = (tabIndex + direction + demoTabs.length) % demoTabs.length;
                activateCapabilityDemo(nextIndex, true);
            });
        });
    });
    var productStoryDemos = document.querySelectorAll('[data-product-story-demo]');
    Array.prototype.forEach.call(productStoryDemos, function (demo) {
        var tabs = demo.querySelectorAll('[data-product-story-tab]');
        var panels = demo.querySelectorAll('[data-product-story-panel]');
        var activate = function (activeIndex, focusTab) {
            Array.prototype.forEach.call(tabs, function (tab, index) {
                var active = index === activeIndex;
                tab.classList.toggle('is-active', active);
                tab.setAttribute('aria-selected', active ? 'true' : 'false');
                tab.setAttribute('tabindex', active ? '0' : '-1');
                if (active && focusTab) tab.focus();
            });
            Array.prototype.forEach.call(panels, function (panel, index) {
                panel.hidden = index !== activeIndex;
            });
        };
        Array.prototype.forEach.call(tabs, function (tab, index) {
            tab.addEventListener('click', function () { activate(index, false); });
            tab.addEventListener('keydown', function (event) {
                if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'Home' && event.key !== 'End') return;
                event.preventDefault();
                var nextIndex = index;
                if (event.key === 'Home') nextIndex = 0;
                if (event.key === 'End') nextIndex = tabs.length - 1;
                if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
                if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
                activate(nextIndex, true);
            });
        });
    });
    Array.prototype.forEach.call(document.querySelectorAll('.phone-live-booking'), function (button) {
        button.addEventListener('click', function () {
            button.classList.toggle('is-complete');
            button.setAttribute('aria-pressed', button.classList.contains('is-complete') ? 'true' : 'false');
        });
    });
    var giftStudio = document.querySelector('[data-gift-studio]');
    if (giftStudio) {
        var giftTypeButtons = giftStudio.querySelectorAll('[data-gift-type]');
        var giftValueButtons = giftStudio.querySelectorAll('[data-gift-value]');
        var giftThemeButtons = giftStudio.querySelectorAll('[data-gift-theme]');
        var giftPreview = giftStudio.querySelector('[data-gift-preview]');
        var giftPreviewTitle = giftStudio.querySelector('[data-gift-preview-title]');
        var giftPreviewDetail = giftStudio.querySelector('[data-gift-preview-detail]');
        var giftPreviewValue = giftStudio.querySelector('[data-gift-preview-value]');
        var giftFilter = giftStudio.querySelector('[data-gift-filter]');
        var activateGiftType = function (button, focusButton) {
            Array.prototype.forEach.call(giftTypeButtons, function (item) {
                var active = item === button;
                item.classList.toggle('is-active', active);
                item.setAttribute('aria-selected', active ? 'true' : 'false');
                item.setAttribute('tabindex', active ? '0' : '-1');
            });
            giftPreviewTitle.textContent = button.getAttribute('data-gift-title');
            giftPreviewDetail.textContent = button.getAttribute('data-gift-detail');
            if (focusButton) button.focus();
        };
        Array.prototype.forEach.call(giftTypeButtons, function (button, index) {
            button.addEventListener('click', function () { activateGiftType(button, false); });
            button.addEventListener('keydown', function (event) {
                if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'Home' && event.key !== 'End') return;
                event.preventDefault();
                var nextIndex = index;
                if (event.key === 'Home') nextIndex = 0;
                if (event.key === 'End') nextIndex = giftTypeButtons.length - 1;
                if (event.key === 'ArrowRight') nextIndex = (index + 1) % giftTypeButtons.length;
                if (event.key === 'ArrowLeft') nextIndex = (index - 1 + giftTypeButtons.length) % giftTypeButtons.length;
                activateGiftType(giftTypeButtons[nextIndex], true);
            });
        });
        Array.prototype.forEach.call(giftValueButtons, function (button) {
            button.addEventListener('click', function () {
                Array.prototype.forEach.call(giftValueButtons, function (item) {
                    var active = item === button;
                    item.classList.toggle('is-active', active);
                    item.setAttribute('aria-pressed', active ? 'true' : 'false');
                });
                giftPreviewValue.textContent = '₪' + button.getAttribute('data-gift-value');
            });
        });
        Array.prototype.forEach.call(giftThemeButtons, function (button) {
            button.addEventListener('click', function () {
                Array.prototype.forEach.call(giftThemeButtons, function (item) {
                    var active = item === button;
                    item.classList.toggle('is-active', active);
                    item.setAttribute('aria-pressed', active ? 'true' : 'false');
                });
                giftPreview.setAttribute('data-theme', button.getAttribute('data-gift-theme'));
            });
        });
        if (giftFilter) {
            giftFilter.addEventListener('click', function () {
                giftFilter.classList.toggle('is-active');
                giftFilter.setAttribute('aria-pressed', giftFilter.classList.contains('is-active') ? 'true' : 'false');
            });
        }
    }

    var worldVideoBlocks = document.querySelectorAll('[data-world-video]');
    Array.prototype.forEach.call(worldVideoBlocks, function (videoBlock) {
        var videoTabs = videoBlock.querySelectorAll('[data-world-video-tab]');
        var videoFrame = videoBlock.querySelector('[data-world-video-frame]');
        var videoCaption = videoBlock.querySelector('[data-world-video-caption]');
        var screenImage = videoBlock.querySelector('[data-world-screen-image]');
        var videoPlay = videoBlock.querySelector('[data-world-video-play]');
        var videoModal = videoBlock.querySelector('[data-world-video-modal]');
        var videoClose = videoBlock.querySelector('[data-world-video-close]');
        var activateVideoChapter = function (activeIndex, focusTab) {
            Array.prototype.forEach.call(videoTabs, function (tab, tabIndex) {
                var active = tabIndex === activeIndex;
                tab.classList.toggle('is-active', active);
                tab.setAttribute('aria-selected', active ? 'true' : 'false');
                tab.setAttribute('tabindex', active ? '0' : '-1');
                if (active && focusTab) tab.focus();
            });
            videoFrame.setAttribute('data-active-chapter', String(activeIndex));
            if (videoCaption && videoTabs[activeIndex]) videoCaption.textContent = videoTabs[activeIndex].textContent.replace(/^0\d\s*/, '');
            if (screenImage && videoTabs[activeIndex]) {
                var nextScreen = videoTabs[activeIndex].getAttribute('data-world-screen-src');
                var nextAlt = videoTabs[activeIndex].getAttribute('data-world-screen-alt');
                if (nextScreen && screenImage.getAttribute('src') !== nextScreen) {
                    screenImage.style.opacity = '0';
                    window.setTimeout(function () {
                        screenImage.setAttribute('src', nextScreen);
                        screenImage.setAttribute('alt', nextAlt || '');
                        screenImage.style.opacity = '1';
                    }, 120);
                }
            }
        };
        Array.prototype.forEach.call(videoTabs, function (tab, tabIndex) {
            tab.addEventListener('click', function () { activateVideoChapter(tabIndex, false); });
            tab.addEventListener('keydown', function (event) {
                if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
                event.preventDefault();
                var direction = event.key === 'ArrowRight' ? 1 : -1;
                activateVideoChapter((tabIndex + direction + videoTabs.length) % videoTabs.length, true);
            });
        });
        var setVideoModal = function (open) {
            videoModal.hidden = !open;
            document.body.classList.toggle('has-modal-open', open);
            if (open) videoClose.focus();
            else videoPlay.focus();
        };
        if (videoPlay && videoModal && videoClose) {
            videoPlay.addEventListener('click', function () { setVideoModal(true); });
            videoClose.addEventListener('click', function () { setVideoModal(false); });
            videoModal.addEventListener('click', function (event) { if (event.target === videoModal) setVideoModal(false); });
            document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !videoModal.hidden) setVideoModal(false); });
        }
        var youtubeEmbed = videoBlock.querySelector('[data-youtube-embed]');
        var youtubePlay = youtubeEmbed ? youtubeEmbed.querySelector('[data-youtube-play]') : null;
        if (youtubeEmbed && youtubePlay) {
            youtubePlay.addEventListener('click', function () {
                var videoId = youtubeEmbed.getAttribute('data-video-id') || '';
                var videoTitle = youtubeEmbed.getAttribute('data-video-title') || 'BIZonline video';
                if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) return;
                var iframe = document.createElement('iframe');
                var pageOrigin = encodeURIComponent(window.location.origin || 'https://bizonline.spaplus.co');
                var pageUrl = encodeURIComponent(window.location.href);
                iframe.setAttribute('src', 'https://www.youtube-nocookie.com/embed/' + videoId + '?autoplay=1&rel=0&origin=' + pageOrigin + '&widget_referrer=' + pageUrl);
                iframe.setAttribute('title', videoTitle);
                iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
                iframe.setAttribute('allowfullscreen', '');
                iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
                youtubeEmbed.classList.add('is-playing');
                while (youtubeEmbed.firstChild) youtubeEmbed.removeChild(youtubeEmbed.firstChild);
                youtubeEmbed.appendChild(iframe);
            });
        }
    });

    var screenLightbox = document.querySelector('[data-screen-lightbox]');
    if (screenLightbox) {
        var screenLightboxImage = screenLightbox.querySelector('[data-screen-lightbox-image]');
        var screenLightboxClose = screenLightbox.querySelector('[data-screen-lightbox-close]');
        var screenLightboxTriggers = document.querySelectorAll('[data-screen-lightbox-trigger]');
        var screenLightboxReturn = null;
        var setScreenLightbox = function (isOpen, trigger) {
            screenLightbox.hidden = !isOpen;
            document.body.classList.toggle('has-modal-open', isOpen);
            if (isOpen && trigger) {
                screenLightboxReturn = trigger;
                screenLightboxImage.setAttribute('src', trigger.getAttribute('data-screen-src') || '');
                screenLightboxImage.setAttribute('alt', trigger.getAttribute('data-screen-alt') || '');
                screenLightboxClose.focus();
            } else if (!isOpen && screenLightboxReturn) {
                screenLightboxReturn.focus();
            }
        };
        Array.prototype.forEach.call(screenLightboxTriggers, function (trigger) {
            trigger.addEventListener('click', function () { setScreenLightbox(true, trigger); });
        });
        screenLightboxClose.addEventListener('click', function () { setScreenLightbox(false); });
        screenLightbox.addEventListener('click', function (event) { if (event.target === screenLightbox) setScreenLightbox(false); });
        document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !screenLightbox.hidden) setScreenLightbox(false); });
    }

    var customerJourney = document.querySelector('[data-customer-journey]');
    if (customerJourney) {
        var journeySteps = customerJourney.querySelectorAll('[data-journey-step]');
        var journeyPanels = customerJourney.querySelectorAll('[data-journey-panel]');
        var activateJourneyStep = function (activeIndex, focusStep) {
            Array.prototype.forEach.call(journeySteps, function (step, stepIndex) {
                var active = stepIndex === activeIndex;
                step.classList.toggle('is-active', active);
                step.setAttribute('aria-selected', active ? 'true' : 'false');
                step.setAttribute('tabindex', active ? '0' : '-1');
                if (active && focusStep) step.focus();
                if (active && window.innerWidth <= 640) {
                    step.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest', inline: 'nearest' });
                }
            });
            Array.prototype.forEach.call(journeyPanels, function (panel, panelIndex) {
                var active = panelIndex === activeIndex;
                panel.hidden = !active;
                panel.classList.toggle('is-active', active);
            });
        };
        Array.prototype.forEach.call(journeySteps, function (step, stepIndex) {
            step.addEventListener('click', function () { activateJourneyStep(stepIndex, false); });
            step.addEventListener('keydown', function (event) {
                if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
                event.preventDefault();
                var direction = event.key === 'ArrowLeft' ? 1 : -1;
                activateJourneyStep((stepIndex + direction + journeySteps.length) % journeySteps.length, true);
            });
        });
        Array.prototype.forEach.call(customerJourney.querySelectorAll('[data-journey-next]'), function (button) {
            button.addEventListener('click', function () {
                var panel = button.closest('[data-journey-panel]');
                var currentIndex = Number(panel ? panel.getAttribute('data-journey-panel') : 0);
                activateJourneyStep(Math.min(currentIndex + 1, journeyPanels.length - 1), false);
            });
        });
        Array.prototype.forEach.call(customerJourney.querySelectorAll('[data-journey-restart]'), function (button) {
            button.addEventListener('click', function () { activateJourneyStep(0, false); });
        });
    }

    Array.prototype.forEach.call(document.querySelectorAll('[data-product-flow]'), function (productFlow) {
        var flowSteps = productFlow.querySelectorAll('[data-product-flow-step]');
        var flowPanels = productFlow.querySelectorAll('[data-product-flow-panel]');
        if (!flowSteps.length || !flowPanels.length) return;
        var activateProductFlow = function (activeIndex, focusStep) {
            Array.prototype.forEach.call(flowSteps, function (step, stepIndex) {
                var active = stepIndex === activeIndex;
                step.classList.toggle('is-active', active);
                step.setAttribute('aria-selected', active ? 'true' : 'false');
                step.setAttribute('tabindex', active ? '0' : '-1');
                if (active && focusStep) step.focus();
            });
            Array.prototype.forEach.call(flowPanels, function (panel, panelIndex) {
                var active = panelIndex === activeIndex;
                panel.hidden = !active;
                panel.classList.toggle('is-active', active);
            });
            productFlow.setAttribute('data-active-step', String(activeIndex));
        };
        Array.prototype.forEach.call(flowSteps, function (step, stepIndex) {
            step.addEventListener('click', function () { activateProductFlow(stepIndex, false); });
            step.addEventListener('keydown', function (event) {
                if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'Home' && event.key !== 'End') return;
                event.preventDefault();
                var nextIndex = stepIndex;
                if (event.key === 'Home') nextIndex = 0;
                if (event.key === 'End') nextIndex = flowSteps.length - 1;
                if (event.key === 'ArrowRight') nextIndex = (stepIndex + 1) % flowSteps.length;
                if (event.key === 'ArrowLeft') nextIndex = (stepIndex - 1 + flowSteps.length) % flowSteps.length;
                activateProductFlow(nextIndex, true);
            });
        });
        Array.prototype.forEach.call(productFlow.querySelectorAll('[data-product-flow-next]'), function (button) {
            button.addEventListener('click', function () {
                var panel = button.closest('[data-product-flow-panel]');
                var currentIndex = Number(panel ? panel.getAttribute('data-product-flow-panel') : 0);
                activateProductFlow(Math.min(currentIndex + 1, flowPanels.length - 1), false);
            });
        });
        Array.prototype.forEach.call(productFlow.querySelectorAll('[data-product-flow-restart]'), function (button) {
            button.addEventListener('click', function () { activateProductFlow(0, false); });
        });
    });

    var storeDemo = document.querySelector('[data-store-demo]');
    if (storeDemo) {
        var storeFilters = storeDemo.querySelectorAll('[data-demo-filter]');
        var storeProducts = storeDemo.querySelectorAll('[data-demo-product]');
        var storeSearch = storeDemo.querySelector('[data-demo-search]');
        var storeEmpty = storeDemo.querySelector('[data-demo-empty]');
        var storeCart = storeDemo.querySelector('[data-demo-cart]');
        var storeCartTriggers = storeDemo.querySelectorAll('[data-demo-cart-trigger]');
        var storeCartClose = storeDemo.querySelector('[data-demo-cart-close]');
        var storeCartCount = storeDemo.querySelectorAll('[data-demo-cart-count]');
        var storeCartEmpty = storeDemo.querySelector('[data-demo-cart-empty]');
        var storeCartItem = storeDemo.querySelector('[data-demo-cart-item]');
        var storeCartTitle = storeDemo.querySelector('[data-demo-cart-title]');
        var storeCartPrice = storeDemo.querySelector('[data-demo-cart-price]');
        var storeCheckout = storeDemo.querySelector('[data-demo-checkout]');
        var storeActiveFilter = 'all';
        var storeSelected = null;
        var storeCheckoutStep = 1;
        var storeHebrew = document.documentElement.getAttribute('dir') === 'rtl';

        var filterStoreProducts = function () {
            var query = storeSearch ? storeSearch.value.trim().toLocaleLowerCase() : '';
            var visibleCount = 0;
            Array.prototype.forEach.call(storeProducts, function (product) {
                var matchesCategory = storeActiveFilter === 'all' || product.getAttribute('data-category') === storeActiveFilter;
                var haystack = (product.getAttribute('data-search') || '').toLocaleLowerCase();
                var matchesSearch = query === '' || haystack.indexOf(query) !== -1;
                product.hidden = !(matchesCategory && matchesSearch);
                if (!product.hidden) visibleCount += 1;
            });
            if (storeEmpty) storeEmpty.hidden = visibleCount !== 0;
        };
        Array.prototype.forEach.call(storeFilters, function (button) {
            button.addEventListener('click', function () {
                storeActiveFilter = button.getAttribute('data-demo-filter') || 'all';
                Array.prototype.forEach.call(storeFilters, function (item) { item.classList.toggle('is-active', item === button); });
                filterStoreProducts();
            });
        });
        if (storeSearch) storeSearch.addEventListener('input', filterStoreProducts);

        var setStoreCartOpen = function (isOpen) {
            storeCart.classList.toggle('is-open', isOpen);
            storeCart.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
            if (isOpen && storeCartClose) storeCartClose.focus();
        };
        Array.prototype.forEach.call(storeCartTriggers, function (button) { button.addEventListener('click', function () { setStoreCartOpen(true); }); });
        if (storeCartClose) storeCartClose.addEventListener('click', function () { setStoreCartOpen(false); });
        document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && storeCart.classList.contains('is-open')) setStoreCartOpen(false); });

        Array.prototype.forEach.call(storeDemo.querySelectorAll('[data-demo-add]'), function (button) {
            button.addEventListener('click', function () {
                storeSelected = { title: button.getAttribute('data-title') || '', price: button.getAttribute('data-price') || '0' };
                storeCartTitle.textContent = storeSelected.title;
                storeCartPrice.textContent = '₪' + storeSelected.price;
                storeCartItem.hidden = false;
                storeCartEmpty.hidden = true;
                storeCheckout.disabled = false;
                storeCheckoutStep = 1;
                Array.prototype.forEach.call(storeCartCount, function (count) { count.textContent = '1'; });
                setStoreCartOpen(true);
            });
        });
        if (storeCheckout) {
            storeCheckout.addEventListener('click', function () {
                var steps = storeCart.querySelectorAll('.demo-cart-steps span');
                if (!storeSelected) return;
                storeCheckoutStep += 1;
                Array.prototype.forEach.call(steps, function (step, index) { step.classList.toggle('is-active', index < storeCheckoutStep); });
                if (storeCheckoutStep === 2) {
                    storeCheckout.textContent = storeHebrew ? 'המשך לתשלום לדוגמה' : 'Continue to sample payment';
                } else {
                    storeCheckout.textContent = storeHebrew ? 'המסלול הושלם בהמחשה' : 'Preview journey completed';
                    storeCheckout.disabled = true;
                }
            });
        }
    }
}());
