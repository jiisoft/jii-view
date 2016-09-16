/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

'use strict';

var Jii = require('jii');
var WebView = require('../../WebView');
var ReactRenderer = require('../ReactRenderer');
var _values = require('lodash/values');
var IRenderer = require('../../IRenderer');
var React = require('react');
var ReactDOMServer = require('react-dom/server');

/**
 *
 * @class Jii.view.react.ReactServerRenderer
 * @extends Jii.view.IRenderer
 */
module.exports = Jii.defineClass('Jii.view.react.ReactServerRenderer', /** @lends Jii.view.react.ReactServerRenderer.prototype */{

    __extends: IRenderer,

    pageTemplate: '{docType}<html lang="{lang}"><head><title>{title}</title>{head}</head><body>{bodyBegin}{layout}{bodyEnd}</body></html>',
    layoutTemplate: '<div id="{id}">{content}</div>',

    /**
     *
     * @param {*} view
     * @param {Jii.base.Context} context
     * @param {object} params
     * @param {Jii.base.Controller} controller
     * @param {Jii.view.WebView} webView
     * @returns {*}
     */
    render(view, context, params, controller, webView) {
        view = Jii.namespace(view);
        return React.createElement(view, params);
    },

    /**
     *
     * @param {*} view
     * @param {Jii.base.Context} context
     * @param {object} params
     * @param {Jii.base.Controller} controller
     * @param {Jii.view.WebView} webView
     * @returns {*}
     */
    renderLayout(view, context, params, controller, webView) {
        params.context = context;
        var layout = ReactDOMServer.renderToString(this.render(view, context, params, controller, webView));
        return this.pageTemplate
            .replace('{docType}', webView.docType)
            .replace('{lang}', Jii.app.language)
            .replace('{title}', webView.title)
            .replace('{head}', [].concat(
                _values(webView.metaTags),
                _values(webView.linkTags),
                _values(webView.cssFiles),
                _values(webView.css),
                _values(webView.jsFiles[WebView.POS_HEAD]),
                _values(webView.js[WebView.POS_HEAD])
            ).join('\n'))
            .replace('{bodyBegin}', [].concat(
                _values(webView.jsFiles[WebView.POS_BEGIN]),
                _values(webView.js[WebView.POS_BEGIN])
            ).join('\n'))
            .replace('{layout}', this.layoutTemplate
                .replace('{id}', ReactRenderer.APP_ID_PREFIX + Jii.app.id)
                .replace('{content}', layout)
            )
            .replace('{bodyEnd}', [].concat(
                _values(webView.jsFiles[WebView.POS_END]),
                _values(webView.js[WebView.POS_END]),
                _values(webView.js[WebView.POS_READY]),
                _values(webView.js[WebView.POS_LOAD])
            ).join('\n'))
    }

});