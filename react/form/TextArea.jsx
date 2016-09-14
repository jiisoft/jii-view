'use strict';

var Jii = require('jii');
var ActiveField = require('./ActiveField');

/**
 * @class Jii.view.react.form.TextArea
 * @extends Jii.view.react.form.ActiveField
 */
module.exports = Jii.defineClass('Jii.view.react.form.TextArea', /** @lends Jii.view.react.form.TextArea.prototype */{

    __extends: ActiveField,

    renderInput() {
        return (
            <textarea
                {...this.props.inputOptions}
                id={this._getInputId()}
                name={this._getInputName()}
                type={this.props.type}
                placeholder={this.props.placeholder}
                className={[
                    this.props.inputOptions.className || '',
                    'form-control'
                ].join(' ')}
                onKeyPress={this._onKeyPress}
                onFocus={this._onFocus}
                onBlur={this._onBlur}
                onChange={this._onChange}
                value={this.state.value || ''}
            />
        );
    },

    _onChange(e) {
        this.setState({value: e.target.value});
        this.__super(e);
    }

});
