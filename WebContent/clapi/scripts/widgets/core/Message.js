/**
 * GenGLMessage()
 * Notification messages and popup messages.
 */

// add the Layout object to the dictionary
_dictionary.words.set('message', new DictionaryItem('message', _initMessage, GenGLMessage));

function _initMessage(_node, _to, _prefix, _me)
{
	var _n_id					= _prefix + _node.getAttribute('id');
	var _object				= new GenGLMessage(_n_id, _to, _node);
	
	_object.SetDashboard(_me);
	_object.SetEventHandler(_EventHandler);
	_Objects[_Objects.length] 			= new kvp(_n_id, _object);
//	_addObject(_n_id, _object);
	
	_object.Draw();
	return _object;
}

function GenGLMessage(__id, __target, __node)
{
	this.type						= 'Message';
	
	var _id							= __id;
	var _target					= __target;
	var _handler					= null;
	var _node 						= __node;
	var _dashboard				= null;
	var _title						= __node.getAttribute('title');
	var _lifetime					= __node.getAttribute('lifetime');
	var _position					= __node.getAttribute('position');
	var _message				= __node.firstChild.nodeValue;
	var _me						= this;
	
	// public methods
	this.Draw						= _draw;
	this.Redraw					= _redraw;
	this.GetProperty			= function _getProperty() { return null; }
	this.SetEventHandler		= function _setEventHandler(__handler) { _handler = __handler; }
	this.SetDashboard				= function _setDashboard(_value) { _dashboard = _value; }
	this.GetId						= function _getID() { return _id; }
	
	// hide/show doesnt really apply in the regular sense for messages
	this.Hide						= _hide;
	this.Show						= _show;
	this.ToggleHideShow		= function _toggleHideShow() { return; }

	if(_position==null) 		_position 	= "top";
	if(_lifetime==null) 		_lifetime 	= 1000;
	
	function _show()
	{
		var _m 		= _evaluate(_me, _message, false);
		var _mt		= _evaluate(_me, _title, false);
		
		dhtmlx.message({
			text: '<b>' + _mt + '</b><br/>' + _m,
			expire: parseInt(_lifetime, 10),
			position: _position
		});

	}
	
	function _hide()
	{
		return;
	}
	
	function _draw()
	{
		return;
	}
	
	function _redraw()
	{
		return;
	}

}
