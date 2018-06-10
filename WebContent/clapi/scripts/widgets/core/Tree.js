
function ItemTree(__id, __collection, __target, __branch, __node, __iconsPath)
{
	this.type					= 'Tree';
	
	// private data
	var _id						= __id;
	var _hideShowId				= __id;
	var _collection 			= __collection;
	var _target					= __target;
	var _branch					= __branch;
	var _node					= __node;
	var _iconsPath				= __iconsPath;
	var _flagCollapseOnLoad		= false;
	var _flagSelectOnLoad		= true;
	var _handler				= null;
	var _dhtmlxTree				= null;
	var _root					= null;
	var _rootId					= null;
	var _me						= this;

	// public methods
	this.Draw					= _draw;
	this.Redraw					= _redraw;
	this.GetProperty			= _getProperty;
	this.SetEventHandler		= function _setEventHandler(__handler) { _handler = __handler; }
	this.SetHideShowId			= function _setHideShowId(_value) { _hideShowId = _value; }
	this.GetId					= function _getID() { return _id; }
	this.SetRoot				= function _setRoot(_value) { _root = _value; }
	this.SetCollapseOnLoad		= function _collapseOnLoad(_value) { _flagCollapseOnLoad = _value; }
	this.SetSelectOnLoad		= function _selectOnLoad(_value) { _flagSelectOnLoad = _value; }
	this.GetSourceId			= function _getSourceId() { return (_collection!=null)? _collection.GetId() : ''; }
	
	this.Hide					= _hide;
	this.Show					= _show;
	this.ToggleHideShow			= _toggleHideShow;
	
	// default callbacks are stored, so they can be fired anyway
	this.DefaultOnClick			= _fireOnClick;
	this.DefaultOnDblClick		= _fireOnDblClick;
	this.DefaultOnSelect		= _fireOnSelect;
	this.DefaultOnRightClick	= _fireOnRightClick;
	this.DefaultOnMouseOver		= _fireOnMouseOver;
	this.DefaultOnMouseOut		= _fireOnMouseOut;
	
	// overrides possible for callbacks on events
	this.CallbackOnClick		= _fireOnClick;
	this.CallbackOnDblClick		= _fireOnDblClick;
	this.CallbackOnSelect		= _fireOnSelect;
	this.CallbackOnRightClick	= _fireOnRightClick;
	this.CallbackOnMouseOver	= _fireOnMouseOver;
	this.CallbackOnMouseOut		= _fireOnMouseOut;

	// event functions
	function _fireOnClick(_item)				{		_handler.FireEvent(_item, "onClick"); _handler.FireEvent(_item, "Refresh"); }
	function _fireOnDblClick(_item)				{		_handler.FireEvent(_item, "onDblClick"); _handler.FireEvent(_item, "Refresh");}
	function _fireOnSelect(_item)				{		_handler.FireEvent(_item, "onSelect"); _handler.FireEvent(_item, "Refresh");}
	function _fireOnRightClick(_item)			{		_handler.FireEvent(_item, "onRightClick"); }
	function _fireOnMouseOver(_item)			{		_handler.FireEvent(_item, "onMouseOver"); }
	function _fireOnMouseOut(_item)				{		_handler.FireEvent(_item, "onMouseOut"); }
	
	if(_iconsPath==null || _iconsPath=='') _iconsPath = 'csh_bluebooks';

	function _getProperty(_name)
	{
		if(_dhtmlxTree==null) return('');
		
		try {
			var _collObj		= _getCollectionByName(_collection.GetId());
			var _rowId			= (_dhtmlxTree!=null)? _dhtmlxTree.getSelectedItemId() : '';
			var _parts			= _rowId.split('^');
			var _row			= _collObj.GetItemByRowId(_parts[1]);
	
			return _row.GetProperty(_name);
		} catch(e) { return(''); }
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
	
	/**
	 * draws the tree to the target cell and renders the data
	 */
	function _draw()
	{
		if(_debug=="true") _addTimeline(_id, new Date(), null, 'draw tree');
		
		_dhtmlxTree = (_target.attachTree!=null)? _target.attachTree() : new dhtmlXTreeObject(_id, "100%", "100%", 0);
		
		_dhtmlxTree.setImagePath("clapi/ui/imgs/"+_iconsPath+"/");
		_dhtmlxTree.enableHighlighting(true);
		
		_dhtmlxTree.attachEvent("onClick", this.CallbackOnClick);
		_dhtmlxTree.attachEvent("onDblClick", this.CallbackOnDblClick);
		_dhtmlxTree.attachEvent("onSelect", this.CallbackOnSelect);
		_dhtmlxTree.attachEvent("onRightClick", this.CallbackOnRightClick);
		_dhtmlxTree.attachEvent("onMouseIn", this.CallbackOnMouseOver);
		_dhtmlxTree.attachEvent("onMouseOut", this.CallbackOnMouseOut);
		
		// now publish that we fire these events
		_handler.PublishEvent(_id, "onClick");
		_handler.PublishEvent(_id, "onDblClick");
		_handler.PublishEvent(_id, "onRightClick");
		_handler.PublishEvent(_id, "onSelect");
		_handler.PublishEvent(_id, "onMouseOver");
		_handler.PublishEvent(_id, "onMouseOut");
		_redraw();
		
		if(_debug=="true") _updateTimeline(_id, new Date());
	}
	
	function _redraw()
	{
		var _evalBranch		= _evaluate(_me, _branch, true);
		var _nodes 			= _collection.GetUnique(_evalBranch);
		
		if(_root!=null)
		{
			_rootId = _id + '^ROOT';
		} else
		{
			_rootId = 0;
		}
		
		_dhtmlxTree.deleteItem(_rootId);
		if(_rootId!=0) _dhtmlxTree.insertNewChild(0, _rootId, _evaluate(_me, _root, true));
		
		for(var n=0; n<_nodes.length; n++)
		{
			var _nodeid = _id + '^' + _evalBranch + '^' + _nodes[n];
			_dhtmlxTree.insertNewChild(_rootId, _nodeid, _nodes[n]);
		}

		if(_node!=null && _node!="")
		{
			_nodes = _collection.GetAllItems();
			
			for(n=0; n<_nodes.length; n++)
			{
				var _parent = _id + '^' + _evalBranch + '^' + _nodes[n].GetProperty(_evalBranch);
				var _value	= _nodes[n].GetProperty(_node);
				_nodeid = _id + '^' + n + '^' + _node + '^' + _nodes[n].GetProperty(_node);

				_dhtmlxTree.insertNewChild(_parent, _nodeid, _value);
			}
		}
		
		if(_flagCollapseOnLoad==true) _dhtmlxTree.closeAllItems(0);
		
		if(_flagSelectOnLoad==true && _nodes[0]!=null)
		{
			_nodeid = _id + '^0^' + _node + '^' + _nodes[0].GetProperty(_node);
			_dhtmlxTree.selectItem(_nodeid, true, false);
		}
		
		_handler.FireEvent(_id, "Refresh");
	}
}