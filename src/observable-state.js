const createObservableState = (initialState) => {
  let state = initialState;
  let listeners = [];
  
  return {
    subscribe(listener) {
      listeners = [...listeners, listener];
      return () => {
        listeners = listeners.filter(
          l => l !== listener,
        );
      }
    },
    next(nextState) {
      state = {
        ...state,
        nextState,
      };
      listeners.forEach(
        listener => listener(state),
      );
    },
    freeRefs() {
      state = null;
      listeners = [];
    },
  };
};

export default createObservableState;
