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
 * View represents a view object in the MVC pattern.
 *
 * View provides a set of methods (e.g. [[render()]]) for rendering purpose.
 *
 * View is configured as an application component in [[\yii\base\Application]] by default.
 * You can access that instance via `Yii::$app->view`.
 *
 * You can modify its configuration by adding an array to your application config under `components`
 * as it is shown in the following example:
 *
 * ~~~
 * 'view' => [
 *     'theme' => 'app\themes\MyTheme',
 *     'renderers' => [
 *         // you may add Smarty or Twig renderer here
 *     ]
 *     // ...
 * ]
 * ~~~
 *
 * @class Jii.view.ServerWebView
 * @extends Jii.view.WebView
 */
Jii.defineClass('Jii.view.ServerWebView', /** @lends Jii.view.ServerWebView.prototype */{

	__extends: Jii.view.WebView,

	// @todo Временное решение
	getTemplate: function(path) {
		this._templates[path] = Jii._.template(require('fs').readFileSync(path));
		return this._templates[path] || null;
	}

});