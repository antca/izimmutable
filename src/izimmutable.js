function mutate(mutation, obj) {
  if(typeof mutation === 'function') {
    return mutate(mutation(obj));
  }
  if(Object.isFrozen(mutation) || !(mutation instanceof Object)) {
    return mutation;
  }
  return Object.freeze(Object.keys(mutation).reduce((modified, key) => {
    modified[key] = mutate(mutation[key], obj && obj[key]);
    return modified;
  }, Array.isArray(obj || mutation) ? [].concat(obj || []) : Object.assign({}, obj)));
}

function izimmutable(obj) {
  const frozen = mutate(obj);
  return (m) => {
    if(m === void 0) {
      return frozen;
    }
    return izimmutable(mutate(m, frozen));
  }
}

export default izimmutable;
