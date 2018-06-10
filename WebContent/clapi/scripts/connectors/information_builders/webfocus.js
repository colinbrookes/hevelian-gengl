/**
 * WFConnector()
 * This is a simple connector for fetching data from a WebFocus XML source. Only the 'select'
 * CRUD method is supported, and paging is not supported.
 */
function WFConnector(__xml)
{
	var _XML				= __xml;
	var _from				= __xml.getAttribute('src');
	var _handler			= null;
	var _collection		= null;
	var _parameters		= null;
	var _refresh			= __xml.getAttribute('refresh');
	var _failed				= false;
	var _params			= null;
	var _items				= [];
		
	this.SetItemCollection	= function _setItemCollection(__collection) { _collection = __collection; }
	this.SetEventHandler	= function _setEventHandler(__handler) { _handler = __handler; }
	this.Select				= _select;
	
	function _selectDebug()
	{
		var _ar = [];
		
		_parameters		= _processParameters(_XML, _collection, _handler, null, _refresh);
		
		_ar[_ar.length] = {id:"select", data:["SELECT * FROM " + _from]};
		_ar[_ar.length] = {id:"parameters", data:[_parameters]};
		
		return _ar;
	}
	
	function _select(_debug)
	{
		if(_debug==true) return _selectDebug();
		
		_parameters		= _processParameters(_XML, _collection, _handler, null, _refresh);
		if(_parameters == null) { _failed=true; return _items; }
		
		try {
			_log('PARAMS', _collection,  _parameters + " (" + _parameters.length + ")");
			_log('PARAMS', _collection, _params + " (" + _params.length + ")");
		} catch (e) { }
		
		if(_params!=null && _parameters==_params && _items.length>0)
		{
			return _items;
		}
		
		_params 				= _parameters;
		_items					= [];
		
		var _ajax 		= new sisAJAXConnector();
		var _url 		= (_parameters!=null)? _from + _parameters : _from;
		_ajax.open("GET", _url, false);
		_ajax.send(null);

		//var _xml 		= new sisXMLDocument(_ajax.responseText.replace(/\&/g,'&amp;'));
		var _xml 		= new sisXMLDocument(_ajax.responseText);
		var _arCols 	= [];
		var _columns	= _xml.getElementsByTagName('column_desc')[0].getElementsByTagName('col');
		for(var i=0; i<_columns.length; i++) _arCols[_arCols.length] = new kvp(_columns[i].getAttribute('colnum'), _columns[i].getAttribute('fieldname'));

		var _Nodes	 	= _xml.getElementsByTagName('table')[0].getElementsByTagName('tr');
		for(var i=0; i<_Nodes.length; i++)
		{
			var _Node = _Nodes[i];
			
			_Node.normalize();
			
			if(_Node.getAttribute('linetype')!='data') continue;
			
			_items[_items.length] = new Item(_Node, "fxf", _arCols);
		}
		
		return _items;
	}
	
	function _findValueByKey(_kvp, _key)
	{
		for(var i=0; i<_kvp.length; i++) if(_kvp[i].key==_key) return _kvp[i].value;
		return '';
	}
}
