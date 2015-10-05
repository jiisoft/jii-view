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

/**
 * ViewRenderer is the base class for view renderer classes.
 * @class Jii.view.ViewRenderer
 * @extends Jii.base.Component
 */
Jii.defineClass('Jii.view.ViewRenderer', /** @lends Jii.view.ViewRenderer.prototype */{

	__extends: Jii.base.Component,

	/**
	 * Renders a view file.
	 *
	 * This method is invoked by [[View]] whenever it tries to render a view.
	 * Child classes must implement this method to render the given view file.
	 *
	 * @param {Jii.view.BaseView} view the view object used for rendering the file.
	 * @param {string} file the view file.
	 * @param {object} params the parameters to be passed to the view file.
	 * @return string the rendering result
	 */
	render: function(view, file, params) {
	}

});