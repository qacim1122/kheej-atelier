class VariantPicker extends HTMLElement {
  connectedCallback() {
    this.inputs = Array.from(this.querySelectorAll('.main-product__option-input'));
    if (this.inputs.length === 0) return;

    const dataScript = this.querySelector('[data-product-variants]');
    if (!dataScript) return;

    this.variants = JSON.parse(dataScript.textContent);
    this.priceEl = this.querySelector('.main-product__price');
    this.addToCartButton = this.querySelector('.main-product__button');
    this.gallery = this.querySelector('product-gallery');
    this.defaultMediaId = this.gallery ? this.gallery.dataset.defaultMediaId : null;
    this.availabilityEl = this.querySelector('.main-product__availability');
    this.quantitySelector = this.querySelector('quantity-selector');

    this.optionForms = Array.from(this.querySelectorAll('form[method="get"]'));
    this.selection = this.readSelection();

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.addEventListener('change', this.onChange);
    this.optionForms.forEach((form) => form.addEventListener('submit', this.onSubmit));

    // The "Update selection" buttons only exist for the no-JS fallback
    // (see main-product.liquid) — once JS is driving instant updates,
    // a button that would trigger a page reload is just confusing.
    this.querySelectorAll('.main-product__option-update').forEach((button) => {
      button.hidden = true;
    });

    this.render();
  }

  disconnectedCallback() {
    this.removeEventListener('change', this.onChange);
    this.optionForms.forEach((form) => form.removeEventListener('submit', this.onSubmit));
  }

  onSubmit(event) {
    event.preventDefault();
  }

  onChange(event) {
    if (!event.target.matches('.main-product__option-input')) return;

    const position = Number(event.target.dataset.optionPosition) - 1;
    this.selection[position] = event.target.dataset.optionValue;
    this.render();
  }

  readSelection() {
    const selection = [];

    this.inputs.forEach((input) => {
      if (input.checked) {
        selection[Number(input.dataset.optionPosition) - 1] = input.dataset.optionValue;
      }
    });

    return selection;
  }

  // Matches Milestone 2's own Liquid logic, just re-run client-side:
  // find the one variant whose options line up with the full current
  // selection across every fieldset, not just the one that just changed.
  findVariant(selection) {
    return this.variants.find((variant) =>
      variant.options.every((value, index) => value === selection[index])
    );
  }

  render() {
    const variant = this.findVariant(this.selection);

    this.updateOptionStates();
    this.updatePrice(variant);
    this.updateAvailability(variant);
    this.updateAddToCart(variant);
    this.updateQuantityMax(variant);
    this.updateImage(variant);
  }

  // Re-evaluates every radio's availability against "this value, with
  // every other fieldset held at its current selection" — and keeps
  // each radio's value attribute correct, since that's what actually
  // gets submitted for the add-to-cart form's name="id" radios if a
  // user changes an earlier option and then submits without JS ever
  // re-running (e.g. a script error partway through).
  updateOptionStates() {
    this.inputs.forEach((input) => {
      const position = Number(input.dataset.optionPosition) - 1;
      const candidateSelection = this.selection.slice();
      candidateSelection[position] = input.dataset.optionValue;

      const match = this.findVariant(candidateSelection);

      input.disabled = !match || !match.available;

      if (match) {
        input.value = match.id;
      }
    });
  }

  updatePrice(variant) {
    if (!this.priceEl || !variant) return;

    this.priceEl.textContent = '';

    if (variant.compare_at_price) {
      const salePrice = document.createElement('span');
      salePrice.className = 'main-product__price--sale';
      salePrice.textContent = variant.price;

      const comparePrice = document.createElement('span');
      comparePrice.className = 'main-product__compare-price';
      comparePrice.textContent = variant.compare_at_price;

      this.priceEl.append(salePrice, comparePrice);
    } else {
      this.priceEl.textContent = variant.price;
    }
  }

  // Mirrors the same 4-state logic main-product.liquid computes
  // server-side (in stock / low stock / backorder / sold out) so
  // switching variants without a reload keeps this in sync — leaving it
  // stale would be a real regression given price/image are already
  // instant. Labels and the low-stock threshold come from data
  // attributes (set from real translated/merchant-configured values),
  // never hardcoded English strings here.
  computeAvailability(variant) {
    if (!variant || !this.availabilityEl) return null;

    const el = this.availabilityEl;
    const threshold = Number(el.dataset.lowStockThreshold) || 5;

    if (!variant.available) {
      return { modifier: 'sold-out', label: el.dataset.soldOutLabel };
    }

    if (!variant.inventory_tracked) {
      return { modifier: 'in-stock', label: el.dataset.inStockLabel };
    }

    if (variant.inventory_quantity <= 0 && variant.continue_selling) {
      return { modifier: 'backorder', label: el.dataset.backorderLabel };
    }

    if (variant.inventory_quantity > 0 && variant.inventory_quantity <= threshold) {
      const template = el.dataset.lowStockTemplate || '';
      return { modifier: 'low-stock', label: template.replace('COUNT_PLACEHOLDER', variant.inventory_quantity) };
    }

    return { modifier: 'in-stock', label: el.dataset.inStockLabel };
  }

  updateAvailability(variant) {
    const status = this.computeAvailability(variant);
    if (!status) return;

    this.availabilityEl.textContent = '';

    const span = document.createElement('span');
    span.className = `main-product__availability-status main-product__availability-status--${status.modifier}`;
    span.textContent = status.label;

    this.availabilityEl.append(span);
  }

  updateAddToCart(variant) {
    if (!this.addToCartButton) return;

    const available = Boolean(variant && variant.available);

    this.addToCartButton.disabled = !available;
    this.addToCartButton.textContent = available
      ? this.addToCartButton.dataset.addToCartLabel
      : this.addToCartButton.dataset.soldOutLabel;
  }

  // Defensive typeof check, same reasoning as updateImage below: relies
  // on quantity-selector being defined before variant-picker.
  updateQuantityMax(variant) {
    if (!this.quantitySelector || typeof this.quantitySelector.setMax !== 'function') return;

    let max = null;
    if (variant && variant.inventory_tracked && !variant.continue_selling && variant.inventory_quantity > 0) {
      max = variant.inventory_quantity;
    }

    this.quantitySelector.setMax(max);
  }

  // Reuses ProductGallery (Milestone 4) rather than touching an <img>
  // directly — the gallery already renders every image, so this only
  // needs to say which one should be active. Defensive typeof check:
  // product-gallery is defined before variant-picker below specifically
  // so this is always available by the time it's called, but this
  // guards against that ordering assumption ever quietly breaking.
  updateImage(variant) {
    if (!this.gallery || typeof this.gallery.activateByMediaId !== 'function') return;

    const mediaId = (variant && variant.featured_media_id) || this.defaultMediaId;
    if (!mediaId) return;

    this.gallery.activateByMediaId(mediaId);
  }
}

class ProductGallery extends HTMLElement {
  connectedCallback() {
    this.items = Array.from(this.querySelectorAll('.main-product__gallery-item'));
    this.thumbnails = Array.from(this.querySelectorAll('.main-product__thumbnail'));
    if (this.items.length <= 1) return;

    this.onThumbnailClick = this.onThumbnailClick.bind(this);
    this.thumbnails.forEach((thumbnail) => thumbnail.addEventListener('click', this.onThumbnailClick));

    // This is the only thing that switches the gallery from "all images
    // stacked" (the no-JS baseline, see main-product.liquid) into
    // "one image at a time" — see main-product.css.
    this.classList.add('main-product__gallery--js');
  }

  disconnectedCallback() {
    this.thumbnails.forEach((thumbnail) => thumbnail.removeEventListener('click', this.onThumbnailClick));
  }

  onThumbnailClick(event) {
    event.preventDefault();
    this.activateByMediaId(event.currentTarget.dataset.mediaId);
  }

  activateByMediaId(mediaId) {
    if (!mediaId) return;

    const id = String(mediaId);

    this.items.forEach((item) => {
      item.classList.toggle('is-active', item.dataset.mediaId === id);
    });

    this.thumbnails.forEach((thumbnail) => {
      const isActive = thumbnail.dataset.mediaId === id;
      thumbnail.classList.toggle('is-active', isActive);
      thumbnail.setAttribute('aria-current', String(isActive));
    });
  }
}

// Independent of VariantPicker/ProductGallery — no ordering dependency
// with either. The native number input is always the source of truth:
// current value is read fresh from it on every action, never cached in
// a separate property that could drift out of sync. setMax() is the
// public hook VariantPicker calls when a variant switch changes the
// available inventory ceiling.
class QuantitySelector extends HTMLElement {
  connectedCallback() {
    this.input = this.querySelector('.main-product__quantity-input');
    this.decreaseButton = this.querySelector('.main-product__quantity-button--decrease');
    this.increaseButton = this.querySelector('.main-product__quantity-button--increase');
    if (!this.input || !this.decreaseButton || !this.increaseButton) return;

    this.onDecrease = this.onDecrease.bind(this);
    this.onIncrease = this.onIncrease.bind(this);
    this.onInputChange = this.onInputChange.bind(this);

    this.decreaseButton.addEventListener('click', this.onDecrease);
    this.increaseButton.addEventListener('click', this.onIncrease);
    this.input.addEventListener('change', this.onInputChange);

    // Only reveals the custom +/- buttons once JS confirms it can drive
    // them (see main-product.css) — the native input's own browser
    // spinner is the sole increment/decrement mechanism until then.
    this.classList.add('main-product__quantity--js');

    this.updateButtonStates();
  }

  disconnectedCallback() {
    this.decreaseButton.removeEventListener('click', this.onDecrease);
    this.increaseButton.removeEventListener('click', this.onIncrease);
    this.input.removeEventListener('change', this.onInputChange);
  }

  get min() {
    return Number(this.input.min) || 1;
  }

  get max() {
    return this.input.max === '' ? Infinity : Number(this.input.max);
  }

  onDecrease() {
    this.setValue(this.currentValue() - 1);
  }

  onIncrease() {
    this.setValue(this.currentValue() + 1);
  }

  onInputChange() {
    this.setValue(this.currentValue());
  }

  currentValue() {
    const value = Math.trunc(Number(this.input.value));
    return Number.isFinite(value) ? value : this.min;
  }

  setValue(value) {
    this.input.value = Math.min(this.max, Math.max(this.min, value));
    this.updateButtonStates();
  }

  // Called by VariantPicker after a variant switch. max === null means
  // untracked/backorder-eligible inventory — no ceiling.
  setMax(max) {
    if (max === null || max === undefined) {
      this.input.removeAttribute('max');
    } else {
      this.input.max = max;
    }

    if (this.currentValue() > this.max) {
      this.input.value = this.max;
    }

    this.updateButtonStates();
  }

  updateButtonStates() {
    const value = this.currentValue();
    this.decreaseButton.disabled = value <= this.min;
    this.increaseButton.disabled = value >= this.max;
  }
}

// Fully independent — no data dependency on the other two.
// recommendations.performed is only ever true when Shopify's
// recommendations-rendering context fetches this exact section markup
// (see main-product.liquid); on a normal page load it's always false,
// so the server-rendered same-collection fallback is what's already
// visible before this ever runs. This only upgrades that fallback to
// genuinely algorithmic results if the fetch succeeds — a failed fetch
// or JS being unavailable simply leaves the fallback in place.
class ProductRecommendations extends HTMLElement {
  connectedCallback() {
    const url = this.dataset.url;
    if (!url) return;

    fetch(url)
      .then((response) => (response.ok ? response.text() : null))
      .then((html) => {
        if (!html) return;

        const parsed = new DOMParser().parseFromString(html, 'text/html');
        const fetched = parsed.getElementById(this.id);
        if (fetched && fetched.innerHTML.trim()) {
          this.innerHTML = fetched.innerHTML;
        }
      })
      .catch(() => {
        // Network error or similar — the server-rendered fallback
        // already in the DOM remains exactly as it was.
      });
  }
}

// product-gallery and quantity-selector are both defined before
// variant-picker: VariantPicker calls methods on both from its own
// connectedCallback (via render()), and both are nested inside
// <variant-picker> in the markup — so they must already be upgraded
// with their methods before the picker's initial render() runs.
if (!customElements.get('product-gallery')) {
  customElements.define('product-gallery', ProductGallery);
}

if (!customElements.get('quantity-selector')) {
  customElements.define('quantity-selector', QuantitySelector);
}

if (!customElements.get('variant-picker')) {
  customElements.define('variant-picker', VariantPicker);
}

if (!customElements.get('product-recommendations')) {
  customElements.define('product-recommendations', ProductRecommendations);
}
