'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('jii');

/**
 * @class Jii.view.react.form.Button
 * @extends Jii.view.react.ReactView
 */
Jii.defineClass('Jii.view.react.form.Button', /** @lends Jii.view.react.form.Button.prototype */{

    __extends: Jii.view.react.ReactView,

    __static: /** @lends Jii.view.react.form.Button */{

        contextTypes: {
            form: React.PropTypes.object.isRequired
        }

    },

    type: 'button',

    options: {
        className: 'form-group'
    },

    inputOptions: {
        className: 'btn btn-default'
    },

    render: function() {
        return React.createElement(
            'div',
            this.options,
            React.createElement(
                'div',
                {
                    className: this.context.form.layout === Jii.view.react.form.ActiveForm.LAYOUT_HORIZONTAL ?
                        'col-sm-offset-' +  + this.context.form.cols[0] + ' col-sm-' + this.context.form.cols[1] :
                        ''
                },
                this.renderButton()
            )
        );
    },

    renderButton: function() {
        var options = Jii._.clone(this.inputOptions);

        if (this.type === 'submit') {
            options.type = 'submit';
            options.value = String(this.children || '');
            return React.createElement('input', options);
        }

        return React.createElement('button', options, this.children);
    }

});
