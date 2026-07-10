// Genuinely required for the print button: no-JS fallback would leave
// it as decoration, so it's hidden by default (see gift-card.css) and
// only revealed once this attaches.
const printButton = document.getElementById('GiftCardPrint');

if (printButton) {
  printButton.hidden = false;
  printButton.addEventListener('click', () => window.print());
}
