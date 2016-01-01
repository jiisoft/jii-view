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

    onSave: null,

    _initModel: function() {
        this.__super();

        if (!(this.model instanceof Jii.base.Model)) {
            throw new Jii.exceptions.InvalidConfigException('Param `model` is required for view `' + this.className() + '`');
        }
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
        return <form className="form-horizontal" onSubmit={this._onSubmit.bind(this)}>
            {this.children}
        </form>;
    }

});
