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
    this.updateAddToCart(variant);
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

  updateAddToCart(variant) {
    if (!this.addToCartButton) return;

    const available = Boolean(variant && variant.available);

    this.addToCartButton.disabled = !available;
    this.addToCartButton.textContent = available
      ? this.addToCartButton.dataset.addToCartLabel
      : this.addToCartButton.dataset.soldOutLabel;
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

// product-gallery is defined before variant-picker: VariantPicker calls
// gallery.activateByMediaId() from its own connectedCallback (via
// render()), and <product-gallery> is nested inside <variant-picker> in
// the markup — so the gallery element must already be upgraded with its
// methods before the picker's initial render() runs.
if (!customElements.get('product-gallery')) {
  customElements.define('product-gallery', ProductGallery);
}

if (!customElements.get('variant-picker')) {
  customElements.define('variant-picker', VariantPicker);
}
