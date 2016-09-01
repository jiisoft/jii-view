'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('jii');

/**
 * @class Jii.view.react.grid.Column
 * @extends Jii.base.Object
 */
Jii.defineClass('Jii.view.react.grid.Column', /** @lends Jii.view.react.grid.Column.prototype */{

    __extends: 'Jii.base.Object',

    /**
     * @type {jii.grid.GridView} the grid view object that owns this column.
     */
    grid: null,

    /**
     * @type {string} the header cell content. Note that it will not be HTML-encoded.
     */
    header: null,

    /**
     * @type {string} the footer cell content. Note that it will not be HTML-encoded.
     */
    footer: null,

    /**
     * @type {function} This is a callable that will be used to generate the content of each cell.
     * The signature of the function should be the following: `function (model, key, index, column)`.
     * Where `model`, `key`, and `index` refer to the model, key and index of the row currently being rendered
     * and `column` is a reference to the [[Column]] object.
     */
    content: null,

    /**
     * @type {boolean} whether this column is visible. Defaults to true.
     */
    visible: true,

    /**
     * @type {object} the HTML attributes for the column group tag.
     * @see \jii\helpers\Html.renderTagAttributes() for details on how attributes are being rendered.
     */
    options: null,

    /**
     * @type {object} the HTML attributes for the header cell tag.
     * @see \jii\helpers\Html.renderTagAttributes() for details on how attributes are being rendered.
     */
    headerOptions: {},

    /**
     * @type {object|function} the HTML attributes for the data cell tag. This can either be an array of
     * attributes or an anonymous function ([[Closure]]) that returns such an array.
     * The signature of the function should be the following: `function (model, key, index, column)`.
     * Where `model`, `key`, and `index` refer to the model, key and index of the row currently being rendered
     * and `column` is a reference to the [[Column]] object.
     * A function may be used to assign different attributes to different rows based on the data in that row.
     *
     * @see \jii\helpers\Html.renderTagAttributes() for details on how attributes are being rendered.
     */
    contentOptions: {},

    /**
     * @type {object} the HTML attributes for the footer cell tag.
     * @see \jii\helpers\Html.renderTagAttributes() for details on how attributes are being rendered.
     */
    footerOptions: {},

    key: null,

    /**
     * Renders the header cell.
     */
    renderHeaderCell() {
        var options = Jii._.clone(this.headerOptions);
        options.key = this.key;
        return React.createElement('th', options, this._renderHeaderCellContent());
    },

    /**
     * Renders the footer cell.
     */
    renderFooterCell() {
        var options = Jii._.clone(this.headerOptions);
        options.key = this.key;
        return React.createElement('td', options, this._renderFooterCellContent());
    },

    /**
     * Renders a data cell.
     * @param {mixed} model the data model being rendered
     * @param {mixed} key the key associated with the data model
     * @param {number} index the zero-based index of the data item among the item array returned by [[GridView.dataProvider]].
     * @returns {object} the rendering result
     */
    renderDataCell(model, key, index) {
        var options = Jii._.isFunction(this.contentOptions) ?
            this.contentOptions.call(null, model, key, index, this) :
            Jii._.clone(this.contentOptions);

        options.key = this.key + '-' + JSON.stringify(key);
        return React.createElement('td', options, this._renderDataCellContent(model, key, index));
    },

    /**
     * Renders the header cell content.
     * The default implementation simply renders [[header]].
     * This method may be overridden to customize the rendering of the header cell.
     * @returns {string} the rendering result
     */
    _renderHeaderCellContent() {
        return Jii._s.trim(this.header) !== '' ? this.header : this.grid.props.emptyCell;
    },

    /**
     * Renders the footer cell content.
     * The default implementation simply renders [[footer]].
     * This method may be overridden to customize the rendering of the footer cell.
     * @returns {string} the rendering result
     */
    _renderFooterCellContent() {
        return Jii._s.trim(this.footer) !== '' ? this.footer : this.grid.props.emptyCell;
    },

    /**
     * Renders the data cell content.
     * @param {mixed} model the data model
     * @param {mixed} key the key associated with the data model
     * @param {number} index the zero-based index of the data model among the models array returned by [[GridView.dataProvider]].
     * @returns {string} the rendering result
     */
    _renderDataCellContent(model, key, index) {
        if (this.content !== null) {
            return this.content.call(null, model, key, index, this);
        }
        return this.grid.props.emptyCell;
    }

});
