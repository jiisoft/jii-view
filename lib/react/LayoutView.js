'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('jii');

require('./ReactView');

/**
 * @class Jii.view.react.LayoutView
 * @extends Jii.view.react.ReactView
 */
Jii.defineClass('Jii.view.react.LayoutView', /** @lends Jii.view.react.LayoutView.prototype */{

    __extends: 'Jii.view.react.ReactView',

    /**
     * @type {object}
     */
    state: {

        content: null

    }

});
