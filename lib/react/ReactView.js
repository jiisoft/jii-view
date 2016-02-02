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

        ID_PREFIX: 'v'

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
        if (this.model instanceof Jii.base.Model) {
            Jii._.each(this.attributes, function(name) {
                this.model.on(Jii.base.Model.EVENT_CHANGE_NAME + name, this._onModelChange);
            }.bind(this));
        }
        if (this.collection instanceof Jii.base.Collection) {
            this.collection.on(Jii.base.Collection.EVENT_CHANGE, this._onModelChange);
        }
    },

    componentWillUnmount: function() {
        if (this.model instanceof Jii.base.Model) {
            Jii._.each(this.attributes, function(name) {
                this.model.off(Jii.base.Model.EVENT_CHANGE_NAME + name, this._onModelChange);
            }.bind(this));
        }
        if (this.collection instanceof Jii.base.Collection) {
            this.collection.off(Jii.base.Collection.EVENT_CHANGE, this._onModelChange);
        }
    },

    _initModel: function() {
        if (Jii._.isString(this.model) || Jii._.isFunction(this.model)) {
            var modelClassFn = Jii.namespace(this.model);
            this.model = new modelClassFn();
            this.model.loadDefaultValues();
        }
        if (this.model instanceof Jii.base.Model) {
            this.attributes = this.attributes || this.model.attributes();
            Jii._.each(this.attributes, function(name) {
                this.state[name] = this.model.get(name);
            }.bind(this));
        }

        if (Jii._.isString(this.collection) || Jii._.isFunction(this.collection)) {
            var collectionClassFn = Jii.namespace(this.collection);
            this.collection = new collectionClassFn();
        }
        if (this.collection instanceof Jii.base.Collection) {
            this.state.models = this.collection.getModels();
        }

        this._onModelChange = this._onModelChange.bind(this);
    },

    _onModelChange: function(event) {
        if (event instanceof Jii.model.ChangeAttributeEvent) {
            var changes = {};
            changes[event.attribute] = event.sender.get(event.attribute);
            this.setState(changes);
        }
        if (event instanceof Jii.model.CollectionEvent) {
            this.setState({models: event.sender.getModels()});
        }
    }

});

Jii._.extend(self.__static, Jii.base.Object.__static);
Jii._.extend(self.prototype, Jii.base.Object.prototype);
