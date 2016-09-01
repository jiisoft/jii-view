'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('jii');

var React = require('react');

/**
 * @class Jii.view.react.ReactView
 * @extends Jii.base.Object
 * @extends React.Component
 */
var self = Jii.defineClass('Jii.view.react.ReactView', /** @lends Jii.view.react.ReactView.prototype */{

    __extends: React.Component,

    __static: /** @lends Jii.view.react.ReactView */{

        ID_PREFIX: 'v',

        /**
         *
         * @param {Jii.view.react.ReactView} component
         * @param {string|Jii.base.Model|Jii.base.Collection} model
         * @param {string[]} [attributes]
         */
        listenModel(component, model, attributes) {
            attributes = attributes || [];

            if (!(model instanceof Jii.base.Model) && !(model instanceof Jii.base.Collection)) {
                throw new Jii.exceptions.InvalidParamException('Not found model for apply to state.');
            }

            // Event handler
            var onModelChange = () => {
                component.forceUpdate();
            };

            // Mount events
            var createMountHandler = (subscribeMethod, originalCallback) => {
                return () => {
                    if (model instanceof Jii.base.Model) {
                        model[subscribeMethod](Jii.base.Model.EVENT_CHANGE, onModelChange);
                        model[subscribeMethod](Jii.base.Model.EVENT_CHANGE_ERRORS, onModelChange);
                        Jii._.each(attributes, attribute => {
                            model[subscribeMethod](Jii.base.Model.EVENT_CHANGE_NAME + attribute, onModelChange);
                        });
                    }
                    if (model instanceof Jii.base.Collection) {
                        model[subscribeMethod](Jii.base.Collection.EVENT_CHANGE, onModelChange);
                        Jii._.each(attributes, attribute => {
                            model[subscribeMethod](Jii.base.Collection.EVENT_CHANGE_NAME + attribute, onModelChange);
                        });
                    }
                    onModelChange();
                    return originalCallback.apply(this, arguments);
                }
            }
            component.componentWillMount = createMountHandler('on', component.componentWillMount);
            component.componentWillUnmount = createMountHandler('off', component.componentWillUnmount);

            return model;
        },

        wrapCallback(callback1, callback2) {
            return () => {
                if (!Jii._.isFunction(callback1) || callback1.apply(this, arguments) !== false) {
                    callback2.apply(this, arguments);
                }
            }
        }

    },

    /**
     * @type {string}
     */
    id: null,

    /**
     * @type {object}
     */
    context: null,

    constructor() {
        this.id = Jii._.uniqueId(this.__static.ID_PREFIX);

        // Display class name in react warnings
        this.__static.displayName = this.className();

        this.__super.apply(this, arguments);

        // Run custom init method
        this.init();
    },

    setState() {
        this.__super.apply(this, arguments);
    },

    forceUpdate() {
        this.__super.apply(this, arguments);
    },

    componentDidMount() {
    },

    componentWillMount() {
    },

    componentWillUnmount() {
    },

    componentWillReceiveProps() {
    },

    componentDidUpdate() {
    },

    componentWillUpdate() {
    },

    listenModel(model, listenAttributes) {
        return this.__static.listenModel(this, model, listenAttributes);
    }

});

Jii._.extend(self.__static, Jii.base.Object.__static);
Jii._.extend(self.prototype, Jii.base.Object.prototype);
