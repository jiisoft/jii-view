'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('jii');

require('../widgets/BaseListView');

/**
 * @class Jii.view.react.grid.GridView
 * @extends Jii.view.react.widgets.BaseListView
 */
Jii.defineClass('Jii.view.react.grid.GridView', /** @lends Jii.view.react.grid.GridView.prototype */{

    __extends: 'Jii.view.react.widgets.BaseListView',

    /**
     * @type {string} the default data column class if the class name is not explicitly specified when configuring a data column.
     * Defaults to 'Jii.view.react.grid.DataColumn'.
     */
    dataColumnClassName: null,

    /**
     * @type {string} the caption of the grid table
     */
    caption: null,

    /**
     * @type {object} the HTML attributes for the caption element.
     */
    captionOptions: {},

    /**
     * @type {object} the HTML attributes for the grid table element.
     */
    tableOptions: {
        className: 'table table-striped table-bordered'
    },

    /**
     * @type {object} the HTML attributes for the container tag of the grid view.
     * The "tag" element specifies the tag name of the container element and defaults to "div".
     */
    options: {
        className: 'grid-view'
    },

    /**
     * @type {object} the HTML attributes for the table header row.
     */
    headerRowOptions: {},

    /**
     * @type {object} the HTML attributes for the table footer row.
     */
    footerRowOptions: {},

    /**
     * @type {object|function} the HTML attributes for the table body rows. This can be either an array
     * specifying the common HTML attributes for all body rows, or an anonymous function that
     * returns an array of the HTML attributes. The anonymous function will be called once for every
     * data model returned by [[dataProvider]]. It should have the following signature:
     *
     * ```js
     * function (model, key, index, grid)
     * ```
     *
     * - `model`: the current data model being rendered
     * - `key`: the key value associated with the current data model
     * - `index`: the zero-based index of the data model in the model array returned by [[dataProvider]]
     * - `grid`: the GridView object
     */
    rowOptions: {},

    /**
     * @type {function} an anonymous function that is called once BEFORE rendering each data model.
     * It should have the similar signature as [[rowOptions]]. The return result of the function
     * will be rendered directly.
     */
    beforeRow: null,

    /**
     * @type {function} an anonymous function that is called once AFTER rendering each data model.
     * It should have the similar signature as [[rowOptions]]. The return result of the function
     * will be rendered directly.
     */
    afterRow: null,

    /**
     * @type {boolean} whether to show the header section of the grid table.
     */
    showHeader: true,

    /**
     * @type {boolean} whether to show the footer section of the grid table.
     */
    showFooter: false,

    /**
     * @type {boolean} whether to show the grid view if [[dataProvider]] returns no data.
     */
    showOnEmpty: true,

    /**
     * @type {[]} grid column configuration. Each array element represents the configuration
     * for one particular grid column.
     */
    columns: [],

    /**
     * @type {string} the HTML display when the content of a cell is empty.
     * This property is used to render cells that have no defined content,
     * e.g. empty footer or filter cells.
     *
     * Note that this is not used by the [[Jii.view.react.grid.DataColumn]] if a data item is `null`. In that case
     * the [[\jii\i18n\Formatter.nullDisplay|nullDisplay]] property of the [[formatter]] will
     * be used to indicate an empty data value.
     */
    emptyCell: ' ',

    /**
     * @type {string} the layout that determines how different sections of the list view should be organized.
     * The following tokens will be replaced with the corresponding section contents:
     *
     * - `{summary}`: the summary section. See [[renderSummary()]].
     * - `{errors}`: the filter model error summary. See [[renderErrors()]].
     * - `{items}`: the list items. See [[renderItems()]].
     * - `{sorter}`: the sorter. See [[renderSorter()]].
     * - `{pager}`: the pager. See [[renderPager()]].
     */
    layout: '{summary}\n{items}\n{pager}',

    /**
     * Initializes the grid view.
     * This method will initialize required property values and instantiate [[columns]] objects.
     */
    init: function () {
        this.__super();
        this._initColumns();
    },

    /**
     * Renders validator errors of filter model.
     * @returns {string} the rendering result.
     */
    renderErrors: function () {
        return ''; // @todo
    },

    /**
     * @inheritdoc
     */
    renderSection: function (name) {
        switch (name) {
            case '{errors}':
                return this.renderErrors();
        }

        return this.__super(name);
    },

    /**
     * Renders the data models for the grid view.
     */
    renderItems: function () {
        var caption = this.renderCaption();
        var columnGroup = this.renderColumnGroup();
        var tableHeader = this.showHeader ? this.renderTableHeader() : false;
        var tableBody = this.renderTableBody();
        var tableFooter = this.showFooter ? this.renderTableFooter() : false;

        return React.createElement.apply(React, ['table', this.tableOptions].concat(Jii._.filter([
            caption,
            columnGroup,
            tableHeader,
            tableFooter,
            tableBody
        ])));
    },

    /**
     * Renders the caption element.
     * @returns {object} the rendered caption element or `false` if no caption element should be rendered.
     */
    renderCaption: function () {
        if (!Jii._.isEmpty(this.caption)) {
            return React.createElement('caption', this.captionOptions, this.caption);
        }
        return false;
    },

    /**
     * Renders the column group HTML.
     * @returns {boolean|object} the column group HTML or `false` if no column group should be rendered.
     */
    renderColumnGroup: function () {
        var requireColumnGroup = false;
        Jii._.each(this.columns, function(column) {
            if (!Jii._.isEmpty(column.options)) {
                requireColumnGroup = true;
            }
        });

        if (requireColumnGroup) {
            return React.createElement('colgroup', null, Jii._.map(this.columns, function(column) {
                /** @typedef {Jii.view.react.grid.Column} column */
                return React.createElement('col', column.options);
            }));
        }
        return false;
    },

    /**
     * Renders the table header.
     * @returns {object} the rendering result.
     */
    renderTableHeader: function () {
        return React.createElement(
            'thead',
            null,
            React.createElement(
                'tr',
                this.headerRowOptions,
                Jii._.map(this.columns, function(column) {
                    /** @typedef {Jii.view.react.grid.Column} column */
                    return column.renderHeaderCell();
                })
            )
        );
    },

    /**
     * Renders the table footer.
     * @returns {object} the rendering result.
     */
    renderTableFooter: function () {
        return React.createElement(
            'tfoot',
            null,
            React.createElement(
                'tr',
                this.footerRowOptions,
                Jii._.map(this.columns, function(column) {
                    /** @typedef {Jii.view.react.grid.Column} column */
                    return column.renderFooterCell();
                })
            )
        );
    },

    /**
     * Renders the filter.
     * @returns {string} the rendering result.
     */
    renderFilters: function () {
        return ''; // @todo
    },

    /**
     * Renders the table body.
     * @returns {object} the rendering result.
     */
    renderTableBody: function () {
        var models = this.state.models;
        var rows = [];
        Jii._.each(models, function(model, index) {
            var key = model.getPrimaryKey();
            if (this.beforeRow !== null) {
                var beforeRow = this.beforeRow.call(null, model, key, index, this);
                if (!Jii._.isEmpty(beforeRow)) {
                    rows.push(beforeRow);
                }
            }

            rows.push(this.renderTableRow(model, key, index));

            if (this.afterRow !== null) {
                var afterRow = this.afterRow.call(null, model, key, index, this);
                if (!Jii._.isEmpty(afterRow)) {
                    rows.push(afterRow);
                }
            }
        }.bind(this));

        if (!Jii._.isEmpty(rows)) {
            return React.createElement(
                'tbody',
                null,
                rows
            );
        }

        return React.createElement(
            'tbody',
            null,
            React.createElement(
                'tr',
                null,
                React.createElement(
                    'td',
                    {colSpan: Jii._.size(this.columns)},
                    this.renderEmpty()
                )
            )
        );
    },

    /**
     * Renders a table row with the given data model and key.
     * @param {mixed} model the data model to be rendered
     * @param {mixed} key the key associated with the data model
     * @param {number} index the zero-based index of the data model among the model array returned by [[dataProvider]].
     * @returns {object} the rendering result
     */
    renderTableRow: function (model, key, index) {
        var options = Jii._.isFunction(this.rowOptions) ?
            this.rowOptions.call(null, model, key, index, this) :
            Jii._.clone(this.rowOptions);
        options.key = Jii._.isObject(key) ? JSON.stringify(key) : String(key);

        return React.createElement(
            'tr',
            options,
            Jii._.map(this.columns, function(column) {
                /** @typedef {Jii.view.react.grid.Column} column */
                return column.renderDataCell(model, key, index);
            })
        );
    },

    /**
     * Creates column objects and initializes them.
     */
    _initColumns: function () {
        if (Jii._.isEmpty(this.columns)) {
            this._guessColumns();
        }

        var columns = [];
        Jii._.each(this.columns, function(column, index) {
            if (Jii._.isString(column)) {
                column = this._createDataColumn(column, index);
            } else {
                column = Jii.createObject(Jii._.extend({
                    className: this.dataColumnClassName || Jii.view.react.grid.DataColumn.className(),
                    grid: this,
                    key: (column.attribute || 'c') + index
                }, column));
            }

            if (column.visible) {
                columns.push(column);
            }
        }.bind(this));

        this.columns = columns;
    },

    /**
     * Creates a [[Jii.view.react.grid.DataColumn]] object based on a string in the format of "attribute:format:label".
     * @param {string} text the column specification string
     * @param {number} index
     * @returns {Jii.view.react.grid.DataColumn} the column instance
     * @throws InvalidConfigException if the column specification is invalid
     */
    _createDataColumn: function (text, index) {
        var matches = /^([^:]+)(:(\w*))?(:(.*))?/.exec(text);
        if (!matches) {
            throw new Jii.exceptions.InvalidConfigException('The column must be specified in the format of "attribute", "attribute:format" or "attribute:format:label"');
        }

        return Jii.createObject({
            className: this.dataColumnClassName || Jii.view.react.grid.DataColumn.className(),
            grid: this,
            key: matches[1] + '-' + index,
            attribute: matches[1],
            format: matches[3] || 'text',
            label: matches[5] || null
        });
    },

    /**
     * This function tries to guess the columns to show from the given data
     * if [[columns]] are not explicitly specified.
     */
    _guessColumns: function () {
        var model = this.state.models[0];
        if (!model && this.collection.modelClass) {
            model = this.collection.createModel();
        }
        if (model instanceof Jii.base.Model) {
            this.columns = model.attributes();
        } else if (Jii._.isObject(model)) {
            this.columns = Jii._.keys(model);
        }
    }

});
