function ListConnector(__xml)
{
	var _XML		= __xml;
	var _delimiter	= _XML.getAttribute('delimiter');
	var _handler	= null;
	var _collection	= null;
	
	this.SetItemCollection	= function _setItemCollection(__collection) { _collection = __collection; }
	this.SetEventHandler	= function _setEventHandler(__handler) { _handler = __handler; }
	this.Select				= _select;

	function _selectDebug()
	{
		var _ar = [];
		_ar[_ar.length] = {id:"select", data:["LIST WITH DELIMITER " + _delimiter]};
		return _ar;
		
	}
	
	function _select(_debug)
	{
		if(_debug==true) return _selectDebug();
		
		var _items		= [];
		
		var _str			= _evaluate(_collection, _XML.firstChild.nodeValue, true);
		var _parts		= _str.split(_delimiter);
		for(var i=0; i<_parts.length; i++)
		{
			var _ar 				= [];
			_ar[0]					= new kvp('Value', _parts[i]);
			_items[_items.length]	= new Item(_ar, 'array');
		}
		
		return _items;
	}
}
