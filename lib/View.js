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
 * View represents a view object in the MVC pattern.
 * View provides a set of methods (e.g. [[render()]]) for rendering purpose.
 * @class Jii.view.View
 * @extends Jii.base.Component
 */
Jii.defineClass('Jii.view.View', {

	__extends: Jii.base.Component,

	__static: {

		/**
		 * @event ViewEvent an event that is triggered by [[renderFile()]] right before it renders a view file.
		 */
		EVENT_BEFORE_RENDER: 'beforeRender',
		/**
		 * @event ViewEvent an event that is triggered by [[renderFile()]] right after it renders a view file.
		 */
		EVENT_AFTER_RENDER: 'afterRender',

		_extensionRegExp: /\.([a-z]+)$/
	},

	/**
	 * @type {mixed} custom parameters that are shared among view templates.
	 */
	params: null,

	/**
	 * @type {object} a list of available renderers indexed by their corresponding supported file extensions.
	 * Each renderer may be a view renderer object or the configuration for creating the renderer object.
	 * For example, the following configuration enables both Smarty and Twig view renderers:
	 *
	 * ~~~
	 * {
		 *     tpl: [class: 'jii\smarty\ViewRenderer'],
		 *     twig: [class: 'jii\twig\ViewRenderer'],
		 * }
	 * ~~~
	 *
	 * If no renderer is available for the given view file, the view file will be treated as a normal PHP
	 * and rendered via [[renderPhpFile()]].
	 */
	renderers: {},

	/**
	 * @type {string} the default view file extension. This will be appended to view file names if they don't have file extensions.
	 */
	defaultExtension: '',

	/**
	 * @type {Jii.view.Theme|[]|string} the theme object or the configuration for creating the theme object.
	 * If not set, it means theming is not enabled.
	 */
	theme: null,

	/**
	 * @type {[]} a list of named output blocks. The keys are the block names and the values
	 * are the corresponding block content. You can call [[beginBlock()]] and [[endBlock()]]
	 * to capture small fragments of a view. They can be later accessed somewhere else
	 * through this property.
	 */
	blocks: null,

	/**
	 * @type {[]} a list of currently active fragment cache widgets. This property
	 * is used internally to implement the content caching feature. Do not modify it directly.
	 * @internal
	 */
	cacheStack: null,

	/**
	 * @type {[]} a list of placeholders for embedding dynamic contents. This property
	 * is used internally to implement the content caching feature. Do not modify it directly.
	 * @internal
	 */
	dynamicPlaceholders: null,

	/**
	 * @type {[]} the view files currently being rendered. There may be multiple view files being
	 * rendered at a moment because one view may be rendered within another.
	 */
	_viewFiles: [],

	/**
	 * @type {object}
	 */
	_templates: {},

	/**
	 * Initializes the view component.
	 */
	init: function () {
		this.__super();

		if (Jii._.isObject(this.theme)) {
			if (!this.theme.className) {
				this.theme.className = 'Jii.view.Theme';
			}
			this.theme = Jii.createObject(this.theme);
		} else if (Jii._.isString(this.theme)) {
			this.theme = Jii.createObject(this.theme);
		}
	},

	/**
	 * Renders a view.
	 *
	 * The view to be rendered can be specified in one of the following formats:
	 *
	 * - path alias (e.g. "@app/views/site/index");
	 * - absolute path within application (e.g. "//site/index"): the view name starts with double slashes.
	 *   The actual view file will be looked for under the [[Application.viewPath|view path]] of the application.
	 * - absolute path within current module (e.g. "/site/index"): the view name starts with a single slash.
	 *   The actual view file will be looked for under the [[Module.viewPath|view path]] of the [[Controller.module|current module]].
	 * - relative view (e.g. "index"): the view name does not start with `@` or `/`. The corresponding view file will be
	 *   looked for under the [[ViewContextInterface.getViewPath()|view path]] of the view `context`.
	 *   If `context` is not given, it will be looked for under the directory containing the view currently
	 *   being rendered (i.e., this happens when rendering a view within another view).
	 *
	 * @param {string} view the view name.
	 * @param {object} [params] the parameters (name-value pairs) that will be extracted and made available in the view file.
	 * @param {object} [context] the context to be assigned to the view and can later be accessed via [[context]]
	 * in the view. If the context implements [[ViewContextInterface]], it may also be used to locate
	 * the view file corresponding to a relative view name.
	 * @returns {string} the rendering result
	 * @throws InvalidParamException if the view cannot be resolved or the view file does not exist.
	 * @see renderFile()
	 */
	render: function (view, params, context) {
		params = params || {};
		context = context || null;

		var viewFile = this._findViewFile(view, context);
		return this.renderFile(viewFile, params, context);
	},

	/**
	 * Finds the view file based on the given view name.
	 * @param {string} view the view name or the path alias of the view file. Please refer to [[render()]]
	 * on how to specify this parameter.
	 * @param {object} context the context to be assigned to the view and can later be accessed via [[context]]
	 * in the view. If the context implements [[ViewContextInterface]], it may also be used to locate
	 * the view file corresponding to a relative view name.
	 * @returns {string} the view file path. Note that the file may not exist.
	 * @throws InvalidCallException if a relative view name is given while there is no active context to
	 * determine the corresponding view file.
	 */
	_findViewFile: function (view, context) {
		context = context || null;

		var file = null;

		if (view.substr(0, 1) === '@') {
			// e.g. "@app/views/main"
			file = Jii.getAlias(view);
		} else if (view.substr(0, 2) === '//') {
			// e.g. "//layouts/main"
			file = Jii.app.getViewPath() + '/' + Jii._.ltrim(view, '/');
		} else if (view.substr(0, 1) === '/') {
			// e.g. "/site/index"
			if (context instanceof Jii.base.Controller) {
				file = context.module.getViewPath() + '/' + Jii._s.ltrim(view, '/');
			} else {
				throw new Jii.exceptions.InvalidCallException('Unable to locate view file for view ' + view + ': no active controller.');
			}
		} else if (Jii._.isObject(context) && Jii._.isFunction(context.getViewPath)) {
			file = context.getViewPath() + '/' + view;
		} else {
			var currentViewFile = this.getViewFile();
			if (currentViewFile !== false) {
				file = Jii.helpers.File.getFileDirecroty(currentViewFile) + '/' + view;
			} else {
				throw new Jii.exceptions.InvalidCallException('Unable to resolve view file for view ' + view + ': no active view context.');
			}
		}

		if (Jii.helpers.File.getFileExtension(file) !== '') {
			return file;
		}

		var path = file + '.' + this.defaultExtension;
		if (this.defaultExtension !== 'ejs' && !Jii.helpers.File.getFileExtension(path)) {
			path = file + '.ejs';
		}

		return path;
	},

	/**
	 * Renders a view file.
	 *
	 * If [[theme]] is enabled (not null), it will try to render the themed version of the view file as long
	 * as it is available.
	 *
	 * The method will call [[FileHelper.localize()]] to localize the view file.
	 *
	 * If [[renderers|renderer]] is enabled (not null), the method will use it to render the view file.
	 * Otherwise, it will simply include the view file as a normal PHP file, capture its output and
	 * return it as a string.
	 *
	 * @param {string} viewFile the view file. This can be either an absolute file path or an alias of it.
	 * @param {[]} [params] the parameters (name-value pairs) that will be extracted and made available in the view file.
	 * @param {object} [context] the context that the view should use for rendering the view. If null,
	 * existing [[context]] will be used.
	 * @returns {string} the rendering result
	 * @throws InvalidParamException if the view file does not exist
	 */
	renderFile: function (viewFile, params, context) {
		params = params || {};
		context = context || null;

		viewFile = Jii.getAlias(viewFile);

		if (this.theme !== null) {
			viewFile = this.theme.applyTo(viewFile);
		}
		if (this.hasTemplate(viewFile)) {
			viewFile = this._localize(viewFile);
		} else {
			throw new Jii.exceptions.InvalidParamException('The view file does not exist: ' + viewFile);
		}

		var output = '';
		this._viewFiles.push(viewFile);

		if (this.beforeRender(viewFile, params)) {
			Jii.trace('Rendering view file: ' + viewFile);

			var ext = Jii.helpers.File.getFileExtension(viewFile);
			if (this.renderers[ext]) {
				if (Jii._.isObject(this.renderers[ext]) || Jii._.isString(this.renderers[ext])) {
					this.renderers[ext] = Jii.createObject(this.renderers[ext]);
				}
				/** @typedef {Jii.view.ViewRenderer} renderer */
				var renderer = this.renderers[ext];
				output = renderer.render(this, viewFile, params);
			} else {
				output = this.renderJsFile(viewFile, params);
			}
			output = this.afterRender(viewFile, params, output);
		}

		this._viewFiles.pop();
		return output;
	},

	/**
	 * Returns the localized version of a specified file.
	 *
	 * The searching is based on the specified language code. In particular,
	 * a file with the same name will be looked for under the subdirectory
	 * whose name is the same as the language code. For example, given the file "path/to/view.php"
	 * and language code "zh-CN", the localized file will be looked for as
	 * "path/to/zh-CN/view.php". If the file is not found, it will try a fallback with just a language code that is
	 * "zh" i.e. "path/to/zh/view.php". If it is not found as well the original file will be returned.
	 *
	 * If the target and the source language codes are the same,
	 * the original file will be returned.
	 *
	 * @param {string} file the original file
	 * @param {string} [language] the target language that the file should be localized to.
	 * If not set, the value of [[\jii\base\Application.language]] will be used.
	 * @param {string} [sourceLanguage] the language that the original file is in.
	 * If not set, the value of [[\jii\base\Application.sourceLanguage]] will be used.
	 * @returns {string} the matching localized file, or the original file if the localized version is not found.
	 * If the target and the source language codes are the same, the original file will be returned.
	 */
	_localize: function (file, language, sourceLanguage) {
		language = language || null;
		sourceLanguage = sourceLanguage || null;

		if (language === null) {
			language = Jii.app.language;
		}
		if (sourceLanguage === null) {
			sourceLanguage = Jii.app.sourceLanguage;
		}
		if (language === sourceLanguage) {
			return file;
		}

		var desiredFile = this.getFileDirecroty(file) + '/' + language + '/' + this.getFileName(file);
		if (this.hasTemplate(desiredFile)) {
			return desiredFile;
		}

		language = language.substr(0, 2);
		if (language === sourceLanguage) {
			return file;
		}

		desiredFile = this.getFileDirecroty(file) + '/' + language + '/' + this.getFileName(file);
		return this.hasTemplate(desiredFile) ? desiredFile : file;
	},

	hasTemplate: function(path) {
		return this.getTemplate(path) !== null;
	},

	getTemplate: function(path) {
		path = Jii.helpers.File.normalizePath(path);

		var basePath = Jii.app.getBasePath();
		if (path.indexOf(basePath) === 0) {
			path = path.substr(basePath.length);
		}

		return this._templates[path] || null;
	},

	/**
	 * @returns {string|boolean} the view file currently being rendered. False if no view file is being rendered.
	 */
	getViewFile: function () {
		return this._viewFiles[this._viewFiles.length - 1];
	},

	/**
	 * This method is invoked right before [[renderFile()]] renders a view file.
	 * The default implementation will trigger the [[EVENT_BEFORE_RENDER]] event.
	 * If you override this method, make sure you call the parent implementation first.
	 * @param {string} viewFile the view file to be rendered.
	 * @param {[]} params the parameter array passed to the [[render()]] method.
	 * @returns {boolean} whether to continue rendering the view file.
	 */
	beforeRender: function (viewFile, params) {
		var event = new Jii.view.ViewEvent({
			viewFile: viewFile,
			params: params
		});
		this.trigger(this.__static.EVENT_BEFORE_RENDER, event);

		return event.isValid;
	},

	/**
	 * This method is invoked right after [[renderFile()]] renders a view file.
	 * The default implementation will trigger the [[EVENT_AFTER_RENDER]] event.
	 * If you override this method, make sure you call the parent implementation first.
	 * @param {string} viewFile the view file being rendered.
	 * @param {[]} params the parameter array passed to the [[render()]] method.
	 * @param {string} output the rendering result of the view file. Updates to this parameter
	 * will be passed back and returned by [[renderFile()]].
	 */
	afterRender: function (viewFile, params, output) {
		if (this.hasEventHandlers(this.__static.EVENT_AFTER_RENDER)) {
			var event = new Jii.view.ViewEvent({
				viewFile: viewFile,
				params: params,
				output: output
			});
			this.trigger(this.__static.EVENT_AFTER_RENDER, event);
			output = event.output;
		}
		return output;
	},

	/**
	 * Renders a view file as a PHP script.
	 *
	 * This method treats the view file as a PHP script and includes the file.
	 * It extracts the given parameters and makes them available in the view file.
	 * The method captures the output of the included view file and returns it as a string.
	 *
	 * This method should mainly be called by view renderer or [[renderFile()]].
	 *
	 * @param {string} file the view file.
	 * @param {object} [params] the parameters (name-value pairs) that will be extracted and made available in the view file.
	 * @returns {string} the rendering result
	 */
	renderJsFile: function (file, params) {
		params = params || {};

		if (!this._templates[file]) {
			throw new Jii.exceptions.ApplicationException('Not found template in path `' + file + '`.');
		}

        params.Jii = Jii;

		return this._templates[file].call(this, params);
	}

});