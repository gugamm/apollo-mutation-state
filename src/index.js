import React, { PureComponent } from 'react';
import hoistNonReactStatic from 'hoist-non-react-statics';
import createObservableState from './observable-state';

/**
 * @typedef MutationStateOptions
 * @type {object}
 * @property {string} mutationName - The name of the method "mutate" from the graphql hoc
 * @property {string} propName - The name of the prop that will be used to pass the mutation state object
 * @property {boolean} propagateError - Define if the hoc should propagate the mutation error. The hoc still change to state to "error" even if propagate error is false
 * @property {boolean} wrapper - Define if the hoc is beign used as a wrapper. If yes, then it will pass a method "wrap" so you can wrap the "mutate" call
 * @property {string} wrapName - Define the name of the "wrap" method. The wrap method is only passed if wrapper is true 
 */

/**
 * A hoc for track a mutation state. There should be one hoc for each mutation. 
 * If using two graphql hocs with two mutations, then there should be 2 hocs for tracking their state
 * @param {MutationStateOptions} options - Mutation state options 
 */
export default ({ mutationName = 'mutate', propName = 'mutation', propagateError = false, wrapper = false, wrapName = 'wrapMutate' } = {}) => WrappedComponent => {
  class MutationState extends PureComponent {
    constructor(props) {
      super(props);
      this.state = {
        loading: false,
        error: null,
        success: false,
      };
      this.observableState = createObservableState(this.state);
    }

    componentDidMount() {
      this.unsubscribe = this.observableState.subscribe(this.onStateChange);
    }

    componentWillUnmount() {
      this.unsubscribe();
    }

    onStateChange = (nextState) => {
      this.setState(nextState);
    }

    setMutationState = (newState) => {
      this.observableState.next(newState);
    }

    wrapMutate = (mutatePromise) => {
      this.setMutationState({
        loading: true,
      });
      return mutatePromise.then((response) => {
        this.setMutationState({
          success: true,
        });
        return response;
      }).catch((error) => {
        this.setMutationState({
          error,
        });
        if (propagateError) {
          return Promise.reject(error);
        }
      });
    }

    mutate = (mutateOptions) => {
      const mutate = this.props[mutationName];
      if (!mutate) {
        throw new Error('MutationState must be inside a component with a mutate prop');
      }
      return this.wrapMutate(mutate(mutateOptions));
    }

    clearState = () => {
      this.setMutationState({
        loading: false,
        error: null,
        success: false,
      });
    }

    render() {
      const props = {
        ...this.props
      };
      if (wrapper) {
        props[wrapName] = this.wrapMutate;
      } else {
        props[mutationName] = this.mutate;
      }
      props[propName] = {
        ...this.state,
        clearState: this.clearState,
      };
      return (
        <WrappedComponent {...props} />
      );
    }
  }
  hoistNonReactStatic(MutationState, WrappedComponent);
  return MutationState;
}
