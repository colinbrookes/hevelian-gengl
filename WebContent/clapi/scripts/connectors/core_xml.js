/**
 * XMLConnector()
 * This is a simple connector for fetching data from an XML source. Only the 'select'
 * CRUD method is supported, and paging is not supported.
 */
function XMLConnector(__xml)
{
	var _XML				= __xml;
	var _nodeName		= _XML.getAttribute('root');
	var _from				= _XML.getAttribute('src');
	var _handler			= null;
	var _collection		= null;
	var _parameters		= null;
	var _params			= null;
	var _items				= [];
	
	this.SetItemCollection	= function _setItemCollection(__collection) { _collection = __collection; }
	this.SetEventHandler	= function _setEventHandler(__handler) { _handler = __handler; }
	this.Select						= _select;
	
	function _selectDebug()
	{
		var _ar 		= [];
		
		_parameters		= _processParameters(_XML, _collection, _handler);
		
		_ar[_ar.length] = {id:"select", data:["SELECT * FROM " + _evaluate(_collection, _from, true)]};
		_ar[_ar.length] = {id:"parameters", data:[_parameters]};
		
		return _ar;
	}
	
	
	function _select(_debug)
	{
		if(_debug==true) return _selectDebug();

		_parameters		= _processParameters(_XML, _collection, _handler);
		if(_parameters == null) { _failed=true; return _items; }

		_params 				= _parameters;
		_items					= [];
		
		var _ajax 		= new sisAJAXConnector();
		var _url 		= (_parameters!=null)? _from + _parameters : _from;
		_ajax.open("GET", _evaluate(_collection, _url, true), false);
		_ajax.send(null);
		
		var _xmlX 		= new sisXMLDocument(_ajax.responseText);
		var _rootNode	= _findRootNode(_xmlX);
		var _Nodes		= _rootNode.getElementsByTagName(_nodeName);
		
		for(var i=0; i<_Nodes.length; i++)
		{
			
			if(_Nodes[i].nodeName == _nodeName)
			{
				try { _Nodes[i].normalize(); } catch(e) { }
				_items[_items.length] = new Item(_Nodes[i]);
			}
		}
		
		return _items;
	}
	
	function _findRootNode(_xmlRoot)
	{
		for(var i=0; i<_xmlRoot.childNodes.length; i++)
		{
			if(_xmlRoot.childNodes[i].nodeType == 1) return _xmlRoot.childNodes[i];
		}
		
		return _xmlRoot;
	}
}
