export function resolveViewBuilder(registrations, node) {
  function matches(hint) {
    return function (registration) {
      return registration.hint === hint && (!registration.condition || registration.condition(node));
    };
  }
  
  var registration;
  node.spec.hints.some(hint => {
    registration = registrations.find(matches(hint));
    return !!registration;
  });
  
  if (registration) return registration.builder;
  return null;
}
