/**
 * (C) Hevelian 2013
 *
 * A Tab is not really a full grown component - it can only be added as part of a Tabbar object.
 * However, we need to have dynamic tabs and we need tabs to be able to send and receive events themselves -
 * hence we make it a pseudo full grown component.
 * 
 * This also allows us to have forEach and If statements inside the Tabbar object.
 * 
 * The __target parameter in the case of a Tab is the Tabbar object rather than a container.
 */

function Tab(__node, __target, __prefix)
{
	this.type							= 'Tab';
	
	var _id								= __prefix + __node.getAttribute('id');
	var _prefix							= __prefix;
	var _target							= __target;
	var _xml							= __node;
	var _hideShowId						= _id;
	var _properties						= [];
	var _handler						= null;
	var _dashboard						= null;
	var _me								= this;
	
	this.Draw							= _draw;
	this.Redraw							= _redraw;
	this.GetProperty					= _getProperty;
	this.Hide							= _hide;
	this.Show							= _show;
	this.ToggleHideShow					= _toggleHideShow;
	this.SetEventHandler				= function _setEventHandler(__handler) { _handler = __handler; }
	this.SetHideShowId					= function _setHideShowId(_value) { _hideShowId = _value; }
	this.SetDashboard					= function _setDashboard(_value) { _dashboard = _value; }
	this.GetId							= function _getID() { return _id; }

	/**
	 * Draw()
	 * Should draw the static parts of the object, create any internal objects required and generally initialise stuff. 
	 * Included in the initialisation is the mapping of events from an underlying object to events fired off to the EventHandler.
	 * Normally this method gets called once when the page is loaded and then never again.
	 * It usually calls the _redraw() method once the initialisation has been done.
	 */
	function _draw()
	{
		_redraw();
	}
	
	/**
	 * Redraw()
	 * When an event occurs that causes a 'refresh' the Redraw method gets called for any objects that want that event.
	 * The Redraw() method is where actual rendering to the screen takes place - theoretically the only place.
	 */
	function _redraw()
	{
		
	}
	
	/**
	 * GetProperty()
	 * returns the value associated with the 'name'. The actual properties could be stored in the internal array or may be fetched from an underlying object,
	 * or a combination of both.
	 * 
	 * @param _name
	 */
	function _getProperty(_name)
	{
		
	}
	
	/**
	 * ToggleHideShow()
	 * Flips the hide/show status. 
	 * 
	 * @returns {String}
	 */
	function _toggleHideShow()
	{
		var _div = document.getElementById(_hideShowId);
		if(_div==null) return;
		
		if(_div.style.display=='none') return _div.style.display = 'block';
		_div.style.display = 'none';
	}
	
	/**
	 * Hide()
	 * Hides the main div for this object.
	 */
	function _hide()
	{
		var _div = document.getElementById(_hideShowId);
		if(_div==null) return;
		
		if(_div.style.display=='none') return;
		_div.style.display = "none";
		
	}
	
	/**
	 * Show()
	 * Shows the main div for this object.
	 */
	function _show()
	{
		var _div = document.getElementById(_hideShowId);
		if(_div==null) return;
		
		if(_div.style.display=='block') return;
		_div.style.display = "block";
		
	}
	
}
