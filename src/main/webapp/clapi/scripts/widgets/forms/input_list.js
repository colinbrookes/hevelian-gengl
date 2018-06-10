/**
 * (c) Brookes Management B.V. - Colin Brookes - 2012 
 */
 
 function MyQInputList(__id, __target, __xml)
 {
	 this.type											= 'ListInput';
 
 	var _id												= __id;
 	var _target										= __target;
 	var _xml											= __xml;
 	var _me											= this;
 	
 	var _properties									= [];
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
	this.fireOnClick									= function _onClick() { _handler.FireEvent(_id, 'onClick'); }
	
	this.fireOnChange								= function _onChange() { _handler.FireEvent(_id, 'onChange'); _handler.FireEvent(_id, 'Refresh');}
	this.fireOnBlur									= function _onBlur() { _handler.FireEvent(_id, 'onBlur'); }
	this.fireOnFocus								= function _onFocus() { _handler.FireEvent(_id, 'onFocus'); }
	
	var _featRequired								= false;
	
	function _draw()
	{
		if(_debug=="true") _addTimeline(_id, new Date(), null, 'draw text input');
		
		_setProperty('label', 						_xml.getAttribute('label'));
		_setProperty('enabled', 					_xml.getAttribute('enabled'));
		_setProperty('visible',						_xml.getAttribute('visible'));
		_setProperty('labelPlacement',		_xml.getAttribute('labelPlacement'));
		_setProperty('width',						_xml.getAttribute('width'));
		_setProperty('features',					_xml.getAttribute('features'));
		_setProperty('displayas',					_xml.getAttribute('displayAs'));
		_setProperty('size',							_xml.getAttribute('size'));
		_setProperty('src',							_xml.getAttribute('src'));
		_setProperty('labelsFrom',				_xml.getAttribute('labelsFrom'));
		_setProperty('valuesFrom',				_xml.getAttribute('valuesFrom'));
		_setProperty('defaultValue',			_xml.getAttribute('value'));
		
		if(_getProperty('visible')==null)							_setProperty('visible', 'true');
		if(_getProperty('enabled')==null)						_setProperty('enabled', 'true');
		if(_getProperty('labelPlacement')==null)				_setProperty('labelPlacement', 'right');
		if(_getProperty('displayas')==null)						_setProperty('displayas', 'combo');
		
		// process the features flags
		if(_getProperty('features','')!='')
		{
			var _feats = _getProperty('features').split(',');
			for(var i=0; i<_feats.length; i++)
			{
				switch(_feats[i])
				{
					case 'required':							_featRequired		= true;						break;
				}
			}
		}
		
		_handler.WantEvent(_id, _getProperty('src'), 'Refresh', 'Redraw', 'always');
		_renderInput();
		_redraw();
		
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
		var _element = document.getElementById("input_" + _id);
		if(_element!=null)
		{
			var _savedValue = (_element.options!=null && _element.options.length>0 && _element.selectedIndex>=0)? _element.options[_element.selectedIndex].value : _evaluate(_me, _getProperty('defaultValue', 'none'), false);
			
			try
			{
				var _collection 		= _getObjectByName(_getProperty('src', null), _me, _id);
				var _labelsFrom 		= _getProperty('labelsFrom', null);
				var _valuesFrom 		= _getProperty('valuesFrom', null);
				if(_labelsFrom==null) {return; }
				if(_valuesFrom==null) _valuesFrom = _labelsFrom;
				
				// now we need to get all items in the collection, and add the options to the element.
				if(_element.options!=null) _element.options.length = 0;
				var _allItems				= _collection.GetAllItems();

				for(var i=0; i<_allItems.length; i++)
				{
					var _item 		= _allItems[i];
					var _label 		= _item.GetProperty(_labelsFrom);
					var _value		= _item.GetProperty(_valuesFrom);
					
					_element.options[_element.options.length] = new Option(_label, _value);
					
					try {
						if(_value == _savedValue && _savedValue!=null) _element.selectedIndex = _element.options.length -1;
					} catch(e) { continue; } 
				}
				
			} catch(e) { console.log("Oops: " + e.message); }
		}
		
		_handler.FireEvent(_id, 'Refresh');
	}
	
	function _renderInput()
	{
		var _body									= null;
		var _strLabel 							= '';
		var _strInput								= '';
		
		var _inputDiv							= document.createElement('div');
		_inputDiv.style.overflow 			= 'hidden';
		_inputDiv.style.float 					= 'left';
		_inputDiv.style.position 			= 'absolute';
		_inputDiv.style.display				= 'block';
		_inputDiv.style.top 					= '0px';
		_inputDiv.style.left 					= '0px';
		_inputDiv.style.height				= ((parseInt(_getProperty('size', '1'),10)*24)) + 'px';
		_inputDiv.style.width 				= (parseInt(_getProperty('width', '100'),10)) + 'px';
		_inputDiv.style.border				= '0px solid green';
		_inputDiv.style.paddingLeft		= '0px';
		_inputDiv.style.paddingTop		= '0px';
		
		_strLabel 		= '<div id="label_'+_id+'" style="padding-left: '+(parseInt(_getProperty('width', '100'),10)+4)+'px; display: inline; width: 50px;  vertical-align: top; overflow: hidden; font-size: 11px">' +_evaluate(_me, _getProperty('label'),true) + '&nbsp;</div>';
		_strInput		= _displayAs();

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
		_body.style.verticalAlign	= 'top';
		_body.style.float				= 'left';
		
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
		_e.style.height				= ((parseInt(_getProperty('size', '1'),10)*24)) + 'px';
		
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
		var _element = document.getElementById("input_" + _id);
		if(_element!=null)
		{
			// first we set the value
			_element.value 						= _evaluate(_me, _getProperty('Value'), true);
//			_element.disabled					= (_getProperty('enabled', 'false')=='false')? true : false;
			(_getProperty('visible', 'true')=='false')? _hide() : _show();
			
			try {
			_element.onchange				= _me.fireOnChange;
			_element.onkeyup					= _me.fireOnKeyUp;
			_element.onfocus					= _me.fireOnFocus;
			_element.onblur					= _me.fireOnBlur;
			} catch(e) {}
		}
		
		
	}
	
	/**
	 *  displayAs renders the different list types, combo, select, radio and checkbox
	 */
	function _displayAs()
	{
		var _css 									= '';
		var _strInput								= '';
		
		switch(_getProperty('displayas'))
		{
			case 'select':
				_css 				= 'height: '+((parseInt(_getProperty('size', '3'),10)*24)-2)+'px; outline: none; line-height: 24px; border: 1px solid #a0a0a0; background-color: #ffffff; font-size: 11px;width: '+_getProperty('width', '100')+'px';
				_strInput		= '<select class="inputSelect" id="input_'+_id+'" style="'+_css+'" size="'+_getProperty('size', 3)+'"></select>';
				break;
				
			case 'radio':
			case 'checkbox':
				break;
				
			case 'combo':
			default:
				_css 				= 'height: 24px; outline: none; border: 1px solid #a0a0a0; background-color: #ffffff; font-size: 11px;width: '+_getProperty('width', '100')+'px';
				_strInput		= '<select class="inputSelect" id="input_'+_id+'" style="'+_css+'"></select>';
		}
		
		return _strInput;
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
				var _element = document.getElementById("input_" + _id);
				return (_element.value=="")? "true" : "false";
				
			case 'Value':
			case 'value':
				try {
					var _element = document.getElementById("input_" + _id);
					return _element.options[_element.selectedIndex].value;
				} catch(e) { }
				break;
				
			case 'Label':
			case 'label':
				try {
					var _element = document.getElementById("input_" + _id);
					return _element.options[_element.selectedIndex].label;
				} catch(e) { }
				break;
				
			default:
				for(var i=0; i<_properties.length; i++)
				{
					if(_properties[i].key==_name)
					{
						// return value or default if null
						if(_properties[i].value!=null) return _properties[i].value;
						
						return (_default==null)? "" : _default;
					}
				}
		}
		
		// not found
		return (_default==null)? "" : _default;
	}
 }