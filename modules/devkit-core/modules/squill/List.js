import .Window;
import .Widget;
from util.browser import $;
import .models.DataSource as DataSource;
import .models.DataItem as DataItem;
import .Selection;

var List = module.exports = Class(Widget, function(supr) {

  this._css = 'list';

  this.init = function(opts) {
    opts = merge(opts, {
      containSelf: true,
      cellSpacing: 0,
      isTiled: false,
      preserveCells: false,
      renderAll: true,
      isFixedHeight: true,
      absolutePosition: true,
      filter: null
    });

    this.needsRender = delay(this.render);

    if (opts.cellCtor) { this.setCellCtor(opts.cellCtor); }
    if (opts.dataSource) { this.setDataSource(opts.dataSource); }
    if (opts.sorter) { this.setSorter(opts.sorter); }

    this._lastFilter = null;

    this._cellsByID = {};
    this._removed = {};
    this._containSelf = opts.containSelf;
    this._containerTag = opts.containerTag;
    this._applyNodeOrder = opts.applyNodeOrder;

    this._renderOpts = {
      cellSpacing: opts.cellSpacing || 0
    };

    this.setFilter(opts.filter);
    this.updateFilter = delay(function() {
      this._lastFilter = null;
      this.needsRender();
    }, 100);

    supr(this, 'init', [opts]);

    if (opts.__result) {
      opts.__result.addSubscription(this, 'select');
    }

    Window.get().on('ViewportChange', bind(this, 'needsRender'));
  };

  // cells go in _container
  this.getContainer = function() {
    return this._container;
  };

  this.getDataSource = function() {
    return this._dataSource;
  };

  this.setModel = function (path, value) {
    if (arguments.length == 1) {
      this.setDataSource(arguments[0]);
    } else {
      return supr(this, 'setModel', arguments);
    }
  };

  this.setData = function (data) {
    if (!this._dataSource) {
      this.setDataSource(new DataSource({sorter: this._sorter}));
    } else {
      this._dataSource.clear();
    }

    if (data) {
      var items;
      if (Array.isArray(data)) {
        items = data.map(function (data, index) {
          return new DataItem(index, data);
        });
      } else {
        items = Object.keys(data).map(function (key) {
          return new DataItem(key, data[key]);
        });
      }

      this._dataSource.add(items);
    }

    this.needsRender();
  };

  this.setDataSource = function(dataSource) {
    if (this._dataSource == dataSource) { return; }

    if (this._dataSource) {
      this._dataSource.unsubscribe('Update', this);
      this._dataSource.unsubscribe('Remove', this);
      this.clear();
    }

    this._dataSource = dataSource;
    this._dataSource.subscribe('Update', this, 'onUpdateItem');
    this._dataSource.subscribe('Remove', this, 'onRemoveItem');

    this.needsRender();
  };

  this.onUpdateItem = function(id, item) {
    var cell = this._cellsByID[id];
    if (cell) {
      var prevData = cell.getItem();
      if (item instanceof DataItem) {
        if (prevData !== item.data) {
          cell.setItem(item.data, item);
        }
      } else if (prevData !== item) {
        cell.setItem(item);
      }
    }

    this.updateFilter();
  };

  this.onRemoveItem = function(id) {
    this._removed[id] = true;
    this.updateFilter();
  };

  this.buildWidget = function() {

    this._container = $({parent: this._el, className: this._opts.containerClassName, tag: this._containerTag || 'div'});
    if (this._containSelf && !this._applyNodeOrder) {
      this._container.style.position = 'relative';
    }

    if (this._opts.selection || this._opts.selectable) {
      this.setSelectable(this._opts.selection || this._opts.selectable);
    }

    this.render();
  };

  this.setValue = function (value) {
    if (this.selection) {
      this.selection.select(value);
    }
  }

  this.getValue = function () {
    if (this.selection) {
      return this.selection.get();
    }
  }

  this.setSelectable = function(selectable) {
    this.selection = new Selection({
      parent: this,
      type: selectable
    })
      .subscribe('Select', this, '_onSelected', true)
      .subscribe('Deselect', this, '_onSelected', false)

    this.selection;
  };

  this._onSelected = function(isSelected, item, id) {
    if (this._cellsByID[id] !== undefined) {
      this._cellsByID[id].updateSelected();

      if (isSelected) {
        if (item instanceof DataItem) {
          this.emit('select', id, item.data);
        } else {
          this.emit('select', id, item);
        }
      }
    }
  };

  this.setCellCtor = function(cellCtor) {
    if (cellCtor == this._cellCtor) { return; }

    this._cellCtor = cellCtor;
    this.clear();
  }

  this.clear = function() {
    for (var id in this._cellsByID) {
      var cell = this._cellsByID[id];
      cell.remove();
    }

    this._cellsByID = {};
    this._renderedDataSource = null;
    this._cellDim = null;
  };

  this.getCell =
  this.getCellById = function(id) {
    return this._cellsByID[id];
  };

  this.setCell =
  this.setCellForId = function (id, cell) {
    this._cellsByID[id] = cell;
  }

  this.getCells = function() {
    return this._cellsByID;
  };

  this.setSorter = function(sorter) {
    if (sorter != this._rawSorter) {
      this._rawSorter = sorter;
      this._sorter = function (item) {
        return sorter(item instanceof DataItem ? item.data : item);
      };
    }

    if (this._renderedDataSource) {
      this._renderedDataSource.setSorter(sorter);
    }
  };

  // Filter moved to DataSource...
  this.setFilter = function(filter) {
    if (filter != this._rawFilter) {
      this._rawFilter = filter;
      this._filter = function (item) {
        return filter(item instanceof DataItem ? item.data : item);
      };
    }

    this.needsRender();
  };

  this.setFixedHeight = function(isFixedHeight) {
    this._opts.isFixedHeight = isFixedHeight;
  };

  this._applyDataSource = function() {
    if (this._filter != this._lastFilter) {
      this._lastFilter = this._filter;
      this._renderedDataSource = this._dataSource.getFilteredDataSource(this._filter);

      this._lastSorter = this._sorter;
      this._renderedDataSource.setSorter(this._sorter);
    } else if (this._sorter != this._lastSorter) {
      if (!this._renderedDataSource || this._renderedDataSource == this._dataSource) {
        this._filter = function () { return true; };
        return this._applyDataSource();
      } else {
        this._lastSorter = this._sorter;
        this._renderedDataSource.setSorter(this._sorter);
      }
    }

    if (!this._renderedDataSource) {
      this._renderedDataSource = this._dataSource;
    }
  };

  this.onShow = function() { supr(this, 'onShow', arguments); this.needsRender(); }

  // just render all cells for now
  this.render = function() {
    if (!this._dataSource) { return; }
    this._applyDataSource();
    this._renderedDataSource.sort();

    if (this._opts.renderAll) {
      this.renderAllDelayed();
    } else if (this._opts.isFixedHeight) {
      this.renderFixedHeight();
    } else {
      this.renderDynamicHeight();
    }

    this._removed = {};
  };

  this.setCellDim = function(cellDim) {
    this._cellDim = cellDim;
  };

  this.getCellDim = function() {
    if (this._cellDim) { return this._cellDim; }

    if (this._opts.isFixedHeight) {
      var item = this._renderedDataSource.getItemForIndex(0);
      if (!item) { return false; }
      var key = item[this._renderedDataSource.getKey()],
        cell = this._cellsByID[key] || (this._cellsByID[key] = this._createCell(item)),
        dim = $.size(cell.getElement());
      if (dim.width == 0 || dim.height == 0) { return null; }

      var cellSpacing = this._opts.cellSpacing;
      if (cellSpacing) {
        dim.width += cellSpacing;
        dim.height += cellSpacing;
      }

      this._cellDim = dim;
      return dim;
    } else {
      throw 'unimplemented'
    }
  };

  this._createCell = function(item) {
    var key = this._dataSource.getKey();
    var cell = new this._cellCtor({
        parent: this,
        controller: this,
        key: key,
        item: item
      });

    cell.getElement().setAttribute('squill-data-id', item[key]);
    cell.render();
    return cell;
  };

  this._nodeOrder = function() {
    var container = this._container;
    var src = this._renderedDataSource;
    var key = src.key;
    var dummy;
    var cell;
    var element;
    var item;
    var i;

    if (!container.childNodes.length) {
      return;
    }

    dummy = document.createElement('div');

    container.insertBefore(dummy, container.childNodes[0]);
    for (i = 0; i < src.length; i++) {
      item = src.getItemForIndex(i);
      cell = this._cellsByID[item[key]];
      element = cell.getElement();
      if (cell && element.parentNode) {
        container.insertBefore(container.removeChild(element), dummy);
      }
    }

    container.removeChild(dummy);
  };

  this.renderAllDelayed = function() {
    var src = this._renderedDataSource;
    if (!src) { return; }
    if (!this.updateRenderOpts()) { return; }

    var i = 0;
    function renderOne() {
      var item = src.getItemForIndex(i);
      if (!item) { return false; }

      var id = item[src.getKey()];
      var cell = this._cellsByID[id];
      if (!cell) {
        cell = this._cellsByID[id] = this._createCell(item);
      } else {
        cell.render();
      }
      !this._applyNodeOrder && this.positionCell(cell, i);
      ++i;
      return true;
    }

    function renderMany() {
      if (this._renderManyTimeout) {
        clearTimeout(this._renderManyTimeout);
        this._renderManyTimeout = void 0;
      }

      var THRESHOLD = 50; // ms to render
      var n = 0, t = +new Date();
      while (n++ < 10 || +new Date() - t < THRESHOLD) {
        if (!renderOne.call(this)) {
          this._applyNodeOrder && this._nodeOrder();
          return;
        }
      }

      this._renderManyTimeout = setTimeout(bind(this, renderMany), 100);
    }

    var removed = this._removed;
    for (var id in removed) {
      if (!src.getItemForID(id)) {
        var cell = this._cellsByID[id];
        if (cell) {
          cell.remove();
          delete this._cellsByID[id];
        }
      }
    };

    renderMany.call(this);
  }

  this.setOffsetParent = function(offsetParent) {
    this._opts.offsetParent = offsetParent;
  };

  this.setTiled = function(tiled) {
    this._opts.isTiled = tiled;
    this._isTiled = tiled;
  };

  this.updateRenderOpts = function() {
    var r = this._renderOpts;

    r.offsetTop = this._containSelf ? 0 : this._container.offsetTop;
    r.offsetLeft = this._containSelf ? 0 : this._container.offsetLeft;

    var parent = this._offsetParent || this.getOffsetParent();
    r.top = (parent.getAttribute('squill-scroller-top') || parent.scrollTop) - r.offsetTop;
    r.height = parent.offsetHeight;
    r.bottom = r.top + r.height;

    if (this._opts.isFixedHeight) {
      var cellDim = this.getCellDim();
      if (!cellDim) { return false; }
      r.cellWidth = cellDim.width;
      r.cellHeight = cellDim.height;
    }

    var n = r.numRows = this._renderedDataSource.length;
    if (this._opts.isFixedHeight) {
      if (this._opts.isTiled) {
        r.maxWidth = parent.offsetWidth - r.offsetLeft;
        r.numPerRow = Math.max(1, r.maxWidth / r.cellWidth | 0);
        r.numRows = Math.ceil(n / r.numPerRow);
        r.start = Math.max(0, (r.top / r.cellHeight | 0) * r.numPerRow);
        r.end = Math.ceil(r.bottom / r.cellHeight) * r.numPerRow;
      } else {
        r.start = Math.max(0, r.top / r.cellHeight | 0);
        r.end = (r.bottom / r.cellHeight + 1) | 0;
      }
    }

    if (!this._applyNodeOrder) {
      if (this._opts.absolutePosition) {
        this._container.style.height = r.numRows * r.cellHeight + 'px';
      } else {
        this._container.style.height = 'auto';
      }
    }

    return true;
  };

  this.positionCell = function(cell, i) {
    if (!this._opts.absolutePosition) { return; }

    var r = this._renderOpts;
    var el = cell.getElement();
    var x, y;

    if (this._opts.isTiled) {
      x = i % r.numPerRow;
      y = (i / r.numPerRow) | 0;
      el.style.left = x * r.cellWidth + r.offsetLeft + 'px';
      el.style.top = y * r.cellHeight + r.offsetTop + 'px';
    } else {
      el.style.top = (i * r.cellHeight || 0) + r.offsetTop + 'px';
    }
  };

  this.getOffsetParent = function() {
    // the list might be contained in some other scrolling div
    return this._opts.offsetParent || (this._containSelf ? this._container : this._container.offsetParent) || document.body;
  };

  this.renderFixedHeight = function() {
    var parent = this.getOffsetParent();
    if (!parent) { return; }
    if (parent != this._offsetParent) {
      if (this._removeScrollEvt) { this._removeScrollEvt(); }
      this._offsetParent = parent;
      this._removeScrollEvt = $.onEvent(parent, 'scroll', this, 'needsRender');
    }

    // render data
    var src = this._renderedDataSource,
      key = src.getKey(),
      n = src.length;

    if (n && !this.updateRenderOpts()) { return; }

    // swap lists
    var oldCellsByID = this._cellsByID;
    this._cellsByID = {};

    // render new items
    if (n) {
      var isTiled = this._isTiled;
      var r = this._renderOpts;
      for (var i = r.start; i < r.end; ++i) {
        var item = src.getItemForIndex(i);
        if (!item) { break; }

        var id = item[key];
        var cell = oldCellsByID[id];
        if (!cell) {
          cell = this._createCell(item);
        } else {
          delete(oldCellsByID[id]);
          cell.render();
        }

        this.positionCell(cell, i);
        this._cellsByID[id] = cell;
      }
    };

    // remove old items
    if (!this._opts.preserveCells) {
      for (var id in oldCellsByID) {
        oldCellsByID[id].remove();
      }
    } else {
      for (var id in oldCellsByID) {
        var cell = oldCellsByID[id];
        if (!src.getItemForID(id)) {
          cell.remove();
        } else {
          this._cellsByID[id] = cell;
        }
      }
    }
  };
});
