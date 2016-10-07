'use strict';

var Jii = require('jii');
var ActiveField = require('./ActiveField.jsx');

/**
 * @class Jii.view.react.form.TextArea
 * @extends Jii.view.react.form.ActiveField
 */
var TextArea = Jii.defineClass('Jii.view.react.form.TextArea', /** @lends Jii.view.react.form.TextArea.prototype */{

    __extends: ActiveField,

    init() {
        this.__super();
        this._onBlur = this._onBlur.bind(this);
        this._onChange = this._onChange.bind(this);
    },

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
                onBlur={this._onBlur}
                onChange={this._onChange}
                value={this.state.value || ''}
            />
        );
    },

    _onBlur: function(e) {
        let value = e.target.value;

        this.setState({value: value});
        this.validateValue(value);
        this.props.inputOptions.onBlur && this.props.inputOptions.onBlur(e);
    },

    _onChange(e) {
        let value = e.target.value;

        this.setState({value: value});
        this.validateValue(value, true);
        this.props.inputOptions.onChange && this.props.inputOptions.onChange(e, value);
    }

});

module.exports = TextArea;