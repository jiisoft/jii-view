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
        listenModel: function(component, model, attributes) {
            attributes = attributes || [];

            if (!(model instanceof Jii.base.Model) && !(model instanceof Jii.base.Collection)) {
                throw new Jii.exceptions.InvalidParamException('Not found model for apply to state.');
            }

            // Event handler
            var onModelChange = function() {
                component.forceUpdate();
            };

            // Mount events
            var createMountHandler = function(subscribeMethod, originalCallback) {
                return function() {
                    if (model instanceof Jii.base.Model) {
                        model[subscribeMethod](Jii.base.Model.EVENT_CHANGE, onModelChange);
                        Jii._.each(attributes, function(attribute) {
                            model[subscribeMethod](Jii.base.Model.EVENT_CHANGE_NAME + attribute, onModelChange);
                        }.bind(this));
                    }
                    if (model instanceof Jii.base.Collection) {
                        model[subscribeMethod](Jii.base.Collection.EVENT_CHANGE, onModelChange);
                        Jii._.each(attributes, function(attribute) {
                            model[subscribeMethod](Jii.base.Collection.EVENT_CHANGE_NAME + attribute, onModelChange);
                        }.bind(this));
                    }
                    onModelChange();
                    return originalCallback.apply(this, arguments);
                }
            }
            component.componentWillMount = createMountHandler('on', component.componentWillMount);
            component.componentWillUnmount = createMountHandler('off', component.componentWillUnmount);

            return model;
        },

        wrapCallback: function(callback1, callback2) {
            return function() {
                if (!Jii._.isFunction(callback1) || callback1.apply(this, arguments) !== false) {
                    callback2.apply(this, arguments);
                }
            }
        }

    },

    /**
     * @type {Jii.base.Context}
     */
    context: null,

    /**
     * @type {object}
     */
    state: {},

    /**
     * @type {*}
     */
    children: null,

    dangerouslySetInnerHTML: null,

    /**
     * @type {string}
     */
    id: null,

    /**
     * @type {Jii.base.Model}
     */
    model: null,

    /**
     * @type {string[]}
     */
    attributes: null,

    /**
     * @type {Jii.base.Collection}
     */
    collection: null,

    constructor: function(config) {
        var newConfig = {};
        Jii._.each(config, function(value, key) {
            if (Jii._.has(this.state, key)) {
                this.state[key] = value;
            } else {
                newConfig[key] = value;
            }
        }.bind(this));
        arguments[0] = newConfig;

        this.id = Jii._.uniqueId(this.__static.ID_PREFIX);

        // Apply configuration to instance
        Jii.configure(this, newConfig);
        this._initModel();

        // Run custom init method
        this.init();

        this.__super.apply(this, arguments);
    },

    setState: function() {
        this.__super.apply(this, arguments);
    },

    forceUpdate: function() {
        this.__super.apply(this, arguments);
    },

    componentDidMount: function() {
    },

    componentWillMount: function() {
    },

    componentWillUnmount: function() {
    },

    componentWillReceiveProps: function() {
    },

    componentDidUpdate: function() {
    },

    componentWillUpdate: function() {
    },

    listenModel: function(model, listenAttributes) {
        return this.__static.listenModel(this, model, listenAttributes);
    },

    _initModel: function() {
        if (this.model !== null) {
            this.listenModel(this.model, this.attributes);
        }
        if (this.collection !== null) {
            this.listenModel(this.collection, this.attributes);
        }
    }

});

Jii._.extend(self.__static, Jii.base.Object.__static);
Jii._.extend(self.prototype, Jii.base.Object.prototype);
