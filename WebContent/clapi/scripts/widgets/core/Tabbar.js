/**
 * Tabbar()
 * A tabbar component doesnt actually draw anything for itself - it handles drawing the <tab> components.
 */
function Tabbar(__id, __target, __xml)
{
	this.type					= 'Tabbar';
	
	var _id					= __id;
	var _hideShowId			= __id;
	var _target				= __target;
	var _handler			= null;
	var _tabs				= new Array();
	var _dhtmlxTabbar		= null;
	var _orientation		= __xml.getAttribute('orientation');
	var _align				= __xml.getAttribute('align');
	var _margin				= __xml.getAttribute('margin');
	var _offset				= __xml.getAttribute('offset');
	
	// public methods
	this.Draw				= _draw;
	this.Redraw				= _draw;
	this.AddTab				= _addTab;
	this.AddTemplateTab		= _addTemplateTab;
	
	this.GetProperty		= function _getProperty() { return null; }
	this.SetEventHandler	= function _setEventHandler(__handler) { _handler = __handler; }
	this.SetHideShowId		= function _setHideShowId(_value) { _hideShowId = _value; }
	this.GetId				= function _getID() { return _id; }
	this.GetTabbar			= function _getTabbar() { return _dhtmlxTabbar; }
	this.GetDHTMLXObject	= this.GetTabbar;

	this.Hide				= _hide;
	this.Show				= _show;
	this.ToggleHideShow		= _toggleHideShow;
	
	/**
	 * the tabbar breaks the rules - the tabs need to be drawn immediately as they form
	 * a fundamental part of the layout, as opposed to other components that are drawn
	 * in containers. A tabbar, is thus, a container.
	 */
	if(_orientation==null) 	_orientation = 'top';
	if(_align==null)		_align = 'left';
	
	_dhtmlxTabbar = (_target.attachTabbar!=null)? _target.attachTabbar(_orientation) : new dhtmlXTabBar(_id, _orientation);
	_dhtmlxTabbar.setAlign(_align);
	_dhtmlxTabbar.setSkin('dhx_skyblue');
	_dhtmlxTabbar.setImagePath(_defaultImgsPath);
	_dhtmlxTabbar.setHrefMode("iframes-on-demand");
	_dhtmlxTabbar.enableContentZone(true);
	if(_margin!=null) _dhtmlxTabbar.setMargin(_margin);
	if(_offset!=null) _dhtmlxTabbar.setOffset(_offset);
	
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
	
	function _addTemplateTab()
	{
		// a template tab is a tab layout defined to be used for dynamic tabs
	}
	
	function _addTab(__id, __label, __width)
	{
		var _tab = _dhtmlxTabbar.addTab(__id, __label, __width);
		_tabs[_tabs.length] = new kvp(__id, _tab);
		
		return _tab;
	}
	
	function _draw()
	{
		// does nothing ...
	}
}
