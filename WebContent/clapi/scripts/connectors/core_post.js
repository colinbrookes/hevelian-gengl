/**
 * PostConnector()
 */
function PostConnector(__xml)
{
	var _supports				= "update";
	
	var _XML					= __xml;
	var _url					= _XML.getAttribute('url');
	var _handler				= null;
	var _collection				= null;
	var _parameters				= null;
	var _params					= null;
	var _items					= [];
	
	this.SetItemCollection		= function _setItemCollection(__collection) { _collection = __collection; }
	this.SetEventHandler		= function _setEventHandler(__handler) { _handler = __handler; }
	this.Update					= _update;
	
	function _update()
	{
		// this is the update function
		_parameters		= _processParameters(_XML, _collection, _handler, 'Update', 'once', null, _collection.GetId());
		
		_handler.FireEvent(_collection.GetId(), 'onBeforeUpdate');
		
		var _ajax = new sisAJAXConnector();
		_ajax.open('POST', _url, false);

		_ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=utf-8");
		_ajax.setRequestHeader("Content-length", _parameters.length);
		_ajax.setRequestHeader("Connection", "close");
		
		_ajax.send(_parameters);
		
		var _msgNode = _XML.getAttribute('message');
		if(_msgNode!=null)
		{
			var _doc = new sisXMLDocument(_ajax.responseText);
			var _msg = getXMLNode(_doc, _msgNode, 'update complete');
			alert(_msg);
		}
		
		_handler.FireEvent(_collection.GetId(), 'onAfterUpdate');
	}
	
}
