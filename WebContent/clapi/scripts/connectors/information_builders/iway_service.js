/**
 * ServiceConnector()
 * Provides connection to iWay pflows published as a service. Currently only supports the
 * 'select' method, and doesnt support paging.
 */
function ServiceConnector(_xml)
{
	var _handler			= null;
	var _collection			= null;
	var _name				= _xml.getAttribute('src');
	var _root				= _xml.getAttribute('root');
	var _data				= (_xml.firstChild!=null)? _xml.firstChild.nodeValue : null;
	
	this.SetItemCollection	= function _setItemCollection(__collection) { _collection = __collection; }
	this.SetEventHandler	= function _setEventHandler(__handler) { _handler = __handler; }
	this.Select				= _select;

	function _selectDebug()
	{
		var _ar = [];
		
		var _post		= (_data!=null && _data!='')? _evaluate(_collection, _data, false) : _data;
		var _type 		= (_data==null || _data=='')? 'GET' : 'POST';
		
		_ar[_ar.length] = {id:"select", data:["SELECT * FROM /Service?name=" + _evaluate(_collection, _name, false)]};
		if(_post!=null&&_post!='')
		{
			_ar[_ar.length] = {id:"postdata", data:["POST DATA:"]};
			_ar[_ar.length] = {id:"post", data:[_post]};
		}
		return _ar;
	}
	
	function _select(_debug)
	{
	
		if(_debug==true) return _selectDebug();
		
		var _items		= [];
		var _url 		= "/Service?name=" + _evaluate(_collection, _name, true);
		var _post		= (_data!=null && _data!='')? _evaluate(_collection, _data, true) : _data;
		var _type 		= (_data==null || _data=='')? 'GET' : 'POST';
		
		var _ajax = new sisAJAXConnector();
		_ajax.open(_type, _url, false);
		_ajax.send(_post);

		try {
			var _xml 	= _ajax.responseXML;
			var _Nodes	= _xml.getElementsByTagName(_root);
			
			for(var i=0; i<_Nodes.length; i++)
			{
				_Nodes[i].normalize();
				_items[_items.length] = new Item(_Nodes[i]);
			}
		} catch(e) { }
		
		return _items;
	}
}
