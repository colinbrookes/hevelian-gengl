/**
 * ExoniteConnector()
 * (C) Brookes Management B.V. - Colin Brookes - 2012
 * Connects to a server-side defined collection.
 */

function ExoniteConnector(__xml)
{
	var _supports				= "select,update";
	
	var _XML					= __xml;
	var _nodeName				= 'record';
	var _from					= _XML.getAttribute('src');
	var _refresh				= _XML.getAttribute('refresh');
	var _handler				= null;
	var _collection				= null;
	var _parameters				= null;
	var _params					= null;
	var _items					= [];
	var _url					= '';
	var _updateURL				= '';
	
	this.SetItemCollection		= function _setItemCollection(__collection) { _collection = __collection; }
	this.SetEventHandler		= function _setEventHandler(__handler) { _handler = __handler; }
	this.Select					= _select;
	this.Update					= _update;
	
	function _update()
	{
		_parameters		= _processParameters(_XML, _collection, _handler, 'Update', 'once', null, _collection.GetId());
		
		_handler.FireEvent(_collection.GetId(), 'onBeforeUpdate');
		
		_updateURL = _evaluate(_collection, '../exoniteJ/PostCollection.jsp?collection=' + _from, true, _collection.GetId());
		
		var _ajax = new sisAJAXConnector();
		_ajax.open('POST', _updateURL, false);

		_ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=utf-8");
		_ajax.setRequestHeader("Content-length", _parameters.length);
		_ajax.setRequestHeader("Connection", "close");
		
		_ajax.send(_parameters);
		
		var _msgNode = _XML.getAttribute('message');
		if(_msgNode!=null)
		{
			var _doc = new sisXMLDocument(_ajax.responseText);
			var _msg = getXMLNode(_doc, _msgNode, 'update complete');
		}
		
		_handler.FireEvent(_collection.GetId(), 'onAfterUpdate');
	}
	
	function _selectDebug()
	{
		var _ar 		= [];
		
		_parameters		= _processParameters(_XML, _collection, _handler);
		
		_ar[_ar.length] = {id:"select", data:["SELECT * FROM " + _evaluate(_collection, _from, true)]};
		_ar[_ar.length] = {id:"parameters", data:[_parameters]};
		_ar[_ar.length] = {id:"url", data: [_url]};
		
		return _ar;
	}
	
	
	function _select(_debug)
	{
		if(_debug==true) return _selectDebug();
		
		_parameters		= _processParameters(_XML, _collection, _handler, null, _refresh, '&');
		if(_parameters == null) { _failed=true; return _items; }
		
		var _newUrl = _evaluate(_collection, '../hevelian-exonite/api/collection.svc/' + _from + "?", true, _collection.GetId());
		
		_params 				= _parameters;
		_items					= [];
		
		var _ajax 		= new sisAJAXConnector();
		_url 				= (_parameters!=null)? _evaluate(_collection, '../hevelian-exonite/api/collection.svc/' + _from + "?", true, _collection.GetId()) + _parameters : _evaluate(_collection, '../exoniteJ/GetCollection.jsp?collection=' + _from, true, _collection.GetId());
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
