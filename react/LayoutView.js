'use strict';

var Jii = require('jii');
var ReactView = require('./ReactView');

/**
 * @class Jii.view.react.LayoutView
 * @extends Jii.view.react.ReactView
 */
module.exports = Jii.defineClass('Jii.view.react.LayoutView', /** @lends Jii.view.react.LayoutView.prototype */{

    __extends: ReactView,

    /**
     * @type {object}
     */
    state: {

        content: null

    }

});
