/**
 * Allows you to 'rotate' a single record so that each property becomes an item.
 * Mostly used for showing all properties of a row in a grid easily.
 * @param __xml
 * @returns
 */

function RotateConnector(__xml)
{
	var _XML			= __xml;
	var _src			= _XML.getAttribute('src');
	var _internals		= (_XML.getAttribute('includeInternals')=="true")? true : false;
	var _exclude		= (_XML.getAttribute('exclude')==null)? null : _XML.getAttribute('exclude').split(',');
	var _handler		= null;
	var _collection		= null;
	var _me				= this;
	
	this.SetItemCollection	= function _setItemCollection(__collection) { _collection = __collection; }
	this.SetEventHandler	= function _setEventHandler(__handler) { _handler = __handler; }
	this.Select				= _select;

	function _selectDebug()
	{
		var _ar = [];
		_ar[_ar.length] = {id:"select", data:["ROTATE ROW FROM " + _src]};
		if(_exclude!=null) _ar[_ar.length] = {id:"excluded", data:["Excluded: " + _XML.getAttribute('exclude')]};
		if(_internals!=null) _ar[_ar.length] = {id:"internals", data:["Include Internals: " + _internals]};
		return _ar;
		
	}
	
	function _select(_debug)
	{
		if(_debug==true) return _selectDebug();
		
		var _items		= [];
		
		try {
			_handler.WantEvent(_collection.GetId(), _src, 'Refresh', 'FetchData', "always");
			var _object		= _getObjectByName(_src, _collection, _collection.GetId());
			if(_object==null) {
				return _items;
			}
			
			var _props		= _object.GetAllProperties(_internals);
			if(_props==null) {
				return _items;
			}
			
			// rotate the properties into Items
			for(var i=0; i<_props.length; i++) {
				
				if(_isExcluded(_props[i])) continue;
				
				var _ar = [];
				_ar[0] = new kvp('key', _props[i].key);
				_ar[1] = new kvp('value', _props[i].value);
				
				_items[_items.length]	= new Item(_ar, 'array');
			}
			
		} catch(e) {
			return _items;
		}
		
		return _items;
	}
	
	function _isExcluded(_prop) {
		if(_exclude==null) return false;
		
		for(var i=0; i<_exclude.length; i++) {
			if(_prop.key == _exclude[i].trim()) return true;
		}
		return false;
	}
}
