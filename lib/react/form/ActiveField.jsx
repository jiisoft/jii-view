'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('jii');

/**
 * @class Jii.view.react.form.ActiveField
 * @extends Jii.view.react.ReactView
 */
Jii.defineClass('Jii.view.react.form.ActiveField', /** @lends Jii.view.react.form.ActiveField.prototype */{

    __extends: Jii.view.react.ReactView,

    __static: /** @lends Jii.view.react.form.ActiveField */{

        contextTypes: {
            form: React.PropTypes.object.isRequired,
            model: React.PropTypes.object.isRequired
        }

    },

    /**
     * @type {string} the model attribute that this field is associated with
     */
    attribute: null,

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
    options: {
        className: 'form-group'
    },

    wrapperOptions: {},

    /**
     * @type {object} the default options for the input tags. The parameter passed to individual input methods
     * (e.g. [[textInput()]]) will be merged with this property when rendering the input tag.
     *
     * If you set a custom `id` for the input element, you may need to adjust the [[selectors]] accordingly.
     *
     * @see \jii\helpers\Html.renderTagAttributes() for details on how attributes are being rendered.
     */
    inputOptions: {},

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
    errorOptions: {},

    /**
     * @type {object} the default options for the label tags. The parameter passed to [[label()]] will be
     * merged with this property when rendering the label tag.
     * @see \jii\helpers\Html.renderTagAttributes() for details on how attributes are being rendered.
     */
    labelOptions: {},

    /**
     * @type {object} the default options for the hint tags. The parameter passed to [[hint()]] will be
     * merged with this property when rendering the hint tag.
     * The following special options are recognized:
     *
     * - tag: the tag name of the container element. Defaults to "div".
     *
     * @see \jii\helpers\Html.renderTagAttributes() for details on how attributes are being rendered.
     */
    hintOptions: {},

    /**
     * @type {boolean} whether to enable client-side data validation.
     * If not set, it will take the value of [[ActiveForm.enableClientValidation]].
     */
    enableValidation: true,

    /**
     * @type {boolean} whether to perform validation when the value of the input field is changed.
     * If not set, it will take the value of [[ActiveForm.validateOnChange]].
     */
    validateOnChange: null,

    /**
     * @type {boolean} whether to perform validation when the input field loses focus.
     * If not set, it will take the value of [[ActiveForm.validateOnBlur]].
     */
    validateOnBlur: null,

    /**
     * @type {boolean} whether to perform validation while the user is typing in the input field.
     * If not set, it will take the value of [[ActiveForm.validateOnType]].
     * @see validationDelay
     */
    validateOnType: null,

    /**
     * @type {number} number of milliseconds that the validation should be delayed when the user types in the field
     * and [[validateOnType]] is set true.
     * If not set, it will take the value of [[ActiveForm.validationDelay]].
     */
    validationDelay: null,

    /**
     * @type {[]} the jQuery selectors for selecting the container, input and error tags.
     * The array keys should be "container", "input", and/or "error", and the array values
     * are the corresponding selectors. For example, `{input: '#my-input'}`.
     *
     * The container selector is used under the context of the form, while the input and the error
     * selectors are used under the context of the container.
     *
     * You normally do not need to set this property as the default selectors should work well for most cases.
     */
    //selectors: null,

    state: {
        errors: [],
        hasError: false,
        hasSuccess: false
    },

    _timer: null,

    /**
     *
     * @returns {React.Component}
     */
    render: function() {
        var items = this.context.form.layout === Jii.view.react.form.ActiveForm.LAYOUT_HORIZONTAL ?
            [
                this.renderLabel(),
                this.renderWrapper([
                    this.renderInput(),
                    this.renderError()
                ]),
                this.renderHint()
            ] :
            [
                this.renderLabel(),
                this.renderInput(),
                this.renderHint(),
                this.renderError()
            ];

        var options = Jii._.extend({}, this.options);
        options.className = (options.className || '')
            + (this.state.hasError ? ' ' + this.context.form.errorCssClass : '' )
            + (this.state.hasSuccess ? ' ' + this.context.form.successCssClass : '' );

        return React.createElement.apply(React, ['div', options].concat(items));
    },

    /**
     *
     * @returns {React.Component}
     */
    renderInput: function() {
        throw new Jii.exceptions.NotSupportedException('ActiveField is abstract class, renderField is not implemented.');
    },

    /**
     *
     * @param {React.Component[]} [children]
     * @returns {React.Component}
     */
    renderLabel: function(children) {
        children = children || [];

        var options = Jii._.extend({}, {
            htmlFor: this._getInputId(),
            label: this.context.model.getAttributeLabel(this._getAttributeName()),
            className: this._getLayoutOption(
                'control-label col-sm-' + this.context.form.cols[0],
                'sr-only',
                'control-label'
            )
        }, this.labelOptions);

        var text = options.label;
        delete options.label;

        return React.createElement.apply(React, ['label', options, text].concat(children));
    },

    /**
     *
     * @param {React.Component[]} [children]
     * @returns {React.Component}
     */
    renderWrapper: function(children) {
        var options = Jii._.extend({}, {
            tag: 'div',
            className: 'col-sm-' + this.context.form.cols[1]
        }, this.wrapperOptions);

        var tag = options.tag;
        delete options.tag;

        return React.createElement.apply(React, [tag, options].concat(children));
    },

    /**
     *
     * @returns {React.Component}
     */
    renderError: function() {
        if (this.context.form.layout === Jii.view.react.form.ActiveForm.LAYOUT_INLINE) {
            return null;
        }

        var options = Jii._.extend({}, {
            tag: this._getLayoutOption('div', 'p'),
            className: 'help-block help-block-error'
        }, this.errorOptions);

        var tag = options.tag;
        delete options.tag;

        return React.createElement(tag, options, this.state.errors.join(' '));
    },

    /**
     *
     * @returns {React.Component}
     */
    renderHint: function() {
        var options = Jii._.extend({}, {
            tag: this._getLayoutOption('div', 'p', 'p'),
            className: this._getLayoutOption(
                'help-block col-sm-' + this.context.form.cols[0],
                'help-block'
            )
        }, this.hintOptions);

        var text = options.hint || this.context.model.getAttributeHint(this._getAttributeName(this.attribute));
        delete options.hint;

        return text ? React.createElement(options.tag || 'div', options, text) : null;
    },

    /**
     *
     * @returns {*}
     */
    getInputValue: function() {
        throw new Jii.exceptions.NotSupportedException('ActiveField is abstract class, getInputValue is not implemented.');
    },

    /**
     *
     * @returns {*}
     */
    getModelValue: function() {
        return this.context.model.get(this._getAttributeName());
    },

    _getLayoutOption: function(horizontal, inline, def) {
        switch (this.context.form.layout) {
            case Jii.view.react.form.ActiveForm.LAYOUT_HORIZONTAL:
                return horizontal;
            case Jii.view.react.form.ActiveForm.LAYOUT_INLINE:
                return inline || horizontal;
        }
        return def || inline || horizontal;
    },

    _onKeyPress: function(e) {
        var isEnable = this.validateOnType !== null ? this.validateOnType : this.context.form.validateOnType;
        if (!isEnable) {
            return;
        }

        if (Jii._.indexOf([9, 16, 17, 18, 20, 37, 38, 39, 40, 91], e.which) !== -1 ) {
            return;
        }

        // Only for clear error
        if (!this.state.hasError) {
            return;
        }

        // Delay validation
        if (this._timer) {
            clearTimeout(this._timer);
        }
        var time = this.validationDelay !== null ? this.validationDelay : this.context.form.validationDelay;
        this._timer = setTimeout(this._validateAttribute.bind(this), time)
    },

    _onBlur: function(e) {
        var isEnable = this.validateOnBlur !== null ? this.validateOnBlur : this.context.form.validateOnBlur;
        if (!isEnable) {
            return;
        }

        this._validateAttribute();
    },

    _onChange: function(e) {
        var isEnable = this.validateOnChange !== null ? this.validateOnChange : this.context.form.validateOnChange;
        if (!isEnable) {
            return;
        }

        // Only for clear error
        if (!this.state.hasError) {
            return;
        }

        this._validateAttribute();
    },

    _validateAttribute: function() {
        var isEnable = this.enableValidation !== null ? this.enableValidation : this.context.form.enableValidation;
        if (!isEnable) {
            return;
        }

        var previousValue = this.getModelValue();
        var newValue = this.getInputValue();

        // Check changes
        if (previousValue === newValue) {
            return;
        }

        var attribute = this._getAttributeName();
        this.context.model.set(attribute, newValue);
        this.context.model.clearErrors(attribute);
        this.context.model.validate([attribute], false).then(function(isSuccess) {
            this.setState({
                errors: this.context.model.getErrors(attribute),
                hasError: !isSuccess,
                hasSuccess: isSuccess
            })
        }.bind(this));
    },

    // @todo move to helpers
    _getInputId: function() {
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
    _getInputName: function() {
        var formName = this.context.model.formName();
        var matches = /(^|.*\])([\w\.]+)(\[.*|$)/.exec(this.attribute);
        if (!matches) {
            throw new Jii.exceptions.InvalidParamException('Attribute name must contain word characters only.');
        }

        var prefix = matches[1];
        var attribute = matches[2];
        var suffix = matches[3];

        if (formName === '' && prefix === '') {
            return attribute + suffix;
        } else if (formName !== '') {
            return formName + prefix + '[' + attribute + ']' + suffix;
        }

        throw new Jii.exceptions.InvalidParamException(this.className() + '::formName() cannot be empty for tabular inputs.');
    },

    // @todo move to helpers
    _getAttributeName: function() {
        var matches = /(^|.*\])([\w\.]+)(\[.*|$)/.exec(this.attribute);
        if (!matches) {
            throw new Jii.exceptions.InvalidParamException('Attribute name must contain word characters only.');
        }
        return matches[2];
    }

});
