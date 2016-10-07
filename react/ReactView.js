'use strict';

var Jii = require('jii');
var Object = require('jii/base/Object');
var Model = require('jii-model/base/Model');
var Collection = require('jii-model/base/Collection');
var InvalidParamException = require('jii/exceptions/InvalidParamException');
var _isFunction = require('lodash/isFunction');
var _uniqueId = require('lodash/uniqueId');
var _each = require('lodash/each');
var _extend = require('lodash/extend');
var React = require('react');

/**
 * @class Jii.view.react.ReactView
 * @extends Jii.base.Object
 * @extends React.Component
 */
var ReactView = Jii.defineClass('Jii.view.react.ReactView', /** @lends Jii.view.react.ReactView.prototype */{

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

            if (!(model instanceof Model) && !(model instanceof Collection)) {
                throw new InvalidParamException('Not found model for apply to state.');
            }

            // Event handler
            var onModelChange = () => {
                component.forceUpdate();
            };

            // Mount events
            var createMountHandler = (subscribeMethod, originalCallback) => {
                return () => {
                    if (model instanceof Model) {
                        model[subscribeMethod](Model.EVENT_CHANGE, onModelChange);
                        model[subscribeMethod](Model.EVENT_CHANGE_ERRORS, onModelChange);
                        _each(attributes, attribute => {
                            model[subscribeMethod](Model.EVENT_CHANGE_NAME + attribute, onModelChange);
                        });
                    }
                    if (model instanceof Collection) {
                        model[subscribeMethod](Collection.EVENT_CHANGE, onModelChange);
                        _each(attributes, attribute => {
                            model[subscribeMethod](Collection.EVENT_CHANGE_NAME + attribute, onModelChange);
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
                if (!_isFunction(callback1) || callback1.apply(this, arguments) !== false) {
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
        this.id = _uniqueId(this.__static.ID_PREFIX);

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

_extend(ReactView.__static, Object.__static);
_extend(ReactView.prototype, Object.prototype);

module.exports = ReactView;