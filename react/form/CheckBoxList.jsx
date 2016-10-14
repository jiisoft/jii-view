'use strict';

var Jii = require('jii');
var _isObject = require('lodash/isObject');
var _isString = require('lodash/isString');
var _has = require('lodash/has');
var _indexOf = require('lodash/indexOf');
var _map = require('lodash/map');
var _filter = require('lodash/filter');
var _uniq = require('lodash/uniq');
var ActiveField = require('./ActiveField.jsx');
var React = require('react');
var DropDownList = require('./DropDownList.jsx');

/**
 * @class Jii.view.react.form.CheckBoxList
 * @extends ActiveField
 */
var CheckBoxList = Jii.defineClass('Jii.view.react.form.CheckBoxList', /** @lends Jii.view.react.form.CheckBoxList.prototype */{

    __extends: ActiveField,

    __static: /** @lends Jii.view.react.form.CheckBoxList */{

        /**
         * @alias {Jii.view.react.form.CheckBoxList.prototype.props}
         */
        propTypes: Jii.mergeConfigs(ActiveField.propTypes, {

            /**
             * @type {boolean}
             */
            inline: React.PropTypes.bool,

            /**
             * @type {string}
             */
            items: React.PropTypes.oneOfType([
                React.PropTypes.object,
                React.PropTypes.array
            ]),

        }),

        defaultProps: Jii.mergeConfigs(ActiveField.defaultProps, {
            inline: false,
            items: []
        })

    },

    init() {
        this.__super();
        this._onChange = this._onChange.bind(this);
    },

    renderInput() {
        return (
            <div
                id={this._getInputId()}
            >
                {_map(DropDownList.normalizeItems(this.props.items), this.renderItem.bind(this))}
            </div>
        );
    },

    renderItem(item) {

        if (this.props.inline) {
            return this.renderItemLabel(item.label, item.value, item.disabled);
        }

        return (
            <div className={'checkbox' + (item.disabled ? ' disabled' : '')} key={item.value}>
                {this.renderItemLabel(item.label, item.value, item.disabled)}
            </div>
        );
    },

    renderItemLabel(label, value, isDisabled) {
        return (
            <label className={this.props.inline ? 'checkbox-inline' : ''} key={this.props.inline ? value : null}>
                <input
                    {...this.props.inputOptions}
                    type="checkbox"
                    name={this._getInputName()}
                    checked={_indexOf([].concat(this.state.value), value) !== -1}
                    disabled={isDisabled}
                    value={value}
                    onChange={this._onChange}
                /> {label}
            </label>
        );
    },

    _onChange(e) {
        let values = [].concat(this.state.value);
        if (e.target.checked) {
            values.push(e.target.value);
        } else {
            values = _filter(values, v => v !== e.target.value);
        }
        values = _uniq(values);

        this.setState({value: values});
        this.validateValue(values, e);
        this.props.inputOptions.onChange && this.props.inputOptions.onChange(e, values);
    }

});

module.exports = CheckBoxList;