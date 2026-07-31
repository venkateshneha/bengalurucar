// ── Loader ──
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
    // Hero animations (index.html)
    document.querySelectorAll('.animate-up, .animate-right').forEach(el => {
      el.classList.add('visible');
    });
     // Reveal elements already in viewport
    document.querySelectorAll('.reveal').forEach((el, i) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        setTimeout(() => el.classList.add('active'), i * 80);
      }
    });

    // Re-init observer for below-fold elements
    initRevealObserver();

  }, 2200);
});

// ── Custom Cursor ──
const cursor = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursorFollower');
let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';
});

function animateCursor() {
  followerX += (mouseX - followerX) * 0.1;
  followerY += (mouseY - followerY) * 0.1;
  cursorFollower.style.left = followerX + 'px';
  cursorFollower.style.top = followerY + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

// Scale cursor on hover
document.querySelectorAll('a, button, input, select, .service-card, .fleet-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(2)';
    cursorFollower.style.transform = 'translate(-50%, -50%) scale(1.5)';
    cursorFollower.style.opacity = '0.3';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
    cursorFollower.style.transform = 'translate(-50%, -50%) scale(1)';
    cursorFollower.style.opacity = '0.6';
  });
});

// ── Sticky Header ──
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
});

// ── Mobile Menu ──
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');

menuToggle.addEventListener('click', () => {
  menuToggle.classList.toggle('active');
  mobileMenu.classList.toggle('open');
  document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
});

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    menuToggle.classList.remove('active');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ── Form Validation ──
const bookingForm = document.getElementById('bookingForm');
const formMessage = document.getElementById('formMessage');

function showError(input, msg) {
  const err = input.closest('.field-group').querySelector('.error');
  if (err) err.textContent = msg;
  input.closest('.field-group').style.borderColor = 'rgba(239,68,68,0.5)';
}

function clearError(input) {
  const err = input.closest('.field-group')?.querySelector('.error');
  if (err) err.textContent = '';
  if (input.closest('.field-group')) {
    input.closest('.field-group').style.borderColor = '';
  }
}

function validate(input, msg) {
  if (!input.value.trim()) { showError(input, msg); return false; }
  clearError(input); return true;
}

if (bookingForm) {
bookingForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const fields = [
    [document.getElementById('pickup'), 'Pickup location is required'],
    [document.getElementById('drop'), 'Drop location is required'],
    [document.getElementById('date'), 'Please select a date'],
    [document.getElementById('time'), 'Please select a time'],
    [document.getElementById('tripType'), 'Please select a trip type'],
    [document.getElementById('carType'), 'Please select a car type'],
  ];
  const valid = fields.every(([el, msg]) => validate(el, msg));
  if (!valid) {
    formMessage.className = 'form-message error-msg';
    formMessage.textContent = 'Please fill all required fields.';
    return;
  }
  formMessage.className = 'form-message success';
  formMessage.textContent = '✓ Booking confirmed! Our team will contact you shortly.';
  bookingForm.reset();
});

bookingForm.querySelectorAll('input, select').forEach(el => {
  el.addEventListener('input', () => clearError(el));
  el.addEventListener('change', () => clearError(el));
});
}

// ── Testimonials Carousel ──
// ── Testimonials Carousel ──
const slides = document.querySelectorAll('.testimonial-slide');
const cdots = document.querySelectorAll('.cdot');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const testimonialCarousel = document.querySelector('.testimonials-carousel');
const testimonialTrack = document.querySelector('.testimonial-track');

if (slides.length > 0 && cdots.length > 0 && nextBtn && prevBtn && testimonialCarousel && testimonialTrack) {
  let current = 0;

  function goTo(index) {
    slides[current].classList.remove('active');
    cdots[current].classList.remove('active');
    current = index;
    slides[current].classList.add('active');
    cdots[current].classList.add('active');
  }

  function nextSlide() {
    goTo((current + 1) % slides.length);
  }

  function prevSlide() {
    goTo((current - 1 + slides.length) % slides.length);
  }

  nextBtn.addEventListener('click', nextSlide);
  prevBtn.addEventListener('click', prevSlide);

  cdots.forEach(dot => {
    dot.addEventListener('click', () => goTo(+dot.dataset.slide));
  });

  let autoplay = setInterval(nextSlide, 5000);

  testimonialCarousel.addEventListener('mouseenter', () => clearInterval(autoplay));
  testimonialCarousel.addEventListener('mouseleave', () => {
    autoplay = setInterval(nextSlide, 5000);
  });

  let startX = 0;

  testimonialTrack.addEventListener('touchstart', e => {
    startX = e.changedTouches[0].clientX;
  });

  testimonialTrack.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? nextSlide() : prevSlide();
  });
}

// ── Scroll Reveal ──
function initRevealObserver() {
  const revealEls = document.querySelectorAll('.reveal:not(.active)');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('active'), i * 80);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  revealEls.forEach(el => revealObserver.observe(el));
}

// Init after loader hides so observer starts fresh
const revealEls = document.querySelectorAll('.reveal');
// Removed wrong revealObserver line
initRevealObserver();

// ── Parallax effect on hero ──
window.addEventListener('scroll', () => {
  const heroImg = document.querySelector('.hero-img');
  if (heroImg) {
    const scrolled = window.scrollY;
    heroImg.style.transform = `scale(1.08) translateY(${scrolled * 0.15}px)`;
  }
});

// ── Service card stagger on reveal ──
document.querySelectorAll('.service-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 0.1}s`;
});

document.querySelectorAll('.fleet-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 0.1}s`;
});


(function () {
  var cards = document.querySelectorAll('.vs-card');
  if (!cards.length) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('vs-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.10 });

  cards.forEach(function (card) {
    observer.observe(card);
  });
})();

/* ============================================================
   AIRPORT TAXI PAGE → BOOKING.HTML
============================================================ */

document.querySelectorAll('.airport-btn-select').forEach(function (btn) {
  btn.addEventListener('click', function () {
    const card = btn.closest('.airport-car-card');

    const params = new URLSearchParams({
      car: card.dataset.car,
      seats: card.dataset.seats,
      luggage: card.dataset.luggage,
      price: card.dataset.price,
      toll: card.dataset.toll,
      img: card.dataset.img
    });

    window.location.href = "booking.html?" + params.toString();
  });
});


/* ============================================================
   BOOKING PAGES (Airport / Local / Outstation)
   — Show selected car, validate form, submit to backend + WhatsApp
============================================================ */

(function () {
  if (!document.body.classList.contains('booking-page')) return;

  const params = new URLSearchParams(window.location.search);
  const bkForm = document.getElementById('bkForm');
  if (!bkForm) return;

  /* Figure out which booking page we're on */
  const pageType = params.get('type') === 'local' ? 'local'
                  : params.get('type') === 'outstation' ? 'outstation'
                  : 'airport';

  /* ---------- 1. Populate selected-car panel ---------- */
  const car = params.get('car') || 'No car selected';
  const seats = params.get('seats') || '—';
  const luggage = params.get('luggage') || '—';
  const img = params.get('img') || '';

  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  const setHTML = (id, val) => { const el = document.getElementById(id); if (el) el.innerHTML = val; };

  setText('bkCarName', car);
  setHTML('bkCarSeats', `<i class="fa-solid fa-users"></i> ${seats} People`);
  setHTML('bkCarLuggage', `<i class="fa-solid fa-suitcase"></i> ${luggage} Luggage`);
  if (img) {
    const imgEl = document.getElementById('bkCarImg');
    if (imgEl) { imgEl.src = img; imgEl.alt = car; }
  }

  if (pageType === 'airport') {
    const price = params.get('price') || '—';
    const toll = params.get('toll') || '—';
    setText('bkCarPrice', price + ' / trip');
    setText('bkCarToll', 'Toll: ' + toll + ' extra');
  } else if (pageType === 'local') {
    const price = params.get('price') || '—';
    const extraKm = params.get('extraKm') || '—';
    const extraHr = params.get('extraHr') || '—';
    setText('bkCarPrice', price);
    setText('bkCarExtra', `Extra: ${extraKm}/km, ${extraHr}/hr`);
  } else if (pageType === 'outstation') {
    const tripType = params.get('tripType') || 'oneway';
    const rate = tripType === 'roundtrip' ? params.get('rateRT') : params.get('rateOW');
    setText('bkCarPrice', (rate || '—') + ' / km');
    setText('bkTripType', tripType === 'roundtrip' ? 'Round Trip' : 'One Way Trip');

    /* Show return-date field only for round trips */
    const returnWrap = document.getElementById('bkReturnWrap');
    if (returnWrap && tripType === 'roundtrip') {
      returnWrap.style.display = 'block';
    }
  }

  /* ---------- 2. Validation helpers ---------- */
  const getVal = (id) => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
  const setErr = (id, msg) => { const el = document.getElementById('err-' + id); if (el) el.textContent = msg; };
  const clearErr = (id) => { const el = document.getElementById('err-' + id); if (el) el.textContent = ''; };

  const NAME_RE = /^[a-zA-Z\s.'-]{3,60}$/;
  const PHONE_RE = /^[6-9]\d{9}$/;
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* Clear a field's error as soon as the user edits it */
  ['bkName', 'bkPhone', 'bkEmail', 'bkPickup', 'bkDrop', 'bkDate', 'bkTime', 'bkReturnDate'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => clearErr(id));
  });
  document.querySelectorAll('input[name="tripOption"]').forEach((el) => {
    el.addEventListener('change', () => clearErr('tripOption'));
  });

  function todayStr() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function validate() {
    let valid = true;

    /* Trip option — airport page only */
    if (pageType === 'airport') {
      const tripChecked = document.querySelector('input[name="tripOption"]:checked');
      if (!tripChecked) { setErr('tripOption', 'Please choose a trip direction.'); valid = false; }
      else clearErr('tripOption');
    }

    const name = getVal('bkName');
    if (!name) { setErr('bkName', 'Please enter your full name.'); valid = false; }
    else if (!NAME_RE.test(name)) { setErr('bkName', 'Enter a valid name (letters only, 3-60 characters).'); valid = false; }
    else clearErr('bkName');

    const phone = getVal('bkPhone');
    if (!phone) { setErr('bkPhone', 'Please enter your mobile number.'); valid = false; }
    else if (!PHONE_RE.test(phone)) { setErr('bkPhone', 'Enter a valid 10-digit Indian mobile number.'); valid = false; }
    else clearErr('bkPhone');

    const email = getVal('bkEmail');
    if (!email) { setErr('bkEmail', 'Please enter your email address.'); valid = false; }
    else if (!EMAIL_RE.test(email)) { setErr('bkEmail', 'Enter a valid email address.'); valid = false; }
    else clearErr('bkEmail');

    const pickup = getVal('bkPickup');
    if (!pickup || pickup.length < 3) { setErr('bkPickup', 'Please enter a valid pickup location.'); valid = false; }
    else clearErr('bkPickup');

    const drop = getVal('bkDrop');
    if (!drop || drop.length < 3) { setErr('bkDrop', 'Please enter a valid drop location.'); valid = false; }
    else clearErr('bkDrop');

    const date = getVal('bkDate');
    if (!date) { setErr('bkDate', 'Please select a date.'); valid = false; }
    else if (date < todayStr()) { setErr('bkDate', 'Date cannot be in the past.'); valid = false; }
    else clearErr('bkDate');

    const time = getVal('bkTime');
    if (!time) { setErr('bkTime', 'Please select a time.'); valid = false; }
    else clearErr('bkTime');

    /* Return date — outstation round trip only */
    const returnWrap = document.getElementById('bkReturnWrap');
    if (returnWrap && returnWrap.style.display !== 'none') {
      const returnDate = getVal('bkReturnDate');
      if (!returnDate) { setErr('bkReturnDate', 'Please select a return date.'); valid = false; }
      else if (date && returnDate < date) { setErr('bkReturnDate', 'Return date cannot be before travel date.'); valid = false; }
      else clearErr('bkReturnDate');
    }

    return valid;
  }

  /* ---------- 3. Submit handler ---------- */
  bkForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) {
      const firstError = bkForm.querySelector('.at-error:not(:empty)');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const submitBtn = bkForm.querySelector('.at-btn-submit');
    const originalBtnHTML = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Submitting...</span>';
    }

    const tripOptionEl = document.querySelector('input[name="tripOption"]:checked');

    const bookingData = {
      pageType: pageType,
      car: car,
      tripOption: tripOptionEl ? tripOptionEl.value : '',
      name: getVal('bkName'),
      phone: getVal('bkPhone'),
      email: getVal('bkEmail'),
      pickup: getVal('bkPickup'),
      drop: getVal('bkDrop'),
      landmark: getVal('bkLandmark'),
      date: getVal('bkDate'),
      time: getVal('bkTime'),
      returnDate: getVal('bkReturnDate'),
      notes: getVal('bkNotes'),
      returnCab: document.getElementById('bkReturn') ? document.getElementById('bkReturn').checked : false
    };

    /* Send to backend (best-effort — booking still proceeds via WhatsApp even if this fails) */
    fetch('/api/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    }).catch(function (err) {
      console.warn('Backend booking submission failed (continuing with WhatsApp):', err);
    }).finally(function () {
      /* Build WhatsApp message */
      const lines = [
        'New Booking Request',
        'Type: ' + pageType.charAt(0).toUpperCase() + pageType.slice(1),
        'Vehicle: ' + car
      ];
      if (bookingData.tripOption) lines.push('Trip: ' + bookingData.tripOption);
      lines.push('Name: ' + bookingData.name);
      lines.push('Phone: ' + bookingData.phone);
      lines.push('Email: ' + bookingData.email);
      lines.push('Pickup: ' + bookingData.pickup);
      lines.push('Drop: ' + bookingData.drop);
      if (bookingData.landmark) lines.push('Landmark: ' + bookingData.landmark);
      lines.push('Date: ' + bookingData.date);
      lines.push('Time: ' + bookingData.time);
      if (bookingData.returnDate) lines.push('Return Date: ' + bookingData.returnDate);
      if (bookingData.notes) lines.push('Notes: ' + bookingData.notes);
      if (bookingData.returnCab) lines.push('Return Cab: Yes');

      const msg = encodeURIComponent(lines.join('\n'));
      const waBtn = document.getElementById('bkWaBtn');
      if (waBtn) waBtn.href = 'https://wa.me/919152333388?text=' + msg;

      /* Show success state */
      const success = document.getElementById('bkSuccess');
      if (success) {
        bkForm.style.display = 'none';
        success.style.display = 'block';
        success.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
      }
    });
  });
})();

/* ============================================================
   LOCAL CABS PAGE — Add at bottom of script.js
   ============================================================ */

(function () {
  /* ── Card reveal observer ── */
  var lcCards = document.querySelectorAll('.lc-car-card');
  if (!lcCards.length) return;

  var lcObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('lc-card-visible');
        lcObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.10 });

  lcCards.forEach(function (card) {
    lcObserver.observe(card);
  });

  /* ── Filter buttons ── */
  var filterBtns = document.querySelectorAll('.lc-filter-btn');
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');

      var filter = btn.dataset.filter;
      lcCards.forEach(function (card) {
        if (filter === 'all' || card.dataset.category === filter) {
          card.classList.remove('lc-hidden');
          // re-trigger reveal for newly shown cards
          setTimeout(function () { card.classList.add('lc-card-visible'); }, 30);
        } else {
          card.classList.add('lc-hidden');
        }
      });

      /* Re-center last-2 rule after filtering */
      resetLastTwoCenter();
    });
  });

  /* ── Center last-2 visible cards if fewer than 4 in last row ── */
  function resetLastTwoCenter() {
    // Only applies at ≥ 4-col layout
    if (window.innerWidth < 1100) return;
    var visibleCards = Array.from(lcCards).filter(function (c) {
      return !c.classList.contains('lc-hidden');
    });
    // Reset all
    visibleCards.forEach(function (c) {
      c.style.gridColumn = '';
    });
    var cols = 4;
    var lastRowCount = visibleCards.length % cols;
    if (lastRowCount === 0) return; // full last row
    var lastRowCards = visibleCards.slice(-lastRowCount);
    if (lastRowCount === 2) {
      lastRowCards[0].style.gridColumn = '2 / 3';
      lastRowCards[1].style.gridColumn = '3 / 4';
    } else if (lastRowCount === 1) {
      lastRowCards[0].style.gridColumn = '2 / 4';
    }
  }

  /* ── Book Now (Select) → booking-local.html ── */
  document.querySelectorAll('.lc-btn-select').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = btn.closest('.lc-car-card');
      var params = new URLSearchParams({
        car: card.dataset.car,
        seats: card.dataset.seats,
        luggage: card.dataset.luggage,
        price: card.dataset.price,
        extraKm: card.dataset.extraKm,
        extraHr: card.dataset.extraHr,
        img: card.dataset.img,
        type: 'local'
      });
      window.location.href = 'booking-local.html?' + params.toString();
    });
  });
})();

/* ============================================================
   OUTSTATION CABS PAGE — Add at bottom of script.js
   ============================================================ */

(function () {
  var ocCards = document.querySelectorAll('.oc-car-card');
  if (!ocCards.length) return;

  /* ── Current trip type state ── */
  var currentTrip = 'oneway';

  /* ── Card reveal observer ── */
  var ocObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('oc-card-visible');
        ocObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.10 });

  ocCards.forEach(function (card) {
    ocObserver.observe(card);
  });

  /* ── Trip type toggle ── */
  var tripBtns = document.querySelectorAll('.oc-trip-btn');
  tripBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      tripBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentTrip = btn.dataset.trip;

      /* Swap price display on all cards */
      ocCards.forEach(function (card) {
        var ow = card.querySelector('.oc-price-oneway');
        var rt = card.querySelector('.oc-price-roundtrip');
        if (!ow || !rt) return;
        if (currentTrip === 'roundtrip') {
          ow.style.display = 'none';
          rt.style.display = 'block';
        } else {
          ow.style.display = 'block';
          rt.style.display = 'none';
        }
      });
    });
  });

  /* ── Filter buttons ── */
  var filterBtns = document.querySelectorAll('.oc-filter-btn');
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');

      var filter = btn.dataset.filter;
      ocCards.forEach(function (card) {
        if (filter === 'all' || card.dataset.category === filter) {
          card.classList.remove('oc-hidden');
          setTimeout(function () { card.classList.add('oc-card-visible'); }, 30);
        } else {
          card.classList.add('oc-hidden');
        }
      });

      resetLastRowCenter();
    });
  });

  /* ── Re-center last row after filtering ── */
  function resetLastRowCenter() {
    if (window.innerWidth < 1100) return;
    var visibleCards = Array.from(ocCards).filter(function (c) {
      return !c.classList.contains('oc-hidden');
    });
    visibleCards.forEach(function (c) { c.style.gridColumn = ''; });

    var cols = 4;
    var lastRowCount = visibleCards.length % cols;
    if (lastRowCount === 0) return;
    var lastRowCards = visibleCards.slice(-lastRowCount);

    if (lastRowCount === 1) {
      lastRowCards[0].style.gridColumn = '2 / 4';
    } else if (lastRowCount === 2) {
      lastRowCards[0].style.gridColumn = '2 / 3';
      lastRowCards[1].style.gridColumn = '3 / 4';
    } else if (lastRowCount === 3) {
      lastRowCards[0].style.gridColumn = '1 / 2';
      lastRowCards[1].style.gridColumn = '2 / 3';
      lastRowCards[2].style.gridColumn = '3 / 4';
    }
  }

  /* ── Book Now → booking-outstation.html ── */
  document.querySelectorAll('.oc-btn-select').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = btn.closest('.oc-car-card');
      var params = new URLSearchParams({
        car:       card.dataset.car,
        seats:     card.dataset.seats,
        luggage:   card.dataset.luggage,
        rateOW:    card.dataset.rateOneway,
        rateRT:    card.dataset.rateRoundtrip,
        tripType:  currentTrip,
        img:       card.dataset.img,
        type:      'outstation'
      });
      window.location.href = 'booking-outstation.html?' + params.toString();
    });
  });

})();

/* ============================================================
   TOUR PACKAGES PAGE — Add at bottom of script.js
   ============================================================ */

(function () {
  var tpCards = document.querySelectorAll('.tp-pkg-card');
  if (!tpCards.length) return;

  /* ── Filter buttons ── */
  var filterBtns = document.querySelectorAll('.tp-filter-btn');
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');

      var filter = btn.dataset.filter;
      tpCards.forEach(function (card) {
        if (filter === 'all' || card.dataset.category === filter) {
          card.classList.remove('tp-hidden');
        } else {
          card.classList.add('tp-hidden');
        }
      });

      resetLastRowCenter();
    });
  });

  /* ── Re-center last row after filtering ── */
  function resetLastRowCenter() {
    if (window.innerWidth < 1100) return;
    var visibleCards = Array.from(tpCards).filter(function (c) {
      return !c.classList.contains('tp-hidden');
    });
    visibleCards.forEach(function (c) { c.style.gridColumn = ''; });

    var cols = 4;
    var lastRowCount = visibleCards.length % cols;
    if (lastRowCount === 0) return;
    var lastRowCards = visibleCards.slice(-lastRowCount);

    if (lastRowCount === 1) {
      lastRowCards[0].style.gridColumn = '2 / 4';
    } else if (lastRowCount === 2) {
      lastRowCards[0].style.gridColumn = '2 / 3';
      lastRowCards[1].style.gridColumn = '3 / 4';
    } else if (lastRowCount === 3) {
      lastRowCards[0].style.gridColumn = '1 / 2';
      lastRowCards[1].style.gridColumn = '2 / 3';
      lastRowCards[2].style.gridColumn = '3 / 4';
    }
  }

})();

/* ============================================================
   NANDI HILLS TOUR PAGE — Add at bottom of script.js
   ============================================================ */

(function () {
  if (!document.body.classList.contains('nandi-tour-page')) return;

  /* ── Sticky tab highlight on scroll ── */
  var tabNav = document.getElementById('nandiTabNav');
  var sections = ['nandi-overview', 'nandi-itinerary', 'nandi-tariff', 'nandi-includes'];
  var tabs = document.querySelectorAll('#nandiTabNav .mys-tab');

  window.addEventListener('scroll', function () {
    var scrollY = window.scrollY + 200;
    sections.forEach(function (id, i) {
      var el = document.getElementById(id);
      if (!el) return;
      if (el.offsetTop <= scrollY && el.offsetTop + el.offsetHeight > scrollY) {
        tabs.forEach(function (t) { t.classList.remove('active'); });
        if (tabs[i]) tabs[i].classList.add('active');
      }
    });
  });

  /* ── Booking form validation ── */
  var submitBtn = document.getElementById('nandiBookSubmit');
  if (!submitBtn) return;

  function getVal(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function setErr(id, msg) {
    var el = document.getElementById(id);
    if (el) el.textContent = msg;
  }

  function clearErr(id) {
    var el = document.getElementById(id);
    if (el) el.textContent = '';
  }

  /* Clear errors on input */
  ['nandiName','nandiPhone','nandiDate','nandiTime','nandiVehicle','nandiPickup'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', function () { clearErr('nandiErr' + id.replace('nandi', '')); });
      el.addEventListener('change', function () { clearErr('nandiErr' + id.replace('nandi', '')); });
    }
  });

  submitBtn.addEventListener('click', function () {
    var valid = true;

    if (!getVal('nandiName')) {
      setErr('nandiErrName', 'Please enter your full name.'); valid = false;
    } else { clearErr('nandiErrName'); }

    var phone = getVal('nandiPhone');
    if (!phone) {
      setErr('nandiErrPhone', 'Please enter your phone number.'); valid = false;
    } else if (!/^[+\d\s\-]{7,15}$/.test(phone)) {
      setErr('nandiErrPhone', 'Please enter a valid phone number.'); valid = false;
    } else { clearErr('nandiErrPhone'); }

    if (!getVal('nandiDate')) {
      setErr('nandiErrDate', 'Please select a tour date.'); valid = false;
    } else { clearErr('nandiErrDate'); }

    if (!getVal('nandiTime')) {
      setErr('nandiErrTime', 'Please select a pickup time.'); valid = false;
    } else { clearErr('nandiErrTime'); }

    if (!getVal('nandiVehicle')) {
      setErr('nandiErrVehicle', 'Please select a vehicle type.'); valid = false;
    } else { clearErr('nandiErrVehicle'); }

    if (!getVal('nandiPickup')) {
      setErr('nandiErrPickup', 'Please select a pickup location.'); valid = false;
    } else { clearErr('nandiErrPickup'); }

    if (!valid) return;

    /* Build WhatsApp message and open */
    var msg = 'Hi%2C%20I%20want%20to%20book%20Early%20Morning%20Nandi%20Hills%20Tour%20Package%0A'
      + 'Name%3A%20' + encodeURIComponent(getVal('nandiName')) + '%0A'
      + 'Phone%3A%20' + encodeURIComponent(getVal('nandiPhone')) + '%0A'
      + 'Date%3A%20' + encodeURIComponent(getVal('nandiDate')) + '%0A'
      + 'Pickup%20Time%3A%20' + encodeURIComponent(getVal('nandiTime')) + '%0A'
      + 'Vehicle%3A%20' + encodeURIComponent(getVal('nandiVehicle')) + '%0A'
      + 'Pickup%20Location%3A%20' + encodeURIComponent(getVal('nandiPickup'))
      + (getVal('nandiAddress') ? '%0AAddress%3A%20' + encodeURIComponent(getVal('nandiAddress')) : '');

    window.open('https://wa.me/919152333388?text=' + msg, '_blank');

    /* Show success state */
    var form = document.getElementById('nandiBookForm');
    var success = document.getElementById('nandiBookSuccess');
    if (form && success) {
      Array.from(form.querySelectorAll('.mys-field, .mys-book-submit, .mys-book-wa')).forEach(function (el) {
        el.style.display = 'none';
      });
      success.classList.add('visible');
    }
  });

})();

/* ============================================================
   MYSORE TOUR PAGE — Add at bottom of script.js
   (Tab highlighting logic is also reused by Nandi Hills page)
   ============================================================ */

(function () {
  if (!document.body.classList.contains('mysore-tour-page')) return;

  /* ── Sticky tab highlight on scroll ── */
  var sections = ['mys-overview', 'mys-itinerary', 'mys-tariff', 'mys-includes'];
  var tabs = document.querySelectorAll('#mysTabNav .mys-tab');

  window.addEventListener('scroll', function () {
    var scrollY = window.scrollY + 200;
    sections.forEach(function (id, i) {
      var el = document.getElementById(id);
      if (!el) return;
      if (el.offsetTop <= scrollY && el.offsetTop + el.offsetHeight > scrollY) {
        tabs.forEach(function (t) { t.classList.remove('active'); });
        if (tabs[i]) tabs[i].classList.add('active');
      }
    });
  });

  /* ── Booking form validation ── */
  var submitBtn = document.getElementById('mysBookSubmit');
  if (!submitBtn) return;

  function getVal(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function setErr(id, msg) {
    var el = document.getElementById(id);
    if (el) el.textContent = msg;
  }

  function clearErr(id) {
    var el = document.getElementById(id);
    if (el) el.textContent = '';
  }

  /* Clear errors on input */
  ['mysoreName','mysorePhone','mysoreDate','mysoreTime','mysoreVehicle','mysorePickup'].forEach(function (inputId) {
    var el = document.getElementById(inputId);
    if (el) {
      el.addEventListener('input', function () { clearErr('err' + inputId.replace('mysore','').replace(/^\w/, function(c){ return c.toUpperCase(); })); });
      el.addEventListener('change', function () { clearErr('err' + inputId.replace('mysore','').replace(/^\w/, function(c){ return c.toUpperCase(); })); });
    }
  });

  submitBtn.addEventListener('click', function () {
    var valid = true;

    if (!getVal('mysoreName')) {
      setErr('errName', 'Please enter your full name.'); valid = false;
    } else { clearErr('errName'); }

    var phone = getVal('mysorePhone');
    if (!phone) {
      setErr('errPhone', 'Please enter your phone number.'); valid = false;
    } else if (!/^[+\d\s\-]{7,15}$/.test(phone)) {
      setErr('errPhone', 'Please enter a valid phone number.'); valid = false;
    } else { clearErr('errPhone'); }

    if (!getVal('mysoreDate')) {
      setErr('errDate', 'Please select a tour date.'); valid = false;
    } else { clearErr('errDate'); }

    if (!getVal('mysoreTime')) {
      setErr('errTime', 'Please select a pickup time.'); valid = false;
    } else { clearErr('errTime'); }

    if (!getVal('mysoreVehicle')) {
      setErr('errVehicle', 'Please select a vehicle type.'); valid = false;
    } else { clearErr('errVehicle'); }

    if (!getVal('mysorePickup')) {
      setErr('errPickup', 'Please select a pickup location.'); valid = false;
    } else { clearErr('errPickup'); }

    if (!valid) return;

    /* Build WhatsApp message and open */
    var msg = 'Hi%2C%20I%20want%20to%20book%20Bangalore%20to%20Mysore%20Cab%20Service%20Tour%20Package%0A'
      + 'Name%3A%20' + encodeURIComponent(getVal('mysoreName')) + '%0A'
      + 'Phone%3A%20' + encodeURIComponent(getVal('mysorePhone')) + '%0A'
      + 'Date%3A%20' + encodeURIComponent(getVal('mysoreDate')) + '%0A'
      + 'Pickup%20Time%3A%20' + encodeURIComponent(getVal('mysoreTime')) + '%0A'
      + 'Vehicle%3A%20' + encodeURIComponent(getVal('mysoreVehicle')) + '%0A'
      + 'Pickup%20Location%3A%20' + encodeURIComponent(getVal('mysorePickup'))
      + (getVal('mysoreAddress') ? '%0AAddress%3A%20' + encodeURIComponent(getVal('mysoreAddress')) : '');

    window.open('https://wa.me/919152333388?text=' + msg, '_blank');

    /* Show success state */
    var form = document.getElementById('mysoreBookForm');
    var success = document.getElementById('mysBookSuccess');
    if (form && success) {
      Array.from(form.querySelectorAll('.mys-field, .mys-book-submit, .mys-book-wa')).forEach(function (el) {
        el.style.display = 'none';
      });
      success.classList.add('visible');
    }
  });

})();

/* ============================================================
   HOGENAKKAL TOUR PAGE — hogenakkal-tour.js
   Add this file to your project OR paste at the bottom of script.js
   ============================================================ */

(function () {
  if (!document.body.classList.contains('hogenakkal-tour-page')) return;

  /* ── Sticky tab highlight on scroll ── */
  var sections = ['hog-overview', 'hog-itinerary', 'hog-tariff', 'hog-includes'];
  var tabs = document.querySelectorAll('#hogTabNav .mys-tab');

  window.addEventListener('scroll', function () {
    var scrollY = window.scrollY + 200;
    sections.forEach(function (id, i) {
      var el = document.getElementById(id);
      if (!el) return;
      if (el.offsetTop <= scrollY && el.offsetTop + el.offsetHeight > scrollY) {
        tabs.forEach(function (t) { t.classList.remove('active'); });
        if (tabs[i]) tabs[i].classList.add('active');
      }
    });
  });

  /* ── Booking form validation ── */
  var submitBtn = document.getElementById('hogBookSubmit');
  if (!submitBtn) return;

  function getVal(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function setErr(id, msg) {
    var el = document.getElementById(id);
    if (el) el.textContent = msg;
  }

  function clearErr(id) {
    var el = document.getElementById(id);
    if (el) el.textContent = '';
  }

  /* Clear errors on input */
  ['hogName', 'hogPhone', 'hogDate', 'hogTime', 'hogVehicle', 'hogPickup'].forEach(function (inputId) {
    var el = document.getElementById(inputId);
    if (el) {
      el.addEventListener('input', function () { clearErr('hogErr' + inputId.replace('hog', '')); });
      el.addEventListener('change', function () { clearErr('hogErr' + inputId.replace('hog', '')); });
    }
  });

  submitBtn.addEventListener('click', function () {
    var valid = true;

    if (!getVal('hogName')) {
      setErr('hogErrName', 'Please enter your full name.'); valid = false;
    } else { clearErr('hogErrName'); }

    var phone = getVal('hogPhone');
    if (!phone) {
      setErr('hogErrPhone', 'Please enter your phone number.'); valid = false;
    } else if (!/^[+\d\s\-]{7,15}$/.test(phone)) {
      setErr('hogErrPhone', 'Please enter a valid phone number.'); valid = false;
    } else { clearErr('hogErrPhone'); }

    if (!getVal('hogDate')) {
      setErr('hogErrDate', 'Please select a tour date.'); valid = false;
    } else { clearErr('hogErrDate'); }

    if (!getVal('hogTime')) {
      setErr('hogErrTime', 'Please select a pickup time.'); valid = false;
    } else { clearErr('hogErrTime'); }

    if (!getVal('hogVehicle')) {
      setErr('hogErrVehicle', 'Please select a vehicle type.'); valid = false;
    } else { clearErr('hogErrVehicle'); }

    if (!getVal('hogPickup')) {
      setErr('hogErrPickup', 'Please select a pickup location.'); valid = false;
    } else { clearErr('hogErrPickup'); }

    if (!valid) return;

    /* Build WhatsApp message and open */
    var msg = 'Hi%2C%20I%20want%20to%20book%20Bangalore%20to%20Hogenakkal%20Cab%20Service%20Tour%20Package%0A'
      + 'Name%3A%20' + encodeURIComponent(getVal('hogName')) + '%0A'
      + 'Phone%3A%20' + encodeURIComponent(getVal('hogPhone')) + '%0A'
      + 'Date%3A%20' + encodeURIComponent(getVal('hogDate')) + '%0A'
      + 'Pickup%20Time%3A%20' + encodeURIComponent(getVal('hogTime')) + '%0A'
      + 'Vehicle%3A%20' + encodeURIComponent(getVal('hogVehicle')) + '%0A'
      + 'Pickup%20Location%3A%20' + encodeURIComponent(getVal('hogPickup'))
      + (getVal('hogAddress') ? '%0AAddress%3A%20' + encodeURIComponent(getVal('hogAddress')) : '');

    window.open('https://wa.me/919152333388?text=' + msg, '_blank');

    /* Show success state */
    var form = document.getElementById('hogenakkalBookForm');
    var success = document.getElementById('hogBookSuccess');
    if (form && success) {
      Array.from(form.querySelectorAll('.mys-field, .mys-book-submit, .mys-book-wa')).forEach(function (el) {
        el.style.display = 'none';
      });
      success.classList.add('visible');
    }
  });

})();

/* ============================================================
   MYSORE · OOTY · COORG 6N/7D TOUR PAGE
   mysore-ooty-coorg-tour.js
   Paste at the bottom of script.js OR link separately
   ============================================================ */

(function () {
  if (!document.body.classList.contains('moc-tour-page')) return;

  /* ── Sticky tab highlight on scroll ── */
  var sections = ['moc-overview', 'moc-itinerary', 'moc-tariff', 'moc-includes'];
  var tabs = document.querySelectorAll('#mocTabNav .mys-tab');

  window.addEventListener('scroll', function () {
    var scrollY = window.scrollY + 200;
    sections.forEach(function (id, i) {
      var el = document.getElementById(id);
      if (!el) return;
      if (el.offsetTop <= scrollY && el.offsetTop + el.offsetHeight > scrollY) {
        tabs.forEach(function (t) { t.classList.remove('active'); });
        if (tabs[i]) tabs[i].classList.add('active');
      }
    });
  });

  /* ── Booking form validation ── */
  var submitBtn = document.getElementById('mocBookSubmit');
  if (!submitBtn) return;

  function getVal(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function setErr(id, msg) {
    var el = document.getElementById(id);
    if (el) el.textContent = msg;
  }

  function clearErr(id) {
    var el = document.getElementById(id);
    if (el) el.textContent = '';
  }

  /* Clear errors on input */
  ['mocName', 'mocPhone', 'mocDate', 'mocTime', 'mocVehicle', 'mocPickup'].forEach(function (inputId) {
    var el = document.getElementById(inputId);
    if (el) {
      el.addEventListener('input',  function () { clearErr('mocErr' + inputId.replace('moc', '')); });
      el.addEventListener('change', function () { clearErr('mocErr' + inputId.replace('moc', '')); });
    }
  });

  submitBtn.addEventListener('click', function () {
    var valid = true;

    if (!getVal('mocName')) {
      setErr('mocErrName', 'Please enter your full name.'); valid = false;
    } else { clearErr('mocErrName'); }

    var phone = getVal('mocPhone');
    if (!phone) {
      setErr('mocErrPhone', 'Please enter your phone number.'); valid = false;
    } else if (!/^[+\d\s\-]{7,15}$/.test(phone)) {
      setErr('mocErrPhone', 'Please enter a valid phone number.'); valid = false;
    } else { clearErr('mocErrPhone'); }

    if (!getVal('mocDate')) {
      setErr('mocErrDate', 'Please select a departure date.'); valid = false;
    } else { clearErr('mocErrDate'); }

    if (!getVal('mocTime')) {
      setErr('mocErrTime', 'Please select a pickup time.'); valid = false;
    } else { clearErr('mocErrTime'); }

    if (!getVal('mocVehicle')) {
      setErr('mocErrVehicle', 'Please select a vehicle type.'); valid = false;
    } else { clearErr('mocErrVehicle'); }

    if (!getVal('mocPickup')) {
      setErr('mocErrPickup', 'Please select a pickup location.'); valid = false;
    } else { clearErr('mocErrPickup'); }

    if (!valid) return;

    /* Build WhatsApp message */
    var pax     = getVal('mocPax');
    var address = getVal('mocAddress');

    var msg = 'Hi%2C%20I%20want%20to%20book%20Bangalore%20to%20Mysore%20Ooty%20Coorg%206N7D%20Tour%20Package%0A'
      + 'Name%3A%20'            + encodeURIComponent(getVal('mocName'))    + '%0A'
      + 'Phone%3A%20'           + encodeURIComponent(getVal('mocPhone'))   + '%0A'
      + 'Departure%20Date%3A%20'+ encodeURIComponent(getVal('mocDate'))    + '%0A'
      + 'Pickup%20Time%3A%20'   + encodeURIComponent(getVal('mocTime'))    + '%0A'
      + 'Vehicle%3A%20'         + encodeURIComponent(getVal('mocVehicle')) + '%0A'
      + 'Pickup%20Location%3A%20'+ encodeURIComponent(getVal('mocPickup'));

    if (pax)     msg += '%0APassengers%3A%20'     + encodeURIComponent(pax);
    if (address) msg += '%0AAddress%3A%20'        + encodeURIComponent(address);

    window.open('https://wa.me/919152333388?text=' + msg, '_blank');

    /* Show success state */
    var form    = document.getElementById('mocBookForm');
    var success = document.getElementById('mocBookSuccess');
    if (form && success) {
      Array.from(form.querySelectorAll('.mys-field, .mys-book-submit, .mys-book-wa')).forEach(function (el) {
        el.style.display = 'none';
      });
      success.classList.add('visible');
    }
  });

})();

/* ============================================================
   ONE DAY BANGALORE TOUR PAGE — bangalore-tour.js
   Paste at the bottom of script.js OR link separately
   ============================================================ */

(function () {
  if (!document.body.classList.contains('blr-tour-page')) return;

  /* ── Sticky tab highlight on scroll ── */
  var sections = ['blr-overview', 'blr-itinerary', 'blr-tariff', 'blr-includes'];
  var tabs = document.querySelectorAll('#blrTabNav .mys-tab');

  window.addEventListener('scroll', function () {
    var scrollY = window.scrollY + 200;
    sections.forEach(function (id, i) {
      var el = document.getElementById(id);
      if (!el) return;
      if (el.offsetTop <= scrollY && el.offsetTop + el.offsetHeight > scrollY) {
        tabs.forEach(function (t) { t.classList.remove('active'); });
        if (tabs[i]) tabs[i].classList.add('active');
      }
    });
  });

  /* ── Booking form validation ── */
  var submitBtn = document.getElementById('blrBookSubmit');
  if (!submitBtn) return;

  function getVal(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function setErr(id, msg) {
    var el = document.getElementById(id);
    if (el) el.textContent = msg;
  }

  function clearErr(id) {
    var el = document.getElementById(id);
    if (el) el.textContent = '';
  }

  /* Clear errors on input */
  ['blrName', 'blrPhone', 'blrDate', 'blrTime', 'blrVehicle', 'blrPickup'].forEach(function (inputId) {
    var el = document.getElementById(inputId);
    if (el) {
      el.addEventListener('input',  function () { clearErr('blrErr' + inputId.replace('blr', '')); });
      el.addEventListener('change', function () { clearErr('blrErr' + inputId.replace('blr', '')); });
    }
  });

  submitBtn.addEventListener('click', function () {
    var valid = true;

    if (!getVal('blrName')) {
      setErr('blrErrName', 'Please enter your full name.'); valid = false;
    } else { clearErr('blrErrName'); }

    var phone = getVal('blrPhone');
    if (!phone) {
      setErr('blrErrPhone', 'Please enter your phone number.'); valid = false;
    } else if (!/^[+\d\s\-]{7,15}$/.test(phone)) {
      setErr('blrErrPhone', 'Please enter a valid phone number.'); valid = false;
    } else { clearErr('blrErrPhone'); }

    if (!getVal('blrDate')) {
      setErr('blrErrDate', 'Please select a tour date.'); valid = false;
    } else { clearErr('blrErrDate'); }

    if (!getVal('blrTime')) {
      setErr('blrErrTime', 'Please select a pickup time.'); valid = false;
    } else { clearErr('blrErrTime'); }

    if (!getVal('blrVehicle')) {
      setErr('blrErrVehicle', 'Please select a vehicle type.'); valid = false;
    } else { clearErr('blrErrVehicle'); }

    if (!getVal('blrPickup')) {
      setErr('blrErrPickup', 'Please select a pickup location.'); valid = false;
    } else { clearErr('blrErrPickup'); }

    if (!valid) return;

    /* Build WhatsApp message */
    var address = getVal('blrAddress');

    var msg = 'Hi%2C%20I%20want%20to%20book%20One%20Day%20Bangalore%20Tour%20Package%0A'
      + 'Name%3A%20'             + encodeURIComponent(getVal('blrName'))    + '%0A'
      + 'Phone%3A%20'            + encodeURIComponent(getVal('blrPhone'))   + '%0A'
      + 'Tour%20Date%3A%20'      + encodeURIComponent(getVal('blrDate'))    + '%0A'
      + 'Pickup%20Time%3A%20'    + encodeURIComponent(getVal('blrTime'))    + '%0A'
      + 'Vehicle%3A%20'          + encodeURIComponent(getVal('blrVehicle')) + '%0A'
      + 'Pickup%20Location%3A%20'+ encodeURIComponent(getVal('blrPickup'));

    if (address) msg += '%0AAddress%3A%20' + encodeURIComponent(address);

    window.open('https://wa.me/919152333388?text=' + msg, '_blank');

    /* Show success state */
    var form    = document.getElementById('blrBookForm');
    var success = document.getElementById('blrBookSuccess');
    if (form && success) {
      Array.from(form.querySelectorAll('.mys-field, .mys-book-submit, .mys-book-wa')).forEach(function (el) {
        el.style.display = 'none';
      });
      success.classList.add('visible');
    }
  });

})();

/* ============================================================
   COORG TOUR PAGE — Add at bottom of script.js
   ============================================================ */

(function () {
  if (!document.body.classList.contains('coorg-tour-page')) return;

  /* ── Sticky tab highlight on scroll ── */
  var sections = ['coorg-overview', 'coorg-itinerary', 'coorg-tariff', 'coorg-includes'];
  var tabs = document.querySelectorAll('#coorgTabNav .mys-tab');

  window.addEventListener('scroll', function () {
    var scrollY = window.scrollY + 200;
    sections.forEach(function (id, i) {
      var el = document.getElementById(id);
      if (!el) return;
      if (el.offsetTop <= scrollY && el.offsetTop + el.offsetHeight > scrollY) {
        tabs.forEach(function (t) { t.classList.remove('active'); });
        if (tabs[i]) tabs[i].classList.add('active');
      }
    });
  });

  /* ── Helpers ── */
  function getVal(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }
  function setErr(id, msg) {
    var el = document.getElementById(id);
    if (el) el.textContent = msg;
  }
  function clearErr(id) {
    var el = document.getElementById(id);
    if (el) el.textContent = '';
  }

  /* ── Clear errors on input ── */
  ['coorgName','coorgPhone','coorgDate','coorgTime','coorgVehicle','coorgPickup'].forEach(function (inputId) {
    var el = document.getElementById(inputId);
    if (!el) return;
    var errKey = 'coorgErr' + inputId.replace('coorg','').replace(/^\w/, function(c){ return c.toUpperCase(); });
    el.addEventListener('input', function () { clearErr(errKey); });
    el.addEventListener('change', function () { clearErr(errKey); });
  });

  /* ── Form submit ── */
  var submitBtn = document.getElementById('coorgBookSubmit');
  if (!submitBtn) return;

  submitBtn.addEventListener('click', function () {
    var valid = true;

    if (!getVal('coorgName')) {
      setErr('coorgErrName', 'Please enter your full name.'); valid = false;
    } else { clearErr('coorgErrName'); }

    var phone = getVal('coorgPhone');
    if (!phone) {
      setErr('coorgErrPhone', 'Please enter your phone number.'); valid = false;
    } else if (!/^[+\d\s\-]{7,15}$/.test(phone)) {
      setErr('coorgErrPhone', 'Please enter a valid phone number.'); valid = false;
    } else { clearErr('coorgErrPhone'); }

    if (!getVal('coorgDate')) {
      setErr('coorgErrDate', 'Please select a start date.'); valid = false;
    } else { clearErr('coorgErrDate'); }

    if (!getVal('coorgTime')) {
      setErr('coorgErrTime', 'Please select a pickup time.'); valid = false;
    } else { clearErr('coorgErrTime'); }

    if (!getVal('coorgVehicle')) {
      setErr('coorgErrVehicle', 'Please select a vehicle type.'); valid = false;
    } else { clearErr('coorgErrVehicle'); }

    if (!getVal('coorgPickup')) {
      setErr('coorgErrPickup', 'Please select a pickup location.'); valid = false;
    } else { clearErr('coorgErrPickup'); }

    if (!valid) return;

    /* ── Open WhatsApp with booking details ── */
    var msg = 'Hi%2C%20I%20want%20to%20book%20Bangalore%20to%20Coorg%203%20Day%20Tour%20Package%0A'
      + 'Name%3A%20' + encodeURIComponent(getVal('coorgName')) + '%0A'
      + 'Phone%3A%20' + encodeURIComponent(getVal('coorgPhone')) + '%0A'
      + 'Start%20Date%3A%20' + encodeURIComponent(getVal('coorgDate')) + '%0A'
      + 'Pickup%20Time%3A%20' + encodeURIComponent(getVal('coorgTime')) + '%0A'
      + 'Vehicle%3A%20' + encodeURIComponent(getVal('coorgVehicle')) + '%0A'
      + 'Pickup%20Location%3A%20' + encodeURIComponent(getVal('coorgPickup'))
      + (getVal('coorgAddress') ? '%0AAddress%3A%20' + encodeURIComponent(getVal('coorgAddress')) : '');

    window.open('https://wa.me/919152333388?text=' + msg, '_blank');

    /* ── Show success state ── */
    var form = document.getElementById('coorgBookForm');
    var success = document.getElementById('coorgBookSuccess');
    if (form && success) {
      Array.from(form.querySelectorAll('.mys-field, .mys-book-submit, .mys-book-wa')).forEach(function (el) {
        el.style.display = 'none';
      });
      success.classList.add('visible');
    }
  });

})();


/* ============================================================
   HOGENAKKAL TOUR PAGE — Add at bottom of script.js
   ============================================================ */

(function () {
  if (!document.body.classList.contains('hogenakkal-tour-page')) return;

  /* ── Sticky tab highlight on scroll ── */
  var sections = ['hog-overview', 'hog-itinerary', 'hog-tariff', 'hog-includes'];
  var tabs = document.querySelectorAll('#hogTabNav .mys-tab');

  window.addEventListener('scroll', function () {
    var scrollY = window.scrollY + 200;
    sections.forEach(function (id, i) {
      var el = document.getElementById(id);
      if (!el) return;
      if (el.offsetTop <= scrollY && el.offsetTop + el.offsetHeight > scrollY) {
        tabs.forEach(function (t) { t.classList.remove('active'); });
        if (tabs[i]) tabs[i].classList.add('active');
      }
    });
  });

  /* ── Helpers ── */
  function getVal(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }
  function setErr(id, msg) {
    var el = document.getElementById(id);
    if (el) el.textContent = msg;
  }
  function clearErr(id) {
    var el = document.getElementById(id);
    if (el) el.textContent = '';
  }

  /* ── Clear errors on input ── */
  ['hogName','hogPhone','hogDate','hogTime','hogVehicle','hogPickup'].forEach(function (inputId) {
    var el = document.getElementById(inputId);
    if (!el) return;
    var errKey = 'hogErr' + inputId.replace('hog','').replace(/^\w/, function(c){ return c.toUpperCase(); });
    el.addEventListener('input', function () { clearErr(errKey); });
    el.addEventListener('change', function () { clearErr(errKey); });
  });

  /* ── Form submit ── */
  var submitBtn = document.getElementById('hogBookSubmit');
  if (!submitBtn) return;

  submitBtn.addEventListener('click', function () {
    var valid = true;

    if (!getVal('hogName')) {
      setErr('hogErrName', 'Please enter your full name.'); valid = false;
    } else { clearErr('hogErrName'); }

    var phone = getVal('hogPhone');
    if (!phone) {
      setErr('hogErrPhone', 'Please enter your phone number.'); valid = false;
    } else if (!/^[+\d\s\-]{7,15}$/.test(phone)) {
      setErr('hogErrPhone', 'Please enter a valid phone number.'); valid = false;
    } else { clearErr('hogErrPhone'); }

    if (!getVal('hogDate')) {
      setErr('hogErrDate', 'Please select a tour date.'); valid = false;
    } else { clearErr('hogErrDate'); }

    if (!getVal('hogTime')) {
      setErr('hogErrTime', 'Please select a pickup time.'); valid = false;
    } else { clearErr('hogErrTime'); }

    if (!getVal('hogVehicle')) {
      setErr('hogErrVehicle', 'Please select a vehicle type.'); valid = false;
    } else { clearErr('hogErrVehicle'); }

    if (!getVal('hogPickup')) {
      setErr('hogErrPickup', 'Please select a pickup location.'); valid = false;
    } else { clearErr('hogErrPickup'); }

    if (!valid) return;

    var msg = 'Hi%2C%20I%20want%20to%20book%20Bangalore%20to%20Hogenakkal%20One%20Day%20Tour%20Package%0A'
      + 'Name%3A%20' + encodeURIComponent(getVal('hogName')) + '%0A'
      + 'Phone%3A%20' + encodeURIComponent(getVal('hogPhone')) + '%0A'
      + 'Date%3A%20' + encodeURIComponent(getVal('hogDate')) + '%0A'
      + 'Pickup%20Time%3A%20' + encodeURIComponent(getVal('hogTime')) + '%0A'
      + 'Vehicle%3A%20' + encodeURIComponent(getVal('hogVehicle')) + '%0A'
      + 'Pickup%20Location%3A%20' + encodeURIComponent(getVal('hogPickup'))
      + (getVal('hogAddress') ? '%0AAddress%3A%20' + encodeURIComponent(getVal('hogAddress')) : '');

    window.open('https://wa.me/919152333388?text=' + msg, '_blank');

    var form = document.getElementById('hogBookForm');
    var success = document.getElementById('hogBookSuccess');
    if (form && success) {
      Array.from(form.querySelectorAll('.mys-field, .mys-book-submit, .mys-book-wa')).forEach(function (el) {
        el.style.display = 'none';
      });
      success.classList.add('visible');
    }
  });

})();

/* ============================================================
   OOTY TOUR PAGE — JavaScript Implementation
   ============================================================ */

(function () {
  // Only run if the specific body class is present
  if (!document.body.classList.contains('ooty-tour-page')) return;

  /* ── Sticky tab highlight on scroll ── */
  var sections = ['ooty-overview', 'ooty-itinerary', 'ooty-tariff', 'ooty-includes'];
  var tabs = document.querySelectorAll('#ootyTabNav .mys-tab');

  window.addEventListener('scroll', function () {
    var scrollY = window.scrollY + 200;
    sections.forEach(function (id, i) {
      var el = document.getElementById(id);
      if (!el) return;
      if (el.offsetTop <= scrollY && el.offsetTop + el.offsetHeight > scrollY) {
        tabs.forEach(function (t) { t.classList.remove('active'); });
        if (tabs[i]) tabs[i].classList.add('active');
      }
    });
  });

  /* ── Helpers ── */
  function getVal(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }
  function setErr(id, msg) {
    var el = document.getElementById(id);
    if (el) el.textContent = msg;
  }
  function clearErr(id) {
    var el = document.getElementById(id);
    if (el) el.textContent = '';
  }

  /* ── Clear errors on input ── */
  ['ootyName','ootyPhone','ootyDate','ootyTime','ootyVehicle','ootyPickup'].forEach(function (inputId) {
    var el = document.getElementById(inputId);
    if (!el) return;
    // Map input IDs to error IDs (e.g., ootyName -> ootyErrName)
    var errKey = 'ootyErr' + inputId.replace('ooty','').replace(/^\w/, function(c){ return c.toUpperCase(); });
    el.addEventListener('input', function () { clearErr(errKey); });
    el.addEventListener('change', function () { clearErr(errKey); });
  });

  /* ── Form submit ── */
  var submitBtn = document.getElementById('ootyBookSubmit');
  if (!submitBtn) return;

  submitBtn.addEventListener('click', function () {
    var valid = true;

    if (!getVal('ootyName')) {
      setErr('ootyErrName', 'Please enter your full name.'); valid = false;
    } else { clearErr('ootyErrName'); }

    var phone = getVal('ootyPhone');
    if (!phone) {
      setErr('ootyErrPhone', 'Please enter your phone number.'); valid = false;
    } else if (!/^[+\d\s\-]{7,15}$/.test(phone)) {
      setErr('ootyErrPhone', 'Please enter a valid phone number.'); valid = false;
    } else { clearErr('ootyErrPhone'); }

    if (!getVal('ootyDate')) {
      setErr('ootyErrDate', 'Please select a tour date.'); valid = false;
    } else { clearErr('ootyErrDate'); }

    if (!getVal('ootyTime')) {
      setErr('ootyErrTime', 'Please select a pickup time.'); valid = false;
    } else { clearErr('ootyErrTime'); }

    if (!getVal('ootyVehicle')) {
      setErr('ootyErrVehicle', 'Please select a vehicle type.'); valid = false;
    } else { clearErr('ootyErrVehicle'); }

    if (!getVal('ootyPickup')) {
      setErr('ootyErrPickup', 'Please select a pickup location.'); valid = false;
    } else { clearErr('ootyErrPickup'); }

    if (!valid) return;

    // Construct WhatsApp message
    var msg = 'Hi%2C%20I%20want%20to%20book%20Bangalore%20to%20Ooty%203%20Day%20Tour%20Package%0A'
      + 'Name%3A%20' + encodeURIComponent(getVal('ootyName')) + '%0A'
      + 'Phone%3A%20' + encodeURIComponent(getVal('ootyPhone')) + '%0A'
      + 'Date%3A%20' + encodeURIComponent(getVal('ootyDate')) + '%0A'
      + 'Pickup%20Time%3A%20' + encodeURIComponent(getVal('ootyTime')) + '%0A'
      + 'Vehicle%3A%20' + encodeURIComponent(getVal('ootyVehicle')) + '%0A'
      + 'Pickup%20Location%3A%20' + encodeURIComponent(getVal('ootyPickup'))
      + (getVal('ootyPax') ? '%0APax%3A%20' + encodeURIComponent(getVal('ootyPax')) : '')
      + (getVal('ootyAddress') ? '%0AAddress%3A%20' + encodeURIComponent(getVal('ootyAddress')) : '');

    // Open WhatsApp in new tab
    window.open('https://wa.me/919152333388?text=' + msg, '_blank');

    // UI Feedback: Hide form and show success message
    var formContainer = document.getElementById('ootyBookForm');
    var successMsg = document.getElementById('ootyBookSuccess');
    if (formContainer && successMsg) {
      Array.from(formContainer.querySelectorAll('.mys-field, .mys-book-submit, .mys-book-wa')).forEach(function (el) {
        el.style.display = 'none';
      });
      successMsg.classList.add('visible');
      successMsg.style.display = 'block'; // Ensure it becomes visible
    }
  });

})();

/* ============================================================
   BANGALORE TO CHIKMAGALUR TOUR PAGE — chikmagalur-tour.js
   Paste this block at the BOTTOM of your existing script.js
   ============================================================ */

(function () {
  // Only run on the Chikmagalur tour page
  if (!document.body.classList.contains('chikmagalur-tour-page')) return;

  /* ── Sticky tab highlight on scroll ── */
  var sections = ['chik-overview', 'chik-itinerary', 'chik-tariff', 'chik-includes'];
  var tabs = document.querySelectorAll('#chikTabNav .mys-tab');

  window.addEventListener('scroll', function () {
    var scrollY = window.scrollY + 200;
    sections.forEach(function (id, i) {
      var el = document.getElementById(id);
      if (!el) return;
      if (el.offsetTop <= scrollY && el.offsetTop + el.offsetHeight > scrollY) {
        tabs.forEach(function (t) { t.classList.remove('active'); });
        if (tabs[i]) tabs[i].classList.add('active');
      }
    });
  });

  /* ── Helpers ── */
  function getVal(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function setErr(id, msg) {
    var el = document.getElementById(id);
    if (el) el.textContent = msg;
  }

  function clearErr(id) {
    var el = document.getElementById(id);
    if (el) el.textContent = '';
  }

  /* ── Clear errors on input ── */
  ['chikName', 'chikPhone', 'chikDate', 'chikTime', 'chikVehicle', 'chikPickup'].forEach(function (inputId) {
    var el = document.getElementById(inputId);
    if (!el) return;
    var errKey = 'chikErr' + inputId.replace('chik', '').replace(/^\w/, function (c) { return c.toUpperCase(); });
    el.addEventListener('input', function () { clearErr(errKey); });
    el.addEventListener('change', function () { clearErr(errKey); });
  });

  /* ── Form submit ── */
  var submitBtn = document.getElementById('chikBookSubmit');
  if (!submitBtn) return;

  submitBtn.addEventListener('click', function () {
    var valid = true;

    if (!getVal('chikName')) {
      setErr('chikErrName', 'Please enter your full name.'); valid = false;
    } else { clearErr('chikErrName'); }

    var phone = getVal('chikPhone');
    if (!phone) {
      setErr('chikErrPhone', 'Please enter your phone number.'); valid = false;
    } else if (!/^[+\d\s\-]{7,15}$/.test(phone)) {
      setErr('chikErrPhone', 'Please enter a valid phone number.'); valid = false;
    } else { clearErr('chikErrPhone'); }

    if (!getVal('chikDate')) {
      setErr('chikErrDate', 'Please select a departure date.'); valid = false;
    } else { clearErr('chikErrDate'); }

    if (!getVal('chikTime')) {
      setErr('chikErrTime', 'Please select a pickup time.'); valid = false;
    } else { clearErr('chikErrTime'); }

    if (!getVal('chikVehicle')) {
      setErr('chikErrVehicle', 'Please select a vehicle type.'); valid = false;
    } else { clearErr('chikErrVehicle'); }

    if (!getVal('chikPickup')) {
      setErr('chikErrPickup', 'Please select a pickup location.'); valid = false;
    } else { clearErr('chikErrPickup'); }

    if (!valid) return;

    /* ── Build WhatsApp message ── */
    var pax     = getVal('chikPax');
    var address = getVal('chikAddress');

    var msg = 'Hi%2C%20I%20want%20to%20book%20Bangalore%20to%20Chikmagalur%203%20Day%20Tour%20Package%0A'
      + 'Name%3A%20'              + encodeURIComponent(getVal('chikName'))    + '%0A'
      + 'Phone%3A%20'             + encodeURIComponent(getVal('chikPhone'))   + '%0A'
      + 'Departure%20Date%3A%20'  + encodeURIComponent(getVal('chikDate'))    + '%0A'
      + 'Pickup%20Time%3A%20'     + encodeURIComponent(getVal('chikTime'))    + '%0A'
      + 'Vehicle%3A%20'           + encodeURIComponent(getVal('chikVehicle')) + '%0A'
      + 'Pickup%20Location%3A%20' + encodeURIComponent(getVal('chikPickup'));

    if (pax)     msg += '%0APassengers%3A%20' + encodeURIComponent(pax);
    if (address) msg += '%0AAddress%3A%20'    + encodeURIComponent(address);

    window.open('https://wa.me/919152333388?text=' + msg, '_blank');

    /* ── Show success state ── */
    var form    = document.getElementById('chikBookForm');
    var success = document.getElementById('chikBookSuccess');
    if (form && success) {
      Array.from(form.querySelectorAll('.mys-field, .mys-book-submit, .mys-book-wa')).forEach(function (el) {
        el.style.display = 'none';
      });
      success.classList.add('visible');
      success.style.display = 'block';
    }
  });

})();

/* ============================================================
   WAYANAD TOUR PAGE — Add at bottom of script.js
   ============================================================ */

(function () {
  // Only run if the specific body class is present
  if (!document.body.classList.contains('wayanad-tour-page')) return;

  /* ── Sticky tab highlight on scroll ── */
  var sections = ['way-overview', 'way-itinerary', 'way-tariff', 'way-includes'];
  var tabs = document.querySelectorAll('#wayTabNav .mys-tab');

  window.addEventListener('scroll', function () {
    var scrollY = window.scrollY + 200;
    sections.forEach(function (id, i) {
      var el = document.getElementById(id);
      if (!el) return;
      if (el.offsetTop <= scrollY && el.offsetTop + el.offsetHeight > scrollY) {
        tabs.forEach(function (t) { t.classList.remove('active'); });
        if (tabs[i]) tabs[i].classList.add('active');
      }
    });
  });

  /* ── Helpers ── */
  function getVal(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }
  function setErr(id, msg) {
    var el = document.getElementById(id);
    if (el) el.textContent = msg;
  }
  function clearErr(id) {
    var el = document.getElementById(id);
    if (el) el.textContent = '';
  }

  /* ── Clear errors on input ── */
  ['wayName', 'wayPhone', 'wayDate', 'wayTime', 'wayVehicle', 'wayPickup'].forEach(function (inputId) {
    var el = document.getElementById(inputId);
    if (!el) return;
    var errKey = 'wayErr' + inputId.replace('way', '').replace(/^\w/, function (c) { return c.toUpperCase(); });
    el.addEventListener('input', function () { clearErr(errKey); });
    el.addEventListener('change', function () { clearErr(errKey); });
  });

  /* ── Form submit ── */
  var submitBtn = document.getElementById('wayBookSubmit');
  if (!submitBtn) return;

  submitBtn.addEventListener('click', function () {
    var valid = true;

    if (!getVal('wayName')) {
      setErr('wayErrName', 'Please enter your full name.'); valid = false;
    } else { clearErr('wayErrName'); }

    var phone = getVal('wayPhone');
    if (!phone) {
      setErr('wayErrPhone', 'Please enter your phone number.'); valid = false;
    } else if (!/^[+\d\s\-]{7,15}$/.test(phone)) {
      setErr('wayErrPhone', 'Please enter a valid phone number.'); valid = false;
    } else { clearErr('wayErrPhone'); }

    if (!getVal('wayDate')) {
      setErr('wayErrDate', 'Please select a tour date.'); valid = false;
    } else { clearErr('wayErrDate'); }

    if (!getVal('wayTime')) {
      setErr('wayErrTime', 'Please select a pickup time.'); valid = false;
    } else { clearErr('wayErrTime'); }

    if (!getVal('wayVehicle')) {
      setErr('wayErrVehicle', 'Please select a vehicle type.'); valid = false;
    } else { clearErr('wayErrVehicle'); }

    if (!getVal('wayPickup')) {
      setErr('wayErrPickup', 'Please select a pickup location.'); valid = false;
    } else { clearErr('wayErrPickup'); }

    if (!valid) return;

    /* ── Build WhatsApp message ── */
    var pax = getVal('wayPax');
    var address = getVal('wayAddress');

    var msg = 'Hi%2C%20I%20want%20to%20book%20Bangalore%20to%20Wayanad%203%20Day%20Tour%20Package%0A'
      + 'Name%3A%20' + encodeURIComponent(getVal('wayName')) + '%0A'
      + 'Phone%3A%20' + encodeURIComponent(getVal('wayPhone')) + '%0A'
      + 'Date%3A%20' + encodeURIComponent(getVal('wayDate')) + '%0A'
      + 'Pickup%20Time%3A%20' + encodeURIComponent(getVal('wayTime')) + '%0A'
      + 'Vehicle%3A%20' + encodeURIComponent(getVal('wayVehicle')) + '%0A'
      + 'Pickup%20Location%3A%20' + encodeURIComponent(getVal('wayPickup'));

    if (pax) msg += '%0APassengers%3A%20' + encodeURIComponent(pax);
    if (address) msg += '%0AAddress%3A%20' + encodeURIComponent(address);

    window.open('https://wa.me/919152333388?text=' + msg, '_blank');

    /* ── Show success state ── */
    var form = document.getElementById('wayBookForm');
    var success = document.getElementById('wayBookSuccess');
    if (form && success) {
      Array.from(form.querySelectorAll('.mys-field, .mys-book-submit, .mys-book-wa')).forEach(function (el) {
        el.style.display = 'none';
      });
      success.classList.add('visible');
      success.style.display = 'block';
    }
  });

})();

/* ============================================================
   ABOUT US PAGE — about-us.js
   Paste at the bottom of script.js OR link separately
   ============================================================ */

(function () {
  if (!document.body.classList.contains('about-page')) return;

  /* ── Animated Stat Counters ── */
  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-target'), 10);
    var duration = 1800;
    var start = null;

    /* Format large numbers with commas */
    function formatNum(n) {
      if (n >= 1000) return n.toLocaleString('en-IN');
      return n;
    }

    function step(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      /* Ease out quint */
      var eased = 1 - Math.pow(1 - progress, 5);
      var current = Math.floor(eased * target);
      el.textContent = formatNum(current);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = formatNum(target);
      }
    }

    requestAnimationFrame(step);
  }

  /* Trigger counters when stats strip enters viewport */
  var counters = document.querySelectorAll('.au-stat-num');
  var countersStarted = false;

  var statsObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !countersStarted) {
        countersStarted = true;
        counters.forEach(function (counter) {
          animateCounter(counter);
        });
        statsObserver.disconnect();
      }
    });
  }, { threshold: 0.3 });

  var statsStrip = document.querySelector('.au-stats-strip');
  if (statsStrip) statsObserver.observe(statsStrip);

  /* ── FAQ Accordion ── */
  var faqItems = document.querySelectorAll('[data-faq]');

  faqItems.forEach(function (item) {
    var btn = item.querySelector('.au-faq-q');
    var answer = item.querySelector('.au-faq-a');
    if (!btn || !answer) return;

    btn.addEventListener('click', function () {
      var isOpen = btn.getAttribute('aria-expanded') === 'true';

      /* Close all others */
      faqItems.forEach(function (other) {
        var otherBtn = other.querySelector('.au-faq-q');
        var otherAns = other.querySelector('.au-faq-a');
        if (otherBtn && otherAns) {
          otherBtn.setAttribute('aria-expanded', 'false');
          otherAns.classList.remove('open');
        }
      });

      /* Toggle current */
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        answer.classList.add('open');
      }
    });
  });

  /* ── Mobile Services Toggle ── */
  var mobileServicesToggle = document.getElementById('mobileServicesToggle');
  var mobileDropdown = document.getElementById('mobileDropdown');
  if (mobileServicesToggle && mobileDropdown) {
    mobileServicesToggle.addEventListener('click', function () {
      mobileDropdown.classList.toggle('open');
    });
  }

})();

/* ============================================================
   WHY CHOOSE US PAGE — Add at bottom of script.js
   ============================================================ */

(function () {
  if (!document.body.classList.contains('why-choose-page')) return;

  /* ── Counter animation ── */
  function animateCounter(el) {
    var target = parseFloat(el.dataset.target);
    var isFloat = target % 1 !== 0;
    var duration = 1800;
    var start = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      // Ease out cubic
      var ease = 1 - Math.pow(1 - progress, 3);
      var current = target * ease;
      el.textContent = isFloat ? current.toFixed(1) : Math.floor(current).toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = isFloat ? target.toFixed(1) : target.toLocaleString();
    }

    requestAnimationFrame(step);
  }

  var countersStarted = false;
  var counters = document.querySelectorAll('.wcu-stat-num[data-target]');

  function startCounters() {
    if (countersStarted) return;
    var hero = document.querySelector('.wcu-hero-stats');
    if (!hero) return;
    var rect = hero.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      countersStarted = true;
      counters.forEach(function(el) { animateCounter(el); });
    }
  }

  window.addEventListener('scroll', startCounters);
  setTimeout(startCounters, 500); // also try on page load

  /* ── FAQ accordion ── */
  var faqItems = document.querySelectorAll('.wcu-faq-item');

  faqItems.forEach(function(item) {
    var btn = item.querySelector('.wcu-faq-q');
    var answer = item.querySelector('.wcu-faq-a');
    if (!btn || !answer) return;

    btn.addEventListener('click', function() {
      var isOpen = item.classList.contains('open');

      // Close all
      faqItems.forEach(function(fi) {
        fi.classList.remove('open');
        var a = fi.querySelector('.wcu-faq-a');
        if (a) a.classList.remove('open');
        var b = fi.querySelector('.wcu-faq-q');
        if (b) b.setAttribute('aria-expanded', 'false');
      });

      // Open clicked (if it wasn't open)
      if (!isOpen) {
        item.classList.add('open');
        answer.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ── Reason cards stagger on scroll ── */
  var reasonCards = document.querySelectorAll('.wcu-reason-card');
  var reasonObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        reasonObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  reasonCards.forEach(function(card, i) {
    card.style.transitionDelay = (i % 3) * 0.1 + 's';
    reasonObserver.observe(card);
  });

})();

/* ============================================================
   CONTACT PAGE — contact.js
   Link as <script src="contact.js"></script> before </body>
   OR paste this block at the bottom of your script.js
   ============================================================ */

(function () {
  if (!document.body.classList.contains('contact-page')) return;

  /* ── Helpers ── */
  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function setErr(id, msg) {
    var el = document.getElementById(id);
    if (el) el.textContent = msg;
  }

  function clearErr(id) {
    var el = document.getElementById(id);
    if (el) el.textContent = '';
  }

  function markField(inputId, hasError) {
    var el = document.getElementById(inputId);
    if (!el) return;
    if (hasError) {
      el.style.borderColor = 'rgba(239,68,68,0.6)';
    } else {
      el.style.borderColor = '';
    }
  }

  /* ── Clear errors on input ── */
  [
    ['ctName',    'ctErrName'],
    ['ctPhone',   'ctErrPhone'],
    ['ctService', 'ctErrService'],
  ].forEach(function (pair) {
    var el = document.getElementById(pair[0]);
    if (!el) return;
    ['input', 'change'].forEach(function (evt) {
      el.addEventListener(evt, function () {
        clearErr(pair[1]);
        markField(pair[0], false);
      });
    });
  });

  /* ── Form submit → opens WhatsApp ── */
  var submitBtn = document.getElementById('ctSubmitBtn');
  if (!submitBtn) return;

  submitBtn.addEventListener('click', function () {
    var valid = true;

    // Name
    if (!val('ctName')) {
      setErr('ctErrName', 'Please enter your full name.');
      markField('ctName', true);
      valid = false;
    } else {
      clearErr('ctErrName');
      markField('ctName', false);
    }

    // Phone
    var phone = val('ctPhone');
    if (!phone) {
      setErr('ctErrPhone', 'Please enter your phone number.');
      markField('ctPhone', true);
      valid = false;
    } else if (!/^[+\d\s\-]{7,15}$/.test(phone)) {
      setErr('ctErrPhone', 'Please enter a valid phone number.');
      markField('ctPhone', true);
      valid = false;
    } else {
      clearErr('ctErrPhone');
      markField('ctPhone', false);
    }

    // Service
    if (!val('ctService')) {
      setErr('ctErrService', 'Please select a service.');
      markField('ctService', true);
      valid = false;
    } else {
      clearErr('ctErrService');
      markField('ctService', false);
    }

    if (!valid) return;

    /* ── Build WhatsApp message ── */
    var lines = [
      'Hi%2C%20I%20have%20an%20enquiry%20for%20Bengaluru%20Car%20Rentals',
      'Name%3A%20'    + encodeURIComponent(val('ctName')),
      'Phone%3A%20'   + encodeURIComponent(val('ctPhone')),
      'Service%3A%20' + encodeURIComponent(val('ctService')),
    ];

    if (val('ctEmail'))   lines.push('Email%3A%20'   + encodeURIComponent(val('ctEmail')));
    if (val('ctDate'))    lines.push('Date%3A%20'    + encodeURIComponent(val('ctDate')));
    if (val('ctPickup'))  lines.push('Pickup%3A%20'  + encodeURIComponent(val('ctPickup')));
    if (val('ctMessage')) lines.push('Message%3A%20' + encodeURIComponent(val('ctMessage')));

    var msg = lines.join('%0A');

    window.open('https://wa.me/919152333388?text=' + msg, '_blank');

    /* ── Show success ── */
    var form    = document.getElementById('ctContactForm');
    var success = document.getElementById('ctFormSuccess');
    if (form && success) {
      form.style.display    = 'none';
      success.classList.add('visible');
    }
  });

  /* ── FAQ Accordion ── */
  var faqItems = document.querySelectorAll('.ct-faq-item');

  faqItems.forEach(function (item) {
    var btn = item.querySelector('.ct-faq-q');
    var ans = item.querySelector('.ct-faq-a');
    if (!btn || !ans) return;

    btn.addEventListener('click', function () {
      var isOpen = btn.getAttribute('aria-expanded') === 'true';

      // Close all
      faqItems.forEach(function (other) {
        var ob = other.querySelector('.ct-faq-q');
        var oa = other.querySelector('.ct-faq-a');
        if (ob) ob.setAttribute('aria-expanded', 'false');
        if (oa) oa.classList.remove('open');
      });

      // Open this one if it was closed
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        ans.classList.add('open');
      }
    });
  });

  /* ── Scroll reveal for .reveal elements on this page ── */
  // (The main script.js initRevealObserver handles this globally,
  //  but we call it again here in case this script loads after.)
  if (typeof initRevealObserver === 'function') {
    initRevealObserver();
  }

})();