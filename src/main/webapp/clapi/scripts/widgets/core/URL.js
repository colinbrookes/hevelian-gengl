/**
 * URL()
 * Probably the simplest of the GUI components. It loads a URL into a layout area or tab on the page.
 * The dhtmlx library takes care of creating an iFrame for it as required.
 */

// add the Layout object to the dictionary
_dictionary.words.set('url', new DictionaryItem('url', _initURL, URL));

function _initURL(_node, _to, _prefix, _me)
{
	var _n_id			= _prefix + _node.getAttribute('id');
	var _u_src			= _node.getAttribute('src');
	
	var _div_position		= _node.getAttribute('position');
	var _div_hide			= _node.getAttribute('HideOnOpen');
	var _container			= new Container(_node, _n_id, _to, _prefix);
	var _toNode 			= _container.target;
	
	var _object			= new URL(_n_id, _toNode, _u_src, _node);
	
	if(_container.hideShowId!=null) _object.SetHideShowId(_container.hideShowId);
	_object.SetEventHandler(_EventHandler);
	_Objects[_Objects.length] 			= new kvp(_n_id, _object);
//	_addObject(_n_id, _object);
	
	_object.Draw();
	
	if(_div_position=='absolute' && _div_hide!=null && _div_hide=="true") _object.Hide();
	
	return _object;
}

function URL(__id, __target, __url, __node)
{
	this.type					= 'URL';
	
	var _id					= __id;
	var _hideShowId			= __id;
	var _target				= __target;
	var _handler			= null;
	var _node 				= __node;
	var _url				= __url;
	var _refresh			= __node.getAttribute('refresh');
	var me					= this;
	
	// public methods
	this.Draw				= _draw;
	this.Redraw				= _redraw;
	this.GetProperty		= function _getProperty() { return null; }
	this.SetEventHandler	= function _setEventHandler(__handler) { _handler = __handler; }
	this.SetHideShowId		= function _setHideShowId(_value) { _hideShowId = _value; }
	this.GetId				= function _getID() { return _id; }

	this.Hide					= _hide;
	this.Show					= _show;
	this.ToggleHideShow			= _toggleHideShow;

	function _draw()
	{
		if(_debug=="true") _addTimeline(_id, new Date(), null, 'draw url');
		
		_redraw();
		
		if(_debug=="true") _updateTimeline(_id, new Date());
	}
	
	function _redraw()
	{
		var _result = _processParameters(_node,me,_handler, 'Redraw', _refresh);
		_target.attachURL(_evaluate(me, _url, true) + _result);
	}

	function _toggleHideShow()
	{
		var _div = document.getElementById(_hideShowId);
		if(_div==null) return;
		
		if(_div.style.display=='none') return _div.style.display = 'block';
		_div.style.display = 'none';
	}
	
	function _hide()
	{
		var _div = document.getElementById(_hideShowId);
		if(_div==null) return;
		
		if(_div.style.display=='none') return;
		_div.style.display = "none";
		
	}
	
	function _show()
	{
		var _div = document.getElementById(_hideShowId);
		if(_div==null) return;
		
		if(_div.style.display=='block') return;
		_div.style.display = "block";
		
	}

}
