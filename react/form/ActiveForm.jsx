'use strict';

var Jii = require('jii');
var ReactView = require('../ReactView');
var React = require('react');

/**
 * @class Jii.view.react.form.ActiveForm
 * @extends Jii.view.react.ReactView
 */
module.exports = Jii.defineClass('Jii.view.react.form.ActiveForm', /** @lends Jii.view.react.form.ActiveForm.prototype */{

    __extends: ReactView,

    __static: /** @lends Jii.view.react.form.ActiveForm */{

        LAYOUT_DEFAULT: 'default',
        LAYOUT_HORIZONTAL: 'horizontal',
        LAYOUT_INLINE: 'inline',

        childContextTypes: {
            form: React.PropTypes.object,
            model: React.PropTypes.object
        },

        /**
         * @alias {Jii.view.react.form.ActiveForm.prototype.props}
         */
        propTypes: {

            /**
             * @type {[]|string} action the form action URL. This parameter will be processed by [[\jii\helpers\Url.to()]].
             * @see method for specifying the HTTP method for this form.
             */
            action: React.PropTypes.array,

            /**
             * Layout: default, inline or horizontal
             * @type {string}
             */
            layout: React.PropTypes.string,

            /**
             * Columns bootstrap size (1-12)
             * @type {number[]}
             */
            cols: React.PropTypes.array,

            /**
             * @type {object} the HTML attributes (name-value pairs) for the form tag.
             * @see \jii\helpers\Html.renderTagAttributes() for details on how attributes are being rendered.
             */
            options: React.PropTypes.object,

            /**
             * @type {string} the default CSS class for the error summary container.
             * @see errorSummary()
             */
            errorSummaryCssClass: React.PropTypes.string,

            /**
             * @type {string} the CSS class that is added to a field container when the associated attribute is required.
             */
            requiredCssClass: React.PropTypes.string,

            /**
             * @type {string} the CSS class that is added to a field container when the associated attribute has validation error.
             */
            errorCssClass: React.PropTypes.string,

            /**
             * @type {string} the CSS class that is added to a field container when the associated attribute is successfully validated.
             */
            successCssClass: React.PropTypes.string,

            /**
             * @type {string} the CSS class that is added to a field container when the associated attribute is being validated.
             */
            validatingCssClass: React.PropTypes.string,

            /**
             * @type {boolean} whether to enable client-side data validation.
             */
            enableValidation: React.PropTypes.bool,

            /**
             * @type {boolean} whether to perform validation when the form is submitted.
             */
            validateOnSubmit: React.PropTypes.bool,

            /**
             * @type {boolean} whether to perform validation when the value of an input field is changed.
             * If [[ActiveField.validateOnChange]] is set, its value will take precedence for that input field.
             */
            validateOnChange: React.PropTypes.bool,

            /**
             * @type {boolean} whether to perform validation when an input field loses focus.
             * If [[ActiveField.validateOnBlur]] is set, its value will take precedence for that input field.
             */
            validateOnBlur: React.PropTypes.bool,

            /**
             * @type {boolean} whether to perform validation while the user is typing in an input field.
             * If [[ActiveField.validateOnType]] is set, its value will take precedence for that input field.
             * @see validationDelay
             */
            validateOnType: React.PropTypes.bool,

            /**
             * @type {number} number of milliseconds that the validation should be delayed when the user types in the field
             * and [[validateOnType]] is set true.
             * If [[ActiveField.validationDelay]] is set, its value will take precedence for that input field.
             */
            validationDelay: React.PropTypes.number

        },

        defaultProps: {
            action: null,
            layout: 'default',
            cols: [3, 6],
            options: {
                role: 'form'
            },
            errorSummaryCssClass: 'error-summary',
            requiredCssClass: 'required',
            errorCssClass: 'has-error',
            successCssClass: 'has-success',
            validatingCssClass: 'validating',
            enableValidation: true,
            validateOnSubmit: true,
            validateOnChange: true,
            validateOnBlur: true,
            validateOnType: false,
            validationDelay: 500
        }

    },

    init() {
        this._onSubmit = this._onSubmit.bind(this);
    },

    getChildContext() {
        return {
            form: this,
            model: this.props.model
        };
    },

    _onSubmit(e) {
        e.preventDefault();

        this.props.model.save().then(success => {
            if (success) {
                this.props.model.setOldAttributes(null);
            }
        });
    },

    render() {
        return (
            <div>
                <form
                    {...this.props.options}
                    className={[
                        this.props.options.className || '',
                        this.props.layout !== this.__static.LAYOUT_DEFAULT && 'form-' + this.props.layout || ''
                    ].join(' ')}
                    onSubmit={this._onSubmit}
                >
                    {this.props.children}
                </form>
            </div>
        );
    }

});
