/**
 * Set object
 * allows you to set a constant to a specific value - only works for constants at the moment
 */

// add the Layout object to the dictionary
_dictionary.words.set('set', new DictionaryItem('set', _initSet, MyQSet));

function _initSet(_node, _to, _prefix, _me)
{
	var _n_id						= _prefix + _node.getAttribute('id');
	var _object						= new MyQSet(_n_id, null, _node)
	
	_Objects[_Objects.length] 		= new kvp(_n_id, _object);

	_object.SetDashboard(_me);
	_object.SetEventHandler(_EventHandler);
	_object.Draw();
	
	return _object;
}

function MyQSet(__id, __target, __xml)
{
	this.type						= 'Set';
	
	var _id							= __id;
	var _xml						= __xml;
	var _hideShowId					= __id;
	var _target						= __target;
	var _item						= null;
	var _value						= null;
	var _dashboard					= null;
	var _collection					= null;
	var _me							= this;
	
	this.Draw						= _draw;
	this.Redraw						= _redraw;
	this.GetProperty				= _getProperty;
	this.GetAllProperties			= _getAllProperties;
	this.SetEventHandler			= function _setEventHandler(__handler) { _handler = __handler; }
	this.SetHideShowId				= function _setHideShowId(_value) { _hideShowId = _value; }
	this.SetDashboard				= function _setDashboard(_value) { _dashboard = _value; }
	this.GetId						= function _getID() { return _id; }

	function _getAllProperties()
	{
		var _ar = new Array();
		
		_ar[_ar.length]					= new kvp('id', _id);
		
		return _ar;
	}
	
	function _getProperty(_name)
	{
		switch(_name)
		{
			case 'id':
				return _id;
				
			default:
				return '';
		}
	}
	
	function _draw()
	{
		if(_debug=="true") _addTimeline(_id, new Date(), null, 'draw Set');
		
		_item 		= _xml.getAttribute('item');
		_value		= _xml.firstChild.nodeValue;
		
		_redraw();
		if(_debug=="true") _updateTimeline(_id, new Date());
	}
	
	function _redraw()
	{
		var _newValue 	= _evaluate(_me, _value, false, _id);
		var _evalParts	= _evaluate(_me, _item, false, _id);
		var _parts			= _evalParts.split('.');
		
		var _object			= _getObjectByName(_parts[0], _me, _id);
		
		_object.SetProperty(_parts[1], _newValue);
	}
}