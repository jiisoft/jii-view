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
 * AssetBundle represents a collection of asset files, such as CSS, JS, images.
 *
 * Each asset bundle has a unique name that globally identifies it among all asset bundles used in an application.
 * The name is the [fully qualified class name](http://php.net/manual/en/language.namespaces.rules.php)
 * of the class representing it.
 *
 * An asset bundle can depend on other asset bundles. When registering an asset bundle
 * with a view, all its dependent asset bundles will be automatically registered.
 *
 * @class Jii.view.AssetBundle
 * @extends Jii.base.Object
 */
Jii.defineClass('Jii.view.AssetBundle', {

	__extends: Jii.base.Object,

	__static: {

		/**
		 * Registers this asset bundle with a view.
		 * @param {Jii.view.WebView} view the view to be registered with
		 * @returns {Jii.view.AssetBundle} the registered asset bundle instance
		 */
		register: function (view) {
			return view.registerAssetBundle(this.__static.className());
		}
	},

	/**
	 * @type {string} the Web-accessible directory that contains the asset files in this bundle.
	 *
	 * You can use either a directory or an alias of the directory.
	 */
	basePath: null,

	/**
	 * @type {string} the base URL for the relative asset files listed in [[js]] and [[css]].
	 *
	 * You can use either a URL or an alias of the URL.
	 */
	baseUrl: null,

	/**
	 * @type {string[]} list of bundle class names that this bundle depends on.
	 *
	 * For example:
	 *
	 * ```js
	 * depends: null,

	 *    'jii\web\JiiAsset',
	 *    'jii\bootstrap\BootstrapAsset',
	 * ];
	 * ```
	 */
	depends: [],

	/**
	 * @type {string[]} list of JavaScript files that this bundle contains. Each JavaScript file can be
	 * specified in one of the following formats:
	 *
	 * - an absolute URL representing an external asset. For example,
	 *   `http://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js` or
	 *   `//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js`.
	 * - a relative path representing a local asset (e.g. `js/main.js`). The actual file path of a local
	 *   asset can be determined by prefixing [[basePath]] to the relative path, and the actual URL
	 *   of the asset can be determined by prefixing [[baseUrl]] to the relative path.
	 *
	 * Note that only forward slash "/" should be used as directory separators.
	 */
	js: [],

	/**
	 * @type {string[]}
	 */
	templates: [],

	/**
	 * @type {[]} list of CSS files that this bundle contains. Each CSS file can be specified
	 * in one of the three formats as explained in [[js]].
	 *
	 * Note that only forward slash "/" can be used as directory separator.
	 */
	css: [],

	/**
	 * @type {object} the options that will be passed to [[View.registerJsFile()]]
	 * when registering the JS files in this bundle.
	 */
	jsOptions: {},

	/**
	 * @type {object} the options that will be passed to [[View.registerCssFile()]]
	 * when registering the CSS files in this bundle.
	 */
	cssOptions: {},

	/**
	 * @type {Boolean|null}
	 */
	concat: null,

	/**
	 * @type {Boolean|null}
	 */
	compress: null,

	/**
	 * @type {Boolean|null}
	 */
	watch: null,

	/**
	 * @type {String}
	 */
	_concatName: null,

	/**
	 * Initializes the bundle.
	 * If you override this method, make sure you call the parent implementation in the last.
	 */
	init: function () {
		if (this.basePath !== null) {
			this.basePath = Jii._s.rtrim(Jii.getAlias(this.basePath), '/\\');
		}
		if (this.baseUrl !== null) {
			this.baseUrl = Jii._s.rtrim(Jii.getAlias(this.baseUrl), '/');
		}
	},

	getPackageName: function() {
		if (this._concatName === null) {
			this._concatName = this.className().replace(/.*\.([^.]+)$/, '$1').replace(/Asset$/, '').toLowerCase() +
				'-' + Jii.helpers.String.hashCode(this.className());
		}
		return this._concatName;
	},

	/**
	 * @param {Jii.view.AssetManager} assetManager
	 * @returns {object}
	 */
	getFilesGroupedByExtension: function(assetManager) {
		var files = {};

		Jii._.each([].concat(this.js).concat(this.css), function(path) {
			var ext = Jii.helpers.File.getFileExtension(path);

			files[ext] = files[ext] || [];
			files[ext].push(assetManager.getAssetPath(this, path));
		}.bind(this));

		return files;
	},

	/**
	 * Registers the CSS and JS files with the given view.
	 * @param {Jii.view.WebView} view the view that the asset files are to be registered with.
	 */
	registerAssetFiles: function (view) {
		var manager = view.getAssetManager();

		// Check is moved to package
		var concat = this.concat !== null ? this.concat : manager.concat;
		if (concat) {
			if (this.js.length) {
				view.registerJsFile(manager.getPackageUrl(this, 'js'), this.jsOptions);
			}
			if (this.css.length) {
				view.registerCssFile(manager.getPackageUrl(this, 'css'), this.cssOptions);
			}
		} else {
			Jii._.each(this.js, function(js) {
				view.registerJsFile(manager.getAssetUrl(this, js), this.jsOptions);
			}.bind(this));
			Jii._.each(this.css, function(css) {
				view.registerCssFile(manager.getAssetUrl(this, css), this.cssOptions);
			}.bind(this));
		}
	}

});