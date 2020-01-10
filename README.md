# Rewax
This is proof-of-concept and should not be used in production.

## Installation
```
npm install --save rewax
```

## Examples
### Hello World
```JavaScript
import { render } from 'rewax'

render(_ => '<h1>Hello World</h1>', document.getElementById('root'))
```

### Handlers
```JavaScript
import { render, handle } from 'rewax'

let count = 0

render(_ => `
    <button onClick=${handle(_ => count += 1)}>
        ${count}
    </button>
`, document.getElementById('root'))
```

### Lists
```JavaScript
import { render, each } from 'rewax'

let games = [
    { name: 'Canvas Legacy', url: 'https://canvaslegacy.com/' },
    { name: 'Tombs.io', url: 'https://tombs.io/' },
    { name: 'Antipole', url: 'http://hopfog.com/antipole-seasons' }
];

render(_ => `
    <ul>
        ${each(games, (game, i) => `
            <li>
                <a target="_blank" href="${game.url}">
                    ${i + 1}: ${game.name}
                </a>
            </li>
        `)}
    </ul>
`, document.getElementById('root'))
```

### Conditionals
```JavaScript

import { render, handle } from 'rewax'

let user = { loggedIn: false }

function toggle() {
    user.loggedIn = !user.loggedIn
}

render(_ => `
    <p>
        ${user.loggedIn 
            ?  `You're logged in`
            :  `Click "Log in" to log in`
        }
    </p>
    <button onClick=${handle(_ => toggle())}>
        ${user.loggedIn ? 'Log out' : 'Log in'}
    </button>
`, document.getElementById('root'))
```

### Inputs
```JavaScript
import { render, handle } from 'rewax'

let name = ''

render(_ => `
    <input onInput=${handle(e => name = e.target.value)} />
    <p>Hello ${name || 'there'}</p>
`, document.getElementById('root'))
```

### Async
```JavaScript
import { render, redraw, handle } from 'rewax'

let loading = false
let randomNumber

async function getAsyncNumber() {
    return await new Promise(resolve => setTimeout(_ => resolve(123), 1000))
}

const onClick = async _ => {
    loading = true
    randomNumber = await getAsyncNumber()
    loading = false
    redraw()
}

render(_ => `
    <button onClick=${handle(onClick)}>Get number</button>

    ${loading
        ? 'Loading...'
        : `<p>${randomNumber ? randomNumber : 'Click the button'}</p>`
    }
	
`, document.getElementById('root'))
```

### Components
#### - index.js
```JavaScript
import { render } from 'rewax'
import TodoList from './AddTodo'
import TodoList from './TodoList'

const todos = [];

render(_ => `
    <h1>Todo</h1>
    ${AddTodo(todos)}
    ${TodoList(todos)}
`, document.getElementById('root'))
```
#### - AddTodo.js
```JavaScript
import { handle, useState } from 'rewax'

const AddTodo = todos => {
    const state = useState({value: ''})

    return `
        <div>
            <form onSubmit=${handle(e => {
                e.preventDefault()
                todos.push(state.value)
                state.value = ''
            })}>
                <input onInput=${handle(e => state.value = e.target.value)} value="${state.value}" />
                <button type="submit">Add Todo</button>
            </form>
        </div>
    `
}

export default AddTodo
```
#### - TodoList.js
```JavaScript
import { each } from 'rewax'

const TodoList = todos => `
    <ul>
        ${each(todos, todo => `<li>${todo}</li>`)}
    </ul>
`

export default TodoList
```

### Redux
```JavaScript
import { render, handle } from 'rewax'
import { createStore } from 'redux'

function counter(state = 0, action) {
    switch (action.type) {
        case 'INCREMENT':
            return state + 1
        default:
            return state
    }
}

let store = createStore(counter)

render(_  => `
    <h1>${store.getState()}</h1>
    <button onClick=${handle(_ => store.dispatch({type: 'INCREMENT'}))}>Increment</button>
`, document.getElementById('root'))
```

## API
### render(rootComponentFunction, [, container])
Render a Rewax template function in the supplied container. If no container is supplied it will render the element immediately and return it (mainly to be used together with `useScope`).

### handle(callbackFunction, options)
Will set up the necessary event listener and run redraw after the callback has been run.

### redraw()
Will recompile the template.

### useState(initialState)
Returns a local state object inside a component, similar to React Hooks and comes with the same drawbacks (cannot be used in components in loops or conditionals).

### onMount(callbackFunction)
Will be run once and used for initializing stuff inside a component. Same drawbacks as `useState` (cannot be used in components in loops or conditionals).

### useScope()
Creates a locally scoped instance of Rewax. Same drawbacks as `useState` (cannot be used in components in loops or conditionals).

### each(list, mapFunction)
Utility function for compiling lists to template strings. This is optional and you may just as well use this:
```JavaScript
items.map(item => `An ${item}`).join('')
```
