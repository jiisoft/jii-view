'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('jii');

/**
 * @class Jii.view.react.form.Input
 * @extends Jii.view.react.form.ActiveField
 */
Jii.defineClass('Jii.view.react.form.Input', /** @lends Jii.view.react.form.Input.prototype */{

    __extends: Jii.view.react.form.ActiveField,

    /**
     * @type {string}
     */
    type: 'text',

    /**
     * @type {string}
     */
    placeholder: '',

    render: function() {
        if (this.type === 'hidden') {
            return this.renderInput();
        }

        return this.__super();
    },

    renderInput: function() {
        var options = {
            id: this._getInputId(),
            ref: 'input',
            name: this._getInputName(),
            type: this.type,
            placeholder: this.placeholder,
            className: 'form-control',
            defaultValue: this.getModelValue()
        };
        options = Jii._.extend(options, this.inputOptions, {
            onKeyPress: this.__static.wrapCallback(this.inputOptions.onKeyPress, this._onKeyPress.bind(this)),
            onBlur: this.__static.wrapCallback(this.inputOptions.onBlur, this._onBlur.bind(this)),
            onChange: this.__static.wrapCallback(this.inputOptions.onChange, this._onChange.bind(this))
        });

        return React.createElement('input', options);
    },

    getInputValue: function() {
        return ReactDOM.findDOMNode(this.refs.input).value;
    }

});
