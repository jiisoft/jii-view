'use strict';

var Jii = require('jii');
var _isObject = require('lodash/isObject');
var _map = require('lodash/map');
var ActiveField = require('./ActiveField.jsx');
var React = require('react');

/**
 * @class Jii.view.react.form.DropDownList
 * @extends ActiveField
 */
module.exports = Jii.defineClass('Jii.view.react.form.DropDownList', /** @lends Jii.view.react.form.DropDownList.prototype */{

    __extends: ActiveField,

    __static: /** @lends Jii.view.react.form.DropDownList */{

        /**
         * @alias {Jii.view.react.form.DropDownList.prototype.props}
         */
        propTypes: Jii.mergeConfigs(ActiveField.propTypes, {

            /**
             * @type {string}
             */
            items: React.PropTypes.oneOfType([
                React.PropTypes.object,
                React.PropTypes.array
            ])

        }),

        defaultProps: Jii.mergeConfigs(ActiveField.defaultProps, {
            items: []
        })

    },

    init() {
        this.__super();
        this._onChange = this._onChange.bind(this);
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
                onChange={this._onChange}
                value={this.state.value || ''}
            >
                {_map(this.props.items, (item, value) => {
                    let label = _isObject(item) && item.label || item || '';
                    let optionProps = {
                        key: value,
                        value: value,
                        disabled: _isObject(item) && item.disabled ? true : false
                    };

                    return <option {...optionProps}>{label}</option>
                })}
            </select>
        );
    },

    _onChange(e) {
        let value = e.target.value;

        this.setState({value: value});
        this.validateValue(value);
        this.props.inputOptions.onChange && this.props.inputOptions.onChange(e, value);
    }

});
