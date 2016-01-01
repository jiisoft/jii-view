/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('jii');

/**
 * View represents a view object in the MVC pattern.
 * View provides a set of methods (e.g. [[render()]]) for rendering purpose.
 * @class Jii.view.View
 * @extends Jii.base.Component
 */
Jii.defineClass('Jii.view.View', /** @lends Jii.view.View.prototype */{

	__extends: 'Jii.base.Component',

	__static: /** @lends Jii.view.View */{

		/**
		 * @event ViewEvent an event that is triggered by [[renderFile()]] right before it renders a view file.
		 */
		EVENT_BEFORE_RENDER: 'beforeRender',
		/**
		 * @event ViewEvent an event that is triggered by [[renderFile()]] right after it renders a view file.
		 */
		EVENT_AFTER_RENDER: 'afterRender',

        RENDERER_REACT: 'react',

        RENDERER_UNDERSCORE: 'underscore'
	},

	/**
	 * @type {mixed} custom parameters that are shared among view templates.
	 */
	params: null,

    /**
     * @type {Jii.view.IRenderer|null}
     */
    renderer: null,

	/**
	 * @type {object}
	 */
	renderers: {
        react: {
            className: Jii.isNode ? 'Jii.view.react.ReactServerRenderer' : 'Jii.view.react.ReactRenderer'
        },
        underscore: {
            className: 'Jii.view.underscore.UnderscoreRenderer'
        }
    },

    getRenderer: function(view) {
        if (this.renderer instanceof Jii.view.IRenderer) {
            return this.renderer;
        }

        // Auto detect
        var name = this.__static.RENDERER_UNDERSCORE;
        if (Jii._.isString(this.renderer)) {
            name = this.renderer;
        } else if (Jii._.isString(view) && view.indexOf('/') !== -1) {
            name = this.__static.RENDERER_UNDERSCORE;
        } else if (Jii._.isString(view) && view.indexOf('.') !== -1) {
            view = Jii.namespace(view);
            name = this.__static.RENDERER_REACT;
        } else if (Jii._.isFunction(view)) {
            name = this.__static.RENDERER_REACT;
        }

        if (name) {
            if (!(this.renderers[name] instanceof Jii.view.IRenderer)) {
                this.renderers[name] = Jii.createObject(this.renderers[name]);
            }
            return this.renderers[name];
        }

        throw new Jii.exceptions.InvalidConfigException('Not found renderer for view');
    },

    /**
     *
     * @param {*} view
     * @param {Jii.base.Context} context
     * @param {object} params
     * @param {Jii.base.Controller} controller
     * @returns {Promise}
     */
	render: function (view, context, params, controller) {
		params = params || {};
		context = context || null;

        return this.beforeRender(view, context, params).then(function(success) {
            if (!success) {
                return false;
            }

            var output = this.getRenderer(view).render(view, context, params, controller, this);
            return this.afterRender(view, context, params, output);
        }.bind(this));
	},

    /**
     *
     * @param viewFile
     * @param context
     * @param params
     * @returns {Promise.<boolean>}
     */
	beforeRender: function (viewFile, context, params) {
		var event = new Jii.view.ViewEvent({
			viewFile: viewFile,
			params: params
		});
		this.trigger(this.__static.EVENT_BEFORE_RENDER, event);

		return Promise.resolve(event.isValid);
	},

    /**
     *
     * @param viewFile
     * @param context
     * @param params
     * @param output
     * @returns {Promise.<*>}
     */
	afterRender: function (viewFile, context, params, output) {
		if (this.hasEventHandlers(this.__static.EVENT_AFTER_RENDER)) {
			var event = new Jii.view.ViewEvent({
				viewFile: viewFile,
				params: params,
				output: output
			});
			this.trigger(this.__static.EVENT_AFTER_RENDER, event);
			output = event.output;
		}

        return Promise.resolve(output);
	}

});