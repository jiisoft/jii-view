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

    renderInput: function() {
        var options = {
            id: this._getInputId(),
            ref: 'input',
            name: this._getInputName(),
            className: 'form-control',
            onKeyPress: this._onKeyPress.bind(this),
            onBlur: this._onBlur.bind(this),
            onChange: this._onChange.bind(this)
        };

        return React.createElement('textarea', Jii._.extend({}, options, this.inputOptions), this.getModelValue());
    },

    getInputValue: function() {
        return ReactDOM.findDOMNode(this.refs.input).value;
    }

});
