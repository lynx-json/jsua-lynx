export function findNearestElement(view, selector) {
  if (!view || view.matches("html")) return null;
  if (!selector) return null;
  return view.querySelector(selector) || findNearestElement(view.parentElement, selector);
}
