/**
 * (c) Brookes Management B.V. - Colin Brookes - 2012 
 */
 
 function MyQInputEditor(__id, __target, __xml)
 {
	 this.type										= 'EditorInput';
 
 	var _id											= __id;
 	var _target									= __target;
 	var _xml										= __xml;
 	var _me										= this;
 	
 	var _properties								= new Array();
	var _handler									= null;
	var _hideShowId							= __id;
	var _r											= null;
	var _background							= null;
	var _editor									= null;
 	
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
		
	function _draw()
	{
		if(_debug=="true") _addTimeline(_id, new Date(), null, 'draw editor');
		
//		_setProperty('enabled', 				_xml.getAttribute('enabled'));
		_setProperty('width',					_xml.getAttribute('width'));
		_setProperty('height',					_xml.getAttribute('height'));
		_setProperty('Value',					_xml.firstChild.nodeValue);
		
		_renderInput();
		_redraw();
		
		if(_debug=="true") _updateTimeline(_id, new Date());
	}
	
	function _redraw()
	{
//		return;
		
		// first we update the label
		
		var _label = document.getElementById('label_' + _id);
		if(_label!=null)
		{
			_label.innerHTML = _evaluate(_me, _getProperty('label'), false) + '&nbsp;';
		}
		
		// then the value
		// _editor.setContent(_evaluate(_me, _getProperty('Value', 'not found'), true));
	}
	
	function _renderInput()
	{
		var _body									= null;
		
		var _inputDiv							= document.createElement('div');
		_inputDiv.style.overflow 			= 'hidden';
		_inputDiv.style.float 					= 'left';
		_inputDiv.style.position 			= 'absolute';
		_inputDiv.style.display				= 'inline-block';
		_inputDiv.style.top 					= '0px';
		_inputDiv.style.left 					= '0px';
		_inputDiv.style.height				= (parseInt(_getProperty('height', '100'),10)) + 'px';
		_inputDiv.style.width 				= (parseInt(_getProperty('width', '100'),10)) + 'px';
		_inputDiv.style.border				= '0px solid green';
		_inputDiv.style.paddingLeft		= '6px';
		_inputDiv.style.paddingTop		= '3px';
		_inputDiv.setAttribute('id', _id);
		
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
//		_body.onmouseover		= _me.fireOnMouseOver;
//		_body.onmouseout		= _me.fireOnMouseOut;
//		_body.onload				= _me.fireOnLoad;
		
		
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
		_e.style.width				= (parseInt(_getProperty('width', '120'),10)+10) + 'px';
		_e.style.height				= parseInt(_getProperty('height', '30'),10) + 'px';
		
		_e.appendChild(_inputDiv);
		
		dhtmlx.image_path = _defaultImgsPath;
		_editor = new dhtmlXEditor(_id);
		
		_editor.tb.removeItem('applyH1');
		_editor.tb.removeItem('applyH2');
		_editor.tb.removeItem('applyH3');
		_editor.tb.removeItem('applyH4');
		_editor.tb.removeItem('separ01');
		
		_editor.tb.removeItem('alignLeft');
		_editor.tb.removeItem('alignCenter');
		_editor.tb.removeItem('alignRight');
		_editor.tb.removeItem('alignJustify');
		_editor.tb.removeItem('separ02');
		
		_editor.tb.removeItem('applySub');
		_editor.tb.removeItem('applySuper');
		_editor.tb.removeItem('separ03');
		
		_editor.tb.removeItem('increaseIndent');
		_editor.tb.removeItem('decreaseIndent');
		_editor.tb.removeItem('separ05');
		
		_editor.setContent(_evaluate(_me, _getProperty('Value', 'not found'), true));
		
		if(_hideShowId==_id)
		{
			_e.setAttribute('id', 'container_' + _id);
			_hideShowId = 'container_' + _id;
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
			case 'value':
				return _editor.getContent();
				break;
			
			case 'InHidden':
				var _div = document.getElementById(_hideShowId);
				return (_div.style.display=='none')? "true" : "false";
				break;
				
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