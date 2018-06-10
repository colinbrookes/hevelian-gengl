/**
 * Window()
 * A Window object can only be instantiated through a ShowWindow event at the moment. This means
 * it doesnt implement a 'Draw()' method.
 */
function Window(__xml)
{
	this.type						= 'Window';

	var _xml						= __xml;
	var _id							= __xml.getAttribute('id');
	var _top						= __xml.getAttribute('top');
	var _left						= __xml.getAttribute('left');
	var _width						= __xml.getAttribute('width');
	var _height					= __xml.getAttribute('height');
	var _title						= __xml.getAttribute('title');
	var _modal					= __xml.getAttribute('modal');
	var _icon						= __xml.getAttribute('icon');
	var _ondemand				= __xml.getAttribute('from');
	var _resize					= __xml.getAttribute('allowResize');
	var _maxInstances			= __xml.getAttribute('maxInstances');
	var _hideHeader			= __xml.getAttribute('hideHeader');
	var _layout					= (_ondemand==null)? __xml.getElementsByTagName('layout')[0] : null;
	var _handler					= null;
	var _wins						= [];
	var _parent					= null;
	var _dashboard				= null;
	var _me						= this;
	var _win						= null;
	
	this.SetEventHandler			= function _setEventHandler(__handler) { _handler = __handler; }
	this.SetDashboard				= function _setDashboard(__value) { _dashboard = __value; }
	this.GetId							= function _getID() { return _id; }
	this.Redraw						= _redraw;
	this.GetProperty				= function _getProperty() { return null; }
	this.ShowWindow				= _showWindow;
	this.HideWindow				= _closeWindow;
	this.OpenWindow				= _showWindow;
	this.CloseWindow				= _closeWindow;
	this.SetParent					= _setParent;
	this.doClose						= _doClose;
	
	this.Maximise					= _maximiseWindow;
	this.Maximize					= _maximiseWindow;
	this.Minimise					= _minimiseWindow;
	this.Minimize					= _minimiseWindow;	
	
	if(_maxInstances==null)		_maxInstances = 0;
	
	function _maximiseWindow()
	{
		if(_win==null) return;
		
		_win.maximize();
	}
	
	function _minimiseWindow()
	{
		if(_win==null) return;
		
		_win.minimize();
	}
	
	function _redraw()
	{
		for(var i=0; i<_wins.length; i++)
		{
			if(_title!=null)	_win.setText(_evaluate(_me, _title, true, _id));
		}
		
	}
	
	function _closeWindow()
	{
		if(_win==null) return;
		
		_win.close();
	}
	
	function _showWindow(_from)
	{
		/* if we have reached max instances then we bring the last instance to the front */
		if(_maxInstances > 0)
		{
			if(_wins.length == _maxInstances)
			{
				_wins[_wins.length-1].bringToTop();
				return;
			}
		}
		
		var _date 		= new Date();
		var _prefix		= _date.getTime();
		
		if(_parent==null && _dashboard!=null)
		{
			if(_dashboard.dhxWins==null)
			{
				_dashboard.dhxWins = new dhtmlXWindows();
			}
			
			_parent = _dashboard;
		}
		_parent.dhxWins.setImagePath('clapi/ui/imgs/');
		
		_win = _parent.dhxWins.createWindow(_prefix+"." + _id, parseInt(_left), parseInt(_top), parseInt(_width), parseInt(_height));
		_parent.dhxWins.window(_prefix+"." + _id).attachEvent('onClose', _doClose);
		
		if(_resize=='false') _win.denyResize();
		
		_wins[_wins.length] = _win;
		
		if(_ondemand!=null)
		{
			// when its ondemand, we fetch the layout from the server when we create the window
			var _ajax = new sisAJAXConnector();
			_ajax.open('GET', "GetLayout.jsp?layout=" + _ondemand, false);
			_ajax.send(null);
			
			var _xmlDoc 	= new sisXMLDocument(_ajax.responseText);
			if(_xmlDoc.normalize!=null) _xmlDoc.normalize();

			_layout 			= _xmlDoc.getElementsByTagName('layout')[0];
			
			// first we set the constants
			try {
			
				var _constRoot	= _xmlDoc.getElementsByTagName('constants')[0];
				_dashboard.InitObject(_constRoot, _win, _prefix + ".");
			} catch(e) { }
			
			// next we create the collections
			try {
				var _collections	= _xmlDoc.getElementsByTagName('collections')[0];
				var _sources 		= _collections.getElementsByTagName('collection');
				for(var i=0; i<_sources.length; i++)
				{
					_dashboard.InitObject(_sources[i], _win, _prefix + ".");
				}
			} catch(e) { }
			
			// apparently we want events now too
			try {
				var _events = _xmlDoc.getElementsByTagName('events')[0].getElementsByTagName('event');
				for(var e=0; e<_events.length; e++)
				{
					var _event 		= _events[e];
					var _from		= new String(_event.getAttribute('from'));
					var _type		= _event.getAttribute('type');
					var _callback	= _prefix + "." + _event.getAttribute('to');
					var _propogate	= _event.getAttribute('propogate');
					
					_EventHandler.WantEvent("page", _prefix + '.' + _from, _type, _callback, _propogate, _dashboard);
				}
			} catch(e) { }

			// dont forget to do the messages
			try {
				var _messages		= _xmlDoc.getElementsByTagName('messages');
				var _msgs 			= _messages[0].getElementsByTagName('message');
				for(var m=0; m<_msgs.length; m++)
				{
					var _msg			= _msgs[m];
					_dashboard.InitObject(_msg, _win, _prefix + ".");
				}
				
			} catch(e) { }
			
		} else
		{
			// first we set the constants
			try {
			
				var _constRoot	= _xml.getElementsByTagName('constants')[0];
				_dashboard.InitObject(_constRoot, _win, _prefix + ".");
			} catch(e) { }
			
			// next we create the collections
			try {
				var _collections	= __xml.getElementsByTagName('collections')[0];
				var _sources 		= _collections.getElementsByTagName('collection');
				for(var i=0; i<_sources.length; i++)
				{
					_dashboard.InitObject(_sources[i], _win, _prefix + ".");
				}
			} catch(e) { }
			
			// apparently we want events now too
			try {
				var _events = _xml.getElementsByTagName('events')[0].getElementsByTagName('event');
				for(var e=0; e<_events.length; e++)
				{
					var _event 		= _events[e];
					var _from		= new String(_event.getAttribute('from'));
					var _type		= _event.getAttribute('type');
					var _callback	= _prefix + "." + _event.getAttribute('to');
					var _propogate	= _event.getAttribute('propogate');
					
					_EventHandler.WantEvent("page", _prefix + '.' + _from, _type, _callback, _propogate, _dashboard);
				}
			} catch(e) { }
			
			
			// dont forget to do the messages
			try {
				var _messages		= _xml.getElementsByTagName('messages');
				var _msgs 			= _messages[0].getElementsByTagName('message');
				for(var m=0; m<_msgs.length; m++)
				{
					var _msg			= _msgs[m];
					_dashboard.InitObject(_msg, _win, _prefix + ".");
				}
				
			} catch(e) { }
			
			// set the properties
			if(_debug=="true")
			{
				if(_modal=="true") _title = _title + " (debug mode: modal window)";
				_modal = "false";
			} else
			{
			}
		}
		
		if(_hideHeader=="true")		_win.hideHeader();
		if(_title!=null)						_win.setText(_evaluate(_me, _title, true, _id));
		if(_modal=="true") 				_win.setModal(true);
		if(_icon!=null)						_win.setIcon(_icon);
		
		// draw the content
		_dashboard.InitObject(_layout, _win, _prefix + ".");
		
		// when the entire layout is done we need to draw the chart objects
		_CurChart = 0;
		_DrawChart(_prefix);
		
		LateLoading();
		
		return;
	}
	
	/**
	 * doClose()
	 * The Window object consumes its own 'close' event so that it can clean up the instance objects and their events.
	 * For fun, we fire a 'beforeClose' and 'afterClose' event of our own. Can we have any more fun than that?
	 */
	function _doClose(_item)
	{
		// we need to remove the objects from the main object array to avoid memory leak
		var _parts = _item.getId().split('.');
		
		_handler.FireEvent(_id, 'onBeforeClose');

		_dashboard.RemoveObjectsForInstance(_parts[0]);
		_handler.CancelEventsForInstance(_parts[0]);

		try {
			var newWins = [];
			for(var i=0; i<_wins.length; i++)
			{
				if(_wins[i]!=null && _wins[i].getId()!=_item.getId()) newWins[newWins.length] = _wins[i];
			}
			
			_wins = newWins;
		} catch(e) { }
		
		_handler.FireEvent(_id, 'onAfterClose');
		
		return true;
	}
	
	function _setParent(_to)
	{
		_parent = _to;
	}
}
