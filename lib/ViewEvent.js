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
 * ViewEvent represents events triggered by the [[View]] component.
 *
 * @class Jii.view.ViewEvent
 * @extends Jii.base.Event
 */
Jii.defineClass('Jii.view.ViewEvent', /** @lends Jii.view.ViewEvent.prototype */{

	__extends: Jii.base.Event,

	/**
	 * @type {string} the view file being rendered.
	 */
	viewFile: null,

	/**
	 * @type {[]} the parameter array passed to the [[Jii.view.View.render()]] method.
	 */
	params: null,

	/**
	 * @type {string} the rendering result of [[Jii.view.View.renderFile()]].
	 * Event handlers may modify this property and the modified output will be
	 * returned by [[Jii.view.View.renderFile()]]. This property is only used
	 * by [[Jii.view.View.EVENT_AFTER_RENDER]] event.
	 */
	output: null,

	/**
	 * @type {boolean} whether to continue rendering the view file. Event handlers of
	 * [[Jii.view.View.EVENT_BEFORE_RENDER]] may set this property to decide whether
	 * to continue rendering the current view file.
	 */
	isValid: true

});