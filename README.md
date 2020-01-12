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
import { render, bind } from 'rewax'

let count = 0

render(_ => bind`
    <button onClick=${_ => count += 1}>
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

import { render, bind } from 'rewax'

let user = { loggedIn: false }

function toggle() {
    user.loggedIn = !user.loggedIn
}

render(_ => bind`
    <p>
        ${user.loggedIn 
            ?  `You're logged in`
            :  `Click "Log in" to log in`
        }
    </p>
    <button onClick=${toggle}>
        ${user.loggedIn ? 'Log out' : 'Log in'}
    </button>
`, document.getElementById('root'))
```

### Inputs
```JavaScript
import { render, bind } from 'rewax'

let name = ''

render(_ => bind`
    <input onInput=${e => name = e.target.value} />
    <p>Hello ${name || 'there'}</p>
`, document.getElementById('root'))
```

### Async
```JavaScript
import { render, redraw, bind } from 'rewax'

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

render(_ => bind`
    <button onClick=${onClick}>Get number</button>

    ${loading
        ? 'Loading...'
        : `<p>${randomNumber ? randomNumber : 'Click the button'}</p>`
    }
`, document.getElementById('root'))
```

### Components
```JavaScript
import { render, useState, bind, each } from 'rewax'

const todos = [];

const AddTodo = _ => {
    const state = useState({value: ''})

    return bind`
        <div>
            <form onSubmit=${e => {
                e.preventDefault()
                todos.push(state.value)
                state.value = ''
            }}>
                <input onInput=${e => state.value = e.target.value} value="${state.value}" />
                <button type="submit">Add Todo</button>
            </form>
        </div>
    `
}

const TodoList = _ => `
    <ul>
        ${each(todos, todo => TodoItem(todo))}
    </ul>
`

const TodoItem = todo => `<li>${todo}</li>`

render(_ => `
    <h1>Todo</h1>
    ${AddTodo()}
    ${TodoList()}
`, document.getElementById('root'))
```

### Redux
```JavaScript
import { render, bind } from 'rewax'
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

render(_  => bind`
    <h1>${store.getState()}</h1>
    <button onClick=${_ => store.dispatch({type: 'INCREMENT'})}>Increment</button>
`, document.getElementById('root'))
```

### Todo List

[CodeSandbox](https://codesandbox.io/s/bold-black-ujbti)

## API
### render(rootComponentFunction, [, container])
Render a Rewax template function in the supplied container. If no container is supplied it will render the element immediately and return it (mainly to be used together with `useScope`).

### bind
Tag function that sets up all event handlers and returns a binded template that will automatically be redrawn on user input. Use this if you have any immediate event handlers in the template literal.

### redraw()
Will recompile the template (for asynchronous events that should update the DOM).

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
