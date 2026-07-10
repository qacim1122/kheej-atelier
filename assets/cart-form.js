// CartQuantity is a stepper only — it never talks to the network
// itself, just dispatches a quantity-change event. CartItems (wrapping
// the whole line item list) is the single place that calls
// /cart/change.js, so there's one source of truth for cart state
// updates rather than every stepper managing its own request.
class CartQuantity extends HTMLElement {
  connectedCallback() {
    this.key = this.dataset.key;
    this.input = this.querySelector('.main-cart__quantity-input');
    this.decreaseButton = this.querySelector('.main-cart__quantity-button--decrease');
    this.increaseButton = this.querySelector('.main-cart__quantity-button--increase');
    if (!this.input || !this.decreaseButton || !this.increaseButton) return;

    this.onDecrease = this.onDecrease.bind(this);
    this.onIncrease = this.onIncrease.bind(this);
    this.onInputChange = this.onInputChange.bind(this);

    this.decreaseButton.addEventListener('click', this.onDecrease);
    this.increaseButton.addEventListener('click', this.onIncrease);
    this.input.addEventListener('change', this.onInputChange);

    // Only reveals the custom +/- buttons once JS confirms it can drive
    // them — the native input's own browser spinner is the sole
    // increment/decrement mechanism until then.
    this.classList.add('main-cart__quantity--js');

    this.updateButtonStates();
  }

  disconnectedCallback() {
    this.decreaseButton.removeEventListener('click', this.onDecrease);
    this.increaseButton.removeEventListener('click', this.onIncrease);
    this.input.removeEventListener('change', this.onInputChange);
  }

  get min() {
    return Number(this.input.min) || 0;
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
    const clamped = Math.max(this.min, value);
    this.input.value = clamped;
    this.updateButtonStates();
    this.dispatchEvent(
      new CustomEvent('quantity-change', {
        bubbles: true,
        detail: { key: this.key, quantity: clamped },
      })
    );
  }

  updateButtonStates() {
    this.decreaseButton.disabled = this.currentValue() <= this.min;
  }
}

// The one place that calls /cart/change.js. A successful AJAX update
// hides the no-JS "Update cart" button (still present, just redundant
// once this works) and also handles line-item removal (the plain
// url_to_remove <a> stays the fully-functional no-JS fallback either
// way).
class CartItems extends HTMLElement {
  connectedCallback() {
    this.onQuantityChange = this.onQuantityChange.bind(this);
    this.onRemoveClick = this.onRemoveClick.bind(this);

    this.addEventListener('quantity-change', this.onQuantityChange);
    this.addEventListener('click', this.onRemoveClick);

    const updateButton = this.querySelector('.main-cart__update');
    if (updateButton) updateButton.hidden = true;
  }

  disconnectedCallback() {
    this.removeEventListener('quantity-change', this.onQuantityChange);
    this.removeEventListener('click', this.onRemoveClick);
  }

  onQuantityChange(event) {
    const { key, quantity } = event.detail;
    this.updateLine(key, quantity);
  }

  onRemoveClick(event) {
    const link = event.target.closest('.main-cart__line-remove');
    if (!link) return;

    event.preventDefault();
    const li = link.closest('.main-cart__line-item');
    const key = li ? li.dataset.lineItemKey : null;
    if (key) this.updateLine(key, 0);
  }

  updateLine(key, quantity) {
    fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: key, quantity }),
    })
      .then((response) => response.json())
      .then((cart) => this.render(cart, key))
      .catch(() => {
        // Network error: leave the DOM as-is. The no-JS "Update cart"
        // button is still in the DOM (just hidden), and a real form
        // submission would still work as a fallback.
      });
  }

  render(cart, changedKey) {
    const line = cart.items.find((item) => item.key === changedKey);
    const li = this.querySelector(`[data-line-item-key="${changedKey}"]`);

    if (!line) {
      if (li) li.remove();
    } else if (li) {
      const priceEl = li.querySelector('.main-cart__line-price');
      if (priceEl) priceEl.textContent = this.formatMoney(line.final_line_price);
    }

    const subtotalEl = document.querySelector('.main-cart__subtotal-value');
    if (subtotalEl) subtotalEl.textContent = this.formatMoney(cart.total_price);

    if (cart.item_count === 0) {
      // A comparatively rare, terminal transition — reloading to show
      // the server-rendered empty state is simpler and more reliable
      // than duplicating that markup into a JS-hydratable template.
      window.location.reload();
    }
  }

  // /cart/change.js returns raw integer cents, not a pre-formatted
  // string. This does the standard {{amount}}-placeholder substitution
  // against shop.money_format (passed via data attribute) — the
  // documented pattern Shopify's own reference cart implementations
  // use, not a general reimplementation of currency formatting. It only
  // handles the common {{amount}} placeholder, not every money_format
  // variant (e.g. {{amount_no_decimals}}) — a known, minor limitation.
  formatMoney(cents) {
    const format = this.dataset.moneyFormat || '${{amount}}';
    const amount = (cents / 100).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    return format.replace(/\{\{\s*amount\s*\}\}/, amount);
  }
}

if (!customElements.get('cart-quantity')) {
  customElements.define('cart-quantity', CartQuantity);
}

if (!customElements.get('cart-items')) {
  customElements.define('cart-items', CartItems);
}
