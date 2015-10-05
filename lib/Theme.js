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
 * Theme represents an application theme.
 *
 * When [[View]] renders a view file, it will check the [[View.theme|active theme]]
 * to see if there is a themed version of the view file exists. If so, the themed version will be rendered instead.
 *
 * A theme is a directory consisting of view files which are meant to replace their non-themed counterparts.
 *
 * Theme uses [[pathMap]] to achieve the view file replacement:
 *
 * 1. It first looks for a key in [[pathMap]] that is a substring of the given view file path;
 * 2. If such a key exists, the corresponding value will be used to replace the corresponding part
 *    in the view file path;
 * 3. It will then check if the updated view file exists or not. If so, that file will be used
 *    to replace the original view file.
 * 4. If Step 2 or 3 fails, the original view file will be used.
 *
 * For example, if [[pathMap]] is `{'@app/views': '@app/themes/basic'}`,
 * then the themed version for a view file `@app/views/site/index.php` will be
 * `@app/themes/basic/site/index.php`.
 *
 * It is possible to map a single path to multiple paths. For example,
 *
 * ~~~
 * 'pathMap' => {
 *     '@app/views': [
 *         '@app/themes/christmas',
 *         '@app/themes/basic',
 *     ],
 * }
 * ~~~
 *
 * In this case, the themed version could be either `@app/themes/christmas/site/index.php` or
 * `@app/themes/basic/site/index.php`. The former has precedence over the latter if both files exist.
 *
 * To use a theme, you should configure the [[View.theme|theme]] property of the "view" application
 * component like the following:
 *
 * ~~~
 * 'view' => {
 *     theme: [
 *         basePath: '@app/themes/basic',
 *         baseUrl: '@web/themes/basic',
 *     ],
 * },
 * ~~~
 *
 * The above configuration specifies a theme located under the "themes/basic" directory of the Web folder
 * that contains the entry script of the application. If your theme is designed to handle modules,
 * you may configure the [[pathMap]] property like described above.
 *
 * @property string basePath The root path of this theme. All resources of this theme are located under this
 * directory.
 * @property string baseUrl The base URL (without ending slash) for this theme. All resources of this theme
 * are considered to be under this base URL. This property is read-only.
 *
 * @class Jii.view.Theme
 * @extends Jii.base.Component
 */
Jii.defineClass('Jii.view.Theme', /** @lends Jii.view.Theme.prototype */{

	__extends: Jii.base.Component,

	/**
	 * @type {object} the mapping between view directories and their corresponding themed versions.
	 * This property is used by [[applyTo()]] when a view is trying to apply the theme.
	 * Path aliases can be used when specifying directories.
	 * If this property is empty or not set, a mapping [[Application.basePath]] to [[basePath]] will be used.
	 */
	pathMap: null,

	/**
	 * @type {string}
	 */
	_baseUrl: null,

	/**
	 * @returns {string} the base URL (without ending slash) for this theme. All resources of this theme are considered
	 * to be under this base URL.
	 */
	getBaseUrl: function () {
		return this._baseUrl;
	},

	/**
	 * @param {string} url the base URL or path alias for this theme. All resources of this theme are considered
	 * to be under this base URL.
	 */
	setBaseUrl: function (url) {
		this._baseUrl = Jii._s.rtrim(Jii.getAlias(url), '/');
	},

	/**
	 * @type {string}
	 */
	_basePath: null,

	/**
	 * @returns {string} the root path of this theme. All resources of this theme are located under this directory.
	 * @see pathMap
	 */
	getBasePath: function () {
		return this._basePath;
	},

	/**
	 * @param {string} path the root path or path alias of this theme. All resources of this theme are located
	 * under this directory.
	 * @see pathMap
	 */
	setBasePath: function (path) {
		this._basePath = Jii.getAlias(path);
	},

	/**
	 * Converts a file to a themed file if possible.
	 * If there is no corresponding themed file, the original file will be returned.
	 * @param {string} path the file to be themed
	 * @returns {string} the themed file, or the original file if the themed version is not available.
	 * @throws {Jii.exceptions.InvalidConfigException} if [[basePath]] is not set
	 */
	applyTo: function (path) {
		if (Jii._.isEmpty(this.pathMap)) {
			var basePath = this.getBasePath();
			if (basePath === null) {
				throw new Jii.exceptions.InvalidConfigException('The "basePath" property must be set.');
			}
			this.pathMap = {};
			this.pathMap[Jii.app.getBasePath()] = [basePath];
		}

		path = Jii.helpers.File.normalizePath(path);

		Jii._.each(this.pathMap, function(tos, from) {
			from = Jii.helpers.File.normalizePath(Jii.getAlias(from)) + '/';
			if (path.indexOf(from) === 0) {
				var n = from.length;

				if (!Jii._.isArray(tos)) {
					tos = [tos];
				}

				Jii._.each(tos, function(to) {
					to = Jii.helpers.File.normalizePath(Jii.getAlias(to)) + '/';
					var file = to + path.substr(n);
					if (Jii.helpers.File.isFile(file)) {
						return file;
					}
				});
			}
		});

		return path;
	},

	/**
	 * Converts a relative URL into an absolute URL using [[baseUrl]].
	 * @param {string} url the relative URL to be converted.
	 * @returns {string} the absolute URL
	 * @throws {Jii.exceptions.InvalidConfigException} if [[baseUrl]] is not set
	 */
	getUrl: function (url) {
		var baseUrl = this.getBaseUrl();
		if (baseUrl !== null) {
			return baseUrl +  '/' + Jii._s.ltrim(url, '/');
		} else {
			throw new Jii.exceptions.InvalidConfigException('The "baseUrl" property must be set.');
		}
	},

	/**
	 * Converts a relative file path into an absolute one using [[basePath]].
	 * @param {string} path the relative file path to be converted.
	 * @returns {string} the absolute file path
	 * @throws {Jii.exceptions.InvalidConfigException} if [[baseUrl]] is not set
	 */
	getPath: function (path) {
		var basePath = this.getBasePath();
		if (basePath !== null) {
			return basePath + '/' + Jii._s.ltrim(path, '/\\');
		} else {
			throw new Jii.exceptions.InvalidConfigException('The "basePath" property must be set.');
		}
	}

});