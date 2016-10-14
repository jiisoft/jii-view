'use strict';

var Jii = require('jii');
var _isObject = require('lodash/isObject');
var _map = require('lodash/map');
var _each = require('lodash/each');
var _has = require('lodash/has');
var _isString = require('lodash/isString');
var ActiveField = require('./ActiveField.jsx');
var React = require('react');

/**
 * @class Jii.view.react.form.DropDownList
 * @extends ActiveField
 */
var DropDownList = Jii.defineClass('Jii.view.react.form.DropDownList', /** @lends Jii.view.react.form.DropDownList.prototype */{

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
            ]),

        }),

        defaultProps: Jii.mergeConfigs(ActiveField.defaultProps, {
            items: []
        }),

        normalizeItems(items) {
            const result = [];
            _each(items, (item, value) => {
                let isDisabled = false;
                let label = '';

                if (_isObject(item)) {
                    label = item.label || '';
                    isDisabled = !!item.disabled;

                    if (_has(item, 'value')) {
                        value = item.value;
                    }
                } else if (_isString(item)) {
                    label = item
                }

                result.push({
                    label: label,
                    value: value,
                    disabled: isDisabled,
                });
            });
            return result;
        },

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
                {_map(this.__static.normalizeItems(this.props.items), item => {
                    let optionProps = {
                        key: item.value,
                        value: item.value,
                        disabled: item.value.disabled
                    };

                    return <option {...optionProps}>{item.label}</option>
                })}
            </select>
        );
    },

    _onChange(e) {
        let value = e.target.value;

        this.setState({value: value});
        this.validateValue(value, e);
        this.props.inputOptions.onChange && this.props.inputOptions.onChange(e, value);
    }

});

module.exports = DropDownList;