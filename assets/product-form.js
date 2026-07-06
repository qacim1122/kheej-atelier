class VariantPicker extends HTMLElement {
  connectedCallback() {
    this.inputs = Array.from(this.querySelectorAll('.main-product__option-input'));
    if (this.inputs.length === 0) return;

    const dataScript = this.querySelector('[data-product-variants]');
    if (!dataScript) return;

    this.variants = JSON.parse(dataScript.textContent);
    this.priceEl = this.querySelector('.main-product__price');
    this.addToCartButton = this.querySelector('.main-product__button');
    this.mediaImage = this.querySelector('.main-product__image');

    this.defaultImage = this.mediaImage
      ? { src: this.mediaImage.getAttribute('src'), alt: this.mediaImage.getAttribute('alt') }
      : null;

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

  updateImage(variant) {
    if (!this.mediaImage) return;

    const image = (variant && variant.featured_image) || this.defaultImage;
    if (!image) return;

    // A single resolved URL, not a full responsive set — the JSON
    // payload only carries one size per variant image (see
    // main-product.liquid), so any stale srcset/sizes from the initial
    // server render is cleared to avoid the browser picking a mismatched
    // candidate over the new src.
    this.mediaImage.setAttribute('src', image.src);
    this.mediaImage.setAttribute('alt', image.alt);
    this.mediaImage.removeAttribute('srcset');
    this.mediaImage.removeAttribute('sizes');
  }
}

if (!customElements.get('variant-picker')) {
  customElements.define('variant-picker', VariantPicker);
}
