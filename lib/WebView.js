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

require('./View');

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
 * @class Jii.view.WebView
 * @extends Jii.view.View
 */
Jii.defineClass('Jii.view.WebView', {

	__extends: Jii.view.View,

	__static: {

		/**
		 * @event Event an event that is triggered by [[beginBody()]].
		 */
		EVENT_BEGIN_BODY: 'beginBody',

		/**
		 * @event Event an event that is triggered by [[endBody()]].
		 */
		EVENT_END_BODY: 'endBody',

		/**
		 * The location of registered JavaScript code block or files.
		 * This means the location is in the head section.
		 */
		POS_HEAD: 'head',

		/**
		 * The location of registered JavaScript code block or files.
		 * This means the location is at the beginning of the body section.
		 */
		POS_BEGIN: 'begin',

		/**
		 * The location of registered JavaScript code block or files.
		 * This means the location is at the end of the body section.
		 */
		POS_END: 'end',

		/**
		 * The location of registered JavaScript code block.
		 * This means the JavaScript code block will be enclosed within `jQuery(document).ready()`.
		 */
		POS_READY: 'ready',

		/**
		 * The location of registered JavaScript code block.
		 * This means the JavaScript code block will be enclosed within `jQuery(window).load()`.
		 */
		POS_LOAD: 'load',

		/**
		 * This is internally used as the placeholder for receiving the content registered for the head section.
		 */
		PH_HEAD: '<![CDATA[JII-BLOCK-HEAD]]>',

		/**
		 * This is internally used as the placeholder for receiving the content registered for the beginning of the body section.
		 */
		PH_BODY_BEGIN: '<![CDATA[JII-BLOCK-BODY-BEGIN]]>',

		/**
		 * This is internally used as the placeholder for receiving the content registered for the end of the body section.
		 */
		PH_BODY_END: '<![CDATA[JII-BLOCK-BODY-END]]>'

	},

	/**
	 * @type {Object<String, Jii.assets.AssetBundle|Boolean>} list of the registered asset bundles. The keys are the bundle names, and the values
	 * are the registered [[Jii.assets.AssetBundle]] objects.
	 * @see registerAssetBundle()
	 */
	assetBundles: {},

	/**
	 * @type {string} the page title
	 */
	title: null,

	/**
	 * @type {object} the registered meta tags.
	 * @see registerMetaTag()
	 */
	metaTags: {},

	/**
	 * @type {object} the registered link tags.
	 * @see registerLinkTag()
	 */
	linkTags: {},

	/**
	 * @type {object} the registered CSS code blocks.
	 * @see registerCss()
	 */
	css: {},

	/**
	 * @type {object} the registered CSS files.
	 * @see registerCssFile()
	 */
	cssFiles: {},

	/**
	 * @type {object} the registered JS code blocks
	 * @see registerJs()
	 */
	js: {},

	/**
	 * @type {object} the registered JS files.
	 * @see registerJsFile()
	 */
	jsFiles: {},

	/**
	 * @type {Jii.assets.AssetManager}
	 */
	_assetManager: null,

	/**
	 * @param {string} viewFile the view name.
	 * @param {object} [params] the parameters (name-value pairs) that will be extracted and made available in the view file.
	 * @param {object} [context] the context to be assigned to the view and can later be accessed via [[context]]
	 * in the view. If the context implements [[ViewContextInterface]], it may also be used to locate
	 * the view file corresponding to a relative view name.
	 * @returns {string} the rendering result
	 * @throws InvalidParamException if the view cannot be resolved or the view file does not exist.
	 * @see renderFile()
	 */
	renderLayout: function(viewFile, params, context) {
		params = params || {};
		context = context || null;

		var content = this.renderFile(viewFile, params, context);

		content = content.replace(this.__static.PH_HEAD, this._renderHeadHtml());
		content = content.replace(this.__static.PH_BODY_BEGIN, this._renderBodyBeginHtml());
		content = content.replace(this.__static.PH_BODY_END, this._renderBodyEndHtml());
		this.clear();

		return content;
	},

	/**
	 * Marks the position of an HTML head section.
	 */
	head: function () {
		return this.__static.PH_HEAD;
	},

	/**
	 * Marks the beginning of an HTML body section.
	 */
	beginBody: function () {
		this.trigger(this.__static.EVENT_BEGIN_BODY);
		return this.__static.PH_BODY_BEGIN;
	},

	/**
	 * Marks the ending of an HTML body section.
	 */
	endBody: function () {
		this.trigger(this.__static.EVENT_END_BODY);

		Jii._.each(Jii._.keys(this.assetBundles), function(bundle) {
			this._registerAssetFiles(bundle);
		}.bind(this));
		return this.__static.PH_BODY_END;
	},

	/**
	 * Registers the asset manager being used by this view object.
	 * @returns {Jii.assets.AssetManager} the asset manager. Defaults to the "assetManager" application component.
	 */
	getAssetManager: function () {
		return this._assetManager || Jii.app.getComponent('assetManager');
	},

	/**
	 * Sets the asset manager.
	 * @param {Jii.assets.AssetManager} value the asset manager
	 */
	setAssetManager: function (value) {
		this._assetManager = value;
	},

	/**
	 * Clears up the registered meta tags, link tags, css/js scripts and files.
	 */
	clear: function () {
		this.metaTags = {};
		this.linkTags = {};
		this.css = {};
		this.cssFiles = {};
		this.js = {};
		this.jsFiles = {};
		this.assetBundles = {};
	},

	/**
	 * Registers all files provided by an asset bundle including depending bundles files.
	 * Removes a bundle from [[assetBundles]] once files are registered.
	 * @param {string} name name of the bundle to register
	 */
	_registerAssetFiles: function (name) {
		if (!Jii._.has(this.assetBundles, name)) {
			return;
		}

		var bundle = this.assetBundles[name];
		if (bundle) {
			Jii._.each(bundle.depends, this._registerAssetFiles.bind(this));
			bundle.registerAssetFiles(this);
		}
		delete this.assetBundles[name];
	},

	/**
	 * Registers the named asset bundle.
	 * All dependent asset bundles will be registered.
	 * @param {string} name the class name of the asset bundle (without the leading backslash)
	 * @param {number|null} [position] if set, this forces a minimum position for javascript files.
	 * This will adjust depending assets javascript file position or fail if requirement can not be met.
	 * If this is null, asset bundles position settings will not be changed.
	 * See [[registerJsFile]] for more details on javascript position.
	 * @returns {Jii.assets.AssetBundle} the registered asset bundle instance
	 * @throws {Jii.exceptions.InvalidConfigException} if the asset bundle does not exist or a circular dependency is detected
	 */
	registerAssetBundle: function (name, position) {
		position = position || null;

		if (!this.assetBundles[name]) {
			var bundle = this.getAssetManager().getBundle(name);
			this.assetBundles[name] = false;

			// register dependencies
			var pos = bundle.jsOptions['position'] || null;
			Jii._.each(bundle.depends, function(dep) {
				this.registerAssetBundle(dep, pos);
			}.bind(this));
			this.assetBundles[name] = bundle;
		} else if (this.assetBundles[name] === false) {
			throw new Jii.exceptions.InvalidConfigException('A circular dependency is detected for bundle `' + name + '`.');
		} else {
			bundle = this.assetBundles[name];
		}

		if (position !== null) {
			pos = bundle.jsOptions['position'] || null;
			if (pos === null) {
				bundle.jsOptions['position'] = pos = position;
			} else if (pos > position) {
				throw new Jii.exceptions.InvalidConfigException('An asset bundle that depends on `' + name + '` has a higher javascript file position configured than `' + name + '`.');
			}

			// update position for all dependencies
			Jii._.each(bundle.depends, function(dep) {
				this.registerAssetBundle(dep, pos);
			}.bind(this));
		}

		return bundle;
	},

	/**
	 * Registers a meta tag.
	 * @param {object} options the HTML attributes for the meta tag.
	 * @param {string} [key] the key that identifies the meta tag. If two meta tags are registered
	 * with the same key, the latter will overwrite the former. If this is null, the new meta() tag
	 * will be appended to the existing ones.
	 */
	registerMetaTag: function (options, key) {
		key = key || Jii._.keys(this.metaTags).length;
		this.metaTags[key] = this._renderMetaTag(options);
	},

	/**
	 * Registers a link tag.
	 * @param {object} options the HTML attributes for the link tag.
	 * @param {string} [key] the key that identifies the link tag. If two link tags are registered
	 * with the same key, the latter will overwrite the former. If this is null, the new link() tag
	 * will be appended to the existing ones.
	 */
	registerLinkTag: function (options, key) {
		key = key || Jii._.keys(this.linkTags).length;
		this.linkTags[key] = this._renderLinkTag(options);
	},

	/**
	 * Registers a CSS code block.
	 * @param {string} css the CSS code block to be registered
	 * @param {object} [options] the HTML attributes for the style tag.
	 * @param {string} [key] the key that identifies the CSS code block. If null, it will use
	 * css as the key. If two CSS code blocks are registered with the same key, the latter
	 * will overwrite the former.
	 */
	registerCss: function (css, options, key) {
		options = options || {};
		key = key || null;

		if (!key) {
			key = Jii.helpers.String.hashCode(css);
		}
		this.css[key] = this._renderInlineStyle(css, options);
	},

	/**
	 * Registers a CSS file.
	 * @param {string} url the CSS file to be registered.
	 * @param {object} [options] the HTML attributes for the link tag. Please refer to [[Html.cssFile()]] for
	 * the supported options. The following options are specially handled and are not treated as HTML attributes:
	 *
	 * - `depends`: array, specifies the names of the asset bundles that this CSS file depends on.
	 *
	 * @param {string} [key] the key that identifies the CSS script file. If null, it will use
	 * url as the key. If two CSS files are registered with the same key, the latter
	 * will overwrite the former.
	 */
	registerCssFile: function (url, options, key) {
		options = options || {};
		key = key || null;

		url = Jii.getAlias(url);
		key = key || url;

		var depends = options.depends || null;
		delete options.depends;

		if (!depends) {
			this.cssFiles[key] = this._renderCssFile(url, options);
		} else {
			this.getAssetManager().bundles[key] = new Jii.assets.AssetBundle({
				baseUrl: '',
				css: [url.indexOf('//') === 0 ? url : Jii._s.ltrim(url, '/')],
				cssOptions: options,
				depends: depends
			});
			this.registerAssetBundle(key);
		}
	},

	/**
	 * Registers a JS code block.
	 * @param {String|Function} js the JS code block to be registered
	 * @param {String} [position] the position at which the JS script tag should be inserted
	 * in a page. The possible values are:
	 *
	 * - [[POS_HEAD]]: in the head section
	 * - [[POS_BEGIN]]: at the beginning of the body section
	 * - [[POS_END]]: at the end of the body section
	 * - [[POS_LOAD]]: enclosed within jQuery(window).load().
	 *   Note that by using this position, the method will automatically register the jQuery js file.
	 * - [[POS_READY]]: enclosed within jQuery(document).ready(). This is the default value.
	 *   Note that by using this position, the method will automatically register the jQuery js file.
	 *
	 * @param {String} [key] the key that identifies the JS code block. If null, it will use
	 * js as the key. If two JS code blocks are registered with the same key, the latter
	 * will overwrite the former.
	 */
	registerJs: function (js, position, key) {
		position = position || this.__static.POS_READY;
		key = key || null;

		if (Jii._.isFunction(js)) {
			js = Jii._s.trim(js.toString().replace(/^[^{]+\{/, '').replace(/}$/, ''));
		}

		if (!key) {
			key = Jii.helpers.String.hashCode(js);
		}

		this.js[position] = this.js[position] || {};
		this.js[position][key] = js;

		if (position === this.__static.POS_READY || position === this.__static.POS_LOAD) {
			// @todo JqueryAsset.register(this);
		}
	},

	/**
	 * Registers a JS file.
	 * @param {string} url the JS file to be registered.
	 * @param {object} [options] the HTML attributes for the script tag. The following options are specially handled
	 * and are not treated as HTML attributes:
	 *
	 * - `depends`: array, specifies the names of the asset bundles that this JS file depends on.
	 * - `position`: specifies where the JS script tag should be inserted in a page. The possible values are:
	 *     * [[POS_HEAD]]: in the head section
	 *     * [[POS_BEGIN]]: at the beginning of the body section
	 *     * [[POS_END]]: at the end of the body section. This is the default value.
	 *
	 * Please refer to [[Html.jsFile()]] for other supported options.
	 *
	 * @param {string} [key] the key that identifies the JS script file. If null, it will use
	 * url as the key. If two JS files are registered with the same key, the latter
	 * will overwrite the former.
	 */
	registerJsFile: function (url, options, key) {
		options = options || {};
		key = key || null;

		url = Jii.getAlias(url);
		key = key || url;

		var depends = options.depends || null;
		delete options.depends;

		if (!depends) {
			var position = options.position || this.__static.POS_END;
			delete options.position;

			this.jsFiles[position] = this.jsFiles[position] || {};
			this.jsFiles[position][key] = this._renderJsFile(url, options);
		} else {
			this.getAssetManager().bundles[key] = new Jii.assets.AssetBundle({
				baseUrl: '',
				js: [url.indexOf('//') === 0 ? url : Jii._s.ltrim(url, '/')],
				jsOptions: options,
				depends: depends
			});
			this.registerAssetBundle(key);
		}
	},

	/**
	 * Renders the content to be inserted in the head section.
	 * The content is rendered using the registered meta tags, link tags, CSS/JS code blocks and files.
	 * @returns {string} the rendered content
	 */
	_renderHeadHtml: function () {
		var lines = [];
		if (!Jii._.isEmpty(this.metaTags)) {
			lines.push(Jii._.values(this.metaTags).join('\n'));
		}

		if (!Jii._.isEmpty(this.linkTags)) {
			lines.push(Jii._.values(this.linkTags).join('\n'));
		}
		if (!Jii._.isEmpty(this.cssFiles)) {
			lines.push(Jii._.values(this.cssFiles).join('\n'));
		}
		if (!Jii._.isEmpty(this.css)) {
			lines.push(Jii._.values(this.css).join('\n'));
		}
		if (!Jii._.isEmpty(this.jsFiles[this.__static.POS_HEAD])) {
			lines.push(Jii._.values(this.jsFiles[this.__static.POS_HEAD]).join('\n'));
		}
		if (!Jii._.isEmpty(this.js[this.__static.POS_HEAD])) {
			lines.push(this._renderInlineScript(Jii._.values(this.js[this.__static.POS_HEAD]).join('\n'), this.__static.POS_HEAD));
		}

		return lines.join('\n');
	},

	/**
	 * Renders the content to be inserted at the beginning of the body section.
	 * The content is rendered using the registered JS code blocks and files.
	 * @returns {string} the rendered content
	 */
	_renderBodyBeginHtml: function () {
		var lines = [];
		if (!Jii._.isEmpty(this.jsFiles[this.__static.POS_BEGIN])) {
			lines.push(Jii._.values(this.jsFiles[this.__static.POS_BEGIN]).join('\n'));
		}
		if (!Jii._.isEmpty(this.js[this.__static.POS_BEGIN])) {
			lines.push(this._renderInlineScript(Jii._.values(this.js[this.__static.POS_BEGIN]).join('\n'), this.__static.POS_BEGIN));
		}

		return lines.join('\n');
	},

	/**
	 * Renders the content to be inserted at the end of the body section.
	 * The content is rendered using the registered JS code blocks and files.
	 * @returns {string} the rendered content
	 */
	_renderBodyEndHtml: function () {
		var lines = [];

		if (!Jii._.isEmpty(this.jsFiles[this.__static.POS_END])) {
			lines.push(Jii._.values(this.jsFiles[this.__static.POS_END]).join('\n'));
		}

		if (!Jii._.isEmpty(this.js[this.__static.POS_END])) {
			lines.push(this._renderInlineScript(Jii._.values(this.js[this.__static.POS_END]).join('\n'), this.__static.POS_END));
		}
		if (!Jii._.isEmpty(this.js[this.__static.POS_READY])) {
			lines.push(this._renderInlineScript(Jii._.values(this.js[this.__static.POS_READY]).join('\n'), this.__static.POS_READY));
		}
		if (!Jii._.isEmpty(this.js[this.__static.POS_LOAD])) {
			lines.push(this._renderInlineScript(Jii._.values(this.js[this.__static.POS_LOAD]).join('\n'), this.__static.POS_LOAD));
		}

		return lines.join('\n');
	},

	/**
	 *
	 * @param {String} css
	 * @param {Object} [options]
	 * @returns {String}
	 * @private
	 */
	_renderInlineStyle: function(css, options) {
		options = options || {};

		return '<style' + this._renderTagAttributes(options) + '>' + css + '</style>';
	},

	/**
	 *
	 * @param {Object} [options]
	 * @returns {String}
	 * @private
	 */
	_renderMetaTag: function(options) {
		options = options || {};

		return '<meta' + this._renderTagAttributes(options) + ' />';
	},

	/**
	 *
	 * @param {Object} [options]
	 * @returns {String}
	 * @private
	 */
	_renderLinkTag: function(options) {
		options = options || {};

		return '<link' + this._renderTagAttributes(options) + ' />';
	},

	/**
	 *
	 * @param {String} script
	 * @param {Number} [position]
	 * @returns {String}
	 * @private
	 */
	_renderInlineScript: function(script, position) {
		position = position || null;

		switch (position) {
			case this.__static.POS_READY:
				script = "jQuery(document).ready(function () {\n" + script + "\n});";
				break;

			case this.__static.POS_LOAD:
				script = "jQuery(window).load(function () {\n" + script + "\n});";
				break;
		}

		return '<script type="text/javascript">' + script + '</script>';
	},

	/**
	 *
	 * @param {String} file
	 * @param {object} [options]
	 * @returns {string}
	 * @private
	 */
	_renderCssFile: function(file, options) {
		options = options || {};

		options.href = file;
		options.rel = options.rel || 'stylesheet';

		var condition = options.condition || null;
		delete options.condition;

		var noscript = options.noscript || null;
		delete options.noscript;

		var link = '<link' + this._renderTagAttributes(options) + '>';
		if (condition) {
			link = '<!--[if ' + condition + ']>\n' + link + '\n<![endif]-->';
		} else if (noscript) {
			link = '<noscript>' + link + '</noscript>';
		}

		return link;
	},

	_renderJsFile: function(file, options) {
		options = options || {};

		options.src = file;

		var condition = options.condition || null;
		delete options.condition;

		var script = '<script' + this._renderTagAttributes(options) + '></script>';
		if (condition) {
			script = '<!--[if ' + condition + ']>\n' + script + '\n<![endif]-->';
		}

		return script;
	},

	_renderTagAttributes: function(options) {
		options = options || {};

		var attributes = '';
		Jii._.each(options, function(value, key) {
			attributes += ' ' + key + '="' + value + '"';
		});

		return attributes;
	}

});