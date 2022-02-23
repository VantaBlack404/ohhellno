import EventEmitter from "../events.js";
import HookEvent from "../hook.js";

class StyleApi extends EventEmitter {
    constructor(ctx) {
        super();
        this.ctx = ctx;
        this.window = ctx.window;
        this.CSSStyleDeclaration = this.window.CSSStyleDeclaration || {};
        this.cssStyleProto = this.CSSStyleDeclaration.prototype || {};
        this.getPropertyValue = this.cssStyleProto.getPropertyValue || null;
        this.setProperty = this.cssStyleProto.setProperty || null;
        this.urlProps = ['background', 'backgroundImage', 'borderImage', 'borderImageSource', 'listStyle', 'listStyleImage', 'cursor'];
        this.dashedUrlProps = ['background', 'background-image', 'border-image', 'border-image-source', 'list-style', 'list-style-image', 'cursor'];
        this.propToDashed = {
            background: 'background',
            backgroundImage: 'background-image',
            borderImage: 'border-image',
            borderImageSource: 'border-image-source',
            listStyle: 'list-style',
            listStyleImage: 'list-style-image',
            cursor: 'cursor'
        };
    };
    overrideSetGetProperty() {
        this.ctx.override(this.cssStyleProto, 'getPropertyValue', (target, that, args) => {
            if (!args.length) return target.apply(that, args);

            let [ property ] = args;

            const event = new HookEvent({ property }, target, that);
            this.emit('getPropertyValue', event);

            if (event.intercepted) return event.returnValue;
            return event.target.call(event.that, event.data.property);
        });
        this.ctx.override(this.cssStyleProto, 'setProperty', (target, that, args) => {
            if (2 > args.length) return target.apply(that, args);
            let [ property, value ] = args;

            const event = new HookEvent({ property, value }, target, that);
            this.emit('setProperty', event);

            if (event.intercepted) return event.returnValue;
            return event.target.call(event.that, event.data.property, event.data.value);
        });
    };
};

export default StyleApi;