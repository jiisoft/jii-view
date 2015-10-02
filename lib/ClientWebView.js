/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('jii');

require('./WebView');

/**
 * @class Jii.view.ClientWebView
 * @extends Jii.view.WebView
 */
Jii.defineClass('Jii.view.ClientWebView', {

	__extends: Jii.view.WebView,

	templates: {},

    getTemplate: function(path) {
        if (!this._templates[path]) {
            if (this.templates[path]) {
                this._templates[path] = Jii._.template(this.templates[path]);
            } else {
                Jii.warning('Not found template in path `' + path + '`, please require it.');
            }
        }
        return this._templates[path];
    }

});