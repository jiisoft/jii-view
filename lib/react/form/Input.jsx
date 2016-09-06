'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('jii');

var React = require('react');

/**
 * @class Jii.view.react.form.Input
 * @extends Jii.view.react.form.ActiveField
 */
Jii.defineClass('Jii.view.react.form.Input', /** @lends Jii.view.react.form.Input.prototype */{

    __extends: Jii.view.react.form.ActiveField,

    __static: /** @lends Jii.view.react.form.Input */{

        /**
         * @alias {Jii.view.react.form.Input.prototype.props}
         */
        propTypes: Jii.mergeConfigs(Jii.view.react.form.ActiveField.propTypes, {

            /**
             * @type {string}
             */
            type: React.PropTypes.string,

            /**
             * @type {string}
             */
            placeholder: React.PropTypes.string

        }),

        defaultProps: Jii.mergeConfigs(Jii.view.react.form.ActiveField.defaultProps, {
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
