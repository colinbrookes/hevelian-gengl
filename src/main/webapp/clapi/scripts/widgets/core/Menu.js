/**
 * MenuBar()
 */

// add the Layout object to the dictionary
_dictionary.words.set('menu', new DictionaryItem('menu', _initMenu, MenuBar));

function _initMenu(_node, _to, _prefix, _dashboard)
{
	var _v_id			= _prefix + _node.getAttribute('id');
	var _src 			= _node.getAttribute('src')
	var _object 		= new MenuBar(_v_id, _to, _node);
	
	_object.SetEventHandler(_EventHandler);
//	_addObject(_v_id, _object);
	_Objects[_Objects.length] 			= new kvp(_v_id, _object);
	_object.Draw(_src);
	
	return _object;
}

function MenuBar(__id, __target)
{
	this.type					= 'Menu';
	
	var _id					= __id;
	var _target				= __target;
	var _handler			= null;
	var _menus				= new Array();
	var _menuItems			= new Array();
	var _dhtmlxMenu			= null;
	
	// public methods
	this.Draw				= _draw;
	this.Redraw				= _draw;
	this.GetProperty		= function _getProperty() { return null; }
	this.SetEventHandler	= function _setEventHandler(__handler) { _handler = __handler; }
	this.GetId				= function _getID() { return _id; }
	this.GetMenu			= function _getMenu() { return _dhtmlxMenu; }
	this.GetDHTMLXObject	= this.GetMenu;
	
	// default callbacks are stored, so they can be fired anyway
	this.DefaultOnClick			= _fireOnClick;
	
	// overrides possible for callbacks on events
	this.CallbackOnClick		= _fireOnClick;
	// initialisation stuff

	function loadingFinished()
	{
		// TODO: Does nothing at the moment
	}
	
	function _fireOnClick(_item)
	{
		var _parts = _item.split('^');
		var _newItem = _id;
		_handler.FireEvent(_newItem, _parts[0]);
	}
	
	function _draw(_src)
	{
		_dhtmlxMenu = _target.attachMenu();
		_dhtmlxMenu.setIconsPath('clapi/ui/imgs/');
		_dhtmlxMenu.attachEvent("onClick", this.CallbackOnClick);
		_dhtmlxMenu.loadXML(_src, this.loadingFinished);
		//_redraw();
	}
	
	function _redraw()
	{
		// TODO: menubar redraw needs to deal with evaluate stuff.
	}
}
