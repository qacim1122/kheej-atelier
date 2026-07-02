class HeaderSection extends HTMLElement {
  connectedCallback() {
    this.isSticky = this.dataset.sticky === 'true';
    this.transparent = this.dataset.transparent === 'true';
    this.scrollFrame = null;

    if (this.isSticky || this.transparent) {
      this.updateScrollState();
      window.addEventListener('scroll', this.requestScrollUpdate, { passive: true });
    }
  }

  disconnectedCallback() {
    window.removeEventListener('scroll', this.requestScrollUpdate);

    if (this.scrollFrame) {
      window.cancelAnimationFrame(this.scrollFrame);
    }
  }

  requestScrollUpdate = () => {
    if (this.scrollFrame) return;

    this.scrollFrame = window.requestAnimationFrame(() => {
      this.scrollFrame = null;
      this.updateScrollState();
    });
  }

  updateScrollState() {
    this.classList.toggle('is-scrolled', window.scrollY > 8);
  }
}

class MobileDrawer extends HTMLElement {
  focusableSelector = 'a[href], button:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

  connectedCallback() {
    this.openButton = document.querySelector(`[data-drawer-open="${this.id}"]`);
    this.panel = this.querySelector('[data-drawer-panel]');
    this.previousFocus = null;
    this.closeTimer = null;

    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onKeydown = this.onKeydown.bind(this);

    this.openButton?.addEventListener('click', this.open);
    this.addEventListener('click', this.onClick);
  }

  disconnectedCallback() {
    this.openButton?.removeEventListener('click', this.open);
    this.removeEventListener('click', this.onClick);
    document.removeEventListener('keydown', this.onKeydown);
    window.clearTimeout(this.closeTimer);
    document.documentElement.classList.remove('mobile-drawer-open');
  }

  open() {
    if (this.classList.contains('is-open')) return;

    window.clearTimeout(this.closeTimer);
    this.previousFocus = document.activeElement;
    this.removeAttribute('hidden');
    this.setAttribute('aria-hidden', 'false');
    this.openButton?.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('mobile-drawer-open');
    document.addEventListener('keydown', this.onKeydown);

    window.requestAnimationFrame(() => {
      this.classList.add('is-open');
      this.firstFocusableElement?.focus();
    });
  }

  close() {
    if (!this.classList.contains('is-open')) return;

    this.classList.remove('is-open');
    this.setAttribute('aria-hidden', 'true');
    this.openButton?.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('mobile-drawer-open');
    document.removeEventListener('keydown', this.onKeydown);
    this.previousFocus?.focus();

    this.closeTimer = window.setTimeout(() => {
      if (!this.classList.contains('is-open')) {
        this.setAttribute('hidden', '');
      }
    }, 400);
  }

  onClick(event) {
    if (event.target.closest('[data-drawer-close]')) {
      this.close();
    }
  }

  onKeydown(event) {
    if (event.key === 'Escape') {
      this.close();
      return;
    }

    if (event.key !== 'Tab') return;

    const focusable = this.focusableElements;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  get focusableElements() {
    return Array.from(this.panel?.querySelectorAll(this.focusableSelector) || []);
  }

  get firstFocusableElement() {
    return this.focusableElements[0];
  }
}

if (!customElements.get('header-section')) {
  customElements.define('header-section', HeaderSection);
}

if (!customElements.get('mobile-drawer')) {
  customElements.define('mobile-drawer', MobileDrawer);
}
