/**
 * Layout This component draws the actual layout on the page in which all other
 * components are placed.
 */

// add the Layout object to the dictionary
_dictionary.words.set('layout', new DictionaryItem('layout', _initLayout,
		Layout));

function _initLayout(_node, _to, _prefix, _me) {
	var _id = _prefix + _node.getAttribute('id');
	var _object = new Layout(_node, _to, _prefix);

	_object.SetEventHandler(_EventHandler);
	_object.SetDashboard(_me);

	_Objects[_Objects.length] = new kvp(_id, _object);

	_object.Draw();

	return _object;
}

function Layout(__node, __target, __prefix) {
	this.type = 'Layout';

	var _id = __prefix + __node.getAttribute('id');
	var _prefix = __prefix;
	var _hideShowId = _id;
	var _target = __target;
	var _xml = __node;
	var _handler = null;
	var _dashboard = null;
	var _me = this;
	var _myObjects = new Array();
	var _layoutType = "dhtmlx";

	this.Draw = _draw;
	this.Redraw = _redraw;
	this.GetProperty = _getProperty;
	this.SetEventHandler = function _setEventHandler(__handler) {
		_handler = __handler;
	}
	this.SetHideShowId = function _setHideShowId(_value) {
		_hideShowId = _value;
	}
	this.SetDashboard = function _setDashboard(_value) {
		_dashboard = _value;
	}
	this.GetId = function _getID() {
		return _id;
	}
	this.FireResizeFinish = _fireResizeFinish;

	function _fireResizeFinish(_item) {
		_EventHandler.FireEvent(_id, 'onResize');
		return true;
	}

	function _getProperty(_name) {
		return '';
	}

	function _draw() {

		if (_debug == "true")
			_addTimeline(_id, new Date(), null, 'draw layout');

		var _lType = (_xml.getAttribute('type') == null) ? 'dhtmlx' : _xml
				.getAttribute('type');
		
		_layoutType = _lType;
		
		switch (_lType) {
		case 'dhtmlx':
			_layoutDHTMLX(_xml, _target, _prefix);
			break;

		case '960gs':
			_layout960GS(_xml, _target, _prefix);
			break;

		case 'desktop':
			_layoutDesktop(_xml, _target, _prefix);
			break;

		case 'empty':
			_layoutEmpty(_xml, _target, _prefix);
			break;

		default:
			alert('unknown layout type');
		}

		if (_debug == "true")
			_updateTimeline(_id, new Date());
	}

	function _redraw() {
		switch(_layoutType) {
		case 'desktop':
			try {
				var _titleBar = _layout.getElementsByTagName('titleBar')[0];

				try {
					var _topRow = _titleBar.getElementsByTagName('topRow')[0];
					document.getElementById('txt_welcome').innerHTML = _evaluate(
							_me, _topRow.firstChild.nodeValue, true, _id);
				} catch (e) {
				}

				try {
					var _bottomRow = _titleBar.getElementsByTagName('bottomRow')[0];
					document.getElementById('txt_header').innerHTML = _evaluate(
							_me, _bottomRow.firstChild.nodeValue, true, _id);
				} catch (e) {
				}

				try {
					var _hdr_logo = _titleBar.getElementsByTagName('headerLogo')[0];
					if (_hdr_logo != null) {
						document.getElementById('hdr_logo').src = _evaluate(_me,
								_hdr_logo.firstChild.nodeValue, true, _id);
						
						var _lh = _hrd_logo.getAttribute("height");
						if(_lh!=null && _lh!="") {
							document.getElementById('hdr_logo').style.height = _lh + "px";
						}
					}
				} catch (e) {
				}
			} catch (e) {
			}
			break;
			
		default:
			return;
		}
	}

	function _layoutEmpty(_layout, _to, __prefix) {
		var _prefix = (__prefix != null) ? __prefix : '';
		var _id = _prefix + _layout.getAttribute('id');
		var _style = _layout.getAttribute('style');
		var _page = (_to != null) ? _to : _target;

		var _dhxCont = _findHTMLObject(_page, 'dhxMainCont');
		if (_dhxCont != null) {
			_page = _dhxCont;
			_page.style.backgroundColor = 'white';
			_page.style.overflow = 'auto';
		}

		_page.style.border = '0px';
		_page.style.margin = '0px';
		_page.style.overflow = 'auto';
		_page.style.height = '100%';
		_page.style.width = '100%';

		var _container = new Container(_layout, _id, _to, _prefix);
		var _toNode = _container.target;

		for ( var n = 0; n < _layout.childNodes.length; n++) {
			var _node = _layout.childNodes[n];

			if (_node.nodeType != 1)
				continue;

			var _object = _dashboard.InitObject(_node, _toNode, _prefix);

			if (_object != null) {
				_myObjects[_myObjects.length] = _object;

				// we need to make sure that when the panel or layout resizes,
				// the object gets a resize event
				_EventHandler.WantEvent(_object.GetId(), _id, 'onResize',
						'Resize', true, null);
			}
		}

	}

	/**
	 * layoutDesktop() The layout method for creating a desktop application
	 * interface where everything is driven through a control panel and
	 * displayed in windows.
	 */
	function _layoutDesktop(_layout, _to, __prefix) {
		var _prefix = (__prefix != null) ? __prefix : '';
		var _id = _prefix + _layout.getAttribute('id');
		var _style = _layout.getAttribute('style');
		var _page = (_to != null) ? _to : _target;
		var _logoutTarget = _layout.getAttribute('logoutTarget');

		if (_logoutTarget == null)
			_logoutTarget = "index.html";

		var _dhxCont = _findHTMLObject(_page, 'dhxMainCont');
		if (_dhxCont != null) {
			_page = _dhxCont;
			_page.style.backgroundColor = 'white';
			_page.style.overflow = 'auto';
		}

		var _container = document.createElement('div');
		_container.setAttribute('id', _id);
		_container.setAttribute('class', 'manta_body');
		_page.appendChild(_container);
		_page.style.overflow = 'hidden';

		_page.style.border = '0px';
		_page.style.margin = '0px';
		_page.style.overflow = 'hidden';
		_page.style.height = '100%';
		_page.style.width = '100%';
		var _header = '<table id="manta-table" cellpadding="0" cellspacing="0" border="0" width="100%" onClick="hideMenu()">';
		_header += '<tr><td class="manta-logo-top"  style="background-image: url(clapi/images/shadow-2.png)">';
		_header += '<table cellpadding="0" cellspacing="0" border="0" style="position: absolute; top:2px; left: 4px;  vertical-align: top;>';
		_header += '<tr style"margin: 0px;"><td style="margin: 0px; padding: 0px; line-height: 12px;"><img id="hdr_logo" src="clapi/images/logo-transparent.png" height="36px"/></td>';
		_header += '<td style="margin: 0px; padding: 0px; line-height: 12px;">';

		_header += '<span id="txt_welcome">Welcome</span><br/>';
		_header += '<span id="txt_header">Hevelian</span></td></tr></table></td>';

		_header += '<td class="manta-logo-top" style="text-align: right; width: 400px; padding-top: 6px; background-image: url(clapi/images/shadow-2.png)">Hevelian<span>&nbsp;&bull;&nbsp;GenGL</span></td></tr></table>';

		var _body = '<div id="main_body" style="width: 100%; height: 100%; margin: 2px;" onClick="hideMenu()">&nbsp;</div>';

		var _footer = '<div style="z-index: 0; position: absolute; bottom: 0px; left: 0px; width:100%; height: 40px; background-image: url(clapi/images/shadow-2.png)">';
		_footer += '<img onClick="toggleMenu()" src="clapi/images/menuButton.png" style="height: 40px; cursor: pointer;"/></div>';

		_container.innerHTML = _header + _body + _footer;

		var _controlPanel = _layout.getElementsByTagName('controlPanel')[0];
		var _controlSets = _controlPanel.getElementsByTagName('controlSet');

		var _panel = '<div id="mainmenu" style="z-index: 9999; display: none; background-image: url(clapi/images/trans25.png)">';
		_panel += '<table id="tableMenu" cellpadding="0" cellspacing="0" border="0" width="380px">';

		for ( var i = 0; i < _controlSets.length; i++) {
			var _controlSet = _controlSets[i];
			var _csTitle = _controlSet.getAttribute('title');
			_panel += '<tr><td class="controlPanelHeader">' + _csTitle
					+ '<br/><hr style="width: 360px"/></td></tr>';

			var _csItems = _controlSet.getElementsByTagName('item');
			if (_csItems.length == 0)
				continue;

			_panel += '<tr><td class="controlPanelRow">';
			for ( var o = 0; o < _csItems.length; o++) {
				var _csItem = _csItems[o];
				var _csId = _csItem.getAttribute('id');
				var _csName = _csItem.getAttribute('name');
				var _csIcon = _csItem.getAttribute('icon');
				var _csTo = _csItem.getAttribute('to');

				// onClick="openPanel('layouts', 600, 600)" .... on the image
				// .... we will try adding it to the div ...
				var _onClick = '_EventHandler.FireEvent(\'' + _id + '\',\''
						+ _csId + '.onClick\'); hideMenu()';
				_panel += '<div id="' + _csId + '" onClick="' + _onClick
						+ '" class="controlPanelIcon"><img src="clapi/'
						+ _csIcon + '"/><br/>' + _csName + '</div>';

				// _EventHandler.WantEvent(_object.GetId(), _id, 'onResize',
				// 'Resize', true, null);
				if (_csTo != null) {
					// add the event registration for the target object
					var _csToParts = _csTo.split('.');
					_EventHandler.WantEvent(_csToParts[0], _id, _csId
							+ '.onClick', _csToParts[1], true, null);
				}
			}
			_panel += '</td></tr>';
		}

		_panel += '<tr><td class="controlPanelHeader"><hr style="width: 360px"/></td></tr><tr><td class="controlPanelFooter">';
		_panel += '<a href="'
				+ _logoutTarget
				+ '"><img src="clapi/images/nixel.gif" style="height: 10px; width: 10px; background-color: red;"/>&nbsp;logout</a>';
		_panel += '</td></tr></table></div>';

		// add the control panel contents to the page
		_container.innerHTML += _panel;

		// now we need to set the welcome string and header string: txt_welcome
		// and txt_header;
		try {
			var _titleBar = _layout.getElementsByTagName('titleBar')[0];

			try {
				var _topRow = _titleBar.getElementsByTagName('topRow')[0];
				document.getElementById('txt_welcome').innerHTML = _evaluate(
						_me, _topRow.firstChild.nodeValue, true, _id);
			} catch (e) {
			}

			try {
				var _bottomRow = _titleBar.getElementsByTagName('bottomRow')[0];
				document.getElementById('txt_header').innerHTML = _evaluate(
						_me, _bottomRow.firstChild.nodeValue, true, _id);
			} catch (e) {
			}

			try {
				var _hdr_logo = _titleBar.getElementsByTagName('headerLogo')[0];
				if (_hdr_logo != null) {
					document.getElementById('hdr_logo').src = _evaluate(_me,
							_hdr_logo.firstChild.nodeValue, true, _id);
					
					var _lh = _hrd_logo.getAttribute("height");
					if(_lh!=null && _lh!="") {
						document.getElementById('hdr_logo').style.height = _lh + "px";
					}
				}
			} catch (e) {
			}

		} catch (e) {
		}
	}

	/**
	 * layout960GS() The layout method for the 960 grid system.
	 */
	function _layout960GS(_layout, _to, __prefix) {
		var _prefix = (__prefix != null) ? __prefix : '';
		var _id = _prefix + _layout.getAttribute('id');
		var _style = _layout.getAttribute('style');
		var _page = (_to != null) ? _to : _target;

		var _dhxCont = _findHTMLObject(_page, 'dhxMainCont');
		if (_dhxCont != null) {
			_page = _dhxCont;
			_page.style.backgroundColor = 'white';
			_page.style.overflow = 'auto';
		}

		var _html = '<div id="' + _id + '"></div>';
		_page.innerHTML = _html;

		var _container = document.getElementById(_id);

		var _rows = _layout.childNodes;
		for ( var i = 0; i < _rows.length; i++) {
			if (_rows[i].nodeName.toLowerCase() != 'row')
				continue;

			var _row = _rows[i];
			var _rowColumns = _row.getAttribute('columns');
			var _rowStyle = _row.getAttribute('style');

			var _rowObj = document.createElement('div');
			_rowObj.setAttribute('class', 'container_' + _rowColumns);
			_rowObj.setAttribute('id', _id + '_row_' + i);
			if (_rowStyle != null)
				_rowObj.setAttribute('style', _rowStyle);
			_container.appendChild(_rowObj);

			var _cells = _row.childNodes;
			for ( var c = 0; c < _cells.length; c++) {
				if (_cells[c].nodeName.toLowerCase() != 'cell')
					continue;

				var _cell = _cells[c];
				var _cellColumns = _cell.getAttribute('columns');
				var _cellStyle = _cell.getAttribute('style');
				var _cellClass = (_cellColumns == 'clear') ? 'clear' : 'grid_'
						+ _cellColumns;

				var _cellObj = document.createElement('div');
				_cellObj.setAttribute('class', _cellClass);
				_cellObj.setAttribute('id', _id + '_cell_' + i + '_' + c);
				if (_cellStyle != null)
					_cellObj.setAttribute('style', _cellStyle);
				_rowObj.appendChild(_cellObj);

				for ( var n = 0; n < _cell.childNodes.length; n++) {
					var _node = _cell.childNodes[n];

					if (_node.nodeType != 1)
						continue;

					var _div = document.createElement('div');
					_div.setAttribute('id', _prefix + _node.getAttribute('id'));

					_cellObj.appendChild(_div);

					if (_node.getAttribute('height') != null)
						_div.style.height = _node.getAttribute('height');
					if (_node.getAttribute('width') != null)
						_div.style.width = _node.getAttribute('width');

					var _object = _dashboard.InitObject(_node, _div, _prefix);

					if (_object != null) {
						_myObjects[_myObjects.length] = _object;

						// we need to make sure that when the panel or layout
						// resizes, the object gets a resize event
						_EventHandler.WantEvent(_object.GetId(), _id,
								'onResize', 'Resize', true, null);
					}
				}
			}
		}

		LateLoading();
	}

	/**
	 * _layoutDHTMLX() The drawing method for dhtmlx components.
	 */
	function _layoutDHTMLX(_layout, _to, __prefix) {
		var _prefix = (__prefix != null) ? __prefix : '';
		var _id = _prefix + _layout.getAttribute('id');
		var _pattern = _layout.getAttribute('pattern');
		_pattern = (_pattern == null) ? _layout.getElementsByTagName('pattern')[0].firstChild.nodeValue
				: _pattern;
		var _page = null;

		if (_to != null) {
			if (_to.attachLayout != null) {
				_page = _to.attachLayout(_pattern);
			} else {
				_page = new dhtmlXLayoutObject(_to, _pattern);
			}
		} else {
			_page = new dhtmlXLayoutObject(_target, _pattern);
		}

//		_page.setImagePath('clapi/dhtmlx/imgs/');
		_page.attachEvent("onContentLoaded", LateLoading);
		_page.attachEvent("onResizeFinish", _me.FireResizeFinish);
		_page.attachEvent("onPanelResizeFinish", _me.FireResizeFinish);

		// tell the window objects who the layout manager is, if we are the
		// parent layout (i.e. prefix is empty)
		var _winParent = _page;
		if (_debug == "true")
			_winParent = _debugLayoutPage;
		if (_prefix == '')
			_dashboard.SetWindowParent(_winParent);

		var _cells = _layout.childNodes;
		for ( var i = 0; i < _cells.length; i++) {
			if (_cells[i].nodeName != 'cell' && _cells[i].nodeName != 'CELL')
				continue;

			var _cell = _cells[i];
			var _idc = _cell.getAttribute('id');
			var _width = _cell.getAttribute('width');
			var _height = _cell.getAttribute('height');
			var _hideHeader = _cell.getAttribute('hideHeader');
			var _header = _cell.getAttribute('header');

			if (_width != '' && _width != null)
				_page.cells(_idc).setWidth(_width);
			if (_height != '' && _height != null)
				_page.cells(_idc).setHeight(_height);
			if (_hideHeader != null && _hideHeader != ''
					&& _hideHeader == 'true')
				_page.cells(_idc).hideHeader();
			if (_header != null)
				_page.cells(_idc).setText(_header);

			var _pageCell = _page.cells(_idc);

			// for DaD components, we need to set the snapTo stuff
			var _snapTo = _findChild('snapTo', _cell);
			if (_snapTo != null && _snapTo.getAttribute('type') == 'columns')
				_snapDrawColumns(_snapTo, _pageCell, _id + '_' + _idc);

			var _enableScrolling = false;
			for ( var c = 0; c < _cell.childNodes.length; c++) {
				if (_cell.childNodes[c].nodeType != 1
						|| _cell.childNodes[c].nodeName == 'snapTo')
					continue;

				var _node = _cell.childNodes[c];
				if (_node.getAttribute('position') == 'absolute')
					_enableScrolling = true;
				if (_snapTo != null) {
					try {
						if (_snapTo.getAttribute('type') == 'columns') {
							_pageCell = document.getElementById(_node
									.getAttribute('column')
									+ '_' + _id + '_' + _idc);
						}

						_dashboard.AddCellSnapTo({
							id : _prefix + _node.getAttribute('id'),
							cell : _pageCell,
							snap : _snapTo
						});
					} catch (e) {
					}
				}

				var _object = _dashboard.InitObject(_node, _pageCell, _prefix);

				if (_object != null) {
					_myObjects[_myObjects.length] = _object;

					// we need to make sure that when the panel or layout
					// resizes, the object gets a resize event
					_EventHandler.WantEvent(_object.GetId(), _id, 'onResize',
							'Resize', true, null);
				}
			}
		}

		var _x = _findHTMLObject(_page.cells(_idc), 'dhxMainCont');

		if (_x != null && _enableScrolling == true) {
			_x.style.overflowX = 'auto';
			_x.style.overflowY = 'auto';
		}

		LateLoading();
	}

}