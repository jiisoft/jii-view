'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('jii');

/**
 * @class Jii.view.react.form.Input
 * @extends Jii.view.react.ReactView
 */
Jii.defineClass('Jii.view.react.form.Input', /** @lends Jii.view.react.form.Input.prototype */{

    __extends: Jii.view.react.ReactView,

    /**
     * @type {string}
     */
    name: '',

    /**
     * @type {string}
     */
    placeholder: '',

    _initModel: function() {
        this.attributes = [this.name];
        this.__super();

        if (!(this.model instanceof Jii.base.Model)) {
            throw new Jii.exceptions.InvalidConfigException('Param `model` is required for view `' + this.className() + '`');
        }
    },

    _onFieldChange: function(e) {
        this.model.set(e.target.name, e.target.value.toString());
    },

    render: function() {
        var id = 'input' + this.name;

        return <div className="form-group">
                <label htmlFor={id} className="col-sm-2 control-label">{this.model.getAttributeLabel(this.name)}</label>

                <div className="col-sm-10">
                    <input type="text" name={this.name} className="form-control" id={id} placeholder={this.placeholder} value={this.state[this.name]} onChange={this._onFieldChange.bind(this)} />
                </div>
            </div>;
    }

});
