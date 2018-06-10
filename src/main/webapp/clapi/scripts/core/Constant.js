/**
 * Constants are fixed parameters defined globally and re-used thoughout the layout xml file.
 */
 
function Constant(__id)
{
	this.type						= 'Constant';
	
	var _id							= __id;
	var _handler					= null;
	var _properties				= new Array();
	var _originals				= new Array();
	var _me						= this;
	
	this.GetId						= function _getID() { return _id; }
	this.GetAllProperties		= function _getAllProperties() { return _properties; }
	this.GetProperty			= _getProperty;
	this.SetProperty			= _setProperty;
	this.SetEventHandler		= function _setEventHandler(__handler) { _handler = __handler; }
	this.Draw						= _redraw;
	this.Redraw					= _redraw;
	
	this.AddConstant			= _addConstant;
	
	function _null() { return; }
	
	function _getProperty(_name)
	{
		if(_name==null) return '';
		for(var i=0; i<_properties.length; i++) if(_properties[i].key==_name)
		{
			return _properties[i].value;
		}
		return '';
	}
	
	function _redraw()
	{
		for(var i=0; i<_originals.length; i++)
		{
			if(_originals[i].Refresh=="never") continue;
			
			var _forId					= _handler.GetProperty('LastEventFrom');
			var _newValue			= _evaluate(_me, _originals[i].value, true, _forId);
			if(_newValue==_properties[i].value) continue;
			
			// we finally have an actual value, so we cancel the refresh for 'once' refresh types
			if(_originals[i].Refresh=="once") _originals[i].Refresh = "never";
			
			_properties[i].value = _newValue;
			_handler.FireEvent(_id + '^' + _properties[i].key, 'Refresh');
		}
		
	}
	
	function _setProperty(_name, _value)
	{
		for(var i=0; i<_properties.length; i++)
		{
			if(_properties[i].key==_name)
			{
				 _properties[i].value = _value;
				_handler.FireEvent(_id + '^' + _properties[i].key, 'Refresh');
				 return;
			}
		}
		
		_properties[_properties.length] = new kvp(_name, _value);
	}
	
	/**
	 * _addConstant()
	 * adds a new kvp to the properties of this global object. The values are
	 * evaluated, without events, and presume properties are added in a sensible order.
	 */
	function _addConstant(_xml)
	{
		var _forId					= _handler.GetProperty('LastEventFrom');
		var _name					= _xml.nodeName;
		var _refresh				= _xml.getAttribute('refresh');
		var _value					= _evaluate(_me, _xml.firstChild.nodeValue, (_refresh!='never')? true : false, _forId);
		
		_originals[_originals.length]	= new kvp(_name, _xml.firstChild.nodeValue);
		_properties[_properties.length] = new kvp(_name, _value);
		
		_originals[_originals.length-1].Refresh = _refresh;
	}
}