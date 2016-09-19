'use strict';

var Jii = require('jii');
var ActiveField = require('./ActiveField.jsx');
var React = require('react');

/**
 * @class Jii.view.react.form.Input
 * @extends Jii.view.react.form.ActiveField
 */
module.exports = Jii.defineClass('Jii.view.react.form.Input', /** @lends Jii.view.react.form.Input.prototype */{

    __extends: ActiveField,

    __static: /** @lends Jii.view.react.form.Input */{

        /**
         * @alias {Jii.view.react.form.Input.prototype.props}
         */
        propTypes: Jii.mergeConfigs(ActiveField.propTypes, {

            /**
             * @type {string}
             */
            type: React.PropTypes.string,

            /**
             * @type {string}
             */
            placeholder: React.PropTypes.string

        }),

        defaultProps: Jii.mergeConfigs(ActiveField.defaultProps, {
            type: 'text',
            placeholder: ''
        })

    },

    render() {
        if (this.props.type === 'hidden') {
            return this.renderInput();
        }

        return this.__super();
    },

    renderInput() {
        return (
            <input
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
        this.validateValue(value, false);
        this.props.inputOptions.onBlur && this.props.inputOptions.onBlur(e);
    },

    _onChange(e) {
        let value = e.target.value;

        this.setState({value: value});
        this.validateValue(value, true);
        this.props.inputOptions.onChange && this.props.inputOptions.onChange(e, value);
    }

});
