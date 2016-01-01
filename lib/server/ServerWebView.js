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
 * @class Jii.view.ServerWebView
 * @extends Jii.view.WebView
 */
Jii.defineClass('Jii.view.ServerWebView', /** @lends Jii.view.ServerWebView.prototype */{

    __extends: 'Jii.view.WebView',

    /**
     *
     * @param {*} view
     * @param {Jii.base.Context} context
     * @param {object} params
     * @param {Jii.base.Controller} controller
     * @returns {Promise}
     */
    renderLayout: function (view, context, params, controller) {
        return this.__super(view, context, params, controller).then(function(content) {

            content = content.replace(this.__static.PH_HEAD, this._renderHeadHtml());
            content = content.replace(this.__static.PH_BODY_BEGIN, this._renderBodyBeginHtml());
            content = content.replace(this.__static.PH_BODY_END, this._renderBodyEndHtml());
            this.clear();

            return Promise.resolve(content);
        }.bind(this));
    },

    /**
     * Marks the position of an HTML head section.
     */
    head: function() {
        return this.__static.PH_HEAD;
    },

    /**
     * Marks the beginning of an HTML body section.
     */
    beginBody: function() {
        return this.__static.PH_BODY_BEGIN;
    },

    /**
     * Marks the ending of an HTML body section.
     */
    endBody: function() {
        return this.__static.PH_BODY_END;
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

        this.__super();
    },

    /**
     * Renders the content to be inserted in the head section.
     * The content is rendered using the registered meta tags, link tags, CSS/JS code blocks and files.
     * @returns {string} the rendered content
     */
    _renderHeadHtml: function() {
        return [].concat(
            Jii._.values(this.metaTags),
            Jii._.values(this.linkTags),
            Jii._.values(this.cssFiles),
            Jii._.values(this.css),
            Jii._.values(this.jsFiles[Jii.view.WebView.POS_HEAD]),
            Jii._.values(this.js[Jii.view.WebView.POS_HEAD])
        ).join('\n');
    },

    /**
     * Renders the content to be inserted at the beginning of the body section.
     * The content is rendered using the registered JS code blocks and files.
     * @returns {string} the rendered content
     */
    _renderBodyBeginHtml: function() {
        return [].concat(
            Jii._.values(this.jsFiles[Jii.view.WebView.POS_BEGIN]),
            Jii._.values(this.js[Jii.view.WebView.POS_BEGIN])
        ).join('\n');
    },

    /**
     * Renders the content to be inserted at the end of the body section.
     * The content is rendered using the registered JS code blocks and files.
     * @returns {string} the rendered content
     */
    _renderBodyEndHtml: function () {
        return [].concat(
            Jii._.values(this.jsFiles[Jii.view.WebView.POS_END]),
            Jii._.values(this.js[Jii.view.WebView.POS_END]),
            Jii._.values(this.js[Jii.view.WebView.POS_READY]),
            Jii._.values(this.js[Jii.view.WebView.POS_LOAD])
        ).join('\n');
    },

    _registerMetaTagInternal: function(key, options) {
        return '<meta' + this._renderTagAttributes(options) + ' />';
    },

    _registerLinkTagInternal: function(key, options) {
        return '<link' + this._renderTagAttributes(options) + ' />';
    },

    _registerCssInternal: function(key, code, options) {
        return '<style' + this._renderTagAttributes(options) + '>' + code + '</style>';
    },

    _registerCssFileInternal: function(key, condition, noscript, options) {
        var html = '<link' + this._renderTagAttributes(options) + '>';
        if (condition) {
            html = '<!--[if ' + condition + ']>\n' + html + '\n<![endif]-->';
        } else if (noscript) {
            html = '<noscript>' + html + '</noscript>';
        }
        return html;
    },

    _registerJsInternal: function(key, position, code, options) {
        switch (position) {
            case Jii.view.WebView.POS_READY:
                code = "jQuery(document).ready(function () {\n" + code + "\n});";
                break;

            case Jii.view.WebView.POS_LOAD:
                code = "jQuery(window).load(function () {\n" + code + "\n});";
                break;
        }

        return '<script type="text/javascript">' + code + '</script>';
    },

    _registerJsFileInternal: function(key, position, condition, options) {
        var code = '<script' + this._renderTagAttributes(options) + '></script>';
        if (condition) {
            code = '<!--[if ' + condition + ']>\n' + code + '\n<![endif]-->';
        }
        return code;
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