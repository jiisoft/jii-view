/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

'use strict';

var Jii = require('jii');
var String = require('jii/helpers/String');
var _trim = require('lodash/trim');
var _isFunction = require('lodash/isFunction');
var _has = require('lodash/has');
var View = require('./View');

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
module.exports = Jii.defineClass('Jii.view.WebView', /** @lends Jii.view.WebView.prototype */{

    __extends: View,

    __static: /** @lends Jii.view.WebView */{

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
         * @type {string}
         */
        DATA_KEY_NAME: 'data-jiiwebview',

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
     * @type {string}
     */
    docType: '<!DOCTYPE html>',

    /**
     * @type {string} the page title
     */
    title: '',

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
    js: {
        head: {},
        begin: {},
        end: {},
        ready: {},
        load: {}
    },

    /**
     * @type {object} the registered JS files.
     * @see registerJsFile()
     */
    jsFiles: {},

    /**
     * Registers a meta tag.
     * @param {object} options the HTML attributes for the meta tag.
     * @param {string} [key] the key that identifies the meta tag. If two meta tags are registered
     * with the same key, the latter will overwrite the former. If this is null, the new meta() tag
     * will be appended to the existing ones.
     */
    registerMetaTag(options, key) {
        options = options || {};
        key = key || String.hashCode(JSON.stringify(options));

        if (!_has(this.metaTags, key)) {
            options[this.__static.DATA_KEY_NAME] = key;
            this.metaTags[key] = this._registerMetaTagInternal(key, options);
        }
    },

    /**
     * Registers a link tag.
     * @param {object} options the HTML attributes for the link tag.
     * @param {string} [key] the key that identifies the link tag. If two link tags are registered
     * with the same key, the latter will overwrite the former. If this is null, the new link() tag
     * will be appended to the existing ones.
     */
    registerLinkTag(options, key) {
        options = options || {};
        key = key || String.hashCode(JSON.stringify(options));

        if (!_has(this.linkTags, key)) {
            options[this.__static.DATA_KEY_NAME] = key;
            this.linkTags[key] = this._registerLinkTagInternal(key, options);
        }
    },

    /**
     * Registers a CSS code block.
     * @param {string} css the CSS code block to be registered
     * @param {object} [options] the HTML attributes for the style tag.
     * @param {string} [key] the key that identifies the CSS code block. If null, it will use
     * css as the key. If two CSS code blocks are registered with the same key, the latter
     * will overwrite the former.
     */
    registerCss(css, options, key) {
        options = options || {};
        key = key || String.hashCode(css);

        if (!_has(this.css, key)) {
            options[this.__static.DATA_KEY_NAME] = key;
            this.css[key] = this._registerCssInternal(key, css, options);
        }
    },

    /**
     * Registers a CSS file.
     * @param {string} url the CSS file to be registered.
     * @param {object} [options] the HTML attributes for the link tag. Please refer to [[Html.cssFile()]] for
     * the supported options. The following options are specially handled and are not treated as HTML attributes:
     *
     * @param {string} [key] the key that identifies the CSS script file. If null, it will use
     * url as the key. If two CSS files are registered with the same key, the latter
     * will overwrite the former.
     */
    registerCssFile(url, options, key) {
        options = options || {};
        key = key || null;

        url = Jii.getAlias(url);
        key = key || String.hashCode(url);

        if (!_has(this.cssFiles, key)) {
            options.href = url;
            options.rel = options.rel || 'stylesheet';
            options[this.__static.DATA_KEY_NAME] = key;

            var condition = options.condition || null;
            delete options.condition;

            var noscript = options.noscript || null;
            delete options.noscript;

            this.cssFiles[key] = this._registerCssFileInternal(key, condition, noscript, options);
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
    registerJs(js, position, key) {
        if (_isFunction(js)) {
            js = _trim(js.toString().replace(/^[^{]+\{/, '').replace(/}$/, ''));
        }

        position = position || this.__static.POS_READY;
        key = key || String.hashCode(js);

        this.js[position] = this.js[position] || {};
        if (!_has(this.js[position], key)) {
            var options = {
                type: 'text/javascript'
            };

            options[this.__static.DATA_KEY_NAME] = key;
            this.js[position][key] = this._registerJsInternal(key, position, js, options);
        }
    },

    /**
     * Registers a JS file.
     * @param {string} url the JS file to be registered.
     * @param {object} [options] the HTML attributes for the script tag. The following options are specially handled
     * and are not treated as HTML attributes:
     *
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
    registerJsFile(url, options, key) {
        url = Jii.getAlias(url);
        options = options || {};
        key = key || String.hashCode(url);

        var position = options.position || this.__static.POS_END;
        delete options.position;

        options.src = url;
        this.jsFiles[position] = this.jsFiles[position] || {};
        if (!_has(this.jsFiles[position], key)) {
            options[this.__static.DATA_KEY_NAME] = key;

            var condition = options.condition || null;
            delete options.condition;

            this.jsFiles[position][key] = this._registerJsFileInternal(key, position, condition, options);
        }
    },

    /**
     *
     * @param {*} view
     * @param {Jii.base.Context} context
     * @param {object} params
     * @param {Jii.base.Controller} controller
     * @returns {Promise}
     */
    renderLayout(view, context, params, controller) {
        params = params || {};
        return Promise.resolve(this.getRenderer(view).renderLayout(view, context, params, controller, this));
    },

    clear() {
    },

    _registerMetaTagInternal(key, options) {
        return '';
    },

    _registerLinkTagInternal(key, options) {
        return '';
    },

    _registerCssInternal(key, code, options) {
        return '';
    },

    _registerCssFileInternal(key, condition, noscript, options) {
        return '';
    },

    _registerJsInternal(key, position, code, options) {
        return '';
    },

    _registerJsFileInternal(key, position, condition, options) {
        return '';
    },

    // @todo
    renderFile(view, params) {
        return this.renderers.underscore.renderFile(view, params, null, this);
    }

});