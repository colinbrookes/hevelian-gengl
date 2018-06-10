
function ItemView(__id, __collection, __target)
{
	this.type					= 'View';
	
	// private data
	var _id							= __id;
	var _hideShowId			= __id;
	var _colName				= __collection;
	var _collection 				= null;
	var _target					= __target;
	var _template				= null;
	var _dhtmlxView			= null;
	var _width						= null;
	var _height					= null;
	var _margin					= null;
	var _padding					= null;
	var _css						= "default";
	var _me						= this;
	
	var _f_allowSort				= false;
	var _f_allowDrag			= false;
	var _f_allowResize			= false;
	var _f_selectOnLoad		= false;
	
	// general object methods
	this.Draw					= _draw;
	this.Redraw					= _redraw;
	this.GetProperty			= _getProperty;
	this.GetAllProperties		= _getAllProperties;
	this.SetEventHandler		= function _setEventHandler(__handler) { _handler = __handler; }
	this.SetHideShowId			= function _setHideShowId(_value) { _hideShowId = _value; }
	this.GetId					= function _getID() { return _id; }
	this.GetDHTMLXObject		= function _getDHTMLXObject() { return _dhtmlxView; }
	this.SetTemplate			= function _setTemplate(_value) { _template = _value;}
	this.SetHeight				= function _setHeight(_value) { _height = _value; }
	this.SetWidth				= function _setWidth(_value) { _width = _value; }
	this.SetMargin				= function _setMargin(_value) { _margin = _value; }
	this.SetPadding				= function _setPadding(_value) { _padding = _value; }
	this.SetCSS					= function _setCSS(_value) { _css = _value; }
	
	// set boolean flags
	this.SetAllowSort				= function _setAllowSort(_flag) { _f_allowSort 		= _flag; }
	this.SetAllowDrag				= function _setAllowSort(_flag) { _f_allowDrag 		= _flag; }
	this.SetAllowResize				= function _setAllowSort(_flag) { _f_allowResize 	= _flag; }
	this.SetSelectionOnLoad			= function _setSelectionOnLoad(_flag) { _f_selectOnLoad = _flag; }
	
	// event callback methods
	this.FilterByRowIdEvent			= _filterByRowIdEvent;
	this.Hide						= _hide;
	this.Show						= _show;
	this.ToggleHideShow				= _toggleHideShow;

	// default callbacks are stored, so they can be fired anyway
	this.DefaultOnSelect		= _fireOnSelect;
	this.DefaultOnDblClick		= _fireOnDblClick;
	
	// overrides possible for callbacks on events
	this.CallbackOnSelect		= _fireOnSelect;
	this.CallbackOnDblClick		= _fireOnDblClick;
	
	// fired events
	function _fireOnSelect(_item)				{		_handler.FireEvent(_item, "onSelect"); _handler.FireEvent(_item, "Refresh");}
	function _fireOnDblClick(_item)				{		_handler.FireEvent(_item, "onDblClick"); }
	
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
	
	function _getProperty(_name)
	{
		if(_dhtmlxView==null) return;
		
		var _collObj		= _getObjectByName(_collection.GetId(), _me, _id);
		var _rowId			= (_dhtmlxView!=null)? _dhtmlxView.getSelected() : '';
		var _parts			= _rowId.split('^');
		var _row			= _collObj.GetItemByRowId(_parts[1]);

		return _row.GetProperty(_name);
	}
	
	function _getAllProperties()
	{
		if(_dhtmlxView==null) return;
		
		try {
			var _collObj		= _getObjectByName(_collection.GetId(), _me, _id);
			var _rowId			= (_dhtmlxView!=null)? _dhtmlxView.getSelected() : '';
			var _parts			= _rowId.split('^');
			var _row			= _collObj.GetItemByRowId(_parts[1]);
			
			return _row.GetAllProperties();
			
		} catch(e) {
			return [];
		}
		
	}

	function _draw()
	{
		if(_debug=="true") _addTimeline(_id, new Date(), null, 'draw view');
		
		 // do nothing yet
		var _p 					= {};
		var _t					= {};

		_t['template']			= _template.replace(/\"/g, "'");
		if(_width!=null)		_t['width'] 			= parseInt(_width);
		if(_height!=null)		_t['height'] 	= parseInt(_height);
		if(_margin!=null)		_t['margin'] 	= parseInt(_margin);
		if(_padding!=null)		_t['padding']	= parseInt(_padding);
		if(_css!=null)			_t['css']		= _css;

		_p['type'] 				= _t;
		_p['container']			= _target.id;
		
		_target.style.overflowY	= 'auto';
		
		_dhtmlxView = (_target.attachDataView!=null)? _target.attachDataView(_p) : new dhtmlXDataView(_p);
		
		_target.style.overflowY	= 'auto';
		
		_dhtmlxView.attachEvent("onAfterSelect", this.CallbackOnSelect);
		_dhtmlxView.attachEvent("onItemDblClick", this.CallbackOnDblClick);
		
		_collection					= _getObjectByName(_colName, _me, _id);
		_handler.WantEvent(_id, _collection.GetId(), 'Refresh', 'Redraw', 'always');
		_redraw();
		
		if(_debug=="true") _updateTimeline(_id, new Date());
	}
	
	function _redraw()
	{
		_dhtmlxView.clearAll();
		
		// now add the data
		_collection					= _getObjectByName(_colName, _me, _id);
		var _items					= _collection.GetAllItems();
		var _arAll					= new Array();
		
		for(var i=0; i<_items.length; i++)
		{
			var _ar 			= {};
			var _properties 	= _items[i].GetAllProperties();
			
			_ar['id'] = _id+"^"+i;
			for(var p=0; p<_properties.length; p++)
			{
				_ar[_properties[p].key]		= _properties[p].value;
			}
			_arAll[_arAll.length] = _ar;
		}
		
		_dhtmlxView.parse(_arAll, 'json');
		
		if(_f_selectOnLoad) _dhtmlxView.select(_id+"^0");

	}
	
	function _filterByRowIdEvent(_item)
	{
		var _parts 			= _item.split('^');
		var _items 			= _collection.GetAllItems();
		var _item				= _items[_parts[1]];
		var _properties 		= _item.GetAllProperties();
		var _arAll				= new Array();
		
		if(_parts.length!=2)
		{
			// restore the entire data set to the view
			for(var i=0; i<_items.length; i++)
			{
				var _ar 			= {};
				var _properties 	= _items[i].GetAllProperties();
				
				_ar['id'] = _id+"^"+i;
				for(var p=0; p<_properties.length; p++)
				{
					_ar[_properties[p].key]		= _properties[p].value;
				}
				_arAll[_arAll.length] = _ar;
			}
			
			_dhtmlxView.parse(_arAll, 'json');
			
			if(_f_selectOnLoad) _dhtmlxView.select(_id+"^0");
			
			return;
		}
		
		_dhtmlxView.clearAll();
		
		var _item	= _items[_parts[1]];
		var _ar 			= {};
		_ar['id'] = _id+"^"+_parts[1];
		for(var p=0; p<_properties.length; p++)
		{
			_ar[_properties[p].key]		= _properties[p].value;
		}
		_arAll[_arAll.length] = _ar;
		_dhtmlxView.parse(_arAll, 'json');
		if(_f_selectOnLoad) _dhtmlxView.select(_id+"^"+_parts[1]);
	}
	
}