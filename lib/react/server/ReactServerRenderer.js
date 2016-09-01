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

var React = require('react');
var ReactDOMServer = require('react-dom/server');

/**
 *
 * @class Jii.view.react.ReactServerRenderer
 * @extends Jii.view.IRenderer
 */
Jii.defineClass('Jii.view.react.ReactServerRenderer', /** @lends Jii.view.react.ReactServerRenderer.prototype */{

    __extends: 'Jii.view.IRenderer',

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
                Jii._.values(webView.metaTags),
                Jii._.values(webView.linkTags),
                Jii._.values(webView.cssFiles),
                Jii._.values(webView.css),
                Jii._.values(webView.jsFiles[Jii.view.WebView.POS_HEAD]),
                Jii._.values(webView.js[Jii.view.WebView.POS_HEAD])
            ).join('\n'))
            .replace('{bodyBegin}', [].concat(
                Jii._.values(webView.jsFiles[Jii.view.WebView.POS_BEGIN]),
                Jii._.values(webView.js[Jii.view.WebView.POS_BEGIN])
            ).join('\n'))
            .replace('{layout}', this.layoutTemplate
                .replace('{id}', Jii.view.react.ReactRenderer.APP_ID_PREFIX + Jii.app.id)
                .replace('{content}', layout)
            )
            .replace('{bodyEnd}', [].concat(
                Jii._.values(webView.jsFiles[Jii.view.WebView.POS_END]),
                Jii._.values(webView.js[Jii.view.WebView.POS_END]),
                Jii._.values(webView.js[Jii.view.WebView.POS_READY]),
                Jii._.values(webView.js[Jii.view.WebView.POS_LOAD])
            ).join('\n'))
    }

});