/**
 * (c) Brookes Management B.V. - Colin Brookes - 2012 
 */
 
 function MyQInputButton(__id, __target, __xml)
 {
	 this.type											= 'ButtonInput';
 
 	var _id												= __id;
 	var _target										= __target;
 	var _xml											= __xml;
 	var _me											= this;
 	
 	var _properties									= new Array();
	var _handler										= null;
	var _hideShowId								= __id;
	var _r												= null;
	var _background								= null;
 	
	this.Draw											= _draw;
	this.Redraw										= _redraw;
	this.Refresh										= _redraw;
	this.GetProperty								= _getProperty;
	this.SetEventHandler							= function _setEventHandler(__handler) { _handler = __handler; }
	this.SetHideShowId							= function _setHideShowId(_value) { _hideShowId = _value; }
	this.GetId											= function _getID() { return _id; }
	this.Hide											= _hide;
	this.Show											= _show;
	this.ToggleHideShow							= _toggleHideShow;
	
	// event firing methods
	this.fireOnMouseOut							= function _onMouseOut() { _handler.FireEvent(_id, 'onMouseOut'); }
	this.fireOnMouseOver						= function _onMouseOver() { _handler.FireEvent(_id, 'onMouseOver'); }
	this.fireOnLoad									= function _onLoad() { _handler.FireEvent(_id, 'onLoad'); }
	this.fireOnClick									= _fireOnClick;
	
	this.fireOnChange								= function _onChange() { _handler.FireEvent(_id, 'onChange'); _handler.FireEvent(_id, 'Refresh');}
	this.fireOnKeyUp								= function _onKeyUp() { _handler.FireEvent(_id, 'onKeyUp'); _handler.FireEvent(_id, 'Refresh');}
	this.fireOnBlur									= function _onBlur() { _handler.FireEvent(_id, 'onBlur'); }
	this.fireOnFocus								= function _onFocus() { _handler.FireEvent(_id, 'onFocus'); }
	
	function _fireOnClick()
	{
		_handler.FireEvent(_id, 'onClick');
	}
	
	function _draw()
	{
		if(_debug=="true") _addTimeline(_id, new Date(), null, 'draw text input');
		
		_setProperty('enabled', 				_xml.getAttribute('enabled'));
		_setProperty('visible',					_xml.getAttribute('visible'));
		_setProperty('width',					_xml.getAttribute('width'));
		_setProperty('height',					_xml.getAttribute('height'));
		_setProperty('to',						_xml.getAttribute('to'));
		_setProperty('label',					_xml.firstChild.nodeValue);
		
		if(_getProperty('visible')==null)							_setProperty('visible', 'true');
		if(_getProperty('enabled')==null)						_setProperty('enabled', 'true');
		if(_getProperty('height')==null)							_setProperty('height', '30');
		
		if(_getProperty('to')!=null) 
		{
			var _parts = _getProperty('to').split('.');
			_handler.WantEvent(_parts[0], _id, 'onClick', _parts[1], "always");
		}
		
		_renderInput();
		
		if(_debug=="true") _updateTimeline(_id, new Date());
	}
	
	function _redraw()
	{
		// first we update the label
		var _label = document.getElementById('label_' + _id);
		if(_label!=null)
		{
			_label.innerHTML = _evaluate(_me, _getProperty('label'), true) + '&nbsp;';
		}
		
		// then the value
		var _element = document.getElementById(_id);
		if(_element!=null)
		{
			_element.value = _evaluate(_me, _getProperty('Value', 'not found'), true);
		}
	}
	
	function _renderInput()
	{
		var _body										= null;
		var _css 										= 'height: 16px; outline: none; border: 0px solid red; background-color: #ffffff; font-size: 12px; margin: 1px;width: '+_getProperty('width', '100')+'px';
		var _strLabel 								= '';
		var _strInput									= '';
		
		var _inputDiv								= document.createElement('div');
		_inputDiv.style.overflow 				= 'hidden';
		_inputDiv.style.float 						= 'left';
		_inputDiv.style.position 				= 'absolute';
		_inputDiv.style.display					= 'inline-block';
		_inputDiv.style.top 						= '0px';
		_inputDiv.style.left 						= '0px';
		_inputDiv.style.height					=  (parseInt(_getProperty('height', '30'),10)+6) + 'px';
		_inputDiv.style.width 					= (parseInt(_getProperty('width', '120'),10)+10) + 'px';
		_inputDiv.style.border					= '0px solid green';
		_inputDiv.style.paddingLeft			= '0px';
		_inputDiv.style.paddingTop			= '4px';
		
		_strInput		= '<button type="button" class="inputButton" id="'+_id+'">'+_getProperty('label','&nbsp;')+'</button>';

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
		
		_body.style.overflow			= 'hidden';
		_body.style.padding			= '0px';
		_body.style.margin			= '0px';
		_body.style.display			= 'inline-block';
		_body.style.float				= 'left';
		_body.style.verticalAlign	= 'top';
		
		try {
		_body.onmouseover			= this.fireOnMouseOver;
		_body.onmouseout			= this.fireOnMouseOut;
//		_body.onclick					= this.fireOnClick;
		_body.onload					= this.fireOnLoad;
		} catch(e) {}
		
		var _e = document.createElement('div');
		_body.appendChild(_e);
		
		_e.style.paddingTop 			= '10px';
		 _e.style.float 					= 'left';
		_e.style.position				= 'relative';
		_e.style.display					= 'inline-block';
		_e.style.border					= '0px solid blue';
		_e.style.padding				= '0px';
		_e.style.margin					= '0px';
		_e.style.whiteSpace			= 'nowrap';
		_e.style.verticalAlign			= 'top';
		_e.style.width					= (parseInt(_getProperty('width', '120'),10)+10) + 'px';
		_e.style.height					=  (parseInt(_getProperty('height', '30'),10)+6) + 'px';
		
		_e.appendChild(_inputDiv);
		_inputDiv.innerHTML 	 = _strInput;
		
		if(_hideShowId==_id)
		{
			_e.setAttribute('id', 'container_' + _id);
			_hideShowId = 'container_' + _id;
		}
		
		// special events for a text input
		var _element = document.getElementById(_id);
		if(_element!=null)
		{
			_element.onfocus					= _me.fireOnFocus;
			_element.onblur					= _me.fireOnBlur;
			_element.onclick					= _me.fireOnClick;
			
			// first we set the value
//			_element.disabled					= (_getProperty('enabled', 'false')=='false')? true : false;
			_element.style.height			= (parseInt(_getProperty('height', '30'),10)) + 'px';
			_element.style.width			= (parseInt(_getProperty('width', '100'),10)) + 'px';
			(_getProperty('visible', 'true')=='false')? _hide() : _show();
			
			
		}
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
	
	function _setProperty(_name, _value)
	{
		for(var i=0; i<_properties.length; i++)
		{
			if(_properties[i].key==_name)
			{
				_properties[i].value = _value;
				return;
			}
		}
		
		// new, so we add it
		_properties[_properties.length] = new kvp(_name, _value);
	}
	
	/*
	 * internal properties: IsHidden, IsEmpty, 
	 */
	function _getProperty(_name, _default)
	{
		switch(_name)
		{
			case 'InHidden':
				var _div = document.getElementById(_hideShowId);
				return (_div.style.display=='none')? "true" : "false";
				break;
				
			case 'IsEmpty':
				var _element = document.getElementById(_id);
				return (_element.value=="")? "true" : "false";
				
			case 'value':
				var _element = document.getElementById(_id);
				return _element.value;
				
			default:
				for(var i=0; i<_properties.length; i++)
				{
					if(_properties[i].key==_name)
					{
						// return value or default if null
						return (_properties[i].value!=null)? _properties[i].value : (_default==null)? "" : _default;
					}
				}
		}
		
		// not found
		return (_default==null)? "" : _default;
	}
 }