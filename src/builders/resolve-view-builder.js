export function resolveViewBuilder(registrations, hints, input) {
  function matches(hint) {
    return function (registration) {
      return registration.hint === hint && registration.input === input;  
    };
  }
  
  var registration;
  hints.some(hint => {
    registration = registrations.find(matches(hint));
    return !!registration;
  });
  
  if (registration) return registration.builder;
  return null;
}
