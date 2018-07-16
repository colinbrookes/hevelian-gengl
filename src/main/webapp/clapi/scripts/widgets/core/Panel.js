/**
 * Panel()
 * This allows the user to add all kinds of custom content directly into a view in 
 * a layout cell. Note, even if the Panel is in a <tab>, it still needs to be wrapped in
 * a <layout> for it to work properly. This is because a panel is a late loading object and
 * needs a wrapper to fire the 'onContentLoaded' event - otherwise the Panel will not be drawn correctly.
 */

function Panel(__id, __xml, __target)
{
	this.type						= 'Panel';
	
	var _id							= __id;
	var _hideShowId					= __id;
	var _xml						= __xml;
	var _type						= __xml.getAttribute('type');
	var _from						= __xml.getAttribute('from');
	var _columns					= __xml.getAttribute('columns');
	var _linebreak					= __xml.getAttribute('linebreak');
	var _columnbreak				= __xml.getAttribute('columnbreaks');
	var _headers					= __xml.getAttribute('columnheaders');
	var _widths		 				= __xml.getAttribute('columnwidths');
	var _zIndex		 				= __xml.getAttribute('zIndex');
	var _width						= __xml.getAttribute('width');
	var _target						= __target;
	var _handler					= null;
	var _me							= this;
	
	this.GetId						= function _getID() { return _id; }
	this.GetProperty				= function _getProperty() { return null; }
	this.SetHideShowId				= function _setHideShowId(_value) { _hideShowId = _value; }
	this.SetEventHandler			= _setEventHandler;
	this.Draw						= _draw;
	this.Redraw						= _draw;
	
	// event callback methods
	this.FilterByRowIdEvent			= _filterByRowIdEvent;
	this.CollectionRefreshEvent		= _collectionRefreshEvent;
	this.Hide						= _hide;
	this.Show						= _show;
	this.ToggleHideShow				= _toggleHideShow;
	
	// event firing methods
	this.fireOnMouseOut				= function _onMouseOut(_e) { _handler.FireEvent(_id, 'onMouseOut'); _cancelBubble(_e); }
	this.fireOnMouseOver			= function _onMouseOver(_e) { _handler.FireEvent(_id, 'onMouseOver'); _cancelBubble(_e); }
	this.fireOnLoad					= function _onLoad(_e) { _handler.FireEvent(_id, 'onLoad'); }
	this.fireOnClick				= function _onClick(_e) { _handler.FireEvent(_id, 'onClick'); }
	
	
	function _cancelBubble(e)
	{
		if (!e) var e = window.event;
		e.cancelBubble = true;
		if (e.stopPropagation) e.stopPropagation();
		if (e.preventDefault) e.preventDefault();
	}
	
	function _setEventHandler(__handler)
	{
		_handler 			= __handler;
		
		try {
			if(_from==null) return;
			
			var _fromParts		= _from.split('.');
			
			// add an auto event for if the data source changes
			_handler.WantEvent(_id, _fromParts[0], 'Refresh', 'CollectionRefreshEvent', 'always');
		} catch(e) { }
	}
	
	function _toggleHideShow()
	{
		console.log("Panel HideShow div ID: " + _hideShowId);
		
		var _div = document.getElementById("Panel_" + _hideShowId);
		if(_div==null) return;
		
		if(_div.style.display=='none') return _div.style.display = 'block';
		_div.style.display = 'none';
	}
	
	function _hide()
	{
		var _div = document.getElementById("Panel_" + _hideShowId);
		if(_div==null) return;
		
		if(_div.style.display=='none') return;
		_div.style.display = "none";
		
	}
	
	function _show()
	{
		var _div = document.getElementById("Panel_" + _hideShowId);
		if(_div==null) return;
		
		if(_div.style.display=='block') return;
		_div.style.display = "block";
		
	}
	
	function _draw()
	{
		if(_debug=="true") _addTimeline(_id, new Date(), null, 'draw panel');
		
		switch(_type)
		{
			case 'raw':						
				_drawRaw();
				break;
				
			case 'delimited':			
				_drawDelimited();
				break;
				
			case 'xhtml':					
				_drawXHTML();
				break;
				
			case 'svg':						
				_drawSVG();
				break;
				
			case 'x3dom':
				_drawX3();
				break;
				
			case 'detect':
			default:
				_drawOther();
		}
		
		if(_debug=="true") _updateTimeline(_id, new Date());
		_me.fireOnLoad();
	}

	/**
	 * This draws 3D objects based on the x3dom xml syntax.
	 */
	function _drawX3() {
		var _body		= null;
		
		if(_target.getFrame==null)
		{
			_body = _target;
		} else
		{
			try {
				var _frame = _target.getFrame();
				_body	= (_frame.contentWindow!=null)? _frame.contentWindow.document.body : _frame.contentDocument.document.body;
			} catch(e) { }
			if(_body==null) _body = _target;
			var _other = _findHTMLObject(_body, 'dhxMainCont');
			if(_other!=null)
			{
				_body = _other;
			}
		}
		
		_body.style.overflow	= 'auto';
		_body.style.padding		= '0px';
		_body.style.margin		= '0px';
		_body.style.zIndex		= (_zIndex==null)? 1 : _zIndex;
		
		var _t = _evaluate(_me, _xml.innerHTML, true, _id);
		_body.innerHTML = _t;
		x3dom.reload();
		
		// now we need to add events to the <shape> tags in the x3d body.
		// events: onclick, onmouseover, onmouseout
	}
	
	function _drawXHTML()
	{
		
		var _body		= _target;
		var _div		= null;
		
		var existingPanelDiv = document.getElementById("Panel_" + _id);
		if(existingPanelDiv==null) {
			_div = document.createElement('DIV');
			_div.style.display	= 'inline-block';
			_div.style.float	= 'left';

			_div.setAttribute('id', 'Panel_' + _id);
			_target.appendChild(_div);
			_target.style.overflow = 'auto';
			
			_target = _div;
			_body = _target;
			
			_body.style.overflow	= 'auto';
			_body.style.padding		= '0px';
			_body.style.margin		= '0px';

			if(_width!=null) {
				_body.style.width		= _width;
			}
			_body.style.zIndex		= (_zIndex==null)? 1 : _zIndex;
		} else {
			_body = existingPanelDiv;
		}

		
		// has it been provided as an external file reference - then we fetch it
		if(_from!=null)
		{
			var _ajax = new sisAJAXConnector();
			_ajax.open('GET', _from, false);
			_ajax.send(null);
			
			// now the actual rendering of the html into the view.
			_body.innerHTML			= _ajax.responseText;
			
			return;
		}
		
		// otherwise it has been provided as a regular CDATA section
		_body.innerHTML			= _evaluate(_me, _xml.firstChild.nodeValue, true, _id);
		
		try {
			_body.addEventListener('mouseover', _me.fireOnMouseOver, false);
			_body.addEventListener('mouseout', 	_me.fireOnMouseOut, false);
			_body.addEventListener('click', 	_me.fireOnClick, false);
			_body.addEventListener('load', 		_me.fireOnLoad, false);
		} catch(e) { }
	}
	
	function _drawSVG()
	{
		var _body	= null;
		var _ajax		= new sisAJAXConnector();
		_ajax.open('GET', _from, false);
		_ajax.send(null);
		
		// now the actual rendering of the SVG into the view.
		if(_target.getFrame==null)
		{
			_body = _target;
		} else
		{
			try {
				var _frame = _target.getFrame();
				_body	= (_frame.contentWindow!=null)? _frame.contentWindow.document.body : _frame.contentDocument.document.body;
			} catch(e) { }
			if(_body==null) _body = _target;
			var _other = _findHTMLObject(_body, 'dhxMainCont');
			if(_other!=null)
			{
				_body = _other;
			}
		}

		_body.style.overflow	= 'auto';
		_body.style.fontFamily	= 'Courier';
		_body.style.fontSize	= '12px';
		_body.innerHTML			= _ajax.responseText;
	}
	
	function _drawRaw()
	{
		var _fromParts		= _from.split('.');
		var _fromObj		= _getObjectByName(_fromParts[0]);
		var _data			= _fromObj.GetProperty(_fromParts[1]);
		
		// now the actual rendering of the RAW data into the view.
		try {
			if(_target.getFrame==null)
			{
				var _body = _target;
			} else
			{
				var _frame = _target.getFrame();
				var _body	= (_frame.contentWindow!=null)? _frame.contentWindow.document.body : _frame.contentDocument.document.body;
			}
		} catch(e) { var _body = _target; }
		
		_body.style.overflow	= 'auto';
		_body.style.fontFamily	= 'Courier';
		_body.style.fontSize	= '12px';
		_body.innerHTML			= Encoder.htmlEncode(_data);
		
	}
	
	function _drawDelimited()
	{
		var _fromParts		= _from.split('.');
		var _fromObj		= _getObjectByName(_fromParts[0]);
		var _data			= _fromObj.GetProperty(_fromParts[1]);
		
		_data				= _data.split(_linebreak);
		
		/**
		 * if no column break chars are specified then we render the raw data into the body
		 * of the page, otherwise we create a simple grid
		 */
		if(_columnbreak==null)
		{
			_data				= _data.join("<br/>");
			
			// now the actual rendering of the HTML into the view.
			if(_target.getFrame==null)
			{
				var _body = _target;
			} else
			{
				var _frame = _target.getFrame();
				var _body	= (_frame.contentWindow!=null)? _frame.contentWindow.document.body : _frame.contentDocument.document.body;
			}
			
			_body.style.overflow	= 'auto';
			_body.style.fontFamily	= 'Courier';
			_body.style.fontSize	= '12px';
			_body.innerHTML			= _data;
			
			return;
		}
		
		var _arAll	= [];
		try {
			 for(var i=0; i<_data.length; i++)
			 {
			 	var _ar 		= [];
			 	var _row		= _data[i];
			 	var _fromPos	= 0;
			 	
			 	if(_row.length==0) continue;
			 	
			 	for(var c=0; c<_columnbreak.length; c++)
			 	{
			 		var _charToFind = _columnbreak.charAt(c);
			 		var _foundAt	= _row.indexOf(_charToFind, _fromPos);
			 		if(_foundAt!=-1)
			 		{
			 			// we found the delimiter, now we slice the string
			 			_ar[_ar.length] = _row.slice(_fromPos, _foundAt);
			 			_fromPos = _foundAt + 1;
			 		} else
			 		{
			 			_ar[_ar.length] = '';
			 		}
			 	}
			 	if(_fromPos <= (_row.length-1))
			 	{
			 		_ar[_ar.length] = _row.slice(_fromPos);
			 	}
			 	_arAll[_arAll.length] = _ar;
			 }
		} catch(e) { }
		
		// now create the grid object 
		var _dhtmlxGrid = _target.attachGrid();
		_dhtmlxGrid.setImagePath("clapi/ui/imgs/");
		_dhtmlxGrid.setSkin("dhx_skyblue");
		_dhtmlxGrid.setHeader(_headers);
		_dhtmlxGrid.setInitWidths(_widths);
		_dhtmlxGrid.init();
		_dhtmlxGrid.parse(_arAll, "jsarray");
		
	}
	
	function _drawOther()
	{
		var _body	= null;
		var _fromEval		= _evaluate(_me, _from, false, _id);
		var _fromParts		= _fromEval.split('.');
		var _fromObj		= _getObjectByName(_fromParts[0], _me);
		var _data			= _fromObj.GetProperty(_fromParts[1]);
		var _str			= '';
		
		try { _data = _data.trim(); } catch(e) { }
		
		if(_data.substring(0,5) == '<?xml')
		{
			// we have XML data
			var _xmlDoc			= (_data.length>0)? new sisXMLDocument(_data) : null;
			_str				= (_xmlDoc!=null)? _processXML(0, _xmlDoc, "yes") : _processText(_data); 
		} else
		{
			var _xmlDoc		= new sisXMLDocument(_data);
			if(_xmlDoc!=null && (_xmlDoc.getElementsByTagName('parsererror')==null || _xmlDoc.getElementsByTagName('parsererror').length==0))
			{
				// okay, it is probably XML despite the missing header
				_str = _processXML(0, _xmlDoc, "yes");
			} else
			{
				if(_isBinaryData(_data))
				{
					_str			= FormatForBinaryData(_data);
				} else
				{
					// it might be XML without a valid header - lets try that first
					var _xmlDoc		= new sisXMLDocument(_data);
					if(_xmlDoc!=null && (_xmlDoc.getElementsByTagName('parsererror')==null || _xmlDoc.getElementsByTagName('parsererror').length==0))
					{
						// okay, it is probably XML despite the missing header
						_str = _processXML(0, _xmlDoc, "yes");
					} else
					{
						if(_data.substring(0,4) == 'MSH|')
						{
							// is a HL7 2.x file
							_str		= _data.replace('\n', '<br/>');
						} else
						{
							if(_data.substring(0,4) == 'UNA:' || _data.substring(0,4) == 'UNB+')
							{
								// probably EDIFACT
								_str	= _data.replace(/'/g, "'<br/>");
							} else
							{
								if(_data.substring(0,4) == 'ISA*')
								{
									// probably X12
									_str = _data.replace(/^/g, "'<br/>");
								} else
								{
									// we give up ... could be anything but we assume text of some sort
									_str = _processText(_data);
								}
							}
						}
					}					
				}
			}
		}
		
		if(_target.getFrame==null)
		{
			_body = _target;
		} else
		{
			try {
				var _frame = _target.getFrame();
				_body	= (_frame.contentWindow!=null)? _frame.contentWindow.document.body : _frame.contentDocument.document.body;
			} catch(e) { }
			if(_body==null) _body = _target;
			var _other = _findHTMLObject(_body, 'dhxMainCont');
			if(_other!=null)
			{
				_body = _other;
			}
		}
		
		_body.style.overflow	= 'auto';
		_body.style.fontFamily	= 'Courier';
		_body.style.fontSize	= '11px';
		_body.style.lineHeight	= '16px';
		_body.innerHTML			= _str;
	}
	
	function _processText(_text)
	{
		// this needs some work me thinks ...
		var _str = _text.replace(/\n\r/g, '<br/>').replace(/\n/g, '<br/>').replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;').replace(/ /g, '&nbsp;');
		return _str;
	}
	
	function _processXML(_level, _node, _root)
	{
		var _str		= '';
		var _indent 	= parseInt(_level,10) * 15;
		
		// first we add the line padding
		if(_node.nodeName!='#document')
		{
			if(_root==null||_root!="yes") _str	+= '<br/>';
			
			_str 		+= '<img src="clapi/images/nixel.gif" style="border: 0px solid red" width="'+_indent+'px" height="16px"/>';
			_str		+= '<font color="#a0a0a0">&lt;' + _node.nodeName;
			if(_node.attributes.length>0) 
			{
				for(var i=0; i<_node.attributes.length; i++)
				{
					 _str += ' <font color="blue">' + _node.attributes[i].nodeName + '</font>="<font color="red">' + _node.attributes[i].nodeValue + '</font>"';
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
				case 1:
					_nonText++;
					_str += '<br/>' + (_node.childNodes[i].nodeName!='#text')? _processXML(_level+1, _node.childNodes[i]) : '';
					break;
					
				case 3:		// Text
					_text++;
					_str += _node.childNodes[i].nodeValue.replace(/\t/gi, "    ");
					break;
					
				case 4:		// CDATA
					_str += '&lt;![CDATA[' + _node.childNodes[i].nodeValue + ']]&gt;';
					break;
					
				case 8:		// comment
					_str += '&lt;!-- ' + _node.childNodes[i].nodeValue + ' --&gt;';
					break;
			}
		}
		
		if(_node.nodeName!='#document')
		{
			if(_nonText>0) _str += '<br/>';
			if(_nonText>0 || _text==0) _str += '<img src="clapi/images/nixel.gif" width="'+_indent+'px" height="16px"/>';
			_str += '<font color="#a0a0a0">&lt;/' + _node.nodeName + '&gt;</font>';
		}
		
		return _str;
	}
	
	/**
	 * a 'FilterByRowId' event simply needs to call the Draw method as a Panel can only
	 * be linked to a single row.
	 */
	function _filterByRowIdEvent(_item)
	{
		_draw();
	}

	/**
	 * when a collection has refreshed its data it automatically issues a Refresh event, and we
	 * simply redraw the panel contents.
	 */	
	function _collectionRefreshEvent(_fromCollection)
	{
		_draw();
	}

	/**
	 * isBinaryData()
	 * checks the first 'n' characters in the data to see if there is a non-displayable char.
	 */	
	function _isBinaryData(_data)
	{
		for(var i=0; i<_data.length && i<20; i++) if(_data.charCodeAt(i) < 32) return true;
		return false;
	}
}

/**
 * FormatForBinaryData()
 * Replaces binary values with their equivalent named chars, or the charcode number if greater than 255.
 * The changed chars are also displayed 'reverse-video' - white text on black background.
 */
function FormatForBinaryData(_data)
{
	var _specials = new Array('NUL','SOH','STX','ETX','EOT','ENQ','ACK','BEL','BS','TAB','LF','VT','FF','CR','SO','SI','DLE','DC1','DC2','DC3','DC4','NAK','SYN','ETB','CAN','EM','SUB','ESC','FS','GS','RS','US');
	var _text = '';
	
	for(var i=0; i<_data.length; i++)
	{
		var _c = _data.charCodeAt(i);
		switch(_c)
		{
		case 0:
		case 1:
		case 2:
		case 3:
		case 4:
		case 5:
		case 6:
		case 7:
		case 8:
		case 9:
		case 11:
		case 12:
		case 14:
		case 15:
		case 16:
		case 17:
		case 18:
		case 19:
		case 20:
		case 21:
		case 22:
		case 23:
		case 24:
		case 25:
		case 26:
		case 27:
		case 28:
		case 29:
		case 30:
		case 31:
			_text += '<span style="background-color: black; color: white;">';
			_text += _specials[_c];
			_text += '</span><img src="images/nixel.gif" style="background-color: white;" height="10px" width="1px"/>';
			break;
		
		case 13:
			break;
			
		case 10:
			_text += '<br/>';
			break;
			
		case 60:
			_text += '&lt;';
			break;
			
		case 62:
			_text += '&gt;';
			break;
			
		case 38:
			_text += '&amp;';
			break;
			
		default:
			if(_c > 255)
			{
				_text += '<span style="background-color: black; color: white;">';
				_text += _c;
				_text += '</span><img src="images/nixel.gif" style="background-color: white;" height="10px" width="1px"/>';
			} else
			{
				_text += _data.charAt(i);
			}
			break;
			
		}
	}
	
	return _text;
}

