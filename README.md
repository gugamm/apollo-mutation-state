# Apollo mutation state
Apollo mutation state is a hoc for track an apollo mutation state. 

### Installation
With npm
```sh
$ npm install --save apollo-mutation-state
```

With yarn
```sh
$ yarn add apollo-mutation-state
```

### Usage
```js
withMutationState(Options)(TargetComponent)
```

### Options
All options that can be passed to the hoc

| Option | Default value | Type | Description |
| ------ | ------ | ------ | ------ | 
| mutationName | mutate | string | The name of the method "mutate" from the graphql hoc |
| propName | mutation | string | The name of the prop that will be used to pass the mutation state object |
| setStateAfterSuccess | true | boolean | Tells the hoc to set state success after a request is complete. Should be false if component is unmouted after a request is complete. (Redirecting the user to another page for example) |
| propagateError | false | boolean | Tells the hoc to propagate the error of the "mutate" method. If false, the hoc will not propagate the error from the mutate and you will not be able to ".catch" that error |
| wrapper | false | boolean | Should be true if the hoc is the parent of a graphql hoc component. False if it is the child. |
| wrapName | wrapMutate | string |  The name of the method to wrap the mutation call. This method is only passed if wrapper is true |

### MutateState object api
| Prop  | Type | Description |
| ------ | ------ | ------ | 
| loading | boolean | Indicates if the mutation is loading |
| error | boolean | Indicates if there was an error with the mutation |
| success | boolean | Indicates if the mutation was completed |
| clearState() | Function | A function that can be called to clear the MutationState {loading: false, error: false, success: false} |

### Example (Using the MutateState)
```js
import React from 'react'

// You can change the prop "mutation" to another name using the "propName" option
const CreateUserButton = ({ mutation: { loading, error, success, clearState } }) => (
    <Button loading={loading}>Create User</Button>
);

export default CreateUserButton;
```

### Example (withMutationState as a child of a graphql hoc)
```js
import { graphql, gql, compose } from 'react-apollo';
import withMutationState from 'apollo-mutation-state';
import TargetComponent from './TargetComponent';

const CREATE_USER = /* gql mutation */;
const withMutation = graphql(CREATE_USER);

const enhance = compose(
    withMutation,
    withMutationState(), // this is a child of withMutation
);

export default enhance(TargetComponent);
```

### Example (withMutationState as a parent of a graphql hoc)
```js
import { graphql, gql, compose } from 'react-apollo';
import withMutationState from 'apollo-mutation-state';
import TargetComponent from './TargetComponent';

const CREATE_USER = /* gql mutation */;
const withMutation = graphql(CREATE_USER, {
    props: ({ mutate, ownProps: { wrapMutate } }) => ({
        createUser(user) {
            // You must use wrapMutate, so the hoc can track the mutation state
            wrapMutate(mutate({
                variables: { user },
            }))
            .then(response => console.log(response))
            .catch(err => console.error(err)); // You must set propagateError if you want to catch errors
        },
    }),
});

const enhance = compose(
    withMutationState({ wrapper: true, propagateError: true }), // this is a parent of withMutation
    withMutation,
);

export default enhance(TargetComponent);
```

### Example (withMutationState as a parent of a graphql hoc and multiple mutations)
```js
import { graphql, gql, compose } from 'react-apollo';
import withMutationState from 'apollo-mutation-state';
import TargetComponent from './TargetComponent';

const CREATE_USER = /* gql mutation */;
const DELETE_USER = /* gql mutation */;

const withCreateUser = graphql(CREATE_USER, {
    name: 'createUser', // You must set the name of the mutation if using multiple mutations <https://www.learnapollo.com/tutorial-react/react-06/>.
    props: ({ createUser, ownProps: { wrapMutate } }) => ({
        createUser(user) {
            // You must use wrapMutate, so the hoc can track the mutation state
            wrapMutate(createUser({
                variables: { user },
            }))
            .then(response => console.log(response))
            .catch(err => console.error(err)); // You must set propagateError if you want to catch errors
        },
    }),
});

const withDeleteUser = graphql(DELETE_USER, {
    name: 'deleteUser', // You must set the name of the mutation if using multiple mutations <https://www.learnapollo.com/tutorial-react/react-06/>.
    props: ({ deleteUser, ownProps: { wrapMutate } }) => ({
        deleteUser(id) {
            // You must use wrapMutate, so the hoc can track the mutation state
            wrapMutate(deleteUser({
                variables: { id },
            }))
            .then(response => console.log(response))
            .catch(err => console.error(err)); // You must set propagateError if you want to catch errors
        },
    }),
});

const enhance = compose(
    withMutationState({ wrapper: true, propagateError: true, propName: 'createUserState' }), // this is a parent of withMutation
    withCreateUser,
    withMutationState({ wrapper: true, propagateError: true, propName: 'deleteUserState' }),
    withDeleteUser,
);

export default enhance(TargetComponent);
```

### Caveats

* You should use this hoc as a wrapper if you want to implement custom logic after the mutation completes
* You should set "setStateAfterSuccess" to false if after a mutation you make something **like a redirect** that causes the component to unmount (this is important since withMutationState has a internal state and using setState at an unmouted component causes react to display a warning)
* You should use one withMutationState for each mutation
* This hoc only works if using a mutation with one call at a time. If calling the same mutation multiple times in parallel, the hoc can't keep track of all mutation instances.

License
----

MIT
