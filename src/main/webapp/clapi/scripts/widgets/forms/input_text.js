/**
 * (c) Brookes Management B.V. - Colin Brookes - 2012 
 */
 
 function MyQInputText(__id, __target, __xml)
 {
	 this.type										= 'TextInput';
 
 	var _id											= __id;
 	var _target									= __target;
 	var _xml										= __xml;
 	var _me										= this;
 	
 	var _properties								= new Array();
	var _handler									= null;
	var _hideShowId							= __id;
	var _r											= null;
	var _background							= null;
 	
	this.Draw										= _draw;
	this.Redraw									= _redraw;
	this.Refresh									= _redraw;
	this.GetProperty							= _getProperty;
	this.SetEventHandler						= function _setEventHandler(__handler) { _handler = __handler; }
	this.SetHideShowId						= function _setHideShowId(_value) { _hideShowId = _value; }
	this.GetId										= function _getID() { return _id; }
	this.Hide										= _hide;
	this.Show										= _show;
	this.ToggleHideShow						= _toggleHideShow;
	
	// event firing methods
	this.fireOnMouseOut						= function _onMouseOut() { _handler.FireEvent(_id, 'onMouseOut'); }
	this.fireOnMouseOver					= function _onMouseOver() { _handler.FireEvent(_id, 'onMouseOver'); }
	this.fireOnLoad								= function _onLoad() { _handler.FireEvent(_id, 'onLoad'); }
	this.fireOnClick								= function _onClick() { _handler.FireEvent(_id, 'onClick'); }
	
	this.fireOnChange							= function _onChange() { _handler.FireEvent(_id, 'onChange'); _handler.FireEvent(_id, 'Refresh');}
	this.fireOnKeyUp							= function _onKeyUp() { _handler.FireEvent(_id, 'onKeyUp'); _handler.FireEvent(_id, 'Refresh');}
	this.fireOnBlur								= function _onBlur() { _handler.FireEvent(_id, 'onBlur'); }
	this.fireOnFocus							= function _onFocus() { _handler.FireEvent(_id, 'onFocus'); }
	
	this.onKeyDown							= _onKeyDown;
	
	var _featNumeric							= false;
	var _featForceLower						= false;
	var _featForceUpper						= false;
	var _featRequired							= false;
	var _featFloat								= false;
	
	function _onKeyDown(_e)
	{
		// we use this event to check for input features, such as 'numeric', 'forceLower', 'forceUpper', etc
		var e = _e || event;
		var key = (e.keyCode!=null)? e.keyCode : e.which;
//		var key = e.which || e.keyCode;
		
		if(_featNumeric==true)
		{
			if (!e.shiftKey && !e.altKey && !e.ctrlKey &&
                         key >= 48 && key <= 57 ||
                         key >= 96 && key <= 105 ||
                        key == 190 || key == 188 || key == 109 || key == 110 ||
                        key == 8 || key == 9 || key == 13 ||
                        key == 35 || key == 36 ||
                        key == 37 || key == 39 ||
                        key == 46 || key == 45) return true;

                     return false;
		}
		
	}
	
	function _draw()
	{
		if(_debug=="true") _addTimeline(_id, new Date(), null, 'draw text input');
		
		_setProperty('label', 						_xml.getAttribute('label'));
		_setProperty('enabled', 					_xml.getAttribute('enabled'));
		_setProperty('visible',						_xml.getAttribute('visible'));
		_setProperty('labelPlacement',		_xml.getAttribute('labelPlacement'));
		_setProperty('width',						_xml.getAttribute('width'));
		_setProperty('labelWidth',				_xml.getAttribute('labelWidth'));
		_setProperty('direction',					_xml.getAttribute('direction'));
		_setProperty('features',					_xml.getAttribute('features'));
		_setProperty('Value',						_xml.firstChild.nodeValue);
		
		if(_getProperty('direction')==null)						_setProperty('direction', 'ltr');
		if(_getProperty('visible')==null)							_setProperty('visible', 'true');
		if(_getProperty('enabled')==null)						_setProperty('enabled', 'true');
		if(_getProperty('labelPlacement')==null)				_setProperty('labelPlacement', 'right');
		if(_getProperty('labelWidth')==null)				_setProperty('labelPlacement', '0');
		
		// process the features flags
		if(_getProperty('features','')!='')
		{
			var _feats = _getProperty('features').split(',');
			for(var i=0; i<_feats.length; i++)
			{
				switch(_feats[i])
				{
					case 'required':							_featRequired		= true;						break;
					case 'forceUpper':						_featForceUpper	= true;						break;
					case' forceLower':						_featForceLower	= true;						break;
					case 'numeric':							_featNumeric			= true;						break;
					case 'float':								_featFloat				= true;						break;
				}
			}
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
			if(_getProperty('enabled', 'true')=='false')
			{
				// always update when the element is not enabled
				_element.value = _evaluate(_me, _getProperty('Value', _element.value), true);
				return;
			}
			
			if(_element.value=='')
			{
				// otherwise only update when the field is empty
				_element.value = _evaluate(_me, _getProperty('Value', _element.value), true);
			}
		}
	}
	
	function _renderInput()
	{
		var _body							= null;
		var _css 							= 'height: 16px; outline: none; border: 0px solid red; background-color: #ffffff; font-size: 11px; margin: 1px;width: '+_getProperty('width', '100')+'px';
		var _strLabel 					= '';
		var _strInput						= '';
		
		var _inputDiv							= document.createElement('div');
		_inputDiv.style.overflow 			= 'hidden';
		_inputDiv.style.float 					= 'left';
		_inputDiv.style.position 			= 'absolute';
		_inputDiv.style.display				= 'block';
		_inputDiv.style.top 					= '0px';
		_inputDiv.style.left 					= '0px';
		_inputDiv.style.height				= '20px';
		_inputDiv.style.width 				= (parseInt(_getProperty('width', '100'),10)) + 'px';
		_inputDiv.style.border				= '0px solid green';
		_inputDiv.style.paddingLeft		= '6px';
		_inputDiv.style.paddingTop		= '3px';
		
		_strInput		= '<input id="'+_id+'" name="'+_id+'" class="inputText" type="text"  value="" style="'+_css+'"/>';
		_strLabel 	= '<div id="label_'+_id+'" style="display: inline; width: '+(parseInt(_getProperty('labelWidth', '100'),10))+'px;  vertical-align: top; overflow: hidden; font-size: 11px">' +_evaluate(_me, _getProperty('label'),true) + '&nbsp;</div>';

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
		
		_body.style.overflow		= 'hidden';
		_body.style.padding		= '0px';
		_body.style.margin		= '0px';
		_body.style.display		= 'inline-block';
		_body.style.float			= 'left';
		
		try {
		_body.onmouseover		= this.fireOnMouseOver;
		_body.onmouseout		= this.fireOnMouseOut;
		_body.onclick				= this.fireOnClick;
		_body.onload				= this.fireOnLoad;
		} catch(e) {}
		
		var _e = document.createElement('div');
		_body.appendChild(_e);
		
		_e.style.paddingTop 		= '10px';
		 _e.style.float 				= 'left';
		_e.style.position			= 'relative';
		_e.style.display				= 'inline-block';
		_e.style.border				= '0px solid blue';
		_e.style.padding			= '0px';
		_e.style.marginTop		= '4px';
		_e.style.whiteSpace		= 'nowrap';
		_e.style.verticalAlign		= 'top';
		_e.style.width				= (parseInt(_getProperty('width', '100'),10)+parseInt(_getProperty('labelWidth', '100'),10)) + 'px'; //'175px';
		
		_drawFrame(_e);
		
		switch(_getProperty('labelPlacement', 'right'))
		{
			// TODO - left placement doesnt work properly.
			case 'left':
				_e.innerHTML = _strLabel;
				_e.appendChild(_inputDiv);
				_inputDiv.innerHTML 	 = _strInput;
				break;
				
			case 'right':
			default:
				_e.appendChild(_inputDiv);
				_inputDiv.innerHTML 	 = _strInput;
				_e.innerHTML += _strLabel;
		}
		
		
		
		if(_hideShowId==_id)
		{
			_e.setAttribute('id', 'container_' + _id);
			_hideShowId = 'container_' + _id;
		}
		
		// special events for a text input
		var _element = document.getElementById(_id);
		if(_element!=null)
		{
			// first we set the value
			_element.value 						= _evaluate(_me, _getProperty('Value'), true);
			_element.disabled					= (_getProperty('enabled', 'false')=='false')? true : false;
			(_getProperty('visible', 'true')=='false')? _hide() : _show();
			
			if(_featForceUpper)				_element.style.textTransform = 'uppercase';
			if(_featForceLower)				_element.style.textTransform = 'lowercase';
			
			try {
			_element.onchange				= _me.fireOnChange;
			_element.onkeyup				= _me.fireOnKeyUp;
			_element.onkeydown			= _me.onKeyDown;
			_element.onfocus					= _me.fireOnFocus;
			_element.onblur					= _me.fireOnBlur;
			} catch(e) {}
		}
		
		
	}
	
	function _renderInputMessedUp()
	{
		var _body							= null;
		var _css 								= 'height: 16px; outline: none; border: 0px solid red; background-color: #ffffff; font-size: 11px; margin: 1px;width: '+_getProperty('width', '100')+'px';
		var _strLabel 						= '';
		var _strInput						= '';
		
		var _inputDiv								= document.createElement('div');
		_inputDiv.style.overflow 			= 'hidden';
//		_inputDiv.style.float 					= 'left';
		_inputDiv.style.position 			= 'relative';
		_inputDiv.style.display				= 'inline-block';
		_inputDiv.style.top 					= '0px';
		_inputDiv.style.left 					= '0px';
		_inputDiv.style.height				= '20px';
		_inputDiv.style.width 				= (parseInt(_getProperty('width', '100'),10)) + 'px';
		_inputDiv.style.border				= '1px solid red';
		_inputDiv.style.paddingLeft	 	= '6px';
		_inputDiv.style.paddingTop		= '3px';
		
		_strInput		= '<input id="'+_id+'" name="'+_id+'" class="inputText" type="text"  value="" style="'+_css+'"/>';
		
//		_strLabel 		= '<div id="label_'+_id+'" style="padding-left: '+(parseInt(_getProperty('width', '100'),10)+4)+'px; display: inline; width: 50px;  vertical-align: top; overflow: hidden; font-size: 11px">' +_evaluate(_me, _getProperty('label'),true) + '&nbsp;</div>';

//		_strLabel 		= '<div id="label_'+_id+'" style="padding: 0px; margin:0px; display: inline; width: 50px;  vertical-align: top; overflow: hidden; font-size: 11px">' +_evaluate(_me, _getProperty('label'),true) + '&nbsp;</div>';
		_strLabel 		= '<div id="label_'+_id+'" style="padding-left: 0px; margin:0px; display: inline; width: 50px;  vertical-align: top; overflow: hidden; font-size: 11px">' +_evaluate(_me, _getProperty('label'),true) + '&nbsp;</div>';

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
		
		_body.style.overflow		= 'hidden';
		_body.style.padding		= '0px';
		_body.style.margin		= '0px';
		_body.style.display		= 'inline-block';
//		if(_featFloat==true) 
			_body.style.float			= 'left';
		
		try {
		_body.onmouseover		= this.fireOnMouseOver;
		_body.onmouseout		= this.fireOnMouseOut;
		_body.onclick				= this.fireOnClick;
		_body.onload				= this.fireOnLoad;
		} catch(e) {}
		
		var _e = document.createElement('div');
		_body.appendChild(_e);
		
		_e.style.paddingTop 		= '10px';
		_e.style.float 					= 'left';
		_e.style.position			= 'relative';
		_e.style.display				= 'inline';
		_e.style.border				= '1px solid green';
		_e.style.padding			= '0px';
		_e.style.marginTop		= '4px';
		_e.style.whiteSpace		= 'nowrap';
		_e.style.verticalAlign		= 'top';
		_e.style.width				= '175px';
//		_e.style.width				= (parseInt(_getProperty('width', '100'),10)) + 'px';
		
//		_drawFrame(_e);
		
		switch(_getProperty('labelPlacement', 'right'))
		{
			// TODO - left placement doesnt work properly.
			case 'left':
				_e.innerHTML = _strLabel;
				_e.appendChild(_inputDiv);
				_inputDiv.innerHTML 	 = _strInput;
				break;
				
			case 'right':
			default:
				_e.appendChild(_inputDiv);
				_inputDiv.innerHTML 	 = _strInput;
				_e.innerHTML += _strLabel;
		}
		
		
		
		if(_hideShowId==_id)
		{
			_e.setAttribute('id', 'container_' + _id);
			_hideShowId = 'container_' + _id;
		}
		
		// special events for a text input
		var _element = document.getElementById(_id);
		if(_element!=null)
		{
			// first we set the value
			_element.value 						= _evaluate(_me, _getProperty('Value'), true);
			_element.disabled					= (_getProperty('enabled', 'false')=='false')? true : false;
			(_getProperty('visible', 'true')=='false')? _hide() : _show();
			
			if(_featForceUpper)				_element.style.textTransform = 'uppercase';
			if(_featForceLower)				_element.style.textTransform = 'lowercase';
			
			try {
			_element.onchange				= _me.fireOnChange;
			_element.onkeyup				= _me.fireOnKeyUp;
			_element.onkeydown			= _me.onKeyDown;
			_element.onfocus					= _me.fireOnFocus;
			_element.onblur					= _me.fireOnBlur;
			} catch(e) {}
		}
		
		
	}
	
	function _drawFrame(_element)
	{
		_r 								= new Raphael(_element, parseInt(_getProperty('width', '100'))+18, 24);
		_background 			= _r.rect(0,0,parseInt(_getProperty('width', '100'))+14,23, 6);
		
		
		// indicate required field
		if(_featRequired==true)
		{
			_background.attr({fill: '90-#cc0000-#ffffff:20-#ffffff', stroke: '#a0a0a0'});
		} else
		{
			_background.attr({fill: '#ffffff', stroke: '#a0a0a0'});
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