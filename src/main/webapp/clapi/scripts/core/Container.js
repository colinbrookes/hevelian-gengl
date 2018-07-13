/**
 * Container()
 * This attempts to create a proper framed container, with header and toolbar if desired, and drag-and-drop functionality.
 * It is used to frame all components on the screen. The drag and drop functionality can only be enabled if there is a
 * header div in the container - this acts as a handle for dragging the entire container around the page. Otherwise it would
 * overrule any mouse down/up events on the other components in the page, causing stuff like zoom in charts to break.
 *
 * We maintain a global list of all the containers created, so we can easily grab the information used to initialise them and
 * do something with it.
 */

_gridSizeX				= 50;
_gridSizeY				= 50;
_itemZIndex				= 0;
_snap					= false;
_snapType				= 'grid';
_action					= 'move';
_infoDiv				= null;
_originDiv				= null;
_snapColumns			= null;
_gCell					= null;
_snapObj				= null;

function Container(_node, _n_id, _toNode, _prefix)
{
	this.Node					= _node;
	this.Id						= _n_id;
	this.ToNode					= _toNode;
	this.Prefix					= _prefix;
	this.TargetNode				= null;
	this.dhtmlxTarget			= null;
	
	this.WithHeader				= function _withHeader() { return _f_withHeader; }
	this.WithToolbar			= function _withToolbar() { return _f_withToolbar; }
	this.HideOnOpen				= function _hideOnOpen() { return _f_hideOnOpen; }
	this.DragAndDrop			= function _dragAndDrop() { return _f_dragAndDrop; }
	this.GetStyle				= function _getStyle() { return _styleContainer; }
	this.GetStyleMain			= function _getStyleMain() { return _styleMain; }
	this.GetStyleHeader			= function _getStyleHeader() { return _styleHeader; }
	this.GetContainer			= function _getContainer() { return _Container; }
	
	_Containers[_Containers.length] = new kvp(_n_id, this);
	
	if(_toNode.cell!=null) {
		this.dhtmlxTarget = _toNode;
		for(var i=0; i<_toNode.cell.childNodes.length; i++) {
			if(_toNode.cell.childNodes[i].className.substring(0,13)=="dhx_cell_cont") {
				console.log("FOUND CELL CONT NODE");
				this.TargetNode = _toNode.cell.childNodes[i];
				break;
			}
		}
	} else {
		this.TargetNode = _toNode;
	}
	
	// the main code is in the init-space and not functions
	var _me						= _getObjectByName('Dashboard');
	var _hideShowId 			= null;
	var _div_position			= _node.getAttribute('position');
	var _div_zIndex				= _node.getAttribute('zIndex');
	var _Container				= {hideShowId : _hideShowId, target : this.TargetNode , dhtmlxTarget: this.dhtmlxTarget}
	var _heightHeader			= 0;
	var _borderThickness		= 0;
	var _borderWidth			= 0;

	var _allSnaps				= _me.GetCellsSnapTo();
	var _mySnap					= _allSnaps[_allSnaps.length-1];
	
	
	if(_div_position==null) return _Container;
	
	var _toolbar				= _findChild('toolbar', _node);
	var _styleContainer			= _findChild('containerStyle', _node);
	var _styleMain				= (_styleContainer!=null)?	_findChild('main', _styleContainer) : 		null;
	var _styleHeader			= (_styleMain!=null)? 		_findChild('header', _styleContainer) :	null;
	
	if(_allSnaps.length>0)
	{
		_allSnaps[_allSnaps.length-1].styleMain 	= _styleMain;
		_allSnaps[_allSnaps.length-1].styleHeader	= _styleHeader;
	}
	
	var _f_withHeader	 		= (_styleContainer!=null && _styleContainer.getAttribute('withHeader')=='true')? true : false;
	var _f_withToolbar			= (_toolbar!=null)? true : false;
	var _f_hideOnOpen			= _node.getAttribute('hideOnOpen');
	var _f_dragAndDrop			= (_styleContainer!=null && _styleContainer.getAttribute('dragAndDrop')=='true')? true : false;
	var _f_collapsible			= (_styleContainer!=null && _styleContainer.getAttribute('collapsible')=='true')? true : false;
	
	// cant have collapsible without a header
	if(_f_withHeader==false) 	_f_collapsible = false;
	
	var _to					= (_toNode.cell!=null)? _toNode.cell.lastChild : _toNode; //_findHTMLObject(_toNode, 'dhx_cell_cont_layout');
	if(_to==null) 		_to = _toNode;
	
	if(_to.style!=null) {
		_to.style.float 		= 'left';
		_to.style.display 		= 'inline-block';
	}

	if(_to.id==_n_id) 
	{
		_to.style.top			= '0px';
		_to.style.left			= '0px';
		_to.style.position		= 'relative';
		_to.style.zIndex		= '1';
		
		if(_div_zIndex!=null)	_to.style.zIndex = _div_zIndex;
		
		_to.setAttribute('id', '_container_' + _n_id);
		_Container.hideShowId = '_container_' + _n_id;
	} 

	_objectTop				= 0;
	_objectLeft				= 0;
	
	if(_f_withToolbar)		_objectTop += 27;
	if(_f_withHeader)		_objectTop += parseInt(_styleHeader.getAttribute('height'),10);
	
	var _mainDiv			= document.createElement('DIV');
	var _toolbarDiv			= (_f_withToolbar)? document.createElement('DIV') : null;
	var _headerDiv			= (_f_withHeader)? document.createElement('DIV') : null;
	var _objectDiv			= document.createElement('DIV');

	_objectDiv.setAttribute('id', _n_id);
		
	_Container.target		= _objectDiv;
	
	_to.appendChild(_mainDiv);
	if(_f_withHeader)		_mainDiv.appendChild(_headerDiv);
	if(_f_withToolbar)		_mainDiv.appendChild(_toolbarDiv);
	
	var _mainWidth			= _node.getAttribute('width');
	var _mainHeight			= _node.getAttribute('height');
	
	// limited support for percentages, but enough for now. This should have events associated too, to allow dynamic resize.
	try { if(_mainWidth.indexOf('%') != -1) 	_mainWidth 	= (_to.clientWidth * (parseInt(_mainWidth)/100)); } catch(e) { }
	try { if(_mainHeight.indexOf('%') != -1) _mainHeight 	= (_to.clientHeight * (parseInt(_mainHeight)/100)); } catch(e) { }
	
	_mainDiv.style.padding	= '0px';
	if(_mySnap!=null && _mySnap.snap.getAttribute('type') == 'columns')
	{
		 _mainWidth = parseInt(_mySnap.snap.getAttribute('widths').split(',')[parseInt(_node.getAttribute('column'),10)-1]);
		 _mainDiv.style.paddingBottom = parseInt(_mySnap.snap.getAttribute('itemSpacing'),10);
	}
	
	// create the main div area
	_mainDiv.style.width		= _mainWidth;
	_mainDiv.style.height		= _mainHeight;
	_mainDiv.style.position		= 'relative';
	_mainDiv.style.border		= '0px solid black';
	_mainDiv.style.margin		= '0px';
	_mainDiv.style.zIndex		= '1';
	_mainDiv.style.float		= 'left';
	_mainDiv.style.top			= '0px';
	_mainDiv.style.left			= '0px';
	
//	_mainDiv.style.display	= 'inline-block';
	
	_mainDiv.setAttribute('id', 'main_' + _n_id);
	
	if(_div_position=='absolute')
	{
		_Container.hideShowId			= 'main_' + _n_id;
		
		_mainWidth						= parseInt(_node.getAttribute('width'),10);
		_mainHeight						= parseInt(_node.getAttribute('height'),10);
		
		_mainDiv.style.border			= (_node.getAttribute('border')!=null)? _node.getAttribute('border') : '';
		try {_mainDiv.style.top			= parseInt(_evaluate(_me, _node.getAttribute('top'), false, _n_id),10); } catch(e) { }
		try {_mainDiv.style.left		= parseInt(_evaluate(_me, _node.getAttribute('left'), false, _n_id),10); } catch(e) { }
		_mainDiv.style.position			= 'absolute';
		_mainDiv.style.display			= 'block';
	}
	
	if(_styleMain!=null) _drawMain(_mainDiv, _styleMain);
	
	if(_f_withHeader==false && _f_withToolbar==false)
	{
		_mainDiv.setAttribute('id', _n_id);
		if(_div_position=='absolute') _Container.hideShowId	= _n_id;
	}
	
	_mainDiv.appendChild(_objectDiv);
	_borderThickness		= (_styleMain!=null&&_styleMain.getAttribute('borderThickness')!=null)? _styleMain.getAttribute('borderThickness') : _borderThickness;
	_borderWidth			= (_styleMain!=null&&_styleMain.getAttribute('borderWidth')!=null)? _styleMain.getAttribute('borderWidth') : _borderWidth;
	
	// draw the header
	if(_f_withHeader)
	{
		_heightHeader						= (_styleHeader!=null&&_styleHeader.getAttribute('height')!=null)? _styleHeader.getAttribute('height') : _heightHeader;
		_headerDiv.setAttribute('id', 'header_' + _n_id);
		_headerDiv.style.height 			= _heightHeader + 'px';
		_headerDiv.style.width				= _mainWidth - (_borderThickness*2) - (_borderWidth/2);
		_headerDiv.style.position			= 'absolute';
		_headerDiv.style.top				= _borderThickness + 'px';
		_headerDiv.style.left				= _borderThickness + 'px';
		_headerDiv.style.margin				= '0px';
		_headerDiv.style.border				= '0px solid blue';
		_headerDiv.style.padding			= '0px';
		
		_drawHeader(_headerDiv, _styleHeader);
		
		// after the header is drawn, we check for DaD settings
		if(_f_dragAndDrop)
		{
			// create info div - this displays the x,y coords as the container is moved
			if(document.getElementById('infoDiv')==null)
			{
				_infoDiv = document.createElement('DIV');
				_infoDiv.setAttribute('id', 'infoDiv');
				_infoDiv.style.position 		= 'absolute';
				_infoDiv.style.top				= '0px';
				_infoDiv.style.left				= '0px';
				_infoDiv.style.height			= '14px';
				_infoDiv.style.width			= '100px';
				_infoDiv.style.zIndex			= '9999';
				_infoDiv.style.border			= '1px solid black';
				_infoDiv.style.fontFamily		= 'Arial';
				_infoDiv.style.fontSize			= '10px'
				_infoDiv.style.backgroundColor 	= '#fbee9e';
				_infoDiv.style.paddingLeft		= '4px';
				_infoDiv.style.display			= 'none';
				
				_toNode.parentNode.appendChild(_infoDiv);
			}
			
			// create the originBox - this shows where the box originally was
			if(document.getElementById('originBox')==null)
			{
				_originDiv = document.createElement('DIV');
				_originDiv.setAttribute('id', 'originBox');
				_originDiv.style.position 			= 'absolute';
				_originDiv.style.top				= '0px';
				_originDiv.style.left				= '0px';
				_originDiv.style.zIndex				= '0';
				_originDiv.style.border				= '0px solid black';
				_originDiv.style.fontFamily			= 'Arial';
				_originDiv.style.fontSize			= '10px'
				_originDiv.style.paddingLeft		= '4px';
				_originDiv.style.display			= 'none';
				
				_toNode.parentNode.appendChild(_originDiv);
			}
			
			var _dragger = DragHandler.attach(document.getElementById('header_' + _n_id));
		}
	}
	
	// draw the toolbar
	if(_f_withToolbar)
	{
		var _t_id		 				= _prefix + _toolbar.getAttribute('id');
		
		var _toolbarWidth				= _node.getAttribute('width');
		_toolbarWidth					= (_toolbarWidth!=null)? parseInt(_toolbarWidth,10) - (_borderThickness*2) : '100%';

		_toolbarDiv.setAttribute('id', _t_id);
		_toolbarDiv.style.width			= _mainWidth - (_borderThickness*2) - (_borderWidth/2);
		_toolbarDiv.style.height		= '27px';
		_toolbarDiv.style.padding		= '0px';
		_toolbarDiv.style.margin		= '0px';
		_toolbarDiv.style.top			= (parseInt(_borderThickness)+parseInt(_heightHeader)) + 'px';
		_toolbarDiv.style.left			= _borderThickness + 'px';
		_toolbarDiv.style.position		= 'absolute';
		_toolbarDiv.style.border		= '0px solid red';
		
		try {
			_me.InitObject(_toolbar, _toolbarDiv, _prefix);
		} catch(e) { }
		
	}
	
	// and finally the object
	_objHeight					= _mainHeight - (_borderThickness*2) - (_borderWidth/2);
	if(_f_withToolbar) { _objHeight -= 27; }
	if(_f_withHeader) _objHeight -= (_mySnap!=null && _mySnap.snap.getAttribute('type')=='columns')? parseInt(_styleHeader.getAttribute('height'),10) : 0;
	
	_objectDiv.style.float			= 'left';
	_objectDiv.style.display		= 'inline-block';
	_objectDiv.style.border			= '0px solid blue';
	_objectDiv.style.padding		= '0px';
	_objectDiv.style.margin			= '0px';
	_objectDiv.style.top			= _objectTop + parseInt(_borderThickness,10);
	_objectDiv.style.left			= _objectLeft + parseInt(_borderThickness,10);
	_objectDiv.style.position		= 'absolute';
	_objectDiv.style.width			= _mainWidth - (parseInt(_borderThickness,10)*2)- (_borderWidth/2);
	_objectDiv.style.height			= _objHeight;
	
	return _Container;
} 

/**
 * snapDrawColumns()
 * this creates the divs for the columns on the screen.
 */
function _snapDrawColumns(_snapTo, _target, _id)
{


	var _widths					= _snapTo.getAttribute('widths');
	var _columnSpacing			= _snapTo.getAttribute('columnSpacing');
	var _itemSpacing			= _snapTo.getAttribute('itemSpacing');
	var _border					= _snapTo.getAttribute('border');
	var _backgroundColour		= _snapTo.getAttribute('backgroundColour');
	var _columns				= _widths.split(',');
	
	// set defaults for non-specified attributes
	_columnSpacing				= (_columnSpacing==null)? 10 : parseInt(_columnSpacing,10);
	_itemSpacing				= (_itemSpacing==null)? 10 : parseInt(_itemSpacing,10);
	_border						= (_border==null)? '0px solid black' : _border;
	_backgroundColour			= (_backgroundColour==null)? '#FFFFFF' : _backgroundColour;

	var _targetWidth			= parseInt(_target.style.width,10) -  (_columnSpacing * _columns.length) - 50;
	var _to						= _findHTMLObject(_target, 'dhxMainCont');
	if(_to==null) 		_to = _target;
	_to.style.overflow = 'auto';
	
	var _columnDivs				= [];
	var _left								= _columnSpacing;
	
	var _center							= document.createElement('CENTER');
	_to.appendChild(_center);
	var _mainDiv						= document.createElement('DIV');
	_center.appendChild(_mainDiv);
	
	var _totalWidth				= 0;
	var _variableWidthCnt		= 0;
	for(var i=0; i<_columns.length; i++)
	{
		var _column				= _columns[i];
		if(_column.indexOf('%')!=-1)
		{
			var _percent 		= parseInt(_column,10)/100;
			_columns[i]		= _targetWidth * _percent;
		}
		
		if(_columns[i]!='*') _totalWidth += parseInt(_columns[i],10);
		if(_columns[i]=='*')	_variableWidthCnt++;
	}
	
	if(_variableWidthCnt>0)
	{
		var _variableWidth		= (_targetWidth - _totalWidth) / _variableWidthCnt;
		for(var i=0; i<_columns.length; i++)
		{
			if(_columns[i]=='*') _columns[i] = _variableWidth;
		}
	}
	
	_snapTo.setAttribute('widths', _columns.join(','));
	
	_mainWidth						= 0;
	for(var i=0; i<_columns.length; i++) _mainWidth += parseInt(_columns[i],10) + _columnSpacing;
	_mainWidth += _columnSpacing;
	
	_mainDiv.style.border		= '0px solid red';
	_mainDiv.style.width		= _mainWidth;
	_mainDiv.style.height		= '100%';
	_mainDiv.style.position		= 'relative';
	
	for(i=0; i<_columns.length; i++)
	{
		var _columnId					= (i+1) + '_' + _id;
		
		var _div = document.createElement('DIV');
		_mainDiv.appendChild(_div);
		_div.setAttribute('id', _columnId);
		
		_div.style.border							= _border;
		_div.style.backgroundColor		= _backgroundColour;
		_div.style.width								= parseInt(_columns[i]);
		_div.style.height							= 900;
		_div.style.top									= 10;
		_div.style.left									= _left;
		_div.style.position							= 'absolute';
		_div.style.display							= 'block';
		
		_left += parseInt(_columns[i]);
		_left += _columnSpacing;
	}
		
}

function _drawMain(_div, _style)
{
	var _id					= _div.id;
	var _w					= parseInt(_div.style.width,10);
	var _h					= parseInt(_div.style.height,10);
	var _radius				= _style.getAttribute('radius');
	var _radiusTopLeft		= _style.getAttribute('radiusTopLeft');
	var _radiusTopRight		= _style.getAttribute('radiusTopRight');
	var _radiusBottomLeft	= _style.getAttribute('radiusBottomLeft');
	var _radiusBottomRight	= _style.getAttribute('radiusBottomRight');
	var _backgroundColour	= _style.getAttribute('fillColour');
	var _borderWidth		= _style.getAttribute('borderWidth');
	var _borderColour		= _style.getAttribute('borderColour');
	
	_radius					= (_radius==null)? '0' : parseFloat(_radius);
	_radiusTopLeft			= (_radiusTopLeft==null)? _radius : parseFloat(_radiusTopLeft);
	_radiusTopRight			= (_radiusTopRight==null)? _radius : parseFloat(_radiusTopRight);
	_radiusBottomLeft		= (_radiusBottomLeft==null)? _radius : parseFloat(_radiusBottomLeft);
	_radiusBottomRight		= (_radiusBottomRight==null)? _radius : parseFloat(_radiusBottomRight);
	
	_backgroundColour		= (_backgroundColour==null)? '' : _backgroundColour;
	_borderColour			= (_borderColour==null)? '#A4BED4' : _borderColour;
	_borderWidth			= (_borderWidth==null)? 0 : parseInt(_borderWidth);
	
	var _oWindow = new Raphael(_div, _w, _h);
	
	if(_borderWidth!=null && parseFloat(_borderWidth)>0)
	{
		var _path = '';
	
		var _borderOffset = (_borderWidth/2)+1;
		
		// start position
		_path += 'M'+ _borderOffset + ' ' + (_radiusTopLeft + _borderOffset);
		
		// top left corner
		_path += 'S'+_borderOffset+' '+_borderOffset+' ' + (_radiusTopLeft+_borderOffset) + ' '+_borderOffset+'';
		
		// top line
		_path += 'L' + (_w-_radiusTopRight-_borderOffset) + ' ' + _borderOffset + '';
		
		// top right corner
		_path += 'S' + (_w-_borderOffset) + ' '+_borderOffset + ' ' + (_w-_borderOffset) + ' ' + (_radiusTopRight+_borderOffset);
		
		// right side
		_path += 'L' + (_w-_borderOffset) + ' ' + (_h-_radiusBottomRight);
		
		// bottom right corner
		_path += 'S' + (_w-_borderOffset) + ' ' + (_h-_borderOffset) + ' ' + (_w-_radiusBottomRight-_borderOffset) + ' ' + (_h-_borderOffset);
		
		// bottom line
		_path += 'L' + (_radiusBottomLeft+_borderOffset) + ' ' + (_h-_borderOffset);
		
		// bottom left corner
		_path += 'S'+_borderOffset+' ' + (_h-_borderOffset) + ' '+_borderOffset+' ' + (_h-_radiusBottomLeft-_borderOffset);
		
		// left line
		_path += 'Z';
		
		var _s_path = _oWindow.path(_path);
		_s_path.attr({"fill": _backgroundColour});
		_s_path.attr({ "stroke-width": _borderWidth});
		_s_path.attr({ "stroke": _borderColour});
	}
}

function _drawHeader(_div, _style)
{
	var _id					= _div.id;
	var _w					= parseInt(_div.style.width,10);
	var _h					= parseInt(_div.style.height,10);
	var _radius				= _style.getAttribute('radius');
	var _radiusTopLeft		= _style.getAttribute('radiusTopLeft');
	var _radiusTopRight		= _style.getAttribute('radiusTopRight');
	var _radiusBottomLeft	= _style.getAttribute('radiusBottomLeft');
	var _radiusBottomRight	= _style.getAttribute('radiusBottomRight');
	var _backgroundColour	= _style.getAttribute('fillColour');
	var _borderWidth		= _style.getAttribute('borderWidth');
	var _borderColour		= _style.getAttribute('borderColour');
	
	_radius					= (_radius==null)? '0' : parseFloat(_radius);
	_radiusTopLeft			= (_radiusTopLeft==null)? _radius : parseFloat(_radiusTopLeft);
	_radiusTopRight			= (_radiusTopRight==null)? _radius : parseFloat(_radiusTopRight);
	_radiusBottomLeft		= (_radiusBottomLeft==null)? _radius : parseFloat(_radiusBottomLeft);
	_radiusBottomRight		= (_radiusBottomRight==null)? _radius : parseFloat(_radiusBottomRight);
	
	var _oWindow = new Raphael(_div, _w, _h);
	
	if(_borderWidth!=null && parseFloat(_borderWidth)>0)
	{
		var _path = '';
	
		var _borderOffset = (_borderWidth/2)+1;
		
		// start position
		_path += 'M'+ _borderOffset + ' ' + (_radiusTopLeft + _borderOffset);
		
		// top left corner
		_path += 'S'+_borderOffset+' '+_borderOffset+' ' + (_radiusTopLeft+_borderOffset) + ' '+_borderOffset+'';
		
		// top line
		_path += 'L' + (_w-_radiusTopRight-_borderOffset) + ' ' + _borderOffset + '';
		
		// top right corner
		_path += 'S' + (_w-_borderOffset) + ' '+_borderOffset + ' ' + (_w-_borderOffset) + ' ' + (_radiusTopRight+_borderOffset);
		
		// right side
		_path += 'L' + (_w-_borderOffset) + ' ' + (_h-_radiusBottomRight);
		
		// bottom right corner
		_path += 'S' + (_w-_borderOffset) + ' ' + (_h-_borderOffset) + ' ' + (_w-_radiusBottomRight-_borderOffset) + ' ' + (_h-_borderOffset);
		
		// bottom line
		_path += 'L' + (_radiusBottomLeft+_borderOffset) + ' ' + (_h-_borderOffset);
		
		// bottom left corner
		_path += 'S'+_borderOffset+' ' + (_h-_borderOffset) + ' '+_borderOffset+' ' + (_h-_radiusBottomLeft-_borderOffset);
		
		// left line
		_path += 'Z';

		var _s_path = _oWindow.path(_path);
		if(_backgroundColour!=null) _s_path.attr({"fill": _backgroundColour});
		if(_borderWidth!=null) _s_path.attr({ "stroke-width": _borderWidth});
		if(_borderColour!=null) _s_path.attr({ "stroke": _borderColour});
	}
	
	var _me							= _getObjectByName('Dashboard');
	var _titleText			= (_me!=null)? _evaluate(_me, _style.getAttribute('title'), false) : _style.getAttribute('title');
	var _titleAlign			= _style.getAttribute('titleTextAlign');
	var _titleColour		= _style.getAttribute('titleTextColour');
	var _titleFont			= _style.getAttribute('titleFont');
	var _titleFontSize		= _style.getAttribute('titleFontSize');
	var _titlePadding		= _style.getAttribute('titlePadding');
	
	_titlePadding			= (_titlePadding==null)? 0 : parseFloat(_titlePadding);
	_titleColour			= (_titleColour==null)? '#000000' : _titleColour;
	_titleAlign				= (_titleAlign==null)? 'start' : _titleAlign;
	
	var _titleX				= 0;
	var _titleY			 	= _h/2;
	
	if(_titleText!=null)
	{
		switch(_titleAlign)
		{
			case 'middle':
			case 'center':
			case 'centre':
				_titleAlign	= 'middle';
				_titleX		= _w/2;
				break;
				
			case 'end':
			case 'right':
				_titleAlign	= 'end';
				_titleX		= _w - 1 - _titlePadding;
				break;
				
			default:
				_titleAlign	= 'start';
				_titleX		= _titlePadding;
				break;
		}
		var _oTitle				= _oWindow.text(_titleX,_titleY,_titleText);
		
		_oTitle.attr({"text-anchor": _titleAlign});
		if(_titleColour!=null) _oTitle.attr({"fill":_titleColour});
		if(_titleFont!=null) _oTitle.attr({"font-family":_titleFont});
		if(_titleFontSize!=null) _oTitle.attr({"font-size":_titleFontSize});
	}
	
}

var DragHandler = {
	
	_col : 1,
	_oElem : null,
	
	attach : function(oElem) {
	
		oElem.onmousedown  = DragHandler._dragBegin;
		oElem.ontouchstart = DragHandler._dragBegin;
		
		// callbacks
		oElem.dragBegin 	= new Function();
		oElem.drag 			= new Function();
		oElem.dragEnd 		= new Function();
		
		return oElem;
	},
	
	_dragBegin : function(e) {
		
		e = window.event ? window.event : e;
		// we need to find the snap settings for the cell this object is in and
		// change the global snap settings for the DragHandler.
		_setSnapToFor(this.id);
		
		try {
			e.preventDefault();
		} catch(e) { }
		
		var _elemParts = this.id.split('_');
		_elemParts[0]='main';
		
		_o = document.getElementById(_elemParts.join('_'));
		
		var oElem = DragHandler._oElem = _o;
		
		if (isNaN(parseInt(oElem.style.left))) { oElem.style.left = '0px'; }
		if (isNaN(parseInt(oElem.style.top))) { oElem.style.top = '0px'; }
		
		var x = parseInt(oElem.style.left, 10);
		var y = parseInt(oElem.style.top, 10);
		var w = parseInt(oElem.style.width, 10);
		var h = parseInt(oElem.style.height, 10);
		
		switch(_snapType)
		{
			case 'grid':
				oElem.mouseX = e.clientX;
				oElem.mouseY = e.clientY;
				
				oElem.style.zIndex = _itemZIndex;
				break;
				
			case 'columns':
				oElem.mouseX = e.clientX;
				oElem.mouseY = e.clientY;
				
				x += parseInt(oElem.parentNode.style.left, 10);
				y = _calculateItemTop(oElem);

				break;
				
			default:
				oElem.mouseX = e.clientX;
				oElem.mouseY = e.clientY;
				break;
		}
		
		// set the events please ...
		document.onmousemove 	= DragHandler._drag;
		document.onmouseup 		= DragHandler._dragEnd;
		
		document.ontouchmove 	= DragHandler._drag;
		document.ontouchend 	= DragHandler._dragEnd;
		
		if(_snapType!='columns')
		{
			if(_infoDiv!=null)
			{
				_infoDiv.style.display  = 'block';
				var _str				= 'x: ' + x + ', y: ' + y;
				_infoDiv.innerHTML		= _str;
				_infoDiv.style.left		= x;
				_infoDiv.style.top		= y - 18;
			}
		}
		
		if(_originDiv!=null)
		{
			_drawOriginBox(x, y, w, h);
		}
		
		
		e.cancelBubble	= true;
		e.returnValue 	= false;
		return false;
	},
	
	_drag : function(e) {
		
		try {
			e.preventDefault();
		} catch(e) { }
		
		var oElem = DragHandler._oElem;
		
		var x = parseInt(oElem.style.left);
		var y = parseInt(oElem.style.top);
		
		e = window.event ? window.event : e;

 		var _nx = x + (((e.touches==null)? parseInt(e.clientX) : parseInt(e.touches[0].pageX)) - parseInt(oElem.mouseX));
		var _ny = y + (((e.touches==null)? parseInt(e.clientY) : parseInt(e.touches[0].pageY)) - parseInt(oElem.mouseY));
		
		var _nw = (((e.touches==null)? parseInt(e.clientX) : parseInt(e.touches[0].pageX)) - x);
		var _nh = (((e.touches==null)? parseInt(e.clientY) : parseInt(e.touches[0].pageY)) - y);
		
		if(_snap == true)
		{
			switch(_snapType)
			{
				case 'columns':
					// here we need to find the landing zone (column) under the mouse position
					oElem.mouseX = ((e.touches==null)? parseInt(e.clientX) : parseInt(e.touches[0].pageX));
					oElem.mouseY = ((e.touches==null)? parseInt(e.clientY) : parseInt(e.touches[0].pageY));
					break;
					
				case 'grid':
					// snap to the grid within the display area of the render area (not the entire screen of course
					_nx = Math.round(_nx/parseInt(_gridSizeX,10)) * parseInt(_gridSizeX,10);
					_ny = Math.round(_ny/parseInt(_gridSizeY,10)) * parseInt(_gridSizeY,10);
					
					_nw = Math.round(_nw/parseInt(_gridSizeX,10)) * parseInt(_gridSizeX,10);
					_nh = Math.round(_nh/parseInt(_gridSizeY,10)) * parseInt(_gridSizeY,10);
					
					oElem.mouseX = Math.round(((e.touches==null)? parseInt(e.clientX) : parseInt(e.touches[0].pageX))/parseInt(_gridSizeX,10)) * parseInt(_gridSizeX,10);
					oElem.mouseY = Math.round(((e.touches==null)? parseInt(e.clientY) : parseInt(e.touches[0].pageY))/parseInt(_gridSizeY,10)) * parseInt(_gridSizeY,10);
					break;
					
			}
		} else
		{
			// freeform drag and drop ... no grid or columns
			oElem.mouseX = ((e.touches==null)? parseInt(e.clientX) : parseInt(e.touches[0].pageX));
			oElem.mouseY = ((e.touches==null)? parseInt(e.clientY) : parseInt(e.touches[0].pageY));
		}
		
		if(_snapType!='columns')
		{
			if(_infoDiv!=null)
			{
				var _str				= 'x: ' + _nx + ', y: ' + _ny;
				_infoDiv.innerHTML		= _str;
				_infoDiv.style.left		= _nx;
				_infoDiv.style.top		= (_ny - 18);
			}
		}
		
		
		try
		{
			switch(_action)
			{
				case 'move':
				
					switch(_snapType)
					{
						case 'columns':
							_col = _hilightColumn(oElem, _nx, _ny);
							oElem.style.left = _nx;
							oElem.style.top = _ny;
							
							break;
							
						case 'grid':
						default:
							oElem.style.left = _nx;
							oElem.style.top = _ny;
							break;
					}
					break;
	
				case 'resize':
					oElem.style.width = _nw + 'px';
					oElem.style.height = _nh + 'px';
					break;
			}
		} catch(e) { }
		
		e.cancelBubble	= true;
		e.returnValue 	= false;
		return false;
	},
	
	_dragEnd : function(e) {
		
		try {
			e.preventDefault();
		} catch(e) { }
		
		var oElem 	= DragHandler._oElem;
		var y 		= parseInt(oElem.style.top);
		e 			= e ? e : window.event; // window.event ? window.event : e;

		var _ny = y + (((e.touches==null||e.touches.length==0)? parseInt(e.clientY) : parseInt(e.touches[0].pageY)) - parseInt(oElem.mouseY));
		
		if(_infoDiv!=null) 		_infoDiv.style.display = 'none';
		if(_originDiv!=null) 	_removeOriginBox();
		
		if(_snapType=='columns')
		{
			var ocElem 		= DragHandler._oElem;
			var _target 	= _findTargetItem(_col, _ny + _calculateItemTop(ocElem));
			var _child 		= ocElem.parentNode.removeChild(ocElem);
			
			if(_target!=null && _target!=ocElem)
			{
				_col.insertBefore(_child, _target);
			} else
			{
				_col.appendChild(_child);
			}
			
			_col.style.backgroundColor = '';
			_redrawForNewSize(ocElem, _col);
			ocElem.style.left = 0;
			ocElem.style.top = 0;
		}
		
		document.onmousemove = null;
		document.onmouseup = null;
		
		document.ontouchmove = null;
		document.ontouchend = null;
		
		DragHandler._oElem = null;
		
		return false;
	}
	
}

function _redrawForNewSize(oElem, _col)
{
	var _diff			= parseInt(_col.style.width,10) - parseInt(oElem.style.width,10);
	oElem.style.width 	= _col.style.width;
	var _header			= null;
	
	for(var i=0; i<oElem.childNodes.length; i++)
	{
	
		if(oElem.childNodes[i].nodeName.toLowerCase()=='svg' || oElem.childNodes[i].className.toLowerCase() == 'rvm1' || oElem.childNodes[i].id=='')
		{
			oElem.removeChild(oElem.childNodes[i]);
		}
		
		if(oElem.childNodes[i].nodeName.toLowerCase()!='div') continue;
		
		var _parts	= oElem.childNodes[i].id.split('_');
		if(_parts[0] == 'header') _header = oElem.childNodes[i];
		
		var _width = parseInt(oElem.childNodes[i].style.width,10) + _diff;
		oElem.childNodes[i].style.width = _width;
	}
	
	_setSnapToFor(oElem.id);

	if(_snapObj.styleMain!=null)	_drawMain(oElem, _snapObj.styleMain);
	
	if(_header!=null)
	{
		_header.innerHTML = '';
		if(_snapObj.styleHeader!=null)	_drawHeader(_header, _snapObj.styleHeader);
	}
	
}

/**
 * hilightColumn()
 * this tweaks the background colour of the column the mouse is moving over and returns the column object.
 */
function _hilightColumn(_elem, _x, _y)
{
	var _grandParent 	= _elem.parentNode.parentNode;
	var _col			= null;
	
	var _ox = _offsetOriginColumn(_elem) + _x + (parseInt(_elem.style.width,10)/2);
	
	for(var i=0; i<_grandParent.childNodes.length; i++)
	{
		if(_grandParent.childNodes[i].id=='infoDiv') continue;
		if(_grandParent.childNodes[i].id=='originBox') continue;
		
		var _gx = parseInt(_grandParent.childNodes[i].style.left,10);
		var _gw = parseInt(_grandParent.childNodes[i].style.width,10);
		
		if(_ox>=_gx && _ox<=(_gx+_gw))
		{
			_grandParent.childNodes[i].style.backgroundColor = '#F0F0F0';
			_col = _grandParent.childNodes[i];
		} else
		{
			_grandParent.childNodes[i].style.backgroundColor = '';
		}
		
	}
	
	return _col;
}

function _offsetOriginColumn(_elem)
{
	var _grandParent		= _elem.parentNode.parentNode;
	var _parent				= _elem.parentNode;
	
	var _parentIndex		= parseInt(_parent.style.left,10);
	
	return _parentIndex;
}

/**
 * findTargetItem()
 * based on a given 'top' value, find the child node within the column
 */
function _findTargetItem(_col, _y)
{

	var _curTop = 0;
	for(var i=0; i<_col.childNodes.length; i++)
	{
		if(_col.childNodes[i].nodeName!='DIV') continue;
		
		_curHeight = _curTop + parseInt(_col.childNodes[i].style.height,10);
		
		if(_y >= _curTop && _y <=_curHeight)
		{
			return _col.childNodes[i];
		}
		
		_curTop += _curTop + parseInt(_col.childNodes[i].style.height,10) + parseInt(_col.childNodes[i].style.paddingBottom,10);
	}
	
	return null;
}

/**
 * CalculateItemTop()
 * for column based items the positioning is done using relative rather than absolute. 
 * this means we need to calculate the relative position from the top of the column down to the item itself.
 * We also need to include the paddingBottom because this is used for the inter-item spacing.
 */
function _calculateItemTop(_elem)
{

	var _parentElem 	= _elem.parentNode;
	var _elemTop		= parseInt(_parentElem.style.top,10);
	
	for(var i=0; i<_parentElem.childNodes.length; i++)
	{
		if(_parentElem.childNodes[i] == _elem) break;
		
		var _top = parseInt(_parentElem.childNodes[i].style.height,10) + parseInt(_parentElem.childNodes[i].style.paddingBottom,10);
		_elemTop += _top;
	}

	return _elemTop;	
}

/**
 * setSnapFor()
 * This extracts the cell snapTo properties and sets the global values.
 * It also calculates the z-index for the current object to bring it to the front (for 'grid' snapTo's).
 */
function _setSnapToFor(_id)
{
	var _dashboard 	= _getObjectByName('Dashboard');
	var _cells		= _dashboard.GetCellsSnapTo();

	// twiddle with my parts
	var _idParts	= _id.split('_');
	var _idMain		= _id.split('_'); _idMain[0]='main';
	_idParts.shift();
	var _findId		= _idParts.join('_');
	var _cell		= null;
	
	for(var i=0; i<_cells.length; i++)
	{
		if(_cells[i].id == _findId)
		{
			_snapType	= _cells[i].snap.getAttribute('type');
			_snapObj	= _cells[i];
			switch(_snapType)
			{
				case 'grid':
					_gridSizeX 	= parseInt(_cells[i].snap.getAttribute('x'),10);
					_gridSizeY 	= parseInt(_cells[i].snap.getAttribute('y'),10);
					_snap		= true;
					_cell		= _cells[i];
					break;
				
				case 'columns':
					_columns	= _cells[i].snap.widths;
					_snap		= true;
					break;
					
				default:
					_snap		= false;
			}
		}
		
		if(_cell!=null) break;
	}
	
	// the global cell pointer gets updated so we know what we are currently using
	_gCell = _cell;
	
	// now we need to find the max z-index for all the objects in the same cell
	if(_snapType=='grid' || _snapType=='freeform')
	{
		var _zIndex = 1;
		var _matched = "";
		for(var i=0; i<_cells.length; i++)
		{
			if(_cell!=null && _cells[i].cell == _cell.cell)
			{
				try {
					if(parseInt(document.getElementById('main_' + _cells[i].id).style.zIndex,10) >= _zIndex) _zIndex = parseInt(document.getElementById('main_' + _cells[i].id).style.zIndex,10);
				} catch(e) { }
			}
		}
		
		_zIndex++;
		_itemZIndex = _zIndex;
	}
}

function _drawOriginBox(x, y, w, h)
{
	if(_originDiv==null) return;
	
	_originDiv.innerHTML 		= '';
	_originDiv.style.top		= y;
	_originDiv.style.left		= x;
	_originDiv.style.width		= w;
	_originDiv.style.height		= h;
	_originDiv.style.display	= 'block';
	_originDiv.style.zIndex		= '9999';
	
	var oR = new Raphael(_originDiv, w, h);

	var _rect = oR.rect(0, 0+5, w-10, h-10, 20);
	_rect.attr({"stroke-width": 2, "stroke": '#A4BED4', "stroke-dasharray": '--..', "fill-opacity": 0.1, "stroke-opacity": 0.5});
	_rect.attr({"fill": "#A4BED4"});
}

function _removeOriginBox()
{
	if(_originDiv==null) return;
	
	_originDiv.style.display = 'none';
}

/**
 * addEffectsTo()
 * When you have a container, you can add effects as custom callback functions. You can then use any event
 * in the page to trigger an animation. This routine basically adds jQuery animation functions to the object, on demand.
 */
function _addEffectsTo(_node, _object, _container, _id)
{

	var _effectsRoot = _findChild('effects', _findChild('containerStyle', _node));
	if(_effectsRoot==null) return;
	
	var _effects = _effectsRoot.getElementsByTagName('effect');
	for(var i=0; i<_effects.length; i++)
	{
		var _effectId 		= _effects[i].getAttribute('id');
		var _event			= _effects[i].getAttribute('on');
		var _hsID			= (_container.hideShowId!=null)? _container.hideShowId : 'inner_' + _id;
		var _str 			= '_object.'+_effectId+' = function() {$("#'+_hsID.replace(/\./i, '\\\\.')+'")';
		
		for(var c=0; c<_effects[i].childNodes.length; c++)
		{
			switch(_effects[i].childNodes[c].nodeName)
			{
				case 'slideDown':
					var _duration = _effects[i].childNodes[c].getAttribute('duration');
					_str += '.slideDown('+_duration+')';
					break;
					
				case 'slideUp':
					var _duration = _effects[i].childNodes[c].getAttribute('duration');
					_str += '.slideUp('+_duration+')';
					break;
					
				case 'slideToggle':
					var _duration = _effects[i].childNodes[c].getAttribute('duration');
					_str += '.slideToggle('+_duration+')';
					break;
					
				case 'fadeToggle':
					var _duration = _effects[i].childNodes[c].getAttribute('duration');
					_str += '.fadeToggle('+_duration+')';
					break;
					
				case 'fadeTo':
					var _duration 	= _effects[i].childNodes[c].getAttribute('duration');
					var _opacity 		= _effects[i].childNodes[c].getAttribute('opacity');
					_str += '.fadeTo('+_duration+','+_opacity+')';
					break;
					
				case 'animate':
					var _properties	= _effects[i].childNodes[c].getAttribute('properties');
					var _duration 	= _effects[i].childNodes[c].getAttribute('duration');
					_str += '.animate({'+_properties+'},'+_duration+')';
					break;
			}
		}
		
		_str += ' }';
		
//		alert(_str);
		
		eval(_str);
		
		if(_event!=null) _EventHandler.WantEvent(_id, _id, _event, _effectId, "always");
		
	}
}

