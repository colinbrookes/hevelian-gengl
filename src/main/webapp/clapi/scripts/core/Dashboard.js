/**
 * This is the control handler for managing the dashboard.
 * It creates all the components required, including the event handler and event scheduler objects.
 * There is also a global array for the objects created by the dashboard.
 */

_EventHandler		= new EventHandler();
_EventTimer			= new EventTimer();
_MantaSession		= new MantaSession();
_MantaUser			= new MantaUser(_MantaSession);

// add event handler and event timer to the object list
_Objects[_Objects.length]		= new kvp('EventHandler', _EventHandler);
_Objects[_Objects.length]		= new kvp('EventTimer', _EventTimer);
_Objects[_Objects.length]		= new kvp('session', _MantaSession);
_Objects[_Objects.length]		= new kvp('user', _MantaUser);

// we need to track the late loaders
_LateLoaders					= new Array();
_NeedLateLoaders				= 0;

// chain the rendering of the charts to avoid event conflicts.
_Charts							= new Array();
_CurChart						= 0;

/**
 * LateLoading
 * Some objects are 'late loading' - which means they are depending on other content
 * loading first before they can load (for example a Panel and Form are late loading).
 * The page (or popup window) can have multiple late-loading components, so we build
 * an array of these, and keep a count of the number of late loaders. Each main 
 * component in the page will fire an event to say it is ready - and we track the
 * number of events expected/received via the _NeedLateLoaders variable. A new
 * late loader will increment this, and each time LateLoading is called it will
 * decrement it.
 *
 * When NeedLateLoaders reaches zero we can then issue the Draw() instruction to
 * each of the components waiting for a late-loader component to load.
 */
function LateLoading(_item)
{
//	alert('late loading being called');
	// decrement the number of LateLoaders we are waiting for
	_NeedLateLoaders--;
	if(_NeedLateLoaders<0) _NeedLateLoaders = 0;

	// we dont have any late-loaders in this page - we check there are no unprocessed events
	if(_LateLoaders.length <= 0) 
	{
		if(_EventHandler!=null) _EventHandler.FireQueuedEvents();
		return;
	}

	// all late-loading objects are ready, so we can draw the sub-components
	if(_NeedLateLoaders<=0)
	{
		// we need to clear the LateLoading list as we run them because a new
		// popup window might create new late-loading objects
		var _lateLoader = _LateLoaders.shift();
		while(_lateLoader!=null)
		{
			try {
				console.log("drawing late loading object: " + _lateLoader.GetId());
				_lateLoader.Draw();
				_lateLoader.Redraw();
			} catch(e) { }
			_lateLoader = _LateLoaders.shift();
		}
		
		// once the late loading objects are finished, we fire any queued events
		if(_EventHandler!=null) _EventHandler.FireQueuedEvents();
	}
	
}

function _DrawChart(_prefix)
{
	if(_CurChart>=_Charts.length) return;	
	
	_CurChart++;
	try {
		if(_prefix!=null)
		{
			var _chart  = _Charts[_CurChart-1];
			var _id		= _chart.GetId().split('.');
			if(_id[0]==_prefix || (_id[0]+'.') == _prefix) _chart.Draw();
		} else
		{
			_Charts[_CurChart-1].Draw();
		}
	} catch(e) { }
	if(_CurChart==_Charts.length) return;	
	
	_DrawChart(_prefix);
}

/**
 * Dashboard()
 * Builds the entire page layout, and initialises global objects as required.
 */
function Dashboard()
{
	this.type						= 'Dashboard';
	
	// private data storage
	var _id							= 'Dashboard';
	var _target						= null;
	var _type						= null;
	var _wins						= new Array();
	var _me							= this;
	var _cellsSnapTo				= new Array();

	// public data storage
	this.EventHandler				= _EventHandler;
	this.EventTimer					= _EventTimer;
	
	// public methods
	this.GetCellsSnapTo					= function _getCellsSnapTo() { return _cellsSnapTo; }
	this.AddCellSnapTo					= function _addCellSnapTo(_o) { _cellsSnapTo[_cellsSnapTo.length] = _o; }
	this.GetId							= function _getId() { return 'Dashboard'; }
	this.Print							= function _print() { window.print(); }
	this.GetAllProperties				= _getAllProperties;
	this.GetProperty					= _getProperty;
	this.AddObject						= _addObject;
	this.SetObject						= _setObject;
	this.InitObject						= _initObject;
	this.RemoveObjectsForInstance		= _removeObjectsForInstance;
	this.GetObjectByName				= _getObjectByName;
	this.GetCollectionByName			= _getCollectionByName;
	this.DrawTo							= _drawToFromEmbedded;
	this.DrawToFromURL					= _drawToFromURL;
	this.DrawLayoutTo					= _drawLayoutTo;
	this.RedrawCharts					= _redrawCharts;
	this.FireResizeFinish				= _fireResizeFinish;
	this.SetWindowParent				= _setWindowParent;
	this.CustomCallback					= _customCallback;

	_EventHandler.SetDashboard(this);
	
	// we add ourselves to the object array
	_Objects[_Objects.length]		= new kvp('Dashboard', _me);
	
	function _getAllProperties()
	{
		var _ar = new Array();
		_ar[_ar.length] = new kvp('id', _id);
		
		return _ar;
	}
	
	function _customCallback(_item)
	{
		var _parts = _item.split('^')[1].split('.');
		if(_parts.length==2)
		{
			eval(_parts[0])(_parts[1]);
		} else
		{
			eval(_item)(_item);
		}
	}
	
	function _setWindowParent(_parent)
	{
		for(var w=0; w<_wins.length; w++) _wins[w].SetParent(_parent);
	}
	
	function _fireResizeFinish(_item)
	{
		_EventHandler.FireEvent("Dashboard", 'onResize');
	}
	
	function _getProperty(_name)
	{
		return '';
	}
	
	function _redrawCharts()
	{
		_curChart = 0;
		_DrawChart();
	}
	
	/**
	 * AddObject()
	 * All objects should be added to the array of objects by their
	 * unique ID as a key-value pair. If object ID's are not unique then
	 * strange behaviour may happen. If an object is created and not added then
	 * it cannot receive events fired by other objects.
	 */
	function _addObject(_name, _object)
	{
		_Objects[_Objects.length] = new kvp(_name, _object);
	}

	/**
	 * SetObject()
	 * Changes the pointer to the specified object name to the new object.
	 * This is used for the LastEventObject reference primarily, so that messaging can access the actual object in a generic way.
	 * @param _name
	 * @param _object
	 */
	function _setObject(_name, _object)
	{
		for(var i=0; i<_Objects.length; i++)
		{
			if(_Objects[i].key == _name)
			{
				_Objects[i].value = _object;
				return;
			}
		}
		
		_addObject(_name, _object);
	}
	
	/**
	 * RemoveObjectsforInstance()
	 * Some objects are created temporarily, for example when a new instance of
	 * a popup window is created. All objects that are sub-components of the
	 * temporary object get a unique 'instance' ID prepended to their given ID.
	 * This method removes all objects with a given instance prefix. 
	 */
	function _removeObjectsForInstance(_name)
	{
		var _ar = [];
		for(var i=0; i<_Objects.length; i++)
		{
			var _object = _Objects[i];
			if(_object.key.substring(0, _name.length + 1) == _name + '.') continue;
			_ar[_ar.length] = _object;
		}
		
		_Objects = _ar;
		
		try {
			var _arc = [];
			for(var i=0; i<_Collections.length; i++)
			{
				var _object = _Collections[i];
				var _objParts = _object.key.split('.');
				if(_objParts[0] == _name) continue;
				_arc[_arc.length] = _object;
			}
			
			_Collections = _arc;
		} catch(e) { }
		
		try {
			var _archarts = [];
			for(var i=0; i<_Charts.length; i++)
			{
				var _object = _Charts[i];
				var _objParts = _object.GetId().split('.');
				if(_objParts[0] == _name) continue;
				_archarts[_archarts.length] = _object;
			}
			
			_Charts = _archarts;
		} catch(e) { }
	}
	
	/**
	 * DrawToFromURL()
	 * After creating a dashboard object you need to tell it what to draw and where to draw it.
	 * This allows you to specify a URL to the layout XML file, and the destination ('to') can be
	 * the body of a page or a DIV within a page. 
	 */
	function _drawToFromURL(_url, _to)
	{
		if(_debug=="true")
		{
			if(_debug=="true") _addTimeline(_id, new Date(), null, 'draw to, from URL');
			var _to = _debugInit(_to);
		}
		
		if(_debug=="true") _addTimeline(_id, new Date(), null, 'fetch layout from server');

		var _ajax = new sisAJAXConnector();
		_ajax.open("GET", _url, false);
		_ajax.send(null);

		if(_debug=="true") _updateTimeline(_id, new Date());
		
		_target 				= _to;
		var _xml 				= _ajax.responseXML;
		
		_drawFrom(_xml);
		
		if(_debug=="true") _updateTimeline(_id, new Date());
	}

	/**
	 * DrawToFromURL()
	 * After creating a dashboard object you need to tell it what to draw and where to draw it.
	 * This allows you to specify the name of an XML element embedded in the body, and the destination ('to') can be
	 * the body of a page or a DIV within a page. 
	 */
	function _drawToFromEmbedded(_from, _to)
	{
		_target 				= _to;
		var _xml				= document.getElementById(_from);
		
		_drawFrom(_xml);
	}
	
	/**
	 * appendNodes()
	 * this is the recursive function that is used by the <include> tag to re-create a fragment in the correct position
	 * inside the main document. It only re-creates elements, text nodes and cdata sections. All other node types are
	 * ignored at the moment.
	 */
	function _appendNodes(_xml, _to, _children)
	{
		if(_children==null || _children.length<0) return _xml;
		
		for(var i=0; i<_children.length; i++)
		{
			switch(_children[i].nodeType)
			{
				case 1: // node
					var _node = _xml.createElement(_children[i].nodeName);
					
					try {
						if(_children[i].attributes!=null && _children[i].attributes.length>0)
						{
							for(var a=0; a<_children[i].attributes.length; a++)
							{
								 _node.setAttribute(_children[i].attributes.item(a).nodeName, _children[i].attributes.item(a).nodeValue);
							}
						}
					} catch(e) { alert('appendNodes: ' + e); break; }
					
					_to.appendChild(_node);
					
					if(_children[i].childNodes!=null && _children[i].childNodes.length>0)
					{
						_xml = _appendNodes(_xml, _node, _children[i].childNodes);
					}
					break;
				
				case 3:	// text
					var _txtNode = _xml.createTextNode(_children[i].nodeValue);
					_to.appendChild(_txtNode);
					break;
					
				case 4: // cdata
					var _txtNode = _xml.createCDATASection(_children[i].nodeValue);
					_to.appendChild(_txtNode);
					break;
					
				default:
					break;
			}
			
		}
		return _xml;
		
	}
	
	function _drawLayoutTo(_layout, _to, __prefix)
	{
		_initObject(_layout, _to, __prefix);
		_EventTimer.Start();
		
	}
	
	/**
	 * DrawFrom()
	 * This is the main method for rendering the layout XML to the page target element.
	 */
	function _drawFrom(_xml)
	{
		if(_xml.normalize!=null) _xml.normalize();
		
		// do the include function stuff first
		var _includes			= _xml.getElementsByTagName('include');

		for(var i=0; i<_includes.length;i++)
		{
			var _include 	= _includes[i];
			
			var _src		= _include.getAttribute('src');
			var _ajax		= new sisAJAXConnector();
			
			/* TODO: detect JSP or other to load layout xml */
			_ajax.open('GET', "GetLayout.jsp?layout=" + _src, false);
			_ajax.send(null);
			
			var _doc		= new sisXMLDocument(_ajax.responseText);
			
			if(_doc.normalize!=null) _doc.normalize();
			var _docRoot	= _doc.firstChild;
			for(var r=0; r<_doc.childNodes.length; r++)
			{
				if(_doc.childNodes[r].nodeType == 1)
				{
					_docRoot = _doc.childNodes[r];
				}
			}
			
			var _newNode	= _xml.createElement(_docRoot.nodeName);
			
			if(_docRoot.attributes!=null && _docRoot.attributes.length>0)
			{
				for(var a=0; a<_docRoot.attributes.length; a++)
				{
					 _newNode.setAttribute(_docRoot.attributes.item(a).nodeName, _docRoot.attributes.item(a).nodeValue);
				}
			}
			
			_newNode.nodeValue = _docRoot.nodeValue;
			_include.parentNode.insertBefore(_newNode, _include);
			_xml = _appendNodes(_xml, _newNode, _docRoot.childNodes); 
				
		}
		
		// remove all includes from the document
		var _include = _xml.getElementsByTagName('include')[0];
		while(_include!=null)
		{
			_include.parentNode.removeChild(_include);
			try { _include = _xml.getElementsByTagName('include')[0]; } catch(e) { break; }
		}
		
		var _page						= _xml.getElementsByTagName('page')[0];
		var _collections				= _findChildNode(_page, 'collections');
		var _layout					= _findChildNode(_page, 'layout');
		var _windows				= _page.getElementsByTagName('window');
		var _messages				= _page.getElementsByTagName('messages');
		
		if(_page!=null)
		{
			var _title = _page.getAttribute('title');
			document.title = _title;
			
			var _style = _page.getAttribute('style');
			if(_style!=null) document.body.setAttribute('style', document.body.getAttribute('style') + ';' + _style);
			
			if(_debug=="true")
			{
				_debugPretifySource(_xml, _debugLayoutSource.cells('a'));
			}
		}
		
		// ----------------------------------------------------------------------------------------
		// we need to check for authentication enabled
		// ----------------------------------------------------------------------------------------
		
		var _authEnabled 			= _page.getAttribute('requireAuthentication');
		if(_authEnabled=='true')
		{
			// check the user is logged in or display the login screen
			var _authenticator = _page.getElementsByTagName('authenticationProvider')[0];
			if(_authenticator!=null)
			{
				
			}
		}
		
		// first we set the constants
		try {
			var _object 	= new Constant('constant');
			var _constants 	=  _findChildNode(_page, 'constants').childNodes;
			
			_object.SetEventHandler(_EventHandler);
			_addObject('constant', _object);
			
			// now add the actual values
			for(var i=0; i<_constants.length; i++)
			{
				if(_constants[i].nodeType!=1) continue;
				_object.AddConstant(_constants[i]);
			}
			
			_object.Draw();
			
		} catch(e) { }
		
		// next we create the collections
		try {
			var _sources = _collections.getElementsByTagName('collection');
			for(var i=0; i<_sources.length; i++)
			{
				var _source 						= _sources[i];
				var _id								= _source.getAttribute('id');
				var _collection						= new ItemCollection(_source);
				_Collections[_Collections.length] 	= new kvp(_id, _collection);
				_addObject(_id, _collection);
				
				_collection.SetEventHandler(_EventHandler);
				_collection.FetchData();
			}
		} catch(e) { }
		
		// next we process any page level events
		try {
			var _events = _findChildNode(_page, 'events').getElementsByTagName('event');
			for(var e=0; e<_events.length; e++)
			{
				var _event 		= _events[e];
				var _from		= new String(_event.getAttribute('from'));
				var _type		= _event.getAttribute('type');
				var _callback	= "page." + _event.getAttribute('to');
				var _propogate	= _event.getAttribute('propogate');
				
				_EventHandler.WantEvent('page', _from, _type, _callback, _propogate, _me);
			}
		} catch(e) { }

		// now we create the message objects
		try {
			var _msgs = _messages[0].getElementsByTagName('message');
			for(var m=0; m<_msgs.length; m++)
			{
				var _msg			= _msgs[m];
				_initObject(_msg, _target, '');
			}
			
		} catch(e) { }
		
		// now we create the window objects
		for(var w=0; w<_windows.length; w++)
		{
			var _window 			= new Window(_windows[w]);
			_wins[_wins.length]		= _window;
			
			_window.SetEventHandler(_EventHandler);
			_window.SetDashboard(_me);
			
			_addObject(_windows[w].getAttribute('id'), _window);
			
		}
		
		var _l = _initObject(_layout, _target, '');
		_EventTimer.Start();
		
		// when the entire layout is done we need to draw the chart objects
		_CurChart = 0;
		_redrawCharts();
	
		LateLoading();
	}
			
	function _findChildNode(_root, _name)
	{
		for(var i=0; i<_root.childNodes.length; i++)
		{
			if(_root.childNodes[i].nodeName == _name) return _root.childNodes[i];
		}
		
		return null;
	}
	
	function _initObject(_node, _cell, _prefix)
	{
		var _name = new String(_node.nodeName);
		
		// first check if it is in the dictionary
		var _dicItem = _dictionary.words.get(_name.toLowerCase());
		if(_dicItem!=null)
		{
			return _dicItem.init(_node, _cell, _prefix, _me);
		}
		
		switch(_name.toLowerCase())
		{
//		case 'layout':						return _initLayout(_node, _cell, _prefix);
//		case 'toolbar':						return _initToolbar(_node, _cell, _prefix);
//		case 'url':							return _initURL(_node, _cell, _prefix);
//		case 'message':						return _initMessage(_node, _cell, _prefix);
//		case 'set':							return _initSet(_node, _cell, _prefix);
//		case 'region':						return _initRegion(_node, _cell, _prefix);
//		case 'image':						return _initImage(_node, _cell, _prefix);
//		case 'menu': 						return _initMenu(_node, _cell, _prefix);

		/* TODO: not yet migrated to work with the Dictionary */
		case 'panel':						return _initPanel(_node, _cell, _prefix);
		case 'tree':						return _initTree(_node, _cell, _prefix);
		case 'grid':						return _initGrid(_node, _cell, _prefix);	
		case 'view':						return _initView(_node, _cell, _prefix);
		case 'tabbar':						return _initTabbar(_node, _cell, _prefix);
		case 'chart':						return _initChart(_node, _cell, _prefix);
		case 'geo':							return _initGeo(_node, _cell, _prefix);
		case 'accordion':					return _initAccordion(_node, _cell, _prefix);
		case 'foreach':						return _initForEach(_node, _cell, _prefix);
		case 'if':							return _initIf(_node, _cell, _prefix);
		case 'collection':					return _initCollection(_node, _cell, _prefix);
		case 'constants':					return _initConstants(_node, _cell, _prefix);
		case 'input':						return _initInput(_node, _cell, _prefix);
		default:
			return null;
		}
	}

	function _initInput(_node, _to, _prefix)
	{
		var _n_id				= _prefix + _node.getAttribute('id');
		var _container			= new Container(_node, _n_id, _to, _prefix);
		var _toNode 			= _container.target;
		var _type				= _node.getAttribute('type');
		
		var _object				= null;
		switch(_type.toLowerCase())
		{
			/* TODO: not yet migrated to work with the Dictionary */
			case 'text':							_object = new MyQInputText(_n_id, _toNode, _node);				break;
			case 'password':						_object = new MyQInputPassword(_n_id, _toNode, _node);			break;
			case 'hidden':							_object = new MyQInputHidden(_n_id, _toNode, _node);			break;
			case 'label':							_object = new MyQInputLabel(_n_id, _toNode, _node);				break;
			case 'button':							_object = new MyQInputButton(_n_id, _toNode, _node);			break;
			case 'spacer':							_object = new MyQInputSpacer(_n_id, _toNode, _node);			break;
			case 'list':							_object = new MyQInputList(_n_id, _toNode, _node);				break;
			case 'editor':							_object = new MyQInputEditor(_n_id, _toNode, _node);			break;
			
			/* basic types still to be done */
			case 'textarea':
			case 'file':
			
			/* advanced input types still to be done */
			case 'slider':
			case 'datetime':
			case 'colour':
			default:
			
		}
		
		if(_object==null) return null;
		
//		_object.SetDashboard(_me);
		
		if(_container.hideShowId!=null) _object.SetHideShowId(_container.hideShowId);
		_object.SetEventHandler(_EventHandler);
		
		_Objects[_Objects.length] 			= new kvp(_n_id, _object);
		
		_object.Draw();
		
		return _object;
	}
		
	function _initConstants(_node, _to, _prefix)
	{
		var _id								= _prefix + _node.getAttribute('id');
		var _object							= new Constant(_id);
		var _constants 						= _node.childNodes;
		
		_object.SetEventHandler(_EventHandler);
		_Objects[_Objects.length] 			= new kvp(_id, _object);
		
		// now add the actual values
		for(var i=0; i<_constants.length; i++)
		{
			if(_constants[i].nodeType!=1) continue;
			_object.AddConstant(_constants[i]);
		}
		
		_object.Draw();
		
		return _object;
		
	}
	
	function _initCollection(_node, _to, _prefix)
	{
		var _id								= _prefix + _node.getAttribute('id');
		var _collection						= new ItemCollection(_node, _prefix);
		
		_Collections[_Collections.length] 	= new kvp(_id, _collection);
		_addObject(_id, _collection);
		
		_collection.SetEventHandler(_EventHandler);
		_collection.FetchData();
		
		return _collection;
	}
	
	/**
	 * forEach()
	 * this is a simple loop mechanism for repeating elements based on a collection item list.
	 */
	function _initForEach(_node, _to, _prefix)
	{
		var _n_id				= _prefix + _node.getAttribute('id');
//		var _src				= _node.getAttribute('ItemInCollection');

		var _container			= new Container(_node, _n_id, _to, _prefix);
		var _toNode 			= _container.target;
		
		var _object				= new ForEach(_n_id, _toNode, _node);
		
		_object.SetDashboard(_me);
		
		if(_container.hideShowId!=null) _object.SetHideShowId(_container.hideShowId);
		_object.SetEventHandler(_EventHandler);
		_addObject(_n_id, _object);
		
		_object.Draw();
		
		return _object;
	}
	
	/**
	 * if()
	 * conditional block, always gets inserted but only visible if the condition is true.
	 */
	function _initIf(_node, _to, _prefix)
	{
		var _n_id						= _prefix + _node.getAttribute('id');

		var _container			= new Container(_node, _n_id, _to, _prefix);
		var _toNode 				= _container.target;
		
		var _object					= new If(_n_id, _toNode, _node);
		
		_object.SetDashboard(_me);
		
		if(_container.hideShowId!=null) _object.SetHideShowId(_container.hideShowId);
		_object.SetEventHandler(_EventHandler);
		_addObject(_n_id, _object);
		
		_object.Draw();
		
		return _object;
	}
	
	/**
	 * _initAccordion()
	 * An Accordion component is like a layout component in that it can have any of the other components in
	 * any of the tabs in the tabbar. However, the only component that can be a direct child of an Accordion
	 * is an <item> element.
	 */
	function _initAccordion(_node, _to, _prefix)
	{
		var _n_id				= _prefix + _node.getAttribute('id');
		var _effect 			= _node.getAttribute('effect');
		var _def_cell			= _node.getAttribute('default');
		var _div_position		= _node.getAttribute('position');
		var _div_hide			= _node.getAttribute('HideOnOpen');

		var _container			= new Container(_node, _n_id, _to, _prefix);
		var _toNode 			= _container.target;
		
		var _object				= new Accordion(_n_id, _toNode, _effect);
		
		if(_container.hideShowId!=null) _object.SetHideShowId(_container.hideShowId);
		_object.SetEventHandler(_EventHandler);
		_addObject(_n_id, _object);

		// now add the items ...
		var _nodes = _node.childNodes;
		for(var i=0; i<_nodes.length; i++)
		{
			if(_nodes[i].nodeName!='item' && _nodes[i].nodeName!='ITEM') continue;
			
			var _item		= _nodes[i];
			var _id			= _item.getAttribute('id');
			var _text		= _item.getAttribute('text');
			var _icon		= _item.getAttribute('icon');
			
			var _AccordionObject	= _object.AddItem(_id, _text, _icon);
			var _cell				= _object.GetAccordion().cells(_id);

			for(var c=0; c<_item.childNodes.length; c++)
			{
				var _node = _item.childNodes[c];
				_initObject(_node, _cell, _prefix);
			}
		}
		if(_def_cell!=null) _object.GetAccordion().cells(_def_cell).open();
		if(_div_position=='absolute' && _div_hide!=null && _div_hide=="true") _object.Hide();
		
		_object.Draw();

		return _object;
	}
	/**
	 * initPanel()
	 * initialises a Panel component.
	 * A Panel is a LateLoader.
	 */
	function _initPanel(_node, _to, _prefix)
	{
		var _n_id					= _prefix + _node.getAttribute('id');
		
		var _div_position			= _node.getAttribute('position');
		var _panel_from				= _node.getAttribute('from');
		var _panel_type				= _node.getAttribute('type');
		var _div_hide				= _node.getAttribute('HideOnOpen');
		var _container				= new Container(_node, _n_id, _to, _prefix);
		var _toNode 				= _container.target;
		
		var _object					= new Panel(_n_id, _node, _toNode);
		
		_addEffectsTo(_node, _object, _container, _n_id);
		
		if(_container.hideShowId!=null) _object.SetHideShowId(_container.hideShowId);
		_object.SetEventHandler(_EventHandler);
		_addObject(_n_id, _object);
		
		// process events
		try {
			var _events = _node.getElementsByTagName('events')[0].getElementsByTagName('event');
			for(var e=0; e<_events.length; e++)
			{
				var _event 		= _events[e];
				var _from		= _event.getAttribute('from');
				var _type		= _event.getAttribute('type');
				var _callback	= _event.getAttribute('to');
				var _fire		= _event.getAttribute('fire');
				
				_EventHandler.WantEvent(_n_id, _from, _type, _callback, _fire);
			}
		} catch(e) { }
		
		if(_div_position=='absolute' || _panel_from==null || _panel_type=='xml' || _to !=null)
		{
			if(_div_hide!=null && _div_hide=="true") _object.Hide();
			_object.Draw();
		} else
		{
			_LateLoaders[_LateLoaders.length] = _object;
			_NeedLateLoaders++;
			_to.attachURL('about:blank');
		}
		
		return _object;
	}
	
	function _initGeo(_node, _to, _prefix)
	{
		var _g_id				= _prefix + _node.getAttribute('id');
		
		var _container			= new Container(_node, _g_id, _to, _prefix);
		var _toNode 			= _container.target;
		
		if(_toNode==null || _toNode.getAttribute('id')==null)
		{
			_toNode 								= _findHTMLObject(_to, 'dhxMainCont');
			var _divStyle							= "width: 100%; height: 100%; padding: 0px; margin: 0px; border: 0px solid black;";
			_toNode.innerHTML  	   += '<div id="'+_g_id+'" style="'+_divStyle+'"></div>';
			_toNode									= document.getElementById(_g_id);
		}
		
		var _object				= new Geo(_g_id, _toNode, _node);
		
		_object.SetEventHandler(_EventHandler);
		_addObject(_g_id, _object);
		
		// process events
		try {
			var _events = _node.getElementsByTagName('events')[0].getElementsByTagName('event');
			for(var e=0; e<_events.length; e++)
			{
				var _event 		= _events[e];
				var _from		= _event.getAttribute('from');
				var _type		= _event.getAttribute('type');
				var _callback	= _event.getAttribute('to');
				var _fire		= _event.getAttribute('fire');
				
				_EventHandler.WantEvent(_c_id, _from, _type, _callback, _fire);
			}
		} catch(e) { }
		
		_object.Draw();
		
		return _object;
	}
	
	/**
	 * initChart()
	 * a 'chart' tag is for integrating the highcharts library into the framework. HC requires jQuery
	 * unfortunately, and uses animations that use its own event structure - which means we need to be
	 * careful not to create a conflict with our event handler. We do this by isolating each chart object
	 * in its own DIV element within the target layout panel. We allow multiple charts to be placed
	 * inside the target panel - and then the size can be specified - or we can have a single chart that uses
	 * the entire panel and resizes with it. 
	 */
	function _initChart(_node, _to, _prefix)
	{
		var _n_id				= _prefix + _node.getAttribute('id');
		var _div_position		= _node.getAttribute('position');
		var _div_hide			= _node.getAttribute('HideOnOpen');
		
		var _container			= new Container(_node, _n_id, _to, _prefix);
		var _toNode 			= _container.target;
		
		var _object				= new Chart(_n_id, _toNode, _node);
		
		if(_container.hideShowId!=null) _object.SetHideShowId(_container.hideShowId);
		_object.SetEventHandler(_EventHandler);
		_addObject(_n_id, _object);
		
		// process events
		try {
			var _events = _node.getElementsByTagName('events')[0].getElementsByTagName('event');
			for(var e=0; e<_events.length; e++)
			{
				var _event 		= _events[e];
				var _from		= _event.getAttribute('from');
				var _type		= _event.getAttribute('type');
				var _callback	= _event.getAttribute('to');
				var _fire		= _event.getAttribute('fire');
				
				_EventHandler.WantEvent(_n_id, _from, _type, _callback, _fire);
			}
		} catch(e) { }
	
		if(_div_position=='absolute' && _div_hide!=null && _div_hide=="true") _object.Hide();
		
		_Charts[_Charts.length] = _object;
		try {
			_object.Draw();
		} catch(e) { }
		
		_LateLoaders[_LateLoaders.length] = _object;
		_NeedLateLoaders++;

		return _object;
	}
	
	/**
	 * formFieldSets are late loaders, so we only initialise and let the LateLoader render it
	 */
	function _initFormFieldSet(_node, _to, _prefix)
	{
		var _f_id				= _prefix + _node.getAttribute('id');
		var _form_id			= _prefix + _node.getAttribute('form');
		var _object				= new FormFieldSet(_f_id, _to, _prefix, _node);
		var _form				= _getForm(_form_id);
		
		if(_form==null)
		{
			alert('formSet defined for undefined form: ' + _f_id);
			return;
		}
		
		_object.SetForm(_form);
		_object.SetEventHandler(_EventHandler);
		_addObject(_f_id, _object);
		_form.AddFormFieldSet(_object);
		
		// add each of the form field definitions
		for(var i=0; i<_node.childNodes.length; i++) if(_node.childNodes[i].nodeType==1) _object.AddField(_node.childNodes[i]);

//		_LateLoaders[_LateLoaders.length] = _object;
//		_NeedLateLoaders++;
		
//		_to.attachURL('about:blank');
		
		_object.Draw();
		
		return _object;
	}
	
	function _getForm(_name)
	{
		for(var i=0; i<_Objects.length; i++)
		{
			try {
				if(_Objects[i].key==_name) return _Objects[i].value;
			} catch(e) { continue; }
		}
		return null;
	}
	
	/**
	 * forms are late loaders, so we dont draw the object here
	 * @param _node
	 * @param _to
	 * @returns {Form}
	 */
	function _initForm(_node, _to, _prefix)
	{
		var _f_id			= _prefix + _node.getAttribute('id');
		
		var _object			= new Form(_f_id, _node, _to);
		_object.SetEventHandler(_EventHandler);
		_addObject(_f_id, _object);
		
		return _object;
	}
	
	/**
	 * initTabbar()
	 * A Tabbar component is like a layout component in that it can have any of the other components in
	 * any of the tabs in the tabbar. However, the only component that can be a direct child of a Tabbar
	 * is a <tab> element.
	 */
	function _initTabbar(_node, _to, _prefix)
	{
		var _n_id				= _prefix + _node.getAttribute('id');
		var _t_default			= _node.getAttribute('default');

		var _div_position		= _node.getAttribute('position');
		var _div_hide			= _node.getAttribute('HideOnOpen');
		var _container			= new Container(_node, _n_id, _to, _prefix);
		var _toNode 			= _container.target;
		
		var _object			= new Tabbar(_n_id, _toNode, _node);
		
		if(_container.hideShowId!=null) _object.SetHideShowId(_container.hideShowId);
		_object.SetEventHandler(_EventHandler);
		_addObject(_n_id, _object);

		// now add the tabs ...
		var _nodes = _node.childNodes;
		for(var i=0; i<_nodes.length; i++)
		{
			if(_nodes[i].nodeName!='tab' && _nodes[i].nodeName!='TAB') continue;
			
			var _tab			= _nodes[i];
			var _id				= _tab.getAttribute('id');
			var _label			= _tab.getAttribute('label');
			var _width			= _tab.getAttribute('width');
			var _lateLoad		= _tab.getAttribute('lateLoad');
			var _isTemplate		= _tab.getAttribute('isTemplate');
			
			
			var _tabObject	= _object.AddTab(_id, _label, _width);
			var _cell		= _object.GetTabbar().cells(_id);
			
			for(var c=0; c<_tab.childNodes.length; c++)
			{
				var _node = _tab.childNodes[c];
				_initObject(_node, _cell, _prefix);
			}
			
			
		}
		
		_object.GetTabbar().setTabActive(_t_default);
		_object.Draw();
		
		LateLoading();
		
		if(_div_position=='absolute' && _div_hide!=null && _div_hide=="true") _object.Hide();
		
		return _object;
	}
		
	function _initView(_node, _to, _prefix)
	{
		var _n_id					= _prefix + _node.getAttribute('id');
//		var _v_collection	= _getCollectionByName(_node.getAttribute('collection'));
		var _v_collection		= _node.getAttribute('collection');
		
		var _div_position		= _node.getAttribute('position');
		var _div_hide				= _node.getAttribute('HideOnOpen');
		var _container			= new Container(_node, _n_id, _to, _prefix);
		var _toNode 				= _container.target;
		
		var _object 				= new ItemView(_n_id, _v_collection, _toNode);
		
		if(_container.hideShowId!=null) _object.SetHideShowId(_container.hideShowId);
		_object.SetEventHandler(_EventHandler);
		_addObject(_n_id, _object);
		
		// process events
		try {
			var _events = _node.getElementsByTagName('events')[0].getElementsByTagName('event');
			for(var e=0; e<_events.length; e++)
			{
				var _event 		= _events[e];
				var _from		= _event.getAttribute('from');
				var _type		= _event.getAttribute('type');
				var _callback	= _event.getAttribute('to');
				var _fire		= _event.getAttribute('fire');
				
				_EventHandler.WantEvent(_n_id, _from, _type, _callback, _fire);
			}
		} catch(e) { }
		
		var _template = null;
		try {
			_template = _node.getElementsByTagName('template')[0];
			_object.SetTemplate(_template.firstChild.nodeValue);
			
			_object.SetWidth(_template.getAttribute('width'));
			_object.SetHeight(_template.getAttribute('height'));
			_object.SetMargin(_template.getAttribute('margin'));
			_object.SetPadding(_template.getAttribute('padding'));

			if(_node.getAttribute('selectionOnLoad')=='true') _object.SetSelectionOnLoad(true);
			
		} catch(e) { }
		
		if(_template.getAttribute('css')!=null)	{ _object.SetCSS(_template.getAttribute('css')); }
			
		// if select-on-load is true then we need to use LateLoading ..
		if(_node.getAttribute('selectionOnLoad')=='true')
		{
			_LateLoaders[_LateLoaders.length] = _object;
			_to.attachURL('about:blank');
			_NeedLateLoaders++;
			return;
		}
		
		_object.Draw();
		
		if(_div_position=='absolute' && _div_hide!=null && _div_hide=="true") _object.Hide();
		
		return _object;
	}
	
	function _initGrid(_node, _to, _prefix)
	{
		var _n_id								= _prefix + _node.getAttribute('id');
		var _g_hideHeader			= _node.getAttribute('hideHeader');
		var _g_selectOnLoad		= _node.getAttribute('selectionOnLoad');
		var _div_position				= _node.getAttribute('position');
		var _div_hide						= _node.getAttribute('HideOnOpen');
		var _container					= new Container(_node, _n_id, _to, _prefix);
		var _toNode 						= _container.target;
		
		var _object 			= new ItemGrid(_n_id, _toNode, _node);
		
		if(_container.hideShowId!=null) _object.SetHideShowId(_container.hideShowId);
		_object.SetEventHandler(_EventHandler);
		_addObject(_n_id, _object);
		
		// process events
		try {
			var _events = _node.getElementsByTagName('events')[0].getElementsByTagName('event');
			for(var e=0; e<_events.length; e++)
			{
				var _event 		= _events[e];
				var _from		= _event.getAttribute('from');
				var _type		= _event.getAttribute('type');
				var _callback	= _event.getAttribute('to');
				var _fire		= _event.getAttribute('fire');
				
				_EventHandler.WantEvent(_n_id, _from, _type, _callback, _fire);
			}
		} catch(e) { }
		
		// custom column definitions - old style and new style
		try {
			var _columnRoot = _node.getElementsByTagName('columns');
			if(_columnRoot!=null && _columnRoot.length==1) {
				// we have a 'columns' node in the grid ... let's process the child nodes
				for(var c=0; c<_columnRoot[0].childNodes.length; c++) {
					var _colNode = _columnRoot[0].childNodes[c];
					
					switch(_colNode.nodeName) {
					case 'column':
						var _c_name		= _colNode.getAttribute('name');
						var _c_treatAs	= _colNode.getAttribute('treatAs');
						var _c_align	= _colNode.getAttribute('align');
						var _c_width	= _colNode.getAttribute('width');
						var _c_colour	= _colNode.getAttribute('colour');
						var _c_sortAs	= _colNode.getAttribute('sortAs');
						var _c_format	= _colNode.getAttribute('format');
						var _c_cols = _c_name.split(",");
						for( var cc=0; cc<_c_cols.length; cc++) {
							_object.AddColumnDefinition(_c_cols[cc], _c_treatAs, _c_align, _c_width, _c_colour, _c_sortAs, _c_format);
						}
						break;
						
					case 'align':
						var _align = _colNode.firstChild.nodeValue;
						_object.SetColumnAlignments(_align);
						break;
						
					case 'width':
						var _widths = _colNode.firstChild.nodeValue;
						var _remember = _colNode.getAttribute("rememberResize");
						_object.SetColumnWidths(_widths, _remember);
						break;

					case 'sortAs':
						var _sortAs = _colNode.firstChild.nodeValue;
						_object.SetColumnSortAs(_sortAs);
						break;
					}
				}

			}
			
		} catch(e) {  }
		
		// custom row definitions
		try {
			var _rows = _node.getElementsByTagName('rows')[0].getElementsByTagName('row');
			for(var r=0; r<_rows.length; r++)
			{
				_object.AddRowDefinition(_rows[r]);
			}
		} catch(e) {  }
		
		// custom header defintions
		try {
			var _headers = _node.getElementsByTagName('headers')[0].getElementsByTagName('header');
			for(var h=0; h<_headers.length; h++)
			{
				var _header		= _headers[h];
				var _h_value	= _header.getAttribute('value');
				var _h_data		= _header.getAttribute('data');
				
				_object.AddHeader(_h_value, _h_data);
			}
		} catch(e) {  }
		
		// look for specific options
		try {
			var _options = _node.getElementsByTagName('options')[0];
			for(var c=0; c<_options.childNodes.length; c++)
			{
				var _option = _options.childNodes[c];
				switch(_option.nodeName)
				{
				case 'allowSort':
				case 'ALLOWSORT':
					_object.SetAllowSort(eval(_option.firstChild.nodeValue));
					break;
					
				case 'allowResize':
				case 'ALLOWRESIZE':
					_object.SetAllowResize(eval(_option.firstChild.nodeValue));
					break;
					
				case 'allowDrag':
				case 'ALLOWDRAG':
					_object.SetAllowDrag(eval(_option.firstChild.nodeValue));
					break;
					
				case 'allowMultiSelect':
				case 'ALLOWMULTISELECT':
					var _addQuotes 	= _option.getAttribute('addQuotes');
					var _delimiter		= _option.getAttribute('delimiter');
					if(_addQuotes==null) 		_addQuotes = "false";
					if(_delimiter==null) 			_delimiter = ",";
					
					_object.SetAllowMultiSelect(eval(_option.firstChild.nodeValue), _addQuotes, _delimiter);
					break;
				}
			}
		} catch(e) { }
		
		if(_g_hideHeader=="true") _object.SetHideHeader(true);
		if(_g_selectOnLoad!=null) _object.SetSelectOnLoad(_g_selectOnLoad);
		
		_object.Draw();
		
		if(_div_position=='absolute' && _div_hide!=null && _div_hide=="true") _object.Hide();

		return _object;
	}

	
	function _initTree(_node, _to, _prefix)
	{
		var _n_id				= _prefix + _node.getAttribute('id');
		var _t_collection		= _getCollectionByName(_node.getAttribute('collection'));
		var _t_branch			= _node.getAttribute('branch');
		var _t_node				= _node.getAttribute('node');
		var _t_root				= _node.getAttribute('root');
		var _t_collapse			= _node.getAttribute('collapseOnLoad');
		var _t_select			= _node.getAttribute('selectionOnLoad');
		var _t_iconsPath		= _node.getAttribute('iconsPath');
		var _div_position		= _node.getAttribute('position');
		var _div_hide			= _node.getAttribute('HideOnOpen');
		var _container			= new Container(_node, _n_id, _to, _prefix);
		var _toNode 			= _container.target;
		
		var _object				= new ItemTree(_n_id, _t_collection, _toNode, _t_branch, _t_node, _t_iconsPath);
		
		if(_container.hideShowId!=null) _object.SetHideShowId(_container.hideShowId);
		_object.SetEventHandler(_EventHandler);
		_addObject(_n_id, _object);
		
		if(_t_root!=null)		_object.SetRoot(_t_root);
		if(_t_collapse!=null)	_object.SetCollapseOnLoad(_parseBool(_t_collapse));
		if(_t_select!=null)		_object.SetSelectOnLoad(_parseBool(_t_select));
		
		_object.Draw();
		
		if(_div_position=='absolute' && _div_hide!=null && _div_hide=="true") _object.Hide();
		
		return _object;
	}
	
}
