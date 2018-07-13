/**
 * Debugger:
 * loads the page with two tabs, once containing the actual dashboard and one containing the internal debug information.
 * Note: modal windows will need to be changed to non-modal to use the debugger. 
 * 
 */
 
var _debugTabbar											= null;
var _debugTabbarDebug								= null;

var _debugLayout											= null;
var _debugLayoutPage									= null;
var _debugLayoutDebug								= null;
var _debugLayoutCollections							= null;

var _debugLayoutObjects								= null;
var _debugLayoutMessages							= null;
var _debugLayoutEvents								= null;
var _debugLayoutSource								= null;

var _debugEventsToolbar								= null;
var _debugEventsGrid									= null;
var _debugEventsTabbar		 						= null;
var _debugEventsTree									= null;

var _debugCollectionsToolbar						= null;
var _debugCollectionsGrid								= null;
var _debugCollectionDetailsGrid					= null;
var _debugCollectionsTabbar 						= null;
var _debugCollectionQueryGrid						= null;

var _debugObjectsToolbar								= null;
var _debugObjectsGrid									= null;
var _debugObjectsTabbar								= null;
var _debugObjectsEventsLayout						= null;
var _debugObjectsWantEventsGrid					= null;
var _debugObjectsDependEventsGrid				= null;
var _debugObjectsPropsGrid							= null;

var _debugMessagesToolbar							= null;

var _debugDictGrid								= null;
var _debugDictLayout							= null;

function _debugInit(_to)
{
	_addTimeline('Debugger', new Date(), null, 'Init');
	
	// create the master layout
	var _debugLayout 	= new dhtmlXLayoutObject(_to, '1C');
//	_debugLayout.setImagePath(_defaultImgsPath);
	_debugLayout.cells('a').hideHeader();
	
	// add the main tabbar
	var _debugTabbar	=  _debugLayout.cells('a').attachTabbar();
//	_debugTabbar.setSkin('dhx_skyblue');
//	_debugTabbar.setImagePath(_defaultImgsPath);
//	_debugTabbar.setHrefMode("iframes-on-demand");
	_debugTabbar.enableContentZone(true);
	_debugTabbar.addTab('page', 'your page', 100);
	_debugTabbar.addTab('debug', 'debugger', 100);
	_debugTabbar.tabs('page').setActive('page');
	
	
	// insert the two layouts
	_debugLayoutPage	= _debugTabbar.cells('page').attachLayout('1C');
	_debugLayoutDebug	= _debugTabbar.cells('debug').attachLayout('1C');
	
	_debugLayoutPage.cells('a').hideHeader();
	_debugLayoutDebug.cells('a').hideHeader();
	
	_debugInitDebugLayouts();
	
	_updateTimeline('Debugger', new Date());
	
	// return the main cell for the page layout
	return _debugLayoutPage.cells('a');
}

function _debugInitDebugLayouts()
{
	_debugTabbarDebug = _debugLayoutDebug.cells('a').attachTabbar();
//	_debugTabbarDebug.setSkin('dhx_skyblue');
//	_debugTabbarDebug.setImagePath(_defaultImgsPath);
//	_debugTabbarDebug.setHrefMode("iframes-on-demand");
	_debugTabbarDebug.enableContentZone(true);
	
	_debugTabbarDebug.addTab('monitor', 'monitor', 100);
	_debugTabbarDebug.addTab('src', 'source', 100);
	_debugTabbarDebug.addTab('collections', 'collections', 100);
	_debugTabbarDebug.addTab('objects', 'objects', 100);
	_debugTabbarDebug.addTab('events', 'events', 100);
	_debugTabbarDebug.addTab('dictionary', 'dictionary', 100);
	_debugTabbarDebug.addTab('messages', 'messages', 100);
	_debugTabbarDebug.tabs('monitor').setActive();
	
	_debugLayoutMonitor = _debugTabbarDebug.cells('monitor').attachLayout('1C');
	_debugLayoutMonitor.cells('a').hideHeader();
	
	_debugLayoutSource = _debugTabbarDebug.cells('src').attachLayout('1C');
	_debugLayoutSource.cells('a').hideHeader();
	
	_debugLayoutCollections = _debugTabbarDebug.cells('collections').attachLayout('2U');
	_debugLayoutCollections.cells('a').setWidth(500);
	_debugLayoutCollections.cells('a').hideHeader();
	_debugLayoutCollections.cells('b').hideHeader();
	
	_debugLayoutObjects = _debugTabbarDebug.cells('objects').attachLayout('2U');
	_debugLayoutObjects.cells('a').setWidth(500);
	_debugLayoutObjects.cells('a').hideHeader();
	_debugLayoutObjects.cells('b').hideHeader();
	
	_debugLayoutMessages = _debugTabbarDebug.cells('messages').attachLayout('1C');
	_debugLayoutMessages.cells('a').hideHeader();
	
	_debugLayoutEvents = _debugTabbarDebug.cells('events').attachLayout('1C');
	_debugLayoutEvents.cells('a').hideHeader();
	
	_debugDictLayout = _debugTabbarDebug.cells('dictionary').attachLayout('1C');
	_debugDictLayout.cells('a').hideHeader();
	
	_debugInitMonitor();
	_debugInitCollectionsGrid();
	_debugInitObjectsGrid();
	_debugInitEventsGrid();
	_debugInitMessagesGrid();
	_debugInitDictionary();
}

function _debugInitDictionary()
{
	_debugDictGrid = _debugDictLayout.cells('a').attachGrid();
//	_debugDictGrid.setImagePath(_defaultImgsPath);
//	_debugDictGrid.setSkin("dhx_skyblue");
	
	_debugDictGrid.setHeader('XML Tag,Object Name');
	_debugDictGrid.setInitWidths('250,*');
	_debugDictGrid.init();
	
	_debugDrawDictData();
}

function _debugInitMonitor()
{
	_debugMonitorToolbar	= _debugLayoutMonitor.cells('a').attachToolbar();
	_debugMonitorToolbar.setIconsPath('clapi/images/icons/');
	_debugMonitorToolbar.attachEvent("onClick", _debugToolbarsCallBack);
	_debugMonitorToolbar.addButton('clearMonitor', 0, 'clear', 'refresh.png', 'refresh.png');
	_debugMonitorToolbar.addSeparator('sep', 1);
	_debugMonitorToolbar.addButton('refreshMonitor', 2, 'refresh', 'refresh.png', 'refresh.png');
	
}

function _debugInitMessagesGrid()
{
	_debugMessagesToolbar	= _debugLayoutMessages.cells('a').attachToolbar();
	_debugMessagesToolbar.setIconsPath('clapi/images/icons/');
	_debugMessagesToolbar.attachEvent("onClick", _debugToolbarsCallBack);
	_debugMessagesToolbar.attachEvent("onStateChange", _debugToolbarsCallBack);
	_debugMessagesToolbar.addButton('clearMessages', 0, 'clear', 'refresh.png', 'refresh.png');
	_debugMessagesToolbar.addSeparator('sep', 1);
	_debugMessagesToolbar.addButtonTwoState('enabled', 2, 'capture: running', 'green.gif', 'green.gif');
	_debugMessagesToolbar.addSeparator('sep', 3);
	_debugMessagesToolbar.addText('txt1', 4, 'limit to:');
	_debugMessagesToolbar.addInput('msgMax', 5, '100', 50);
	_debugMessagesToolbar.addText('txt2', 6, 'messages');
	
	_debugMessagesToolbar.setItemState('enabled', true);

	_debugMessagesGrid = _debugLayoutMessages.cells('a').attachGrid();
//	_debugMessagesGrid.setImagePath(_defaultImgsPath);
//	_debugMessagesGrid.setSkin("dhx_skyblue");
	
	_debugMessagesGrid.setHeader(',#text_filter,#text_filter,#text_filter');
	_debugMessagesGrid.attachHeader('time,level,from,message');
	_debugMessagesGrid.setInitWidths('150,150,250,*');
	_debugMessagesGrid.init();
	
	_debugClearMessagesData();
}

function _debugInitObjectsGrid()
{
	_debugObjectsToolbar	= _debugLayoutObjects.cells('a').attachToolbar();
	_debugObjectsToolbar.setIconsPath('clapi/images/icons/');
	_debugObjectsToolbar.attachEvent("onClick", _debugToolbarsCallBack);
	_debugObjectsToolbar.addButton('redrawObjects', 0, 'refresh', 'refresh.png', 'refresh.png');

	_debugObjectsGrid = _debugLayoutObjects.cells('a').attachGrid();
//	_debugObjectsGrid.setImagePath(_defaultImgsPath);
//	_debugObjectsGrid.setSkin("dhx_skyblue");
	
	_debugObjectsGrid.setHeader('id (cnt: {#stat_count}),type');
	_debugObjectsGrid.setColAlign('left,left');
	_debugObjectsGrid.attachEvent("onRowSelect", _debugObjectsGridRowSelect);
	_debugObjectsGrid.init();
	
	_debugObjectsTabbar		= _debugLayoutObjects.cells('b').attachTabbar();
//	_debugObjectsTabbar.setSkin('dhx_skyblue');
//	_debugObjectsTabbar.setImagePath(_defaultImgsPath);
//	_debugObjectsTabbar.setHrefMode("iframes-on-demand");
	_debugObjectsTabbar.enableContentZone(true);
	
	_debugObjectsTabbar.addTab('events', 'events', 75);
	_debugObjectsTabbar.addTab('properties', 'properties', 75);	
	_debugObjectsTabbar.addTab('container', 'container', 75);
	_debugObjectsTabbar.addTab('style', 'style', 75);
	_debugObjectsTabbar.tabs('properties').setActive();

	_debugObjectsPropsGrid		= _debugObjectsTabbar.cells('properties').attachGrid();
//	_debugObjectsPropsGrid.setImagePath(_defaultImgsPath);
//	_debugObjectsPropsGrid.setSkin("dhx_skyblue");
	_debugObjectsPropsGrid.setHeader('name,value');
	_debugObjectsPropsGrid.setColAlign('left,left');
	_debugObjectsPropsGrid.setInitWidths("200,*");
	_debugObjectsPropsGrid.init();
	
	_debugObjectsEventsLayout	= _debugObjectsTabbar.cells('events').attachLayout('2E');
	_debugObjectsEventsLayout.cells('a').setText('want events');
	_debugObjectsEventsLayout.cells('b').setText('dependencies');
	
	_debugObjectsWantEventsGrid = _debugObjectsEventsLayout.cells('a').attachGrid();
//	_debugObjectsWantEventsGrid.setImagePath(_defaultImgsPath);
//	_debugObjectsWantEventsGrid.setSkin("dhx_skyblue");
	
	_debugObjectsWantEventsGrid.setHeader('Target,Wants,From,To,Propogate,Call Cnt ({#stat_total})');
	_debugObjectsWantEventsGrid.setInitWidths('150,150,150,250,150,100');
	_debugObjectsWantEventsGrid.setColAlign('left,left,left,left,left,right');
	_debugObjectsWantEventsGrid.init();

	_debugObjectsDependEventsGrid = _debugObjectsEventsLayout.cells('b').attachGrid();
//	_debugObjectsDependEventsGrid.setImagePath(_defaultImgsPath);
//	_debugObjectsDependEventsGrid.setSkin("dhx_skyblue");
	
	_debugObjectsDependEventsGrid.setHeader('Target,Wants,From,To,Propogate,Call Cnt ({#stat_total})');
	_debugObjectsDependEventsGrid.setInitWidths('150,150,150,250,150,100');
	_debugObjectsDependEventsGrid.setColAlign('left,left,left,left,left,right');
	_debugObjectsDependEventsGrid.init();


	_debugDrawObjectData();
}

function _debugInitEventsGrid()
{
	_debugEventsToolbar	= _debugLayoutEvents.cells('a').attachToolbar();
	_debugEventsToolbar.setIconsPath('clapi/images/icons/');
	_debugEventsToolbar.attachEvent("onClick", _debugToolbarsCallBack);
	_debugEventsToolbar.addButton('redrawEvents', 0, 'refresh', 'refresh.png', 'refresh.png');
	
	_debugEventsTabbar = _debugLayoutEvents.cells('a').attachTabbar();
//	_debugEventsTabbar.setSkin('dhx_skyblue');
//	_debugEventsTabbar.setImagePath(_defaultImgsPath);
//	_debugEventsTabbar.setHrefMode("iframes-on-demand");
	_debugEventsTabbar.enableContentZone(true);
	
	_debugEventsTabbar.addTab('events', 'events', 75);
	_debugEventsTabbar.addTab('tree', 'tree', 75);
	_debugEventsTabbar.tabs('events').setActive();
	
	_debugEventsGrid = _debugEventsTabbar.cells('events').attachGrid();
//	_debugEventsGrid.setImagePath(_defaultImgsPath);
//	_debugEventsGrid.setSkin("dhx_skyblue");
	
	_debugEventsGrid.setHeader('Target,Wants,From,To,Propogate,Call Cnt ({#stat_total})');
	_debugEventsGrid.setInitWidths('150,150,150,250,150,100');
	_debugEventsGrid.setColAlign('left,left,left,left,left,right');
	_debugEventsGrid.init();
	
	_debugEventsTree = _debugEventsTabbar.cells('tree').attachTree();
//	_debugEventsTree.setImagePath("clapi/ui/imgs/");
	_debugEventsTree.enableHighlighting(true);
	_debugDrawEventData();
}


function _debugInitCollectionsGrid()
{
	_debugCollectionsToolbar	= _debugLayoutCollections.cells('a').attachToolbar();
	_debugCollectionsToolbar.setIconsPath('clapi/images/icons/');
	_debugCollectionsToolbar.attachEvent("onClick", _debugToolbarsCallBack);
	_debugCollectionsToolbar.addButton('redrawCollections', 0, 'refresh', 'refresh.png', 'refresh.png');
	
	_debugCollectionsTabbar		= _debugLayoutCollections.cells('b').attachTabbar();
//	_debugCollectionsTabbar.setSkin('dhx_skyblue');
//	_debugCollectionsTabbar.setImagePath(_defaultImgsPath);
//	_debugCollectionsTabbar.setHrefMode("iframes-on-demand");
	_debugCollectionsTabbar.enableContentZone(true);
	
	_debugCollectionsTabbar.addTab('data', 'items', 75);
	_debugCollectionsTabbar.addTab('query', 'query', 75);
	_debugCollectionsTabbar.tabs('data').setActive();
	
	_debugCollectionsGrid = _debugLayoutCollections.cells('a').attachGrid();
//	_debugCollectionsGrid.setImagePath(_defaultImgsPath);
//	_debugCollectionsGrid.setSkin("dhx_skyblue");
	
	_debugCollectionsGrid.setHeader('Collection,#cspan,Connector Types (hits),#cspan,#cspan,#cspan');
	_debugCollectionsGrid.attachHeader('Name,Itm cnt,select,update,delete,create');
	_debugCollectionsGrid.setInitWidths('150,50,75,75,75,75');
	_debugCollectionsGrid.setColAlign('left,right,right,right,right,right');
	_debugCollectionsGrid.attachEvent("onRowSelect", _debugCollectionsGridRowSelect);
	_debugCollectionsGrid.init();
	
	_debugDrawCollectionsData();
	
}

function _debugDrawDictData()
{
	_debugDictGrid.clearAll();
	
	var _arAll = new Array();
	for(var i=0; i<_dictionary.words.length; i++)
	{
		var _ar 	= new Array();
		var _item	= _dictionary.words.atIndex(i);
		
		try {
			_ar[0] = _item.key;
			_ar[1] = (_item.value.tag!=null)? _item.value.tag : '&lt;unknown&gt;';
			
			_arAll[_arAll.length] = { id:i, data:_ar };
		} catch(e) { alert('error: ' + _item.key); }
	}
	
	_debugDictGrid.parse({rows:_arAll}, "json");
}

function _debugDrawObjectData()
{
	_debugObjectsGrid.clearAll();

	var _arAll = new Array();
	for(var i=0; i<_Objects.length; i++)
	{
		var _ar 	= new Array();
		var _item	= _Objects[i];
		
		try {
			_ar[0] = _item.key;
			_ar[1] = (_item.value.type!=null)? _item.value.type : '&lt;unknown&gt;';
			
			_arAll[_arAll.length] = { id:i, data:_ar };
		} catch(e) { alert('error: ' + _item.key); }
	}
	
	_debugObjectsGrid.parse({rows:_arAll}, "json");
}

function _debugDrawEventData()
{
	// first draw the events grid
	_debugEventsGrid.clearAll();
	
	var _events		= _EventHandler.GetAllWants();
	var _arAll = new Array();
	for(var i=0; i<_events.length; i++)
	{
		var _ar 	= new Array();
		var _item	= _events[i];
		
		try {
			_ar[0] = _item.target;
			_ar[1] = _item.type;
			_ar[2] = _item.item;
			_ar[3] = _item.callback;
			_ar[4] = _item.propogate;
			_ar[5] = _item.countFired;
			
			_arAll[_arAll.length] = { id:i, data:_ar };
		} catch(e) { }
	}
	
	_debugEventsGrid.parse({rows:_arAll}, "json");
	
	// now we need to calculate the event tree
	_debugEventsTree.deleteChildItems('root');
	_debugEventsTree.deleteItem('root');
	
	var _dependents = new Array();
	for(var i=0; i<_Objects.length; i++)
	{
		try {
		_dependents[_dependents.length] = new kvp(_Objects[i].key,  _EventHandler.CountWantsFrom(_Objects[i].value.GetId()));
		} catch(e) { }
	}
	
	_debugEventsTree.insertNewChild(0, 'root', 'dependency tree');
	
	for(var i=0; i<_dependents.length; i++)
	{
		if(_dependents[i].value>0)
		{
			var _obj	= _getObjectByName(_dependents[i].key, null);
			_debugEventsTree.insertNewChild('root', _dependents[i].key, _dependents[i].key + " (" + _obj.type + ")");
			_EventsTreeChildren(0, _dependents[i].key, _dependents[i].key);
		}
		
	}
	
	_debugEventsTree.closeAllItems('root');
	
}

function _EventsTreeChildren(_level, _parent, _from)
{
	var _wants		= _EventHandler.GetAllWants();
	
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

function _debugDrawCollectionsData()
{
	_debugCollectionsGrid.clearAll();
	
	var _arAll = new Array();
	for(var i=0; i<_Collections.length; i++)
	{
		var _ar 	= new Array();
		var _item	= _Collections[i];
		
		try {
			_ar[0] = _item.key;
			_ar[1] = _item.value.GetAllItems().length;
			_ar[2] = _item.value.GetTypeSelect() + ' (' + _item.value.GetCountSelect() + ')';
			_ar[3] = _item.value.GetTypeUpdate() + ' (' + _item.value.GetCountUpdate() + ')';
			_ar[4] = _item.value.GetTypeDelete() + ' (' + _item.value.GetCountDelete() + ')';
			_ar[5] = _item.value.GetTypeCreate() + ' (' + _item.value.GetCountCreate() + ')';
			
			_arAll[_arAll.length] = { id:i+1, data:_ar };
		} catch(e) { }
	}
	
	_debugCollectionsGrid.parse({rows:_arAll}, "json");
}

function _debugToolbarsCallBack(_clickedItem)
{
	switch(_clickedItem)
	{
		case 'clearMonitor':
			_timeline.length = 0;
			_debugRefreshMonitor();
			break;
			
		case 'refreshMonitor':
			_debugRefreshMonitor();
			break;
			
		case 'redrawCollections':
			_debugDrawCollectionsData();
			break;
			
		case 'redrawEvents':
			_debugDrawEventData();
			break;
			
		case 'redrawObjects':
			_debugDrawObjectData();
			break;
			
		case 'clearMessages':
			_debugClearMessagesData();
			break;
			
		case 'enabled':
			var _state = _debugMessagesToolbar.getItemState('enabled');
			if(_state==false)
			{
				_debugMessagesToolbar.disableItem('msgMax');
				_debugMessagesToolbar.setItemText('enabled', 'capture: paused');
				_debugMessagesToolbar.setItemImage('enabled', 'red.gif');
			} else
			{
				_debugMessagesToolbar.enableItem('msgMax');
				_debugMessagesToolbar.setItemText('enabled', 'capture: running');
				_debugMessagesToolbar.setItemImage('enabled', 'green.gif');
			}
			break;
	}
}

function _debugRefreshMonitor()
{
//	var _target 							= _findHTMLObject(_debugLayoutMonitor.cells('a'), 'dhx_cell_cont_layout');
	var _divTimeline				= document.getElementById('debugTimeline');
	
	
	var _target = _debugLayoutMonitor.cells('a').cell;
	
	_target.style.overflow		= 'auto';
	_target.style.fontFamily	= 'Courier';
	_target.style.fontSize		= '11px';
	
	var _colourTimeBar			= '#b0376a';
	var _colourRelBar				= '#701883';
	var _colourRatioBar			= '#4237b0';
	var _colourGantt				= '#15795e';
	var _colourGanttWait		= '#5db35d';
	var _colourWork				= '#379898';
	
	var _rowHeight					= 40;
	var _headerHeight			= 40;
	var _compWidth				= 300;	// comparison bar charts horizontal size
	var _totalWidth					= parseInt(_target.style.width, 10) - 24;
	var _matrixWidth				= _totalWidth - 300;
	var _totalHeight				= ((_timeline.length+2) * _rowHeight) + _headerHeight + 40;
	
	if(_divTimeline==null)
	{
		_divTimeline							= document.createElement('DIV');
		_divTimeline.style.width		= _totalWidth;
		_divTimeline.style.height		= _totalHeight;
		_divTimeline.style.margin	= '2px';
		_divTimeline.style.border	= '0px solid #A0A0A0';
		
		_divTimeline.setAttribute('id', 'debugTimeline');
		_target.appendChild(_divTimeline);
	} else
	{
		_divTimeline.innerHTML				= '';
		_divTimeline.style.width				= _totalWidth;
	}
		
	var _r = new Raphael(_divTimeline);
	
	var _rBackground						= _r.rect(0,0,_totalWidth, _totalHeight, 4);
	_rBackground.attr({"fill": "135-#B4CEE4-#fff", 'stroke-width': 0, 'stroke': '#FFFFFF'});
	
	_debugMonitorDrawTitle(_r, _divTimeline, _headerHeight, _totalWidth);
	_debugMonitorDrawFrames(_r, _divTimeline, _headerHeight + 10, _totalHeight, _totalWidth);
	
	// calculate the physical size of a millisecond ...
	var _maxDiff							= 0;
	var _elapsed							= 0;
	var _totalTime						= 0;
	var _earliestStart					= null;
	var _latestEnd						= null;
	for(var i=0; i<_timeline.length; i++) 
	{
		var _item = _timeline[i];
		
		if(_item.start==null || _item.end==null) continue;
		
		var _diff = (_item.end!=null)? _item.end.getTime() - _item.start.getTime() : 0; 
		_maxDiff = (_diff>_maxDiff)? _diff : _maxDiff; 
		
		_totalTime += _diff;
		
		if(_earliestStart==null || _item.start.getTime() < _earliestStart.getTime()) _earliestStart = _item.start;
		if(_latestEnd==null || _item.end.getTime() > _latestEnd.getTime()) _latestEnd = _item.end;
	}

	var _elapsed							= (_latestEnd.getTime() - _earliestStart.getTime()); 	
	var _msRelativeSize				= _compWidth / 100;
	var _msSize							= _compWidth / _maxDiff;
	var _msSizePixel					= (_totalWidth-624) / _elapsed;
	
	var _rectTimeElapsed			= _r.rect(314, _headerHeight+15, 10, 10, 2);
	_rectTimeElapsed.attr({"fill": _colourRelBar, 'stroke-width': '0', 'stroke': _colourRelBar});
	
	var _textTimeElapsed			= _r.text(328, _headerHeight+20, 'elapsed: ' + _elapsed + 'ms');
	_textTimeElapsed.attr({'font-size': 10, 'text-anchor': 'start', 'fill': _colourRelBar});
	
	var _rectTimeTotal			= _r.rect(450, _headerHeight+15, 10, 10, 2);
	_rectTimeTotal.attr({"fill": _colourRatioBar, 'stroke-width': '0', 'stroke': _colourRatioBar});

	var _textTimeTotal			= _r.text(464, _headerHeight+20, 'total: ' + _totalTime + 'ms');
	_textTimeTotal.attr({'font-size': 10, 'text-anchor': 'start', 'fill': _colourRatioBar});
	
	_debugMonitorDrawScale(_r, _elapsed, _msSizePixel, _totalWidth, _headerHeight + 10, _totalHeight);
	
	var _cnt = 0;
	for(var i=0; i<_timeline.length; i++)
	{
		var _item						= _timeline[i];

		if(_item.start==null || _item.end==null) continue;

		var _diff							= (_item.end!=null)? _item.end.getTime() - _item.start.getTime() : 0;
		
		var _itemTop					= ((_cnt+1) * _rowHeight) + _headerHeight;
		
		var _topLinePath			= 'M0 ' + (_itemTop+_rowHeight-10) + 'L'+_totalWidth+' ' + (_itemTop+_rowHeight-10);
		var _rTopLine									= _r.path(_topLinePath);
		_rTopLine.attr({"stroke": '#C0C0C0'});
		
		var _itemObject				= _r.text(4, _itemTop, _item.object);
		_itemObject.attr({'font-size': 10, 'text-anchor': 'start'});
		
		var _itemDesc				= _r.text(4, _itemTop+14, _item.description);
		_itemDesc.attr({'font-size': 10, 'text-anchor': 'start'});

		var _compRect				= _r.rect(314, _itemTop-8, (_diff * _msSize), 10, 2);
		_compRect.attr({"fill": _colourTimeBar, 'stroke-width': '0', 'stroke': _colourTimeBar});
		
		// show relative time
		var _relativeTime			= (_diff / _elapsed) * 100;
		var _compRect				= _r.rect(314, _itemTop+5, (_relativeTime * _msRelativeSize), 10, 2);
		_compRect.attr({"fill": _colourRelBar, 'stroke-width': '0', 'stroke': _colourRelBar});
		
		// show ratio time
		var _ratioTime			= (_diff / _totalTime) * 100;
		var _ratioRect				= _r.rect(314, _itemTop+18, (_ratioTime * _msRelativeSize), 10, 2);
		_ratioRect.attr({"fill": _colourRatioBar, 'stroke-width': '0', 'stroke': _colourRatioBar});
		
		// add the numbers as text 
		var _compNum				= new Number(_relativeTime);
		var _ratioNum				= new Number(_ratioTime);
		
		var _itemDiff					= _r.text(298, _itemTop-3, _diff + 'ms');
		_itemDiff.attr({'font-size': 10, 'text-anchor': 'end'});
		
		var _compText				= _r.text(298,_itemTop + 10, _compNum.toFixed(0) + '%');
		_compText.attr({'font-size': 10, 'text-anchor': 'end'});
		
		var _ratioText				= _r.text(298,_itemTop + 23, _ratioNum.toFixed(0) + '%');
		_ratioText.attr({'font-size': 10, 'text-anchor': 'end'});
		
		// the gantt bar gets added now: _msSizePixel
		var _ganttBar				= _r.rect(622+(_item.start.getTime() - _earliestStart.getTime())*_msSizePixel, _itemTop-8, (_item.end.getTime() - _item.start.getTime()) * _msSizePixel, 20, 2);
		_ganttBar.attr({"fill": _colourGantt, 'stroke-width': '0', 'stroke': _colourGantt});
		
		// calculate 'wait' time
		var _waitTime			= _debugMonitorCalcWaitTime(i);
		var _work					= (_item.end.getTime() - _item.start.getTime());
		if(_waitTime.start!=null && _waitTime.end!=null)
		{
			var _ganttWait			= _r.rect(622+(_waitTime.start.getTime() - _earliestStart.getTime())*_msSizePixel, _itemTop-8, (_waitTime.end.getTime() - _waitTime.start.getTime()) * _msSizePixel, 20, 2);
			_ganttWait.attr({"fill": _colourGanttWait, 'stroke-width': '0', 'stroke': _colourGanttWait});
			
			// update work time
			_work							= (_item.end.getTime() - _item.start.getTime()) - (_waitTime.end.getTime() - _waitTime.start.getTime());
			
		}
				
		var _barWork				= _r.rect(622, _itemTop+18, _work*_msSizePixel, 10, 2);
		_barWork.attr({"fill": _colourWork, 'stroke-width': '0', 'stroke': _colourWork});
		
		var _workText			= _r.text(618, _itemTop+23, _work + 'ms');
		_workText.attr({'font-size': 10, 'text-anchor': 'end', 'fill': _colourWork});
		
		_cnt++;
	}
	
}

function _debugMonitorCalcWaitTime(_from)
{
	var _wait = {start: null, end: null}
	
	if(_timeline[_from].start==null || _timeline[_from].end==null) return _wait;
	
	for(var i=_from+1; i<_timeline.length; i++)
	{
		var _t = _timeline[i];
		if(_t.start==null || _t.end==null) continue;		// skip incomplete entries
		
		if(_t.end.getTime() > _timeline[_from].end.getTime()) return _wait;
		if(_t.start.getTime() >= _timeline[_from].end.getTime()) return _wait;
		
		if(_t.start.getTime() >= _timeline[_from].start.getTime() && _t.end.getTime() <= _timeline[_from].end.getTime())
		{
			if(_wait.start==null || _t.start.getTime()<_wait.start.getTime()) _wait.start = _t.start;
			if(_wait.end==null || _t.end.getTime()>_wait.end.getTime()) _wait.end = _t.end;
		}
	}
	
	return _wait;
}

/**
 * debugMonitorDrawScale()
 * draws the scale lines and markers for the gantt chart
 */
function _debugMonitorDrawScale(_r, _elapsed, _msSizePixel, _totalWidth, _top, _height)
{
	var _lineColour						= '#C0C0C0';
	
	var _rZeroText						= _r.text(622, _top+10, '0ms');
	_rZeroText.attr({"fill": "#000000", "font-size": 10, "text-anchor": "start"});
	
	var _rMaxText						= _r.text(_totalWidth-4, _top+10, _elapsed + 'ms');
	_rMaxText.attr({"fill": "#000000", "font-size": 10, "text-anchor": "end"});
	
	var _rHalfText						= _r.text(622+((_totalWidth-620)/2), _top+10, (_elapsed/2) + 'ms');
	_rHalfText.attr({"fill": "#000000", "font-size": 10, "text-anchor": "middle"});
	
	var _rQuarterText					= _r.text(622+((_totalWidth-620)/4), _top+10, (_elapsed/4) + 'ms');
	_rQuarterText.attr({"fill": "#000000", "font-size": 10, "text-anchor": "middle"});
	
	var _rThreeQuarterText		= _r.text(622+(((_totalWidth-620)/4)*3), _top+10, (_elapsed/4)*3 + 'ms');
	_rThreeQuarterText.attr({"fill": "#000000", "font-size": 10, "text-anchor": "middle"});
	
	var _division			= 100;
	var _divisionSize	= (_totalWidth - 620) / _division;
	
	while(_divisionSize < 6)
	{
		_division				= _division / 2;
		_divisionSize		= (_totalWidth - 620) / _division;
	}
	
	for(var i=1; i<_division; i++)
	{
		var _x									= 620 + (i*_divisionSize);
		var _yTop							= _top + 20;
		var _yBottom						= _height;
		var _rDivisionLine				= _r.path('M' + _x + ' ' + _yTop + 'L' + _x + ' ' + _yBottom);
		_rDivisionLine.attr({"stroke": _lineColour});
	}
}

/**
 * debugMonitorDrawTitle()
 * draws the title area.
 */
function _debugMonitorDrawTitle(_r, _div, _height, _width)
{
		var _rHeaderBackground				= _r.rect(0,0, _width-2, _height-2, 4);
		_rHeaderBackground.attr({"fill": "#A4BED4", 'stroke-width': 1, 'stroke': '#A4BED4'});
		
		var _rHeaderTitle							= _r.text(10,19, "Performance Monitor");
		_rHeaderTitle.attr({"fill": "#FFFFFF", "font-size": 18, "text-anchor": "start"});
}

function _debugMonitorDrawFrames(_r, _div, _top, _height, _width)
{
	var _lineColour								= '#A0A0A0';
	
	var _rPathTopLine							= 'M0 ' + (_top+20) + 'L' + (_width) + ' ' + (_top+20);
	var _rPathLeftLine							= 'M0 ' +  (_top+10) + 'L0 ' + (_height);
	var _rPathDescLine						= 'M250 ' +  (_top+10) + 'L250 ' + (_height);
	var _rPathDiffLine							= 'M300 ' +  (_top+10) + 'L300 ' + (_height);
	var _rPathStartLine						= 'M310 ' +  (_top+10) + 'L310 ' + (_height);
	var _rPathTimeLine						= 'M620 ' +  (_top+10) + 'L620 ' + (_height);
	var _rPathEndLine							= 'M ' +  (_width-1) + ' ' + (_top+10) + 'L ' +(_width-1) + ' ' + (_height);
	
	var _rLeftLine									= _r.path(_rPathLeftLine);
	_rLeftLine.attr({"stroke": _lineColour});
	
	var _rEndLine									= _r.path(_rPathEndLine);
	_rEndLine.attr({"stroke": _lineColour});
	
	var _rTopLine									= _r.path(_rPathTopLine);
	_rTopLine.attr({"stroke": _lineColour});
	
	var _rDescLine									= _r.path(_rPathDescLine);
	_rDescLine.attr({"stroke": _lineColour});
	
	var _rDiffLine									= _r.path(_rPathDiffLine);
	_rDiffLine.attr({"stroke": _lineColour});
	
	var _rStartLine									= _r.path(_rPathStartLine);
	_rStartLine.attr({"stroke": _lineColour});
	
	var _rTimeLine									= _r.path(_rPathTimeLine);
	_rTimeLine.attr({"stroke": _lineColour});
	
	var _rTextObject								= _r.text(4, _top+10, 'object, method');
	_rTextObject.attr({'font-size': 10, 'text-anchor': 'start'});
	
	var _rTextDiff								= _r.text(254, _top+10, 'time');
	_rTextDiff.attr({'font-size': 10, 'text-anchor': 'start'});
}
 

function _debugClearMessagesData()
{
	_debugMessagesGrid.clearAll();
}

function _debugObjectsGridRowSelect(_row)
{
	var _object 					= _Objects[parseInt(_row,10)].value;
	var _id							= _object.GetId();
	var _container				= _getContainerForObjectId(_id);
	
	var _tabContainer			= _debugObjectsTabbar.cells('container').cell; //_findHTMLObject(_debugObjectsTabbar.cells('container'), 'dhx_cell_cont_layout');
	var _tabStyle					= _debugObjectsTabbar.cells('style').cell; // _findHTMLObject(_debugObjectsTabbar.cells('style'), 'dhx_cell_cont_layout');
	
	_tabContainer.style.overflow 			= 'auto';
	_tabContainer.style.fontFamily		='Courier';
	_tabContainer.style.fontSize			='11px';

	_tabStyle.style.overflow 					= 'auto';
	_tabStyle.style.fontFamily				='Courier';
	_tabStyle.style.fontSize					='11px';
	
	_tabContainer.innerHTML				= 'no container defined for ' + _id;
	_tabStyle.innerHTML						= 'no container style defined for ' + _id;
	
	if(_container!=null)
	{
		try {
			_debugPretifySource(document.getElementById('main_' + _id), _debugObjectsTabbar.cells('container'));
			_debugPretifySource(_container.GetStyle(), _debugObjectsTabbar.cells('style'));
		} catch(e) { }
	}
	
	// now display the properties for the curent object
	_debugObjectsPropsGrid.clearAll();
	try {
		var _props = _object.GetAllProperties();
		if(_props!=null)
		{
			var _arAll = new Array();
			for(var i=0; i<_props.length; i++)
			{
				var _ar = new Array();
				_ar[0] = _props[i].key;
				_ar[1] = _props[i].value;
				
				_arAll[_arAll.length] = {id : i, data: _ar};
				
			}
			_debugObjectsPropsGrid.parse({rows:_arAll}, "json");
		}
	} catch(e) { }
	
	// now we need to grab the events for this object and display these
	_debugObjectsWantEventsGrid.clearAll();
	
	var _events		= _EventHandler.GetWantsFrom(_id);
	var _arAll = new Array();
	for(var i=0; i<_events.length; i++)
	{
		var _ar 	= new Array();
		var _item	= _events[i];
		
		try {
			_ar[0] = _item.target;
			_ar[1] = _item.type;
			_ar[2] = _item.item;
			_ar[3] = _item.callback;
			_ar[4] = _item.propogate;
			_ar[5] = _item.countFired;
			
			_arAll[_arAll.length] = { id:i, data:_ar };
		} catch(e) { }
	}
	
	_debugObjectsWantEventsGrid.parse({rows:_arAll}, "json");

	_debugObjectsDependEventsGrid.clearAll();
	
	var _events		= _EventHandler.GetWantsTo(_id);
	var _arAll = new Array();
	for(var i=0; i<_events.length; i++)
	{
		var _ar 	= new Array();
		var _item	= _events[i];
		
		try {
			_ar[0] = _item.target;
			_ar[1] = _item.type;
			_ar[2] = _item.item;
			_ar[3] = _item.callback;
			_ar[4] = _item.propogate;
			_ar[5] = _item.countFired;
			
			_arAll[_arAll.length] = { id:i, data:_ar };
		} catch(e) { }
	}
	
	_debugObjectsDependEventsGrid.parse({rows:_arAll}, "json");
}

function _getContainerForObjectId(_id)
{
	for(var i=0; i<_Containers.length; i++)
	{
		if(_Containers[i].key ==_id) return _Containers[i].value;
	}
	
	return null;
}

function _debugCollectionsGridRowSelect(_row)
{
	console.log("select row fired");
	
	if(_debugCollectionDetailsGrid!=null)
	{
		_debugCollectionDetailsGrid.destructor();
		_debugCollectionDetailsGrid = null;
	}
	
	try {
		_debugCollectionDetailsGrid = _debugCollectionsTabbar.cells('data').attachGrid();
//		_debugCollectionDetailsGrid.setImagePath(_defaultImgsPath);
//		_debugCollectionDetailsGrid.setSkin("dhx_skyblue");
		
		var _collection = _Collections[parseInt(_row,10)].value;
		
		_debugCollectionDetailsGrid.setHeader(_collection.GetHeaders());
		_debugCollectionDetailsGrid.init();
		
		var _items 	= _collection.GetAllItems();
		var _arAll	= new Array();
		var _cols	= _collection.GetHeaders().split(',');
		
		for(var i=0; i<_items.length; i++)
		{
			var _ar 	= new Array();
			var _item	= _items[i];
			
			for(var c=0; c<_cols.length; c++)
			{
				_ar[_ar.length] = _item.GetProperty(_cols[c]);
			}
			
			_arAll[_arAll.length] = { id:i,data:_ar };
		}
		_debugCollectionDetailsGrid.parse({rows:_arAll}, "json");
	} catch(e) { }

	// now we need to fetch the analysed query from the collection too
	if(_debugCollectionQueryGrid!=null)
	{
		_debugCollectionQueryGrid.destructor();
		_debugCollectionQueryGrid = null;
	}
	
	try {
		_debugCollectionQueryGrid = _debugCollectionsTabbar.cells('query').attachGrid();
//		_debugCollectionQueryGrid.setImagePath(_defaultImgsPath);
//		_debugCollectionQueryGrid.setSkin("dhx_skyblue");
		_debugCollectionQueryGrid.setHeader('evaluated');
		_debugCollectionQueryGrid.init();
		
		_debugCollectionQueryGrid.parse({rows:_collection.GetQueryDebug()}, "json");
	} catch(e) { }
}

function _debugPretifySource(_xml, _to)
{
	var _frame = _to.cell; //_findHTMLObject(_to, 'dhx_cell_cont_layout');
	
	_frame.innerHTML = '';
	
	_frame.style.overflow 		= 'auto';
	_frame.style.fontFamily		= 'Courier';
	_frame.style.fontSize			= '11px';
	
	if(_xml.normalize!=null) _xml.normalize();
	
	_frame.innerHTML = _debugProcessXML(0, _xml, "yes") + '<br/><br/><br/><br/>';
}

function _debugProcessXML(_level, _node, _root)
{
	var _str		= '';
	var _indent 	= parseInt(_level, 10) * 15;
	
	if(_level==0) {
		_str 		+= '<img  src="clapi/images/nixel.gif" style="border: 0px solid blue; display:none;" width="'+_indent+'px" height="16px"/>';
	}
	// first we add the line padding
	if(_node.nodeName!='#document')
	{
		if(_root==null||_root!="yes") { 
			_str += '<br/>';  
			if(_level==0) _str += '<br/>'; 
			_str 		+= '<img  src="clapi/images/nixel.gif" style="border: 0px solid red;" width="'+_indent+'px" height="16px"/>';
		}
		
		
//		_str 		+= '<img  src="clapi/images/nixel.gif" style="border: 1px solid red;" width="'+_indent+'px" height="16px"/>';
		_str		+= '<font color="#a0a0a0">&lt;' + _node.nodeName;
		if(_node.attributes.length>0) 
		{
			for(var i=0; i<_node.attributes.length; i++)
			{
				 _str += ' <font color="blue">' + _node.attributes[i].nodeName + '</font>="<font color="red">' +  Encoder.htmlEncode(_node.attributes[i].nodeValue) + '</font>"';
			}
		} 
		
		if(_node.childNodes.length==0)
		{
			_str += '/&gt;</font>';
			return _str;
		}
		
		_str += '&gt;</font>';
	}
	var _nonText = 0;
	var _text = 0
	for(var i=0; i<_node.childNodes.length; i++)
	{
		switch(_node.childNodes[i].nodeType)
		{
			case 1:		// element
				_nonText++;
				_text--;
				_str += '<br/>' + (_node.childNodes[i].nodeName!='#text')? _debugProcessXML(_level+1, _node.childNodes[i]) : '';
				break;
				
			case 3:		// Text
				var _x = Encoder.htmlEncode( _node.childNodes[i].nodeValue.replace(/\t/gi, ''));
				if(_x.trim!=null && _x.trim()!='') { _text++; _str += _x; } 
				break;
				
			case 4:		// CDATA
				_text++;
				_str += '&lt;![CDATA[' +Encoder.htmlEncode(_node.childNodes[i].nodeValue) + ']]&gt;';
				break;
				
			case 8:		// comment
				_str += '<br/>' + '<img class="noClass" src="clapi/images/nixel.gif" style="border: 0px solid red; height:16px !important;" width="'+(_indent+15)+'px" height="16px"/>';
				_str += '<font color="#00a000">'
				_str += '&lt;!-- ' + Encoder.htmlEncode(_node.childNodes[i].nodeValue) + ' --&gt;</font>';
				break;
		}
	}
	
	if(_node.nodeName!='#document')
	{
		if(_nonText>0) { _str += '<br/>';  }
		if(_text<=0) _str += '<img class="noClass" src="clapi/images/nixel.gif" style="border: 0px solid red;  height:16px !important;" width="'+_indent+'px" height="16px"/>';
		_str += '<font color="#a0a0a0">&lt;/' + _node.nodeName + '&gt;</font>';
		
		if(_nonText>0 && (_level==2 || _level==3)) _str += '<br/>';
	}
	
	return _str;
}











