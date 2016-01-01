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
 * @class Jii.view.ClientWebView
 * @extends Jii.view.WebView
 */
Jii.defineClass('Jii.view.ClientWebView', /** @lends Jii.view.ClientWebView.prototype */{

    __extends: 'Jii.view.WebView',

    _registerMetaTagInternal: function(key, options) {
        return this._findByKey(key) || this._createTag('meta', Jii.view.WebView.POS_HEAD, '', options);
    },

    _registerLinkTagInternal: function(key, options) {
        return this._findByKey(key) || this._createTag('link', Jii.view.WebView.POS_HEAD, '', options);
    },

    _registerCssInternal: function(key, code, options) {
        return this._findByKey(key) || this._createTag('style', Jii.view.WebView.POS_HEAD, code, options);
    },

    _registerCssFileInternal: function(key, condition, noscript, options) {
        if (!this._isCurrentBrowser(condition)) {
            return true;
        }

        return this._findByKey(key) || this._createTag('link', Jii.view.WebView.POS_HEAD, '', options);
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

        return this._findByKey(key) || this._createTag('script', Jii.view.WebView.position, code, options);
    },

    _registerJsFileInternal: function(key, position, condition, options) {
        if (!this._isCurrentBrowser(condition)) {
            return true;
        }

        return this._findByKey(key) || this._createTag('script', Jii.view.WebView.position, '', options);
    },

    _findByKey: function(key) {
        return jQuery('[' + Jii.view.WebView.DATA_KEY_NAME + '="' + key + '"]').length > 0;
    },

    _createTag: function(name, position, content, options) {
        var $el = jQuery('<' + name + ' />', options)
            .html(content);

        switch (position) {
            case Jii.view.WebView.POS_HEAD:
                $el.appendTo(document.head);
                break;

            case Jii.view.WebView.POS_BEGIN:
                $el.prependTo(document.body); // @todo Insert before app, need for true sort
                break;

            case Jii.view.WebView.POS_END:
            case Jii.view.WebView.POS_READY:
            case Jii.view.WebView.POS_LOAD:
                $el.appendTo(document.body);
                break;
        }
    },

    _isCurrentBrowser: function(condition) {
        return false; // @todo
    }

});