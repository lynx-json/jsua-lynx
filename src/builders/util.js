export function findNearestElement(view, selector) {
  if (!view || view.matches("html")) return null;
  if (!selector) return null;
  return document.querySelector(selector) || findNearestElement(view.parentElement, selector);
}
