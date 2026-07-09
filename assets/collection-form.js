// Progressive enhancement only: the sort <select> lives inside a real
// GET form (see main-collection.liquid) that works with zero JS via its
// own submit button. This just removes the extra click by auto-
// submitting on change, then hides that button since it's redundant
// once this can do that — same pattern as the Product template's
// "Update selection" buttons.
class CollectionSort extends HTMLElement {
  connectedCallback() {
    this.select = this.querySelector('.main-collection__sort-select');
    this.form = this.querySelector('.main-collection__sort-form');
    if (!this.select || !this.form) return;

    this.onChange = this.onChange.bind(this);
    this.select.addEventListener('change', this.onChange);

    this.querySelectorAll('.main-collection__sort-submit').forEach((button) => {
      button.hidden = true;
    });
  }

  disconnectedCallback() {
    this.select.removeEventListener('change', this.onChange);
  }

  onChange() {
    this.form.requestSubmit();
  }
}

if (!customElements.get('collection-sort')) {
  customElements.define('collection-sort', CollectionSort);
}
