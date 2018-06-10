/**
 * This is a global event manager for passing events from the firing object to
 * all interested recipients.
 */

function EventHandler()
{
	this.type					= 'EventHandler';
	
	var _dashboard		= null;
	var _events			= new Array();
	var _wants			= new Array();
	var _eventQ			= new Array();
	var _tree				= null;
	var _me				= this;
	
	var _lastEventFrom					= '';
	var _lastEventType					= '';
	var _lastLogMessage					= '';
	var _lastLogLevel						= '';
	var _lastEventFromId					= '';
	var _lastRefreshFrom					= '';
	var _lastRefreshFromId				= '';
	
	this.SetDashboard						= function _setDashboard(_value) { _dashboard = _value; }
	this.GetAllWants						= function _getAllWants() { return _wants; }
	this.GetId									= function _getId() { return 'EventHandler'; }
	this.GetProperty						= _getProperty;
	this.GetAllProperties					= _getAllProperties;
	this.FireEvent							= _fireEvent;
	this.PublishEvent						= _publishEvent;
	this.WantEvent							= _wantEvent;
	this.FireQueuedEvents				= _fireQueuedEvents;
	this.CancelEventsForInstance		= _cancelEventsForInstance;
	this.CancelEventsForTarget		= _cancelEventsForObject;
	this.SetLastLogMessage				= function _setLastLogMessage(_level, _msg) { _lastLogLevel = _level; _lastLogMessage = _msg; }
	
	// debug routines
	this.ShowWantCount					= _showWantCount;
	this.CountWantsFrom				= _countWantsFrom;
	this.CountWantsTo					= _countWantsTo;
	this.GetWantsFrom					= _getWantsFrom;
	this.GetWantsTo						= _getWantsTo;

	function _getAllProperties()
	{
		var _ar = new Array();
		
		_ar[_ar.length]						= new kvp('LastLogLevel', 			_me.GetProperty('LastLogLevel'));
		_ar[_ar.length]						= new kvp('LastLogMessage', 	_me.GetProperty('LastLogMessage'));
		_ar[_ar.length]						= new kvp('LastRefreshFrom', 		_me.GetProperty('LastRefreshFrom'));
		_ar[_ar.length]						= new kvp('LastRefreshFromId', 	_me.GetProperty('LastRefreshFromId'));
		_ar[_ar.length]						= new kvp('LastEventFrom', 		_me.GetProperty('LastEventFrom'));
		_ar[_ar.length]						= new kvp('LastEventFromId', 	_me.GetProperty('LastEventFromId'));
		_ar[_ar.length]						= new kvp('LastEventType', 		_me.GetProperty('LastEventType'));
		_ar[_ar.length]						= new kvp('CountWants', 			_me.GetProperty('CountWants'));
		_ar[_ar.length]						= new kvp('QueueLength', 		_me.GetProperty('QueueLength'));
		
		return _ar;
	}
	
	function _getProperty(_name)
	{
		switch(_name)
		{
			case 'QueueLength':
				return _eventQ.length;
				
			case 'LastRefreshFrom':
				return _lastRefreshFrom;
				
			case 'LastRefreshFromId':
				return _lastRefreshFromId;
				
			case 'LastEventFrom':
				return _lastEventFrom;
				
			case 'LastEventFromId':
				return _lastEventFromId;
				
			case 'LastEventType':
				return _lastEventType;
				
			case 'CountWants':
				return _wants.length;
				
			case 'LastLogMessage':
				return _lastLogMessage;
				
			case 'LastLogLevel':
				return _lastLogLevel;
		}
		return '';
	}

	function _getWantsFrom(_obj)
	{
		var _ar = new Array();
		for(var i=0; i<_wants.length; i++)
		{
			if(_wants[i].target==_obj) _ar[_ar.length] = _wants[i];
		}
		return _ar;
	}
	
	function _getWantsTo(_obj)
	{
		var _ar = new Array();
		for(var i=0; i<_wants.length; i++)
		{
			if(_wants[i].item==_obj) _ar[_ar.length] = _wants[i];
		}
		return _ar;
	}
	
	function _countWantsFrom(_obj)
	{
		var _cnt = 0;
		for(var i=0; i<_wants.length; i++)
		{
			if(_wants[i].target==_obj) _cnt++;
		}
		return _cnt;
	}
	
	function _countWantsTo(_obj)
	{
		var _cnt = 0;
		for(var i=0; i<_wants.length; i++)
		{
			if(_wants[i].item==_obj) _cnt++;
		}
		return _cnt;
	}
	
	function _showWantCount()
	{
		alert("WANT COUNT: " + _wants.length);
	}
	
	/**
	 * CancelEventsFrom()
	 * This removes all event information for a given object - probably because it has been destroyed,
	 * or because it only wants the event once.
	 */
	function _cancelEventsForInstance(_instanceId)
	{
		var _ar = [];
		for(var i=0; i<_wants.length; i++)
		{
			if(_wants[i].target==null) continue;
			
			var _idParts		= _wants[i].target.split('.');
			if(_idParts!=null && _idParts[0] == _instanceId) continue;
			
			var _idItemParts	= _wants[i].item.split('.');
			if(_idItemParts!=null && _idItemParts.length>1 && _idItemParts[0] == _instanceId) continue;
			
			_ar[_ar.length] = _wants[i];
		}
		
		_wants = _ar;
	}
	
	/**
	 * CancelEventsForObject()
	 * Some objects are created and destroyed as required - for example a Window object and its contents.
	 * If an object is destroyed, you should call CancelEventsForObject to make sure the event handler 
	 * isnt wasting time (and using memory resources) to track events for objects that no longer exist.
	 */
	function _cancelEventsForObject(_objectId)
	{
		var _ar = [];
		for(var i=0; i<_wants.length; i++)
		{
			if(_wants[i].target==null) continue;
			
			if(_wants[i].target == _objectId) continue;
			_ar[_ar.length] = _wants[i];
		}
		
		_wants = _ar;
	}
	
	/**
	 * WantEvent()
	 * Any object can specify that it 'wants' to get events from any other object. Most of the time
	 * the 'wanted' events are defined in the XML layout file, although some events (specifically
	 * around collections) are also added automatically. The object needs to specify the name of the
	 * 'callback' function that should be called when the event is fired. If the 'type' of event is
	 * an asterisk (*) then this means 'all events' from the source object are desired.
	 */
	function _wantEvent(_target, _item, _type, _callback, _propogate, _dashboard)
	{
//		_log('DEBUG', _me, "ITEM " + _target + " WANTS " + _type + " FROM " + _item + " TO " + _callback);
		
		// if we have this event already, dont add it again
		for(var i=0; i<_wants.length; i++)
		{
			var _want = _wants[i];
			if(	_want.target == _target &&
				_want.item == _item &&
				_want.type == _type &&
				_want.callback == _callback &&
				_want.propogate == _propogate &&
				_want.dashboard == _dashboard) return;
		}
		
		_wants[_wants.length] = new Event(_item, _type, _callback, _propogate, _dashboard, _target);

	}

	/**
	 * PublishEvent()
	 * Any object can declare that it can fire an event of any type (including custom events).
	 * When an event has been published, any other object can declare that it 'wants' that event
	 * and specify a callback function to be called when the event is fired.
	 * @param _item
	 * @param _type
	 * @param _callback
	 */
	function _publishEvent(_item, _type, _callback)
	{
		_events[_events.length] = new Event(_item, _type, _callback);
	}

	/**
	 * FireQueuedEvents()
	 * When we have late loading objects we queue up the fired events until all the late loaders
	 * have loaded. Then we process the queued events in sequence.
	 */	
	function _fireQueuedEvents()
	{
		if(_eventQ.length==0) return;
		
		var _e = _eventQ.shift();
		while(_e!=null)
		{
			_fireEvent(_e.key, _e.value);
			_e = _eventQ.shift();
		}
	}
	
	function _refreshEventTree()
	{
		if(_tree!=null) _tree = null;
		
		_tree = new EventTreeNode(0, null);
		
		for(var i=0; i<_wants.length; i++)
		{
			var _dependents = _countWantsFrom(_wants[i].target)
			if(_dependents==0)
			{
				_tree.AddChild(_wants[i]);
				_EventsTreeChildren(1, _tree, _wants[i]);
			}
		}
	}
	
	function _EventsTreeChildren(_level, _parent, _event)
	{
		for(var i=0; i<_wants.length; i++)
		{
			if(_wants[i].target==_from)
			{
				var _id 		= _level + "_" + _parent +  "_" + _wants[i].item;
				var _obj		= _getObjectByName(_wants[i].item, null);
				var _objType	= (_obj!=null)? " (" + _obj.type + ")" : "";
				_debugEventsTree.insertNewChild(_parent, _id, _wants[i].item + "." + _wants[i].type + _objType);
				_EventsTreeChildren(_level+1, _id, _wants[i].item);
			}
		}
	}

	function _ignoreLateLoading(_type)
	{
		switch(_type)
		{
			case 'onReachedLastEntry':
				return true;
		}
		
		return false;
	}
	
	/**
	 * FireEvent()
	 * Any object can, an any time, 'fire' an event to the event handler. The object firing the event has no
	 * idea if anyone is 'listening' for the event - that is managed by the event handler object. 
	 */
	function _fireEvent(_item, _type)
	{
		if(_item==null) return;
		
		// if we have pending late-loaders we queue the fired events and wait until the late-loaders
		// are finished, and then the late loader will call them when all objects are loaded.
		if(_LateLoaders.length>0)
		{
			if(_ignoreLateLoading(_type)==false)
			{
				_eventQ[_eventQ.length] = new kvp(_item, _type);
				return;
			}
		}
		
		var _parts 		= _item.split('^');
		var _id 		= _parts[0];
		var _idParts	= _id.split('.');

		var _fromObj = _getObjectByName(_parts[0]);
		_log('DEBUG', _fromObj, 'EVENT FIRED FROM ' + _item + ' OF TYPE ' + _type);
		
		try {
			if(_type.toLowerCase()!="refresh" && _type.toLowerCase()!="fetchdata")
			{
				_lastEventFromId	= _id;
				_lastEventFrom		= _item;
				_lastEventType		= _type;

				_dashboard.SetObject('LastEventObject', _fromObj);
			}
			
			if(_type.toLowerCase()=='refresh')
			{
				_lastRefreshFromId 	= _id;
				_lastRefreshFrom 		= _item;
			}
			
		} catch(e) { }
		
		// if there are no late-loaders then we need to send the event to all the objects that have said
		// they 'want' the event.
		for(var i=0; i<_wants.length; i++)
		{
			var _want = _wants[i];

			if(_want.dashboard!=null)
			{
				// if the 'dashboard' property was passed in the WantEvent method then this is a doc level
				// event and not an object level event. Doc level events are slightly more complicated as they
				// tie together events across objects indiscriminately.
				try {
					if(_want.type == _type || _want.type=='*')
					{
						var _callParts 	= _want.callback.split('.');
						var _callPage		= _callParts[0];
						var _callObj		= _callParts[1];
						var _callBack		= _callParts[2];
						
						if((_want.item == _id || (_idParts.length==2 && _want.item == _idParts[_idParts.length-1])) && _callParts.length>1)
						{
							// event fired is for this event wanted
							var _object = _getObjectByName(_callObj, _fromObj);
							eval("_object." + _callBack)(_item);
							_want.countFired = _want.countFired + 1;
						}
					}
				} catch(e) { }
			} else
			{
				try {
					var _wantId = _want.item;
					
					if((_wantId == _id || (_idParts.length>1 && _wantId == _idParts[_idParts.length-1])) && (_want.type == _type || _want.type=='*'))
					{
						var _targetObj = _getObjectByName(_want.target, _fromObj, _wantId);
						eval("_targetObj." + _want.callback)(_item);
						_want.countFired = _want.countFired + 1;
						if(_want.propogate=='once') _cancelEventsForObject(_want.target);
					}
				} catch(e) { } 
			}
		}
	}
}

/**
 * EventTreeNode()
 * To optimise the firing of events we create a tree hierarchy of the dependencies of the events. This tree
 * is used for reducing the number of events that actually get fired.
 */
function EventTreeNode(__level, __event)
{
	this.event			= __event;
	this.level			= __level;
	this.children		= new Array();
	
	this.AddChild		= function _addChild(_event) { this.children[this.children.length] = new EventTreeNode(this.level+1, _event); }
}

/**
 * EventTimer()
 * At some point we will need to have features like 'auto-refresh' etc. We should create
 * a 'timer' that fires a 'Timer' event on a given frequency (probably specified in the XML
 * layout file) and allow objects to 'want' the Timer event. 
 */
function EventTimer()
{
	this.type						= 'EventTimer';

	var _dashboard					= null;
	var _timer						= null;
	var _me							= this;
	
	this.GetId						= function _getId() { return 'EventTimer'; }
	this.SetDashboard				= function _setDashboard(_value) { _dashboard = _value; }
	this.GetProperty				= _getProperty;
	this.Start						= _start;
	this.RunEvents					= _runEvents;
	
	function _getProperty(_name)
	{
		return '';
	}
	
	function _runEvents()
	{
		var _handler		= _getObjectByName('EventHandler');
		var _wants			= _handler.GetAllWants();
		var _date			= new Date();
		
		for(var i=0; i<_wants.length; i++)
		{
			if(_wants[i].item=='EventTimer')
			{
				if(_wants[i].lastRun + (parseInt(_wants[i].type,10)*1000) <= _date.getTime())
				{
					_wants[i].lastRun = _date.getTime();
					
					var _callParts 	= _wants[i].callback.split('.');
					var _callPage	= _callParts[0];
					var _callObj	= _callParts[1];
					var _callBack	= _callParts[2];
					var _object = _getObjectByName(_callObj, _me);
					
					try {
						eval("_object." + _callBack)();
					} catch(e) { }
				}
			}
		}
		
		_timer		= setTimeout('_getObjectByName("EventTimer").RunEvents()', 1000);
	}
	
	function _start()
	{
		if(_hasEvents()==true)
		{
			_timer		= setTimeout('_getObjectByName("EventTimer").RunEvents()', 1000);
		}
	}
	
	function _hasEvents()
	{
		var _handler		= _getObjectByName('EventHandler');
		var _wants			= _handler.GetAllWants();
		
		for(var i=0; i<_wants.length; i++)
		{
			if(_wants[i].item=='EventTimer') return true;
		}
	}
}

/**
 * Event()
 * The Event object is pure data storage for the event definition.  
 */
function Event(__item, __type, __callback, __propogate, __dashboard, __target)
{
	this.level		= 0;
	this.target		= __target;
	this.item		= __item;
	this.type		= __type;
	this.callback	= __callback;
	this.propogate	= __propogate;
	this.dashboard	= __dashboard;
	
	this.countFired	= 0;
	
	// for timed events, we need to track when it last ran
	var _date		= new Date();
	this.lastRun	= _date.getTime();
}