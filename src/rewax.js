import { DiffDOM } from 'diff-dom'

class Rewax {
    constructor(parent) {
        this.id = Math.random().toString(36).substring(2, 15) 
                + Math.random().toString(36).substring(2, 15);

        this.parent = parent;

        if (!window._callbacks) {
            window._callbacks = {};
        }
        window._callbacks[this.id] = [];

        this.rootComponent = _ => {};
        this.container = null;
        this.callbackPointer = 0;

        this.dd = new DiffDOM({
            valueDiffing: false,
            maxChildCount: false
        });

        this.statePointer = 0;
        this.states = [];

        this.mountPointer = 0;
        this.onMountFns = [];

        this.scopePointer = 0;
        this.scopes = [];
    }

    render(rootComponent, container) {
        this.rootComponent = rootComponent;

        if (this.parent) {
            this._PARENT_CALLBACK_POINTER_START = this.parent.callbackPointer;
        }

        if (!container) {
            this.resetPointers();
            return `<div id="${this.id}">${this.rootComponent()}</div>`;
        }

        this.container = container;
        this.redraw();
    }

    redraw() {
        this.resetPointers();
        
        let newHtml = document.createElement('div');
        if (typeof this._PARENT_CALLBACK_POINTER_START !== 'undefined') {
            this.parent.callbackPointer = this._PARENT_CALLBACK_POINTER_START;
        }
        newHtml.innerHTML = this.rootComponent();

        let container = this.container;
        if (!container) {
            newHtml.id = this.id;
            container = document.getElementById(this.id);
        }

        this.dd.apply(container, this.dd.diff(container, newHtml));
    }

    resetPointers() {
        window._callbacks[this.id] = [];
        this.callbackPointer = 0;
        this.statePointer = 0;
        this.mountPointer = 0;
        this.scopePointer = 0;
    }

    handle(cb, opts) {
        opts = opts || {};
        let index = this.callbackPointer;
        this.callbackPointer++;
        window._callbacks[this.id][index] = (e) => {
            cb(e);
            if (opts.preventRedraw) {
                return;
            }
            this.redraw();
        }
    
        return `window._callbacks['${this.id}'][${index}](event)`;
    }

    useState(initState) {
        let state;

        if (this.states[this.statePointer]) {
            state = this.states[this.statePointer]
        } else {
            state = this.states[this.statePointer] = initState;
        }

        this.statePointer++;
        return state;
    }

    onMount(fn) {
        if (!this.onMountFns[this.mountPointer]) {
            this.onMountFns[this.mountPointer] = true;
            fn();
        }

        this.mountPointer++;
    }

    useScope() {
        let scope;

        if (this.scopes[this.scopePointer]) {
            scope = this.scopes[this.scopePointer]
        } else {
            scope = this.scopes[this.scopePointer] = new Rewax(this);
        }

        this.scopePointer++;
        return scope;
    }
    
    handleInput(state, propName) {
        return this.handle(
            e => e.target.setAttribute('value', state[propName] = e.target.value), 
            {preventRedraw: true}
        );
    }

    each(list, fn) {
        return list.map(fn).join('');
    }
}

export default Rewax;

const rewax = new Rewax();
export const render = rewax.render.bind(rewax);
export const handle = rewax.handle.bind(rewax);
export const redraw = rewax.redraw.bind(rewax);
export const useState = rewax.useState.bind(rewax);
export const onMount = rewax.onMount.bind(rewax);
export const useScope = rewax.useScope.bind(rewax);
export const handleInput = rewax.handleInput.bind(rewax);
export const each = rewax.each;
