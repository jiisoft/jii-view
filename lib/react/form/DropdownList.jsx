'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('jii');

var React = require('react');

/**
 * @class Jii.view.react.form.DropDownList
 * @extends Jii.view.react.form.ActiveField
 */
Jii.defineClass('Jii.view.react.form.DropDownList', /** @lends Jii.view.react.form.DropDownList.prototype */{

    __extends: Jii.view.react.form.ActiveField,

    __static: /** @lends Jii.view.react.form.DropDownList */{

        /**
         * @alias {Jii.view.react.form.DropDownList.prototype.props}
         */
        propTypes: Jii.mergeConfigs(Jii.view.react.form.ActiveField.propTypes, {

            /**
             * @type {string}
             */
            items: React.PropTypes.oneOfType([
                React.PropTypes.object,
                React.PropTypes.array
            ])

        }),

        defaultProps: Jii.mergeConfigs(Jii.view.react.form.ActiveField.defaultProps, {
            items: []
        })

    },

    renderInput() {
        return (
            <select
                {...this.props.inputOptions}
                id={this._getInputId()}
                name={this._getInputName()}
                className={[
                    this.props.inputOptions.className || '',
                    'form-control'
                ].join(' ')}
                onFocus={this._onFocus}
                onBlur={this._onBlur}
                onChange={this._onChange}
                value={this.state.value || ''}
            >
                {Jii._.map(this.props.items, (item, value) => {
                    let label = Jii._.isObject(item) && item.label || item || '';
                    let optionProps = {
                        key: value,
                        value: value,
                        disabled: Jii._.isObject(item) && item.disabled ? true : false
                    };

                    return <option {...optionProps}>{label}</option>
                })}
            </select>
        );
    },

    _onChange(e) {
        this.setState({value: e.target.value});
        this.__super(e);
    }

});
