'use strict';

var Jii = require('jii');
var ReactView = require('../ReactView');
var React = require('react');

/**
 * @class Jii.view.react.form.Button
 * @extends Jii.view.react.ReactView
 */
module.exports = Jii.defineClass('Jii.view.react.form.Button', /** @lends Jii.view.react.form.Button.prototype */{

    __extends: ReactView,

    __static: /** @lends Jii.view.react.form.Button */{

        /**
         * @alias {Jii.view.react.form.Button.prototype.context}
         */
        contextTypes: {

            /**
             * @type {Jii.view.react.form.ActiveForm}
             */
            form: React.PropTypes.object.isRequired

        },

        /**
         * @alias {Jii.view.react.form.Button.prototype.props}
         */
        propTypes: {

            type: React.PropTypes.string,

            options: React.PropTypes.object,

            inputOptions: React.PropTypes.object

        },

        defaultProps: {

            type: 'button',

            options: {
                className: 'form-group'
            },

            inputOptions: {
                className: 'btn btn-default'
            }

        }

    },

    render() {
        return (
            <div
                {...this.props.options}
            >
                <div
                    className={
                        this.context.form.props.layout === Jii.view.react.form.ActiveForm.LAYOUT_HORIZONTAL ?
                            'col-sm-offset-' +  + this.context.form.props.cols[0] + ' col-sm-' + this.context.form.props.cols[1] :
                            ''
                    }
                >
                    {this.renderButton()}
                </div>
            </div>
        );
    },

    renderButton() {
        if (this.props.type === 'submit') {
            return (
                <input
                    {...this.props.inputOptions}
                    type='submit'
                    value={String(this.props.children || '')}
                />
            );
        }

        return (
            <button {...this.props.inputOptions}>
                {this.props.children}
            </button>
        );
    }

});
