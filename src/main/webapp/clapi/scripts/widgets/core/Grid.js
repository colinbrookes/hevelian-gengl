/**
 * ItemGrid
 * Displays a grid control, either at a specified location on the screen or in a cell layout.
 */


function ItemGrid(__id, __target, __xml)
{
	this.type							= 'Grid';
	
	// private data
	var _xml							= __xml;
	var _id								= __id;
	var _hideShowId						= __id;
	var _target							= __target;
	var _handler						= null;
	var _dashboard						= null;
	var _prefix							= '';
	var _collection 					= null;
	var _dhtmlxGrid						= null;
	var _columns						= new Array();
	var _headers						= new Array();
	var _rows							= new Array();
	var _arResized						= null;
	var _whichColumns					= null;
	var _me								= this;
	
	var _columnSortAs					= null;
	var _columnAlign					= null;
	var _columnWidths					= null;
	var _columnWidthsRemember			= null;
	
	var _f_allowSort					= true;
	var _f_allowDrag					= false;
	var _f_allowResize					= false;
	var _f_hideHeader					= false;
	var _f_multiSelect					= false;
	var _f_selectOnLoad					= null;
	
	var _addQuotes						= "false";
	var _delimiter						= ",";
	
	// general object methods
	this.Draw								= _draw;
	this.Redraw								= _draw; //_redraw;
	this.SetEventHandler					= function _setEventHandler(__handler) { _handler = __handler; }
	this.SetHideShowId						= function _setHideShowId(_value) { _hideShowId = _value; }
	this.SetDashboard						= function _setDashboard(_value) { _dashboard = _value; }
	this.GetId								= function _getID() { return _id; }
	
	this.GetDHTMLXObject					= function _getDHTMLXObject() { return _dhtmlxGrid; }
	this.AddColumnDefinition				= _addColumnDefinition;
	this.AddRowDefinition					= _addRowDefinition;
	this.AddHeader							= _addHeader;
	this.GetProperty						= _getProperty;
	this.GetPropertyForRow					= _getPropertyForRow;
	this.GetAllProperties					= _getAllProperties;
	this.GetColumnIndexByName				= _getColumnIndexByName;
	this.GetColumnValuesByName				= _getColumnValuesByName;
	this.GetSourceId						= function _getSourceId() { return (_collection!=null)? _collection.GetId() : 'unknown'; }
	
	// set other stuff
	this.SetColumnAlignments				= function _setColumnAlignments(_value) { _columnAlign = _value; }
	this.SetColumnWidths					= function _setColumnWidths(_value, _valRemember) { _columnWidths = _value; _columnWidthsRemember = _valRemember; }
	this.SetColumnSortAs					= function _setColumnSortAs(_value) { _columnSortAs = _value; }
	
	// set boolean flags
	this.SetAllowSort						= function _setAllowSort(_flag) { _f_allowSort 			= _flag; }
	this.SetAllowDrag						= function _setAllowDrag(_flag) { _f_allowDrag 			= _flag; }
	this.SetAllowResize						= function _setAllowResize(_flag) { _f_allowResize 		= _flag; }
	this.SetHideHeader						= function _setHideHeader(_flag) { _f_hideHeader 		= _flag; }
	this.SetSelectOnLoad					= function _setSelectOnLoad(_flag) { _f_selectOnLoad 	= _flag; }
	this.SetAllowMultiSelect				= function _setMultiSelect(_flag, _quotes, _delim) { _f_multiSelect 		= _flag; _addQuotes = _quotes; _delimiter = _delim; }
	
	// event callback methods
	this.FilterByValueEvent					= _filterByValueEvent;
	this.FilterByRowIdEvent					= _filterByRowIdEvent;
	this.SelectRowByIndex					= _selectRowByIndex;
	this.Hide								= _hide;
	this.Show								= _show;
	this.ToggleHideShow						= _toggleHideShow;
	this.SelectAll							= _selectAll;

	// default callbacks are stored, so they can be fired anyway
	this.DefaultOnSelect					= _fireOnSelect;
	this.DefaultOnFilterEnd					= _fireOnFilterEnd;
	this.DefaultOnSortingEnd				= _fireOnSortingEnd;
	this.DefaultOnSelectChange				= _fireSelectChange;
	
	// overrides possible for callbacks on events
	this.CallbackOnSelect					= _fireOnSelect;
	this.CallbackOnFilterEnd				= _fireOnFilterEnd;
	this.CallbackOnSortingEnd				= _fireOnSortingEnd;
	this.CallbackOnSelectChange				= _fireSelectChange;
	this.CallbackOnDragEnd					= _fireOnDragEnd;
	this.CallbackOnResizeEnd				= _fireOnResizeEnd;
	
	// fired events
	function _fireOnSelect(_item)				{	console.log("OnSelect fired"); _handler.FireEvent(_item, "onSelect"); _handler.FireEvent(_id, "Refresh");}
	function _fireSelectChange(_item)			{	_handler.FireEvent(_item, "onSelectChange"); _handler.FireEvent(_id, "Refresh");}
	function _fireOnFilterEnd(_item)			{	_handler.FireEvent(_id, "onFilterEnd"); _handler.FireEvent(_id, "Refresh");}
	function _fireOnSortingEnd(_item)			{	_handler.FireEvent(_id, "onSortingEnd"); _handler.FireEvent(_id, "Refresh");}
	function _fireOnDragEnd(_item)				{	_handler.FireEvent(_id, "onDragEnd");}
	
	try {
		var _bits = _id.split('.');
		if(_bits.length==2) _prefix = _bits[0] + '.';
	} catch(e) { _prefix = ''; }
	
	
	/**
	 * When we are doing a redraw we need to remember the column widths from before the redraw, if the 'rememberRedraw' flag is set.
	 * After that, we fire the event to the event handler for others to do stuff with it.
	 * @param _item
	 */
	function _fireOnResizeEnd(_item) {
		
		if(_columnWidthsRemember=="true" && _dhtmlxGrid!=null) {
			// we need to examine the grid columns and save the widths.
			if(_arResized==null) {
				_arResized = new Array();
				
			}
			var _cnt = _dhtmlxGrid.getColumnsNum();
			for(var i=0; i<_cnt; i++) {
				var _colId = _dhtmlxGrid.getColumnId(i);
				var _colWidth = _dhtmlxGrid.getColWidth(i);
				
				// if the column width is already saved, then update it
				var _found = false;
				for(var c=0; c<_arResized.length; c++) {
					if(_arResized[c][0]==_colId) {
						_arResized[c][1] = _colWidth;
						_found = true;
						break;
					}
				}
				
				// we didnt find it, so we add it as a new column
				if(_found==false) {
					_arResized[_arResized.length] = [_colId, _colWidth];
				}
			}
		}
		
		// pass the event on ...
		_handler.FireEvent(_id, "onResizeEnd");
	}
	
	function _selectAll(_flag)
	{
		_dhtmlxGrid.selectAll();
		if(_flag!=false) _fireOnSelect(_id);
	}
	
	function _toggleHideShow()
	{
		var _div = document.getElementById(_hideShowId);
		if(_div==null) return;
		
		if(_div.style.display=='none') return _div.style.display = 'block';
		_div.style.display = 'none';
	}
	
	function _hide()
	{
		var _div = document.getElementById(_hideShowId);
		if(_div==null) return;
		
		if(_div.style.display=='none') return;
		_div.style.display = "none";
		
	}
	
	function _show()
	{
		var _div = document.getElementById(_hideShowId);
		if(_div==null) return;
		
		if(_div.style.display=='block') return;
		_div.style.display = "block";
		
	}
	
	function _getColumnValuesByName(_name)
	{
		var _colIndex 	= _getColumnIndexByName(_name);
		var _values		= [];
		
		for(var i=0; i<_dhtmlxGrid.getRowsNum(); i++)
		{
			_values[_values.length] = _dhtmlxGrid.cells2(i, _colIndex).getValue();
		}
		
		return _values;
	}
	
	function _getPropertyForRow(_rowNum, _name)
	{
		if(_dhtmlxGrid==null) return;
		
		var _collObj		= _getObjectByName(_collection.GetId(), _me, _id);
		var _rowId			= (_dhtmlxGrid!=null)? _dhtmlxGrid.getRowId(_rowNum) : '';
		var _parts			= _rowId.split('^');
		var _row			= _collObj.GetItemByRowId(_parts[1]);

		return _row.GetProperty(_name);
	}
	
	function _getAllProperties(_includeInternals)
	{
		if(_dhtmlxGrid==null) return;
		
		try {
			var _collObj		= _getObjectByName(_collection.GetId(), _me, _id);
			var _rowId			= (_dhtmlxGrid!=null)? _dhtmlxGrid.getSelectedRowId() : '';
			var _parts			= _rowId.split('^');
			var _row			= _collObj.GetItemByRowId(_parts[1]);
			
			return _row.GetAllProperties();
			
		} catch(e) {
			return [];
		}
	}
	
	function _getProperty(_name)
	{
		if(_dhtmlxGrid==null) return('');
		
		if(_name=="SelectedRowId")
		{
			return _dhtmlxGrid.getSelectedRowId();
		}
		
		try {
			var _collObj		= _getObjectByName(_collection.GetId(), _me, _id);
			var _rowId			= (_dhtmlxGrid!=null)? _dhtmlxGrid.getSelectedRowId() : '';
			
			if(_rowId=='')
			{
				_log('DEBUG', _me, 'GRID: ' + _id + ' NO ROW SELECTED');
				return '';
			}
			
			var _ids			= _rowId.split(',');
			var _val			= '';
			for(var i=0; i<_ids.length; i++)
			{
				var _parts			= _ids[i].split('^');
				var _row			= _collObj.GetItemByRowId(_parts[1]);
				
				if(_addQuotes=="true")
				{
					_val += (i==0)? "'" + _row.GetProperty(_name) + "'" : _delimiter + "'" + _row.GetProperty(_name) + "'";
					
				} else
				{
					_val += (i==0)? _row.GetProperty(_name) : _delimiter + _row.GetProperty(_name);
				}
			}
			
			return _val;
	
		} catch(e) { return(''); }
	}
	
	/**
	 * draw()
	 * creates the grid object and adds the items to it.
	 */
	function _draw()
	{
		if(_debug=="true") _addTimeline(_id, new Date(), null, 'draw grid');
		
		try {
			if(_dhtmlxGrid!=null) {
				_dhtmlxGrid.destructor();
				_dhtmlxGrid = null;
			}
		
		} catch(e) { console.log("Grid failed to draw: " + _dhtmlxGrid); return;}
		
		_dhtmlxGrid = (_target.attachGrid!=null && _target.attachGrid!='undefined')? _target.attachGrid() : new dhtmlXGridObject(_id);
		_dhtmlxGrid.setImagePath(_defaultImgsPath);
		_dhtmlxGrid.setSkin("dhx_skyblue");
		
		
		_dhtmlxGrid.attachEvent("onRowSelect", _me.CallbackOnSelect);
		_dhtmlxGrid.attachEvent("onFilterEnd", _me.CallbackOnFilterEnd);
		_dhtmlxGrid.attachEvent("onSortingEnd", _me.CallbackOnSortingEnd);
		_dhtmlxGrid.attachEvent("onSelectStateChanged", _me.CallbackOnSelectChange);
		_dhtmlxGrid.attachEvent("onDrop", _me.CallbackOnDragEnd);
		
		_collection = _getObjectByName(_xml.getAttribute('collection'), _me);
		
		if(_headers.length>0)
		{
			for(var h=0; h<_headers.length; h++)
			{
				var _header = _headers[h];
				if(_headers[h]=='*') _header = _getHeaders();
				
				if(h==0)
				{
					_dhtmlxGrid.setHeader(_evaluate(null, _header, false));
				} else
				{
					_dhtmlxGrid.attachHeader(_evaluate(null, _header, false));
				}
			}
		} else
		{
			_dhtmlxGrid.setHeader(_getHeaders());
		}
		
		if(_whichColumns==null)
		{
			if(_headers.length==0) 			_whichColumns = _getHeaders();
			if(_headers.length>0)			_whichColumns = _headers[_headers.length-1];
			if(_whichColumns=='*') 			_whichColumns = _getHeaders();
		}
		
		_dhtmlxGrid.setColumnIds(_evaluate(_me,_whichColumns, true));
		_dhtmlxGrid.setColTypes(_getColumnTypes());
		_dhtmlxGrid.setColAlign(_getColumnAlignment());
		_dhtmlxGrid.setInitWidths(_getColumnWidths());
		_dhtmlxGrid.setColumnColor(_getColumnColours());
		_dhtmlxGrid.setColSorting(_getColumnSorting());

		_dhtmlxGrid.attachEvent("onResizeEnd", _me.CallbackOnResizeEnd);
		
		if(_f_allowSort)			_dhtmlxGrid.setColSorting(_getColumnSorting());
		if(_f_allowDrag)			_dhtmlxGrid.enableDragAndDrop(true);
		if(_f_hideHeader)		_dhtmlxGrid.setNoHeader(true);
		if(_f_multiSelect)		_dhtmlxGrid.enableMultiselect(true);
		
		// finally, we need to set the number formatting

		var _cols = _evaluate(_me,_whichColumns, true).split(',');
		for(var i=0; i<_cols.length; i++)
		{
			var _format = _getFormatForColumn(_cols[i]);
			if(_format!=null)
			{
				try {
					_dhtmlxGrid.setNumberFormat(_format, i);
				} catch(e) { }
			}
		}
		
		_handler.WantEvent(_id, _collection.GetId(), 'Refresh', 'Redraw', 'always');
		_dhtmlxGrid.init();
		_redraw();
		
		if(_debug=="true") _updateTimeline(_id, new Date());
	}
	
	function _redraw()
	{
		var _items 	= _collection.GetAllItems();
		var _arAll	= new Array();
		var _cols	= _evaluate(_me, _whichColumns, true).split(',');
		
		_dhtmlxGrid.clearAll();
		
		_dhtmlxGrid.setColumnIds(_evaluate(_me, _whichColumns, true));
		for(var i=0; i<_items.length; i++)
		{
			var _ar 	= new Array();
			var _item	= _items[i];
			
			for(var c=0; c<_cols.length; c++)
			{
				_ar[_ar.length] = _item.GetProperty(_cols[c]);
			}
			
			_arAll[_arAll.length] = { id:_id+"^"+i,data:_ar };
		}
		
		console.log(_arAll);
		
		_dhtmlxGrid.parse({rows:_arAll}, "json");
		
		// we need to apply row level formatting afterwards (dont ask)
		if(_rows.length>0) {
			for(var i=0; i<_items.length; i++)
			{
				var _ar 	= new Array();
				var _item	= _items[i];
				
				for(var r=0; r<_rows.length; r++)
				{
					if(_rows[r].IsForRow(_item))
					{
						if(_rows[r].GetTextStyle()!=null) 			_dhtmlxGrid.setRowTextStyle(_id+"^"+i, _rows[r].GetTextStyle());
						if(_rows[r].GetBackgroundColour()!=null) 	_dhtmlxGrid.setRowColor(_id+"^"+i, _rows[r].GetBackgroundColour());
					}
				}
			}
		}
		
		// if we want the first row selected on load ...
		if(_f_selectOnLoad!=null && _f_selectOnLoad!="false") 
		{
			var _select = null;
			
			switch(_f_selectOnLoad)
			{
				case 'true':
					_select = _id + "^0";
					_dhtmlxGrid.selectRowById(_select);
					break;
					
				case 'all':
	                _selectAll(false);
	                break;
	                
				default:
					var _eval = _evaluate(_me, _f_selectOnLoad, true);
					var _parts = _eval.split('^');
					if(_parts.length>1) // we have rowid from another grid
					{
						// then we use select by row id
						_select = _id + "^" + _parts[1];
						_dhtmlxGrid.selectRowById(_select);
					} else
					{
						// we use select by something else
						_parts = _eval.split('=');
						var _colname = _parts[0];
						var _colvalue = _parts[1];
						_select = _selectByColumnValue(_colname, _colvalue);
					}
					break;
			}
			
			_handler.FireEvent(_select, "onSelect");
		}
		
		try {
			_dhtmlxGrid.filterByAll();
		} catch(e) { }
		
		_handler.FireEvent(_id, "Refresh");
		_handler.FireEvent(_id, "Ready");
	}
	
	function _addHeader(_value, _data)
	{
		_headers[_headers.length] = _value;
		if(_data!=null) _whichColumns = _data;
	}
	
	function _addColumnDefinition(_c_name, _c_treatAs, _c_align, _c_width, _c_colour, _c_sortAs, _c_format)
	{
		_columns[_columns.length] = new ColumnDefinition(_c_name, _c_treatAs, _c_align, _c_width, _c_colour, _c_sortAs, _c_format);
	}
	
	function _addRowDefinition(__row)
	{
		_rows[_rows.length] = new RowDefinition(__row);
	}
	
	function _selectByColumnValue(_colname, _colvalue)
	{
		var _index = _getColumnIndexByName(_colname);
		if(_index==-1) return(_id + '^0');

		for (var i=0; i<_dhtmlxGrid.getRowsNum(); i++)
		{
			if(_dhtmlxGrid.cells(_id + '^' + i, _index).getValue() == _colvalue)
			{
				_dhtmlxGrid.selectRow(i, true, false, true);
				return(_id + '^' + i);
			}
		}
		
		 return(_id + '^0');
	}
	
	function _selectRowByIndex(_index)
	{
		var _parts = _index.split('^');
		_dhtmlxGrid.selectRow(_parts[1], true, false, true);
	}
	
	/**
	 * filterEvent()
	 * Filters the data by the supplied item information
	 * @param _item
	 */
	function _filterByValueEvent(_item)
	{
		var _parts = _item.split('^');
		
		if(_parts.length==2)
		{
			_dhtmlxGrid.filterBy(0, "");
			_dhtmlxGrid.refreshFilters();
			return;
		}
		
		var _index	= _getColumnIndexByName(_parts[2]);
		if(_index==-1) return;
		
		_dhtmlxGrid.filterBy(_index, _parts[3]);
		_dhtmlxGrid.refreshFilters();
		
		_fireOnFilterEnd();
	}

	function _filterByRowIdEvent(_item)
	{
		var _parts 	= _item.split('^');
		var _items 	= _collection.GetAllItems();
		var _arAll	= new Array();
		var _cols	= _whichColumns.split(',');
		
		// we reset the contents to the original list of items
		if(_parts.length!=2)
		{
			_dhtmlxGrid.clearAll();
			for(var i=0; i<_items.length; i++)
			{
				var _ar 	= new Array();
				var _item	= _items[i];
				
				for(var c=0; c<_cols.length; c++)
				{
					_ar[_ar.length] = _item.GetProperty(_cols[c]);
				}
				
				_arAll[_arAll.length] = { id:_id+"^"+i,data:_ar };
			}
			
			_dhtmlxGrid.parse({rows:_arAll}, "json");
			_dhtmlxGrid.refreshFilters();
			
			// we need to apply row level formatting afterwards (dont ask)
			for(var i=0; i<_items.length; i++)
			{
				var _ar 	= new Array();
				var _item	= _items[i];
				
				for(var r=0; r<_rows.length; r++)
				{
					if(_rows[r].IsForRow(_item))
					{
						if(_rows[r].GetTextStyle()!=null) 			_dhtmlxGrid.setRowTextStyle(_id+"^"+i, _rows[r].GetTextStyle());
						if(_rows[r].GetBackgroundColour()!=null) 	_dhtmlxGrid.setRowColor(_id+"^"+i, _rows[r].GetBackgroundColour());
					}
				}
			}
			return;
		}
		
		// we display only the record with the selected ID.
		_dhtmlxGrid.clearAll();
		var _item	= _items[_parts[1]];
		var _ar 	= new Array();
		
		for(var c=0; c<_cols.length; c++)
		{
			_ar[_ar.length] = _item.GetProperty(_cols[c]);
		}
		
		_dhtmlxGrid.addRow(_id+"^"+_parts[1], _ar);
		
		for(var r=0; r<_rows.length; r++)
		{
			if(_rows[r].IsForRow(_item))
			{
				if(_rows[r].GetTextStyle()!=null) 			_dhtmlxGrid.setRowTextStyle(_id+"^"+_parts[1], _rows[r].GetTextStyle());
				if(_rows[r].GetBackgroundColour()!=null) 	_dhtmlxGrid.setRowColor(_id+"^"+_parts[1], _rows[r].GetBackgroundColour());
			}
		}
		
		_dhtmlxGrid.refreshFilters();
	}
	
	/**
	 * Returns the column zero based index or -1 on unknown column name
	 * @param _name
	 * @returns {Number}
	 */
	function _getColumnIndexByName(_name)
	{
		var _parts		= _evaluate(_me, _whichColumns, true).split(',');
		
		for(var i=0; i<_parts.length; i++)
		{
			if(_parts[i]==_name) return i;
		}
		
		return -1;
	}
	
	/**
	 * creates the sorting data type for the columns
	 * @returns {String}
	function _getColumnSorting()
	{
		if(_columnSortAs!=null) {
			var r = _evaluate(_me, _columnSortAs, true);
			alert(r);
			return r;
		}
		
		var _str = "";
		
		var _item 			= _collection.GetAllItems()[0];
		var _properties 	= _item.GetAllProperties();
		var _str			= "";
		
		for(var p=0; p<_properties.length; p++)
		{
			if(p>0) _str += ",";
			_str += "str";
		}
		
		return _str;
	}
	 */
	
	/**
	 * creates the column type string for initialising the grid
	 * @returns {String}
	 */
	function _getColumnTypes()
	{
		var _headers		= _evaluate(_me, _whichColumns, true);
		var _str			= "";
		
		for(var p=0; p<_headers.length; p++)
		{
			if(p>0) _str += ",";
			_str += _getColumnType(_headers[p]);
		}

		return _str;
	}

	function _getColumnAlignment()
	{
		if(_columnAlign!=null) return _evaluate(_me, _columnAlign, true);

		var _headers		= _evaluate(_me, _whichColumns, true);
		var _str			= "";
		
		for(var p=0; p<_headers.length; p++)
		{
			if(p>0) _str += ",";
			_str += _getColumnAlign(_headers[p]);
		}

		return _str;
	}
	
	/**
	 * Column widths are an exception in that we allow the user to specify that the widths must
	 * be remembered between redraw actions. Columns can be added or removed from the grid, so we need to keep
	 * the column widths seperate from the actual value used.
	 * @returns
	 */
	function _getColumnWidths()
	{
		if(_arResized==null && _columnWidths!=null) {
			var r = _evaluate(_me, _columnWidths, true);
			return r;
		}

		var _headers		= _evaluate(_me, _whichColumns, true).split(",");
		var _str			= "";
		
		for(var p=0; p<_headers.length; p++)
		{
			// first check if we allow remember on the widths and have saved them
			if(_columnWidthsRemember=="true" && _arResized!=null) {
				for(var i=0; i<_arResized.length; i++) {
					if(_arResized[i][0]==_headers[p]) {
						if(p>0) _str += ",";
						_str += _arResized[i][1];
					}
				}
			} else {
				if(p>0) _str += ",";
				_str += _getColumnWidth(_headers[p]);
			}
		}
		return _str;
	}
	
	function _getColumnColours()
	{
		var _headers		= _evaluate(_me, _whichColumns, true).split(",");
		var _str			= "";
		
		for(var p=0; p<_headers.length; p++)
		{
			if(p>0) _str += ",";
			_str += _getColumnColour(_headers[p]);
		}

		return _str;
	}
	
	function _getColumnSorting()
	{
		if(_columnSortAs!=null) {
			var r = _evaluate(_me, _columnSortAs, true);
			return r;
		}

		var _headers		= _evaluate(_me, _whichColumns, true).split(",");
		var _str			= "";
		
		for(var p=0; p<_headers.length; p++)
		{
			if(p>0) _str += ",";
			_str += _getColumnSortType(_headers[p]);
		}

		return _str;
	}
	
	function _getFormatForColumn(_colName)
	{
		for(var i=0; i<_columns.length; i++)
		{
			var _column  = _columns[i];
			if(_column.IsForColumn(_colName)==true && _column.GetFormat()!=null) return _column.GetFormat();
		}
		
		return null;
	}
	
	function _getColumnColour(_colName)
	{
		for(var i=0; i<_columns.length; i++)
		{
			var _column  = _columns[i];
			if(_column.IsForColumn(_colName)==true && _column.GetColour()!=null) return _column.GetColour();
		}
		
		return "";
	}

	function _getColumnWidth(_colName)
	{
		for(var i=0; i<_columns.length; i++)
		{
			var _column  = _columns[i];
			if(_column.IsForColumn(_colName)==true && _column.GetWidth()!=null) return _column.GetWidth();
		}
		
		return "*";
	}
	
	function _getColumnAlign(_colName)
	{
		for(var i=0; i<_columns.length; i++)
		{
			var _column  = _columns[i];
			if(_column.IsForColumn(_colName)==true && _column.GetAlign()!=null) return _column.GetAlign();
		}
		
		// return default type of 'left'
		return "left";
	}
	
	function _getColumnType(_colName)
	{
		for(var i=0; i<_columns.length; i++)
		{
			var _column  = _columns[i];
			if(_column.IsForColumn(_colName)==true && _column.GetType()!=null) return _column.GetType();
		}
		
		// return default type of 'ro'
		return "ro";
	}
	
	function _getColumnSortType(_colName)
	{
		for(var i=0; i<_columns.length; i++)
		{
			var _column  = _columns[i];
			if(_column.IsForColumn(_colName)==true && _column.GetSortType()!=null) return _column.GetSortType();
		}
		
		// return default type of 'str'
		return "str";
	}
	
	/**
	 * examines the first record and extracts the property names to create the column titles.
	 * @returns {String}
	 */
	function _getHeaders()
	{
		var _str = "";
		
		try {
			var _item 			= _collection.GetAllItems()[0];
			var _properties 	= _item.GetAllProperties();
//			var _str			= "";
			
			for(var p=0; p<_properties.length; p++)
			{
				var _property = _properties[p];
				
				if(p>0) _str += ",";
				_str += _property.key;
			}
		} catch(e) { 
			return _str;
		}
		
		return _str;
	}
	
}

function ColumnDefinition(_c_name, _c_treatAs, _c_align, _c_width, _c_colour, _c_sortAs, _c_format)
{
	var _name			= _c_name;
	var _treatAs		= _c_treatAs;
	var _align			= _c_align;
	var _width			= _c_width;
	var _colour			= _c_colour;
	var _sortAs			= _c_sortAs;
	var _format			= _c_format;
	
	this.IsForColumn	= _isForColumn;
	this.GetType		= function _getType() { return _treatAs; }
	this.GetAlign		= function _getAlign() { return _align; }
	this.GetWidth		= function _getWidth() { return _width; }
	this.GetColour		= function _getColour() { return _colour; }
	this.GetSortType	= function _getSortType() { return _sortAs; }
	this.GetFormat		= function _getFormat() { return _format; }
	
	function _isForColumn(_colName)
	{
		var _parts = _name.split(',');
		for(var i=0; i<_parts.length; i++)
		{
			if(_parts[i] == _colName) return true;
		}
		
		return false;
	}
	
}

/**
 * RowDefinition()
 * allows you to specify styling for rows based on matches row values.
 */
function RowDefinition(_xml)
{
	var _column 		= _xml.getAttribute('column');
	var _bgColour		= _xml.getAttribute('backgroundColour');
	var _textStyle		= _xml.getAttribute('textStyle');
	var _action			= null;
	var _matches		= null;
	
	this.IsForRow				= _isForRow;
	this.GetBackgroundColour	= function _getBackgroundColour() { return _bgColour; }
	this.GetTextStyle			= function _getTextStyle() { return _textStyle; }
	
	// figure out which conjunction to use
	_matches 	= _xml.getAttribute('equals');
	_action		= 'equals';
	if(_matches==null) { _matches = _xml.getAttribute('notEquals'); _action='notEquals';}
	if(_matches==null) { _matches = _xml.getAttribute('greaterThan'); _action='greaterThan';}
	if(_matches==null) { _matches = _xml.getAttribute('lessThan'); _action='lessThan';}
	
	function _isForRow(_row)
	{
		if(_matches==null) return false;
		
		switch(_action)
		{
			case 'equals':
				if(_row.GetProperty(_column)==_matches) return true;
				break;
				
			case 'notEquals':
				if(_row.GetProperty(_column)!=_matches) return true;
				break;
				
			case 'greaterThan':
				if(parseFloat(_row.GetProperty(_column))>parseFloat(_matches)) return true;
				break;
				
			case 'lessThan':
				if(parseFloat(_row.GetProperty(_column))<parseFloat(_matches)) return true;
				break;
				
		}
		
		return false;
	}
}





