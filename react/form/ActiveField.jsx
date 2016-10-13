'use strict';

var Jii = require('jii');
var ActiveForm = require('./ActiveForm.jsx');
var NotSupportedException = require('jii/exceptions/NotSupportedException');
var InvalidParamException = require('jii/exceptions/InvalidParamException');
var _isEmpty = require('lodash/isEmpty');
var _indexOf = require('lodash/indexOf');
var _isObject = require('lodash/isObject');
var ReactView = require('../ReactView');
var React = require('react');

/**
 * @class Jii.view.react.form.ActiveField
 * @extends Jii.view.react.ReactView
 */
var ActiveField = Jii.defineClass('Jii.view.react.form.ActiveField', /** @lends Jii.view.react.form.ActiveField.prototype */{

    __extends: ReactView,

    __static: /** @lends Jii.view.react.form.ActiveField */{

        /**
         * @alias {Jii.view.react.form.ActiveField.prototype.context}
         */
        contextTypes: {

            /**
             * @type {Jii.view.react.form.ActiveForm}
             */
            form: React.PropTypes.object.isRequired,

            /**
             * @type {Jii.base.BaseActiveRecord}
             */
            model: React.PropTypes.object.isRequired,

            /**
             * @type {string}
             */
            layout: React.PropTypes.string,

        },

        propTypes: {

            /**
             * @type {string} the model attribute that this field is associated with
             */
            attribute: React.PropTypes.string.isRequired,

            /**
             * @type {object} the HTML attributes (name-value pairs) for the field container tag.
             * The values will be HTML-encoded using [[Html.encode()]].
             * If a value is null, the corresponding attribute will not be rendered.
             * The following special options are recognized:
             *
             * - tag: the tag name of the container element. Defaults to "div".
             *
             * If you set a custom `id` for the container element, you may need to adjust the [[selectors]] accordingly.
             *
             * @see \jii\helpers\Html.renderTagAttributes() for details on how attributes are being rendered.
             */
            options: React.PropTypes.object,

            wrapperOptions: React.PropTypes.object,

            /**
             * @type {object} the default options for the input tags. The parameter passed to individual input methods
             * (e.g. [[textInput()]]) will be merged with this property when rendering the input tag.
             *
             * If you set a custom `id` for the input element, you may need to adjust the [[selectors]] accordingly.
             *
             * @see \jii\helpers\Html.renderTagAttributes() for details on how attributes are being rendered.
             */
            inputOptions: React.PropTypes.object,

            /**
             * @type {object} the default options for the error tags. The parameter passed to [[error()]] will be
             * merged with this property when rendering the error tag.
             * The following special options are recognized:
             *
             * - tag: the tag name of the container element. Defaults to "div".
             * - encode: whether to encode the error output. Defaults to true.
             *
             * If you set a custom `id` for the error element, you may need to adjust the [[selectors]] accordingly.
             *
             * @see \jii\helpers\Html.renderTagAttributes() for details on how attributes are being rendered.
             */
            errorOptions: React.PropTypes.object,

            /**
             * @type {object} the default options for the label tags. The parameter passed to [[label()]] will be
             * merged with this property when rendering the label tag.
             * @see \jii\helpers\Html.renderTagAttributes() for details on how attributes are being rendered.
             */
            labelOptions: React.PropTypes.object,

            /**
             * @type {object} the default options for the hint tags. The parameter passed to [[hint()]] will be
             * merged with this property when rendering the hint tag.
             * The following special options are recognized:
             *
             * - tag: the tag name of the container element. Defaults to "div".
             *
             * @see \jii\helpers\Html.renderTagAttributes() for details on how attributes are being rendered.
             */
            hintOptions: React.PropTypes.object,

            /**
             * @type {boolean|null} whether to enable client-side data validation.
             * If not set, it will take the value of [[ActiveForm.enableClientValidation]].
             */
            enableValidation: React.PropTypes.bool,

            /**
             * @type {boolean} whether to perform validation when the value of the input field is changed.
             * If not set, it will take the value of [[ActiveForm.validateOnChange]].
             */
            validateOnChange: React.PropTypes.bool,

            /**
             * @type {boolean} whether to perform validation while the user is typing in the input field.
             * If not set, it will take the value of [[ActiveForm.validateOnType]].
             * @see validationDelay
             */
            validateOnType: React.PropTypes.bool,

            /**
             * @type {number} number of milliseconds that the validation should be delayed when the user types in the field
             * and [[validateOnType]] is set true.
             * If not set, it will take the value of [[ActiveForm.validationDelay]].
             */
            validationDelay: React.PropTypes.number,

            layout: React.PropTypes.string,
        },

        defaultProps: {
            options: {
                className: 'form-group'
            },
            wrapperOptions: {},
            inputOptions: {},
            errorOptions: {},
            labelOptions: {},
            hintOptions: {},
            enableValidation: true,
            validateOnChange: null,
            validateOnType: null,
            validationDelay: null,
            layout: null,
        }

    },

    state: {
        value: null,
        isValidated: false
    },

    _timer: null,

    init() {
        this.state.value = this.getModelValue() || '';
    },

    getLayout() {
        return this.props.layout || this.context.layout || this.context.form.props.layout;
    },

    render() {
        return (
            <div
                {...this.props.options}
                className={[
                    this.props.options.className || '',
                    this.hasError() && this.context.form.props.errorCssClass || '',
                    this.hasSuccess() && this.context.form.props.successCssClass || ''
                ].join(' ')}
            >
                {this.getLayout() === ActiveForm.LAYOUT_HORIZONTAL ?
                    <span>
                        {this.renderLabel()}
                        {this.renderWrapper(
                        <span>
                            {this.renderInput()}
                            {this.renderError()}
                        </span>
                            )}
                    </span> :
                    <span>
                        {this.renderLabel()}
                        {this.renderInput()}
                        {this.renderHint()}
                        {this.renderError()}
                    </span>
                    }
            </div>
        );
    },

    /**
     *
     * @returns {React.Component}
     */
    renderInput() {
        return this.props.children;
    },

    renderLabel() {
        return (
            <label
                {...this.props.labelOptions}
                className={[
                    this.props.labelOptions.className || '',
                    this._getLayoutOption(
                        'control-label col-sm-' + this.context.form.props.cols[0],
                        'sr-only',
                        'control-label'
                    )
                ].join(' ')}
                htmlFor={this._getInputId()}
            >
                {this.context.model.getAttributeLabel(this._getAttributeName())}
            </label>
        );
    },

    renderWrapper(children) {
        return (
            <div
                {...this.props.wrapperOptions}
                className={[
                    this.props.wrapperOptions.className || '',
                    'col-sm-' + this.context.form.props.cols[1]
                ].join(' ')}
            >
                {children}
            </div>
        );
    },

    renderError() {
        if (this.getLayout() === ActiveForm.LAYOUT_INLINE) {
            return null;
        }

        const errorText = this.context.model.getErrors(this._getAttributeName()).join(' ');
        if (!errorText) {
            return null;
        }

        if (this.getLayout() === ActiveForm.LAYOUT_HORIZONTAL) {
            return (
                <div
                    {...this.props.errorOptions}
                    className={[
                        this.props.errorOptions.className || '',
                        'help-block help-block-error'
                    ].join(' ')}
                >
                    {errorText}
                </div>
            );
        }


        return (
            <p
                {...this.props.errorOptions}
                className={[
                        this.props.errorOptions.className || '',
                        'help-block help-block-error'
                    ].join(' ')}
            >
                {errorText}
            </p>
        );
    },

    renderHint() {
        const hintText = this.context.model.getAttributeHint(this._getAttributeName(this.props.attribute));
        if (!hintText) {
            return null;
        }

        if (this.getLayout() === ActiveForm.LAYOUT_HORIZONTAL) {
            return (
                <div
                    {...this.props.hintOptions}
                    className={[
                        this.props.hintOptions.className || '',
                        'help-block col-sm-' + this.context.form.props.cols[0]
                    ].join(' ')}
                >
                    {hintText}
                </div>
            );
        }


        return (
            <p
                {...this.props.hintOptions}
                className={[
                    this.props.hintOptions.className || '',
                    'help-block'
                ].join(' ')}
            >
                {hintText}
            </p>
        );
    },

    /**
     *
     * @returns {*}
     */
    getModelValue() {
        return this.context.model.get(this._getAttributeName());
    },

    hasError() {
        return !_isEmpty(this.context.model.getErrors(this._getAttributeName()));
    },

    hasSuccess() {
        return this.state.isValidated && !this.hasError();
    },

    _getLayoutOption(horizontal, inline, def) {
        switch (this.getLayout()) {
            case ActiveForm.LAYOUT_HORIZONTAL:
                return horizontal;
            case ActiveForm.LAYOUT_INLINE:
                return inline || horizontal;
        }
        return def || inline || horizontal;
    },

    /**
     *
     * @param {*} value
     * @param {object} event
     */
    validateValue(value, event) {
        if (_isObject(event) && (event.type || '').indexOf('key') === 0) {
            var isTypeEnable = this.props.validateOnType !== null ? this.props.validateOnType : this.context.form.props.validateOnType;
            if (!isTypeEnable) {
                return;
            }

            if (_indexOf([9, 16, 17, 18, 20, 37, 38, 39, 40, 91], event.which) !== -1 ) {
                return;
            }

            // Only for clear error
            if (!this.hasError()) {
                return;
            }

            // Delay validation
            if (this._timer) {
                clearTimeout(this._timer);
            }
            var time = this.props.validationDelay !== null ? this.props.validationDelay : this.context.form.props.validationDelay;
            this._timer = setTimeout(() => {
                this._validate(value)
            }, time);
        } else {
            var isChangeEnable = this.props.validateOnChange !== null ? this.props.validateOnChange : this.context.form.props.validateOnChange;
            if (isChangeEnable) {
                this._validate(value);
            }
        }
    },

    /**
     * @param {*} newValue
     */
    _validate(newValue) {
        var isEnable = this.props.enableValidation !== null ? this.props.enableValidation : this.context.form.props.enableValidation;
        if (!isEnable) {
            return;
        }

        var previousValue = this.getModelValue();

        // Check changes
        if (previousValue === newValue) {
            return;
        }

        var attribute = this._getAttributeName();
        this.context.model.set(attribute, newValue);
        this.context.model.clearErrors(attribute);
        this.context.model.validate([attribute], false).then(isSuccess => {
            this.setState({
                isValidated: true
            });
        });
    },

    // @todo move to helpers
    _getInputId() {
        return this._getInputName()
            .toLowerCase()
            .replace(/\[\]/g, '')
            .replace(/\]\[/g, '-')
            .replace(/\[/g, '-')
            .replace(/\]/g, '')
            .replace(/ /g, '-')
            .replace(/\./g, '-');
    },

    // @todo move to helpers
    _getInputName() {
        var formName = this.context.model.formName();
        var matches = /(^|.*\])([\w\.]+)(\[.*|$)/.exec(this.props.attribute);
        if (!matches) {
            throw new InvalidParamException('Attribute name must contain word characters only.');
        }

        var prefix = matches[1];
        var attribute = matches[2];
        var suffix = matches[3];

        if (formName === '' && prefix === '') {
            return attribute + suffix;
        } else if (formName !== '') {
            return formName + prefix + '[' + attribute + ']' + suffix;
        }

        throw new InvalidParamException(this.className() + '::formName() cannot be empty for tabular inputs.');
    },

    // @todo move to helpers
    _getAttributeName() {
        var matches = /(^|.*\])([\w\.]+)(\[.*|$)/.exec(this.props.attribute);
        if (!matches) {
            throw new InvalidParamException('Attribute name must contain word characters only.');
        }
        return matches[2];
    }

});

module.exports = ActiveField;