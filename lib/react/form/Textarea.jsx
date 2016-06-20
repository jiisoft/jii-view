'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('jii');

/**
 * @class Jii.view.react.form.TextArea
 * @extends Jii.view.react.form.ActiveField
 */
Jii.defineClass('Jii.view.react.form.TextArea', /** @lends Jii.view.react.form.TextArea.prototype */{

    __extends: Jii.view.react.form.ActiveField,

    componentWillUpdate: function() {
        ReactDOM.findDOMNode(this.refs.input).value = this.getModelValue();
    },

    renderInput: function() {
        var options = {
            id: this._getInputId(),
            ref: 'input',
            name: this._getInputName(),
            className: 'form-control',
            onKeyPress: this._onKeyPress.bind(this),
            onBlur: this._onBlur.bind(this),
            onChange: this._onChange.bind(this),
            defaultValue: ''
        };
        options = Jii._.extend(options, this.inputOptions, {
            onKeyPress: this.__static.wrapCallback(this.inputOptions.onKeyPress, this._onKeyPress.bind(this)),
            onBlur: this.__static.wrapCallback(this.inputOptions.onBlur, this._onBlur.bind(this)),
            onChange: this.__static.wrapCallback(this.inputOptions.onChange, this._onChange.bind(this))
        });

        return React.createElement('textarea', options);
    },

    getInputValue: function() {
        return ReactDOM.findDOMNode(this.refs.input).value;
    }

});
