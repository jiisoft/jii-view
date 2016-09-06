'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('jii');

var React = require('react');

/**
 * @class Jii.view.react.form.CheckBoxList
 * @extends Jii.view.react.form.ActiveField
 */
Jii.defineClass('Jii.view.react.form.CheckBoxList', /** @lends Jii.view.react.form.CheckBoxList.prototype */{

    __extends: Jii.view.react.form.ActiveField,

    __static: /** @lends Jii.view.react.form.CheckBoxList */{

        /**
         * @alias {Jii.view.react.form.CheckBoxList.prototype.props}
         */
        propTypes: Jii.mergeConfigs(Jii.view.react.form.ActiveField.propTypes, {

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
            ])

        }),

        defaultProps: Jii.mergeConfigs(Jii.view.react.form.ActiveField.defaultProps, {
            inline: false,
            items: []
        })

    },

    renderInput() {
        return (
            <div
                id={this._getInputId()}
            >
                {Jii._.map(this.props.items, this.renderItem.bind(this))}
            </div>
        );
    },

    renderItem(item, value) {
        let isDisabled = Jii._.isObject(item) && item.disabled ? true : false
        let label = Jii._.isObject(item) && item.label || item || '';

        if (this.props.inline) {
            return this.renderItemLabel(label, value, isDisabled);
        }

        return (
            <div className={'checkbox' + (isDisabled ? ' disabled' : '')} key={value}>
                {this.renderItemLabel(label, value, isDisabled)}
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
                    checked={Jii._.indexOf([].concat(this.state.value), value) !== -1}
                    disabled={isDisabled}
                    value={value}
                    onFocus={this._onFocus}
                    onBlur={this._onBlur}
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
            values = Jii._.filter(values, v => v !== e.target.value);
        }

        this.setState({value: Jii._.uniq(values)});
        this.__super(e);
    }

});
