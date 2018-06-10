
// add the Layout object to the dictionary
_dictionary.words.set('toolbar', new DictionaryItem('toolbar', _initToolbar, Toolbar));

function _initToolbar(_node, _to, _prefix, _me)
{
	var _v_id			= _prefix + _node.getAttribute('id');
	
	var _object 		= new Toolbar(_v_id, _to, _node);
	_Objects[_Objects.length] 			= new kvp(_v_id, _object);
	_object.SetEventHandler(_EventHandler);
	
//	_addObject(_v_id, _object);
	
	for(var i=0; i<_node.childNodes.length; i++)
	{
		var _child = _node.childNodes[i];
		
		if(_child.nodeType!=1) continue;
		switch(_child.nodeName)
		{
			case 'toolInput':
				_object.AddTool('input', _child.getAttribute('id'), 
								null, null, null, null, null, null, null, null, null, null, null, 
								_child.getAttribute('width'), null);
				break;
				
			case 'toolButton':			
				_object.AddTool('button', _child.getAttribute('id'), 
								_child.getAttribute('icon'), _child.getAttribute('name'), 
								null, null, null, null, null, null, null, null, 
								_child.getAttribute('to'));
				break;
				
			case 'toolSeparator':
				_object.AddTool('separator', _child.getAttribute('id'),
								_child.getAttribute('icon'), _child.getAttribute('name'));
				break;
				
			case 'toolSelect':
				_object.AddTool('select', _child.getAttribute('id'),
								_child.getAttribute('icon'), null,
								_child.getAttribute('collection'), _child.getAttribute('label'), 
								_child.getAttribute('value'), _child.getAttribute('required'),
								null, null, null, null, null, _child.getAttribute('width'), _child.getAttribute('refresh'));
				break;
				
			case 'toolDate':
				_object.AddTool('date', _child.getAttribute('id'), null, null, null, null, null, null,
					 			_child.getAttribute('format'), _child.getAttribute('default'),
					 			_child.getAttribute('andTime'), _child.getAttribute('displayFormat'));
				break;
			
			case  'toolText':
				_object.AddTool('text', _child.getAttribute('id'), null, _child.getAttribute('name'),
				null, null, null, null, null, null, null, null, null, null,
				_child.getAttribute('refresh'));
				break;
		}
	}
	
	_object.Draw();
	
	return _object;
}


function Toolbar(__id, __target, __node)
{
	this.type					= 'Toolbar';
	
	// private data
	var _id						= __id;
	var _iconsPath				= __node.getAttribute('iconsPath');
	var _target					= __target;
	var _handler				= null;
	var _dhtmlxToolbar			= null;
	var _calendar				= null;
	var _tools					= [];
	var _me				 		= this;
	var _lastClicked			= '';
	
	this.Draw					= _draw;
	this.Redraw					= _redraw;
	this.GetProperty			= _getProperty;
	this.SetEventHandler		= function _setEventHandler(__handler) { _handler = __handler; }
	this.GetId					= function _getID() { return _id; }
	this.GetDHTMLXObject		= function _getDHTMLXObject() { return _dhtmlxToolbar; }
	this.AddTool				= _addTool;
	this.DateSelected			= _dateSelected;
	
	// for date tools we need some fixed values
	var _oneMillisecond			= 1;
	var _oneSecond				= 1000 * _oneMillisecond;
	var _oneMinute				= 60 * _oneSecond;
	var _oneHour				= 60 * _oneMinute;
	var _oneDay					= 24 * _oneHour;
	var _oneWeek				= 7 * _oneDay;

	// default callbacks are stored, so they can be fired anyway
	this.DefaultOnClick			= _fireOnClick;
	
	// overrides possible for callbacks on events
	this.CallbackOnClick		= _fireOnClick;
	this.FireOnChange			= _fireOnChange;
	
	if(_iconsPath==null || _iconsPath=='') _iconsPath = 'clapi/images/icons/';
	
	// fired events
	function _fireOnClick(_item)
	{
		var _parts		 = _item.split('^');
		_lastClicked	= _parts[1];
		
		_handler.FireEvent(_item, _parts[1]);
	}
	
	function _fireOnChange(_what)
	{
	
		var _item = _what.id + '^' + _what.value;
		if(_what.srcElement!=null) _item = _what.srcElement.id + '^' + _what.srcElement.value;
		
		_handler.FireEvent(_item, (_item.substring(0,3)=='...')? 'onSelectAll' : 'onSelectChange');
		_handler.FireEvent(_item, 'Refresh');
	}
	
	function _getProperty(_tool, _prop)
	{
		if(_tool=='lastClicked') return _lastClicked;
		
		for(var i=0; i<_tools.length; i++)
		{ 
			if(_tools[i].id==_tool) 
			{
				switch(_prop)
				{
					case 'Value':
					switch(_tools[i].type)
					{
						case 'input':
							return _dhtmlxToolbar.getValue(_id + "^" + _tools[i].id);
							break;
							
						case 'select':
							return document.getElementById(_tools[i].id+"^"+_tools[i].value).value;
							
						case 'date':
							// the date portion gets updated 'on change', but the time we get when someone
							// requests the value of the tool
							if(_tools[i].andtime=="true")
							{
								_elemHH			= document.getElementById(_tools[i].id + "_HH");
								_elemMM			= document.getElementById(_tools[i].id + "_MM");
								_tools[i].date.setHours(parseInt(_elemHH.value));
								_tools[i].date.setMinutes(parseInt(_elemMM.value));
							}
							return _tools[i].date.format(_tools[i].format);
					}
					break;
					
					case 'Label':
					switch(_tools[i].type)
					{
						case 'select':
							try {
								return document.getElementById(_tools[i].id+"^"+_tools[i].value)[document.getElementById(_tools[i].id+"^"+_tools[i].value).selectedIndex].innerHTML;
							} catch(e) { return ''; }
							
						case 'date':
							// the date portion gets updated 'on change', but the time we get when someone
							// requests the value of the tool
							if(_tools[i].andtime=="true")
							{
								_elemHH			= document.getElementById(_tools[i].id + "_HH");
								_elemMM			= document.getElementById(_tools[i].id + "_MM");
								_tools[i].date.setHours(parseInt(_elemHH.value));
								_tools[i].date.setMinutes(parseInt(_elemMM.value));
							}
							return _tools[i].date.format(_tools[i].display);
					}
					break;
				}
			}
		}
		return '';
	}
	
	function _addTool(_type, _id, _icon, _name, _collection, _label, _value, _required, _format, _default, _andTime, _display, _callback, _width, _refresh)
	{ 
		_tools[_tools.length] = new Tool(_type, _id, _icon, _name, _collection, _label, _value, _required, _format, _default, _andTime, _display, _callback, _width, _refresh); 
	}
	
	function _draw()
	{
		if(_debug=="true") _addTimeline(_id, new Date(), null, 'draw toolbar');
		
		_dhtmlxToolbar = (_target.attachToolbar!=null)? _target.attachToolbar() : new dhtmlXToolbarObject(_id);
		_dhtmlxToolbar.setIconsPath(_iconsPath);
		_dhtmlxToolbar.attachEvent("onClick", this.CallbackOnClick);
		
		
		for(var i=0; i<_tools.length; i++)
		{
			var _tool = _tools[i];
			switch(_tool.type)
			{
				case 'button': 		_dhtmlxToolbar.addButton(_id + "^" + _tool.id, i, _tool.name, _tool.icon, _tool.icon); break;
				case 'separator': 	_dhtmlxToolbar.addSeparator(i); break;
				case 'text':			_dhtmlxToolbar.addText(_id + "^" + _tool.id, i, _evaluate(_me, _tool.name, (_tool.refresh!='never')? true : false)); break;
				case 'select':			_drawSelect(i); break;
				case 'date':			_drawDateTime(i); break;
				case 'input':			_dhtmlxToolbar.addInput(_id + "^" + _tool.id, i, '', _tool.width);
			}
		}
		
		_redraw();
		
		if(_debug=="true") _updateTimeline(_id, new Date());
	}
	
	function _redraw(_item)
	{
//		alert(_item);
		var _parts		= (_item!=null)? _item.split('^'): null;
		
		for(var i=0; i<_tools.length; i++)
		{
			var _tool = _tools[i];
			
			switch(_tool.type)
			{
				case 'button':
					if(_tool.callback!=null)
					{
						// we need to add the automatic event stuff
						var _callBacks		= _tool.callback.split(',');
						
						for(var c=0; c<_callBacks.length; c++)
						{
							var _callback		= _callBacks[c];
							var _callParts		= _callback.split('.');
							_handler.WantEvent(_callParts[0], _id, _tool.id, _callParts[1], 'always');
						}
					}
					
				case 'text':
					_dhtmlxToolbar.setItemText(_id + "^" + _tool.id, _evaluate(_me, _tool.name, (_tool.refresh!='never')? true : false));
					break;
				
				case 'select':
					
					var _select				= document.getElementById(_tool.id+"^"+_tool.value);
					var _savedValue 		= _select.value;
					
					_select.options.length = 0;
					
					var __value 			= _evaluate(_me, _tool.value, true);
					var __label			= _evaluate(_me, _tool.label, true);
					var _collection 		= _getCollectionByName(_evaluate(_me, _tool.collection, true));
					var _values			= _collection.GetUnique(__value);
					
					if(_tool.required=="false") _select.options[_select.options.length] = new Option("Select...", "...");
					for(var o=0; o<_values.length; o++)
					{
						var _option 		= _values[o];
						var _label			= _collection.GetItemBy(__value, _option).GetProperty(__label);
						
						_select.options[_select.options.length] = new Option(_label, _option);
						if(_savedValue == _select.options[_select.options.length - 1].value && _savedValue!='' && _savedValue!=null) _select.options[_select.options.length -1].selected = true;
					}
				
					if(_EventHandler.GetProperty('LastRefreshFromId') != _tool.id) _fireOnChange(_select);	
					
					break;
					
			}
		}
	}
	
	/**
	 * DateSelected()
	 * Callback function attached to the calendar object to make sure the correct tool is updated
	 * with the new calendar date/time value.
	 */
	function _dateSelected(_date, _index)
	{
		var _tool = _tools[_index];
		_tool.date = _date;
		
		if(_tool.andtime=="true")
		{
			_elemHH			= document.getElementById(_tool.id + "_HH");
			_elemMM			= document.getElementById(_tool.id + "_MM");
			_tool.date.setHours(parseInt(_elemHH.value));
			_tool.date.setMinutes(parseInt(_elemMM.value));
		}

		_fireOnChange(_tool);

	}
	
	/**
	 * drawDateTime()
	 * creates a date [and optionally 'time'] field in the toolbar. We attach a calendar to the date field
	 * although it is also possible to manually update the date too. 
	 */
	function _drawDateTime(_index)
	{
		var _obj 			= _findHTMLObjectByClass(_target, 'float_left');
		var _elem			= _obj.ownerDocument.createElement('div');
		
		_elem.className 			= 'dhx_toolbar_text';
		_elem.style.border			= '0px solid blue';
		_elem.style.marginTop		= '4px';

		_obj.appendChild(_elem);
		
		var _str = '';
		
		_str += '<input id="'+_tools[_index].id+'" name="'+_tools[_index].id+'" type="text" value="YYYY-MM-DD" style="line-height: 10px; font-family: Tahoma; font-size: 11px; height:18px; width:75px; padding: 0px; margin: 0px; padding-top: 4px; background-color: #D9EAFF; border: 1px solid #FFFFFF"/>';
		_str += '&nbsp;';
		
		if(_tools[_index].andtime=="true")
		{
			_str += _drawHr(_index) + ":" + _drawMin(_index);
		}
		
		_elem.innerHTML = _str;
		_elemDate		= document.getElementById(_tools[_index].id);
		_elemHH			= document.getElementById(_tools[_index].id + "_HH");
		_elemMM			= document.getElementById(_tools[_index].id + "_MM");

		
		_tools[_index].calendar = new dhtmlXCalendarObject([_tools[_index].id]);
		_tools[_index].calendar.hideTime();
		_tools[_index].calendar.setDateFormat(_translateDateFormat(_tools[_index].display));
		_tools[_index].calendar.attachEvent("onClick", function(date) {_me.DateSelected(date, _index);});
		
		/**
		 * now we need to parse the date/time stuff to set the value.
		 */
		var _calcParts	= _tools[_index].def.split(' ');
		switch(_calcParts.length)
		{
			case 1:
				/* this means the value is probably 'now' because its just one word */
				break;
				
			case 2:
				/* this means the value is something like: '9:00 today' */
				_translate2PartFormat(_tools[_index].date, _calcParts[0], _calcParts[1]);
				break;
				
			case 3:
				/* this means the value is something like: '3 days ago' */
				_translate3PartFormat(_tools[_index].date, _calcParts[0], _calcParts[1], _calcParts[2]);
				break;
				
			default:
				alert("Unknown DEFAULT value '" + _tools[_index].def + "' for " + _tools[_index].id);
				break;
		}
		
		_elemDate.value = _tools[_index].date.format(_tools[_index].display);
		if(_tools[_index].andtime=="true")
		{
			_elemHH.value = _tools[_index].date.format('HH');
			_elemMM.value = _tools[_index].date.format('MM');
			
			_elemHH.setAttribute('onTouchStart', 'this.focus()');
			_elemMM.setAttribute('onTouchStart', 'this.focus()');
			
		}
	}
	
	function _translate3PartFormat(_date, _num, _unit, _ago)
	{
		var _now		= _date.getTime();
		switch(_unit)
		{
			case 'minute':
			case 'minutes':
				_now	-= parseInt(_num) * _oneMinute;
				break;
				
			case 'hour':
			case 'hours':
				_now	-= parseInt(_num) * _oneHour;
				break;
				
			case 'day':
			case 'days':
				_now	-= parseInt(_num) * _oneDay;
				break;
				
			case 'week':
			case 'weeks':
				_now	-= parseInt(_num) * _oneWeek;
				break;
				
			/* the following are more complex cases */
			
			case 'month':
			case 'months':
				var _years  = parseInt(parseInt(_num) / 12);
				var _months = parseInt(_num) % 12;
				_date.setYear(_date.getFullYear() - _years);
				if(_date.getMonth() < _months)
				{
					_date.setFullYear(_date.getFullYear() - 1);
					_date.setMonth(11 - (_months - _date.getMonth()));
				} else
				{
					_date.setMonth(_date.getMonth() - _months);
				}
				return;
				
			case 'year':
			case 'years':
				var _year = _date.getFullYear() - parseInt(_num);
				_date.setFullYear(_year);
				return;
		}
		
		_date.setTime(_now);
	}
	
	function _translate2PartFormat(_date, _time, _day)
	{
		var _timeParts		= _time.split(':');
		if(_timeParts.length!=2) { alert('Invalid DEFAULT TIME value ' + _time); return; }
		if(_day!='today' && _day!='yesterday') {alert('Invalid DEFAULT DAY value ' + _day); return; }
		
		var _now			= _date.getTime();
		if(_day=='yesterday') _now = _now - _oneDay;
		
		// adjust the date object value
		_date.setTime(_now);
		_date.setHours(parseInt(_timeParts[0]));
		_date.setMinutes(parseInt(_timeParts[1]));
		
	}
	
	function _translateDateFormat(_from)
	{
		var _to		= _from;
		
		_to			= _to.replace("yyyy", "%Y");
		_to			= _to.replace("yy", "%y");
		_to			= _to.replace("dd", "%d");
		_to			= _to.replace("mm", "%m");
		
		return _to;
	}
	
	function _pad(_num)
	{
		return (_num<10)? "0" + _num : _num; 
	}
	
	function _drawHr(_index)
	{
		var _str = '';
		
		_str += '<select id="'+_tools[_index].id+'_HH" class="none" style="';
		_str += 'vertical-align: top; background-color: #D9EAFF; border: 1px solid #FFFFFF; line-height:10px font-family: Tahoma; font-size:11px; height: 18px; width: 50px; padding: 0px; margin: 0px;';
		_str += '">';
		
		for(var i=0; i<24; i++) _str += '<option value="'+_pad(i)+'">'+_pad(i)+'</option>';
		
		_str += '</select>';
		
		return _str;
	}
	
	function _drawMin(_index)
	{
		var _str = '';
		
		_str += '<select id="'+_tools[_index].id+'_MM" class="none" style="';
		_str += 'vertical-align: top; background-color: #D9EAFF; border: 1px solid #FFFFFF; line-height:10px font-family: Tahoma; font-size:11px; height: 18px; width: 50px; padding: 0px; margin: 0px;';
		_str += '">';
		
		for(var i=0; i<60; i++) _str += '<option value="'+_pad(i)+'">'+_pad(i)+'</option>';
		
		_str += '</select>';
		return _str;
	}
	
	function _drawSelect(_index)
	{
		var _obj 			= _findHTMLObjectByClass(_target, 'float_left');
		var _rootElem		= _obj.ownerDocument.createElement('div');
		
		_rootElem.className 			= 'dhx_toolbar_text';
		_rootElem.style.border			= '0px solid blue';
		_rootElem.style.marginTop		= '4px';
		
		_obj.appendChild(_rootElem);
	
		var _selectElem		= _obj.ownerDocument.createElement('select');
		_selectElem.setAttribute('id', _tools[_index].id+'^'+_tools[_index].value);
		_selectElem.style.backgroundColor	= '#D9EAFF';
		_selectElem.style.border			= '1px solid #FFFFFF';
		_selectElem.style.fontFamily		= 'Tahoma';
		_selectElem.style.fontSize			= '11px';
		_selectElem.style.height			= '18px';
		_selectElem.style.margin			= '0px';
		_selectElem.style.padding			= '0px';
		_selectElem.style.width				= _tools[_index].width + 'px';
		
		_selectElem.setAttribute('onChange', '_getObjectByName(\''+_id+'\').FireOnChange(this)');
		_selectElem.setAttribute('onTouchStart', 'this.focus()');

		try {
			_selectElem.attachEvent('onchange', _me.FireOnChange);
		} catch(e) { }
		
		_selectElem.onChange = '_getObjectByName(\''+_id+'\').FireOnChange(this)';
		_rootElem.appendChild(_selectElem);
		
		if(_tools[_index].refresh!='never') _handler.WantEvent(_id, _tools[_index].collection, 'Refresh', 'Redraw', (_tools[_index].refresh==null)?'always':_tools[_index].refresh);
	}
	
	function _findHTMLObjectByClass(_in, _ida)
	{
		for(var i=0; i<_in.childNodes.length; i++)
		{
			try {
				if(_in.childNodes[i].getAttribute('class')==_ida || _in.childNodes[i].getAttribute('className')== _ida) return _in.childNodes[i];
				if(_in.childNodes[i].childNodes.length!=0) var _node = _findHTMLObjectByClass(_in.childNodes[i], _ida);
				if(_node!=null) return _node;
			} catch(e) { }
		}
		
		return null;
	}
	
}

function Tool(_type, _id, _icon, _name, _collection, _label, _value, _required, _format, _default, _andTime, _display, _callback, _width, _refresh)
{

	this.GetId			= function() { return _id; }
	
	this.type		= _type;
	this.id			= _id;
	this.icon		= _icon;
	this.name		= _name;
	this.refresh	= _refresh;
	
	// for the buttons we do auto-events too
	this.callback	= _callback;
	
	// for select boxes we need some extra stuff ...
	this.collection	= _collection;
	this.label		= _label;
	this.value		= _value;
	this.required	= _required;
	this.width		= (_width!=null)? _width : '150';
	
	// extra stuff for date/time tool
	this.calendar	= null;
	this.format		= _format;
	this.def		= _default;
	this.andtime	= _andTime;
	this.display	= _display;
	this.date		= new Date();
}
