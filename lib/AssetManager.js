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
 * AssetManager manages asset bundle configuration and loading.
 *
 * AssetManager is configured as an application component in [[\jii\web\Application]] by default.
 * You can access that instance via `Jii.app.assetManager`.
 *
 * You can modify its configuration by adding an array to your application config under `components`
 * as shown in the following example:
 *
 * ```js
 * 'assetManager' => {
 *     bundles: [
 *         // you can override AssetBundle configs here
 *     ],
 * }
 * ```
 * 
 * @class Jii.view.AssetManager
 * @extends Jii.base.Component
 */
Jii.defineClass('Jii.view.AssetManager', {

	__extends: Jii.base.Component,

	__static: {

	},

	/**
	 * @type {object|boolean} list of asset bundle configurations. This property is provided to customize asset bundles.
	 * When a bundle is being loaded by [[getBundle()]], if it has a corresponding configuration specified here,
	 * the configuration will be applied to the bundle.
	 *
	 * The array keys are the asset bundle names, which typically are asset bundle class names without leading backslash.
	 * The array values are the corresponding configurations. If a value is false, it means the corresponding asset
	 * bundle is disabled and [[getBundle()]] should return null.
	 *
	 * If this property is false, it means the whole asset bundle feature is disabled and [[getBundle()]]
	 * will always return null.
	 *
	 * The following example shows how to disable the bootstrap css file used by Bootstrap widgets
	 * (because you want to use your own styles):
	 *
	 * ~~~
	 * {
     *     'jii\bootstrap\BootstrapAsset': [
     *         css: [],
     *     ],
     * }
	 * ~~~
	 */
	bundles: {},

	/**
	 * @returns {string} the root directory storing the published asset files.
	 */
	basePath: '@webroot/assets',

	/**
	 * @returns {string} the base URL through which the published asset files can be accessed.
	 */
	baseUrl: '@web/assets',

	/**
	 * @type {object} mapping from source asset files (keys) to target asset files (values).
	 *
	 * This property is provided to support fixing incorrect asset file paths in some asset bundles.
	 * When an asset bundle is registered with a view, each relative asset file in its [[AssetBundle.css|css]]
	 * and [[AssetBundle.js|js]] arrays will be examined against this map. If any of the keys is found
	 * to be the last part of an asset file,
	 * the corresponding value will replace the asset and be registered with the view.
	 * For example, an asset file `my/path/to/jquery.js` matches a key `jquery.js`.
	 *
	 * Note that the target asset files should be either absolute URLs or paths relative to [[baseUrl]] and [[basePath]].
	 *
	 * In the following example, any assets ending with `jquery.min.js` will be replaced with `jquery/dist/jquery.js`
	 * which is relative to [[baseUrl]] and [[basePath]].
	 *
	 * ```js
	 * {
     *     'jquery.min.js': 'jquery/dist/jquery.js',
     * }
	 * ```
	 */
	assetMap: {},

	/**
	 * @type {Boolean}
	 */
	concat: true,

	/**
	 * @type {Boolean|null}
	 */
	compress: null,

	/**
	 * @type {Boolean|null}
	 */
	watch: null,

	_dummyBundles: {},

	/**
	 * Initializes the component.
	 * @throws InvalidConfigException if [[basePath]] is invalid
	 */
	init: function () {
		this.__super();

		if (this.compress === null) {
			this.compress = Jii.app.environment === Jii.base.Application.ENVIRONMENT_PRODUCTION;
		}
		if (this.watch === null) {
			this.watch = Jii.app.environment === Jii.base.Application.ENVIRONMENT_DEVELOPMENT;
		}
		
		this.basePath = Jii.getAlias(this.basePath);
		/*if (!is_dir(this.basePath)) {
			throw new InvalidConfigException("The directory does not exist: {this.basePath}");
		} else if (!is_writable(this.basePath)) {
			throw new InvalidConfigException("The directory is not writable by the Web process: {this.basePath}");
		} else {
			this.basePath = realpath(this.basePath);
		}*/
		this.baseUrl = Jii._s.rtrim(Jii.getAlias(this.baseUrl), '/');
	},

	/**
	 * Returns the named asset bundle.
	 *
	 * This method will first look for the bundle in [[bundles]]. If not found,
	 * it will treat `name` as the class of the asset bundle and create a new instance() of it.
	 *
	 * @param {string} name the class name of the asset bundle (without the leading backslash)
	 * @returns {Jii.view.AssetBundle} the asset bundle instance
	 * @throws {Jii.exceptions.InvalidConfigException} if name does not refer to a valid asset bundle
	 */
	getBundle: function (name) {
		if (this.bundles === false) {
			return this._loadDummyBundle(name);
		} else if (!this.bundles[name]) {
			return this.bundles[name] = this._loadBundle(name);
		} else if (this.bundles[name] instanceof Jii.view.AssetBundle) {
			return this.bundles[name];
		} else if (Jii._.isObject(this.bundles[name])) {
			return this.bundles[name] = this._loadBundle(name, this.bundles[name]);
		} else if (this.bundles[name] === false) {
			return this._loadDummyBundle(name);
		}

		throw new Jii.exceptions.InvalidConfigException('Invalid asset bundle configuration: ' + name);
	},

	/**
	 *
	 * @returns {Jii.view.AssetBundle[]}
	 */
	getBundles: function() {
		return Jii._.map(Jii._.keys(this.bundles), function(name) {
			return this.getBundle(name);
		}.bind(this));
	},

	/**
	 * Loads asset bundle class by name
	 *
	 * @param {string} name bundle name
	 * @param {object} [config] bundle object configuration
	 * @returns {Jii.view.AssetBundle}
	 * @throws InvalidConfigException if configuration isn't valid
	 */
	_loadBundle: function (name, config) {
		config = config || {};

		if (!config['className']) {
			config['className'] = name;
		}

		return Jii.createObject(config);
	},

	/**
	 * Loads dummy bundle by name
	 *
	 * @param {string} name
	 * @returns {Jii.view.AssetBundle}
	 */
	_loadDummyBundle: function (name) {
		if (!this._dummyBundles[name]) {
			this._dummyBundles[name] = this._loadBundle(name, {
				js: [],
				css: [],
				depends: []
			});
		}
		return this._dummyBundles[name];
	},

	/**
	 * Returns the actual URL for the specified asset.
	 * The actual URL is obtained by prepending either [[baseUrl]] or [[AssetManager.baseUrl]] to the given asset path.
	 * @param {Jii.view.AssetBundle} bundle the asset bundle which the asset file belongs to
	 * @returns {string} the actual URL for the specified asset.
	 */
	getPackageUrl: function (bundle, ext) {
		return this.baseUrl + '/' + bundle.getPackageName() + '.' + ext;
	},

	/**
	 * Returns the actual file path for the specified asset.
	 * @param {Jii.view.AssetBundle} bundle the asset bundle which the asset file belongs to
	 * @returns {string} the actual file path, or false if the asset is specified as an absolute URL
	 */
	getPackagePath: function (bundle, ext) {
		return this.basePath + '/' + bundle.getPackageName() + '.' + ext;
	},

	/**
	 * Returns the actual URL for the specified asset.
	 * The actual URL is obtained by prepending either [[baseUrl]] or [[AssetManager.baseUrl]] to the given asset path.
	 * @param {Jii.view.AssetBundle} bundle the asset bundle which the asset file belongs to
	 * @param {string} asset the asset path. This should be one of the assets listed in [[js]] or [[css]].
	 * @returns {string} the actual URL for the specified asset.
	 */
	getAssetUrl: function (bundle, asset) {
		var actualAsset = this._resolveAsset(bundle, asset);
		if (actualAsset !== false) {
			return Jii.helpers.Url.isRelative(actualAsset) ? this.baseUrl + '/' + actualAsset : actualAsset;
		}
// @todo appendTimestamp
		return Jii.helpers.Url.isRelative(asset) ? bundle.baseUrl + '/' + asset : asset;
	},

	/**
	 * Returns the actual file path for the specified asset.
	 * @param {Jii.view.AssetBundle} bundle the asset bundle which the asset file belongs to
	 * @param {string} asset the asset path. This should be one of the assets listed in [[js]] or [[css]].
	 * @returns {string|boolean} the actual file path, or false if the asset is specified as an absolute URL
	 */
	getAssetPath: function (bundle, asset) {
		var actualAsset = this._resolveAsset(bundle, asset);
		if (actualAsset !== false) {
			return Jii.helpers.Url.isRelative(actualAsset) ? this.basePath + '/' + actualAsset : false;
		}

		return Jii.helpers.Url.isRelative(asset) ? bundle.basePath + '/' + asset : false;
	},

	/**
	 * @param {Jii.view.AssetBundle} bundle
	 * @param {string} asset
	 * @returns {string|boolean}
	 */
	_resolveAsset: function (bundle, asset) {
		if (this.assetMap[asset]) {
			return this.assetMap[asset];
		}

		var n = asset.length;
		for (var from in this.assetMap) {
			if (this.assetMap.hasOwnProperty(from)) {
				var n2 = from.length;
				var offset = n - n2;

				if (n2 <= n && asset.substr(offset, n2) === from.substr(0, n2)) {
					return this.assetMap[from];
				}
			}
		}

		return false;
	}

});