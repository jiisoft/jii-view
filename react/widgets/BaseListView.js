'use strict';

var Jii = require('jii');
var _map = require('lodash/map');
var _clone = require('lodash/clone');
var _filter = require('lodash/filter');
var ReactView = require('../ReactView');
var React = require('react');

/**
 * @class Jii.view.react.widgets.BaseListView
 * @extends Jii.view.react.ReactView
 */
module.exports = Jii.defineClass('Jii.view.react.widgets.BaseListView', /** @lends Jii.view.react.widgets.BaseListView.prototype */{

    __extends: ReactView,

    __static: /** @lends Jii.view.react.widgets.BaseListView */{

        /**
         * @alias {Jii.view.react.widgets.BaseListView.prototype.props}
         */
        propTypes: {

            /**
             * @type {Jii.base.Collection}
             */
            collection: React.PropTypes.object,

            /**
             * @type {object} the HTML attributes for the container tag of the list view.
             * The "tag" element specifies the tag name of the container element and defaults to "div".
             * @see \jii\helpers\Html.renderTagAttributes() for details on how attributes are being rendered.
             */
            options: React.PropTypes.object,

            /**
             * @type {object} the configuration for the pager widget. By default, [[LinkPager]] will be
             * used to render the pager. You can use a different widget class by configuring the "class" element.
             * Note that the widget must support the `pagination` property which will be populated with the
             * [[\jii\data\BaseDataProvider.pagination|pagination]] value of the [[dataProvider]].
             */
            pager: React.PropTypes.object,

            /**
             * @type {object} the configuration for the sorter widget. By default, [[LinkSorter]] will be
             * used to render the sorter. You can use a different widget class by configuring the "class" element.
             * Note that the widget must support the `sort` property which will be populated with the
             * [[\jii\data\BaseDataProvider.sort|sort]] value of the [[dataProvider]].
             */
            sorter: React.PropTypes.object,

            /**
             * @type {string} the HTML content to be displayed as the summary of the list view.
             * If you do not want to show the summary, you may set it with an empty string.
             *
             * The following tokens will be replaced with the corresponding values:
             *
             * - `{begin}`: the starting row number (1-based) currently being displayed
             * - `{end}`: the ending row number (1-based) currently being displayed
             * - `{count}`: the number of rows currently being displayed
             * - `{totalCount}`: the total number of rows available
             * - `{page}`: the page number (1-based) current being displayed
             * - `{pageCount}`: the number of pages available
             */
            summary: React.PropTypes.string,

            /**
             * @type {[]} the HTML attributes for the summary of the list view.
             * The "tag" element specifies the tag name of the summary element and defaults to "div".
             * @see \jii\helpers\Html.renderTagAttributes() for details on how attributes are being rendered.
             */
            summaryOptions: React.PropTypes.object,

            /**
             * @type {boolean} whether to show the list view if [[dataProvider]] returns no data.
             */
            showOnEmpty: React.PropTypes.bool,

            /**
             * @type {string} the HTML content to be displayed when [[dataProvider]] does not have any data.
             */
            emptyText: React.PropTypes.string,

            /**
             * @type {[]} the HTML attributes for the emptyText of the list view.
             * The "tag" element specifies the tag name of the emptyText element and defaults to "div".
             * @see \jii\helpers\Html.renderTagAttributes() for details on how attributes are being rendered.
             */
            emptyTextOptions: React.PropTypes.object,

            /**
             * @type {string} the layout that determines how different sections of the list view should be organized.
             * The following tokens will be replaced with the corresponding section contents:
             *
             * - `{summary}`: the summary section. See [[renderSummary()]].
             * - `{items}`: the list items. See [[renderItems()]].
             * - `{sorter}`: the sorter. See [[renderSorter()]].
             * - `{pager}`: the pager. See [[renderPager()]].
             */
            layout: React.PropTypes.string
        },

        defaultProps: {
            options: null,
            pager: null,
            sorter: null,
            summary: null,
            summaryOptions: {
                className: 'summary'
            },
            showOnEmpty: false,
            emptyText: null,
            emptyTextOptions: {
                className: 'empty'
            },
            layout: '{summary}\n{items}\n{pager}'
        }

    },

    /**
     * Renders the data models.
     * @returns {string} the rendering result.
     */
    renderItems() {

    },

    /**
     * Initializes the view.
     */
    init() {
        this.listenModel(this.props.collection);
    },

    /**
     * Runs the widget.
     */
    render() {
        var content = [];
        if (this.props.showOnEmpty || this.props.collection.length > 0) {
            content = _map(this.props.layout.match(/{\w+}/g), this.renderSection.bind(this));
        } else {
            content = [this.renderEmpty()];
        }

        var options = _clone(this.props.options);
        var tag = options.tag || 'div';
        delete options.tag;

        return React.createElement.apply(React, [tag, options].concat(_filter(content)));
    },

    /**
     * Renders a section of the specified name.
     * If the named section is not supported, false will be returned.
     * @param {string} name the section name, e.g., `{summary}`, `{items}`.
     * @returns {object} the rendering result of the section, or false if the named section is not supported.
     */
    renderSection(name) {
        switch (name) {
            case '{summary}':
                return this.renderSummary();
            case '{items}':
                return this.renderItems();
            case '{pager}':
                return this.renderPager();
            case '{sorter}':
                return this.renderSorter();
        }
        return '';
    },

    /**
     * Renders the HTML content indicating that the list view has no data.
     * @returns {object} the rendering result
     */
    renderEmpty() {
        var options = _clone(this.props.emptyTextOptions);
        var tag = options.tag || 'div';
        delete options.tag;

        return React.createElement(tag, options, this.props.emptyText || Jii.t('jii', 'No results found.'));
    },

    /**
     * Renders the summary text.
     */
    renderSummary() {
        return ''; // @todo
    },

    /**
     * Renders the pager.
     * @returns {string} the rendering result
     */
    renderPager() {
        return ''; // @todo
    },

    /**
     * Renders the sorter.
     * @returns {string} the rendering result
     */
    renderSorter() {
        return ''; // @todo
    }

});
