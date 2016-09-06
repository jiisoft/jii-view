'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('jii');

var React = require('react');

/**
 * @class Jii.view.react.form.RadioList
 * @extends Jii.view.react.form.ActiveField
 */
Jii.defineClass('Jii.view.react.form.RadioList', /** @lends Jii.view.react.form.RadioList.prototype */{

    __extends: Jii.view.react.form.ActiveField,

    __static: /** @lends Jii.view.react.form.RadioList */{

        /**
         * @alias {Jii.view.react.form.RadioList.prototype.props}
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
            <div className={'radio' + (isDisabled ? ' disabled' : '')} key={value}>
                {this.renderItemLabel(label, value, isDisabled)}
            </div>
        );
    },

    renderItemLabel(label, value, isDisabled) {
        return (
            <label className={this.props.inline ? 'radio-inline' : ''} key={this.props.inline ? value : null}>
                <input
                    {...this.props.inputOptions}
                    type="radio"
                    name={this._getInputName()}
                    checked={this.state.value == value}
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
        this.setState({value: e.target.value});
        this.__super(e);
    }

});
