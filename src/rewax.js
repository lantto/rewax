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

        this.memos = ['state', 'mount', 'unmount', 'scope'].map(type => this.createMemo(type));
    }

    createMemo(type) {
        return {
            type,
            pointer: 0,
            hooks: []
        }
    }

    render(rootComponent, container) {
        this.rootComponent = rootComponent;

        if (this.parent) {
            this._PARENT_CALLBACK_POINTER_START = this.parent.callbackPointer;
        }

        if (!container) {
            this.reset();
            return `<div id="${this.id}">${this.rootComponent()}</div>`;
        }

        this.container = container;
        this.redraw();
    }

    redraw() {
        this.reset();
        
        let newHtml = document.createElement('div');
        if (typeof this._PARENT_CALLBACK_POINTER_START !== 'undefined') {
            this.parent.callbackPointer = this._PARENT_CALLBACK_POINTER_START;
        }
        newHtml.innerHTML = this.rootComponent();

        this.memos.forEach(memo => {
            // TODO: Support keys (convert to numeric hash?)
            memo.hooks.forEach((hook, pointer) => {
                if (!hook.active) {
                    if (memo.type === 'unmount') {
                        hook.effect();
                    }

                    delete memo.hooks[pointer];
                }
            });
        });

        let container = this.container;
        if (!container) {
            newHtml.id = this.id;
            container = document.getElementById(this.id);
        }

        this.dd.apply(container, this.dd.diff(container, newHtml));
    }

    reset() {
        window._callbacks[this.id] = [];
        this.callbackPointer = 0;

        this.memos.forEach(memo => {
            memo.pointer = 0;
            memo.hooks.forEach(hook => {
                hook.active = false;
            });
        });
    }

    bind(strings, ...expressions) {
        let output = strings.slice();
        expressions.forEach((expression, i) => {
            output[i] += {}.toString.call(expression) === '[object Function]'
                ? this.handle(expression)
                : expression;
        });
        return output.join('');
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

    useState(initState, key) {
        return this.useMemo('state', _ => initState, key);
    }

    onMount(fn, key) {
        return this.useMemo('mount', _ => fn(), key);
    }

    onUnmount(fn, key) {
        return this.useMemo('unmount', _ => fn, key);
    }

    useScope(key) {
        return this.useMemo('scope', _ => new Rewax(this), key);
    }

    useMemo(type, cb, key) {
        let memo = this.memos.find(memo => memo.type === type);
        let pointer = key || memo.pointer++;

        let hook = memo.hooks[pointer];

        if (!hook) {
            hook = memo.hooks[pointer] = {effect: false, active: true};
            return hook.effect = cb();
        }

        hook.active = true;
        return hook.effect;
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
export const bind = rewax.bind.bind(rewax);
export const useState = rewax.useState.bind(rewax);
export const onMount = rewax.onMount.bind(rewax);
export const onUnmount = rewax.onUnmount.bind(rewax);
export const useScope = rewax.useScope.bind(rewax);
export const handleInput = rewax.handleInput.bind(rewax);
export const each = rewax.each;
