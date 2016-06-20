'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('jii');

/**
 * @class Jii.view.react.form.ActiveForm
 * @extends Jii.view.react.ReactView
 */
Jii.defineClass('Jii.view.react.form.ActiveForm', /** @lends Jii.view.react.form.ActiveForm.prototype */{

    __extends: Jii.view.react.ReactView,

    __static: /** @lends Jii.view.react.form.ActiveForm */{

        LAYOUT_DEFAULT: 'default',
        LAYOUT_HORIZONTAL: 'horizontal',
        LAYOUT_INLINE: 'inline',

        childContextTypes: {
            form: React.PropTypes.object,
            model: React.PropTypes.object
        }

    },

    /**
     * @type {[]|string} action the form action URL. This parameter will be processed by [[\jii\helpers\Url.to()]].
     * @see method for specifying the HTTP method for this form.
     */
    action: null,

    /**
     * Layout: default, inline or horizontal
     * @type {string}
     */
    layout: 'default',

    /**
     * Columns bootstrap size (1-12)
     * @type {number[]}
     */
    cols: [3, 6],

    /**
     * @type {object} the HTML attributes (name-value pairs) for the form tag.
     * @see \jii\helpers\Html.renderTagAttributes() for details on how attributes are being rendered.
     */
    options: {
        role: 'form'
    },

    /**
     * @type {string} the default CSS class for the error summary container.
     * @see errorSummary()
     */
    //errorSummaryCssClass: 'error-summary',

    /**
     * @type {string} the CSS class that is added to a field container when the associated attribute is required.
     */
    //requiredCssClass: 'required',

    /**
     * @type {string} the CSS class that is added to a field container when the associated attribute has validation error.
     */
    errorCssClass: 'has-error',

    /**
     * @type {string} the CSS class that is added to a field container when the associated attribute is successfully validated.
     */
    successCssClass: 'has-success',

    /**
     * @type {string} the CSS class that is added to a field container when the associated attribute is being validated.
     */
    //validatingCssClass: 'validating',

    /**
     * @type {boolean} whether to enable client-side data validation.
     */
    enableValidation: true,

    /**
     * @type {boolean} whether to perform validation when the form is submitted.
     */
    //validateOnSubmit: true,

    /**
     * @type {boolean} whether to perform validation when the value of an input field is changed.
     * If [[ActiveField.validateOnChange]] is set, its value will take precedence for that input field.
     */
    validateOnChange: true,

    /**
     * @type {boolean} whether to perform validation when an input field loses focus.
     * If [[ActiveField.validateOnBlur]] is set, its value will take precedence for that input field.
     */
    validateOnBlur: true,

    /**
     * @type {boolean} whether to perform validation while the user is typing in an input field.
     * If [[ActiveField.validateOnType]] is set, its value will take precedence for that input field.
     * @see validationDelay
     */
    validateOnType: false,

    /**
     * @type {number} number of milliseconds that the validation should be delayed when the user types in the field
     * and [[validateOnType]] is set true.
     * If [[ActiveField.validationDelay]] is set, its value will take precedence for that input field.
     */
    validationDelay: 500,

    /**
     * @type {boolean} whether to scroll to the first error after validation.
     * @since 2.0.6
     */
    //scrollToError: true,

    /*_initModel: function() {
        this.__super();

        if (!(this.model instanceof Jii.base.Model)) {
            throw new Jii.exceptions.InvalidConfigException('Param `model` is required for view `' + this.className() + '`');
        }
    },*/

    getChildContext: function() {
        return {
            form: this,
            model: this.model
        };
    },

    _onSubmit: function(e) {
        e.preventDefault();

        this.model.save().then(function(success) {
            if (success) {
                this.model.setOldAttributes(null);
            }
        }.bind(this));
    },

    render: function() {
        var options = Jii._.extend({}, this.options);
        options.className = (options.className || '')
            + (this.layout !== this.__static.LAYOUT_DEFAULT ? ' form-' + this.layout : '' );
        options.onSubmit = Jii.view.react.ReactView.wrapCallback(this.options.onSubmit, this._onSubmit.bind(this));

        return React.createElement('form', options, this.children);
    }

});
