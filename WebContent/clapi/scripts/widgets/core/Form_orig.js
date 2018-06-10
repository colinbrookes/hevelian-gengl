/**
 * Form()
 * builds an input form based on an xml description of the form.
 * 
 * @param __formName
 * @returns {Form}
 */
function Form(__id, __form, __target)
{
	var _id				= __id;
	var _formName		= __id;
	var _form			= __form;
	var _target			= __target;
	var _control		= null;
	var _parent			= null;
	var _submitTo		= null;
	var _submitAs		= null;
	var _doc			= document;
	var _xmlText		= '';
	
	this.Draw					= _draw;
	this.GetFormObject			= _getFormObject;
	this.DisableField			= _disableField;
	this.resize					= function _resize(_paramW, _paramH) { return; }
	this.SetParent				= function _setParent(_val) { _parent = _val; }
	this.GetName				= function _getName() { return _formName; }
	this.GetId					= function _getId() { return _id; }
	this.SetDocument			= function _setDocument(_value) { _doc = _value; }
	this.SetEventHandler		= function _setEventHandler(__handler) { _handler = __handler; }
	this.GetId					= function _getID() { return _id; }
	this.SetValue				= _setValue;
	this.SetXML					= _setXML;
	this.Refactor				= _refactor;
	
	if(_form!=null)
	{
		_control		= _form.getElementsByTagName('control')[0];
		
		_submitTo		= getXMLNode(_control, 'SubmitTo', '');
		_submitAs		= getXMLNode(_control, 'SubmitAs', '');
		_submitType		= getXMLNode(_control, 'SubmitType', '');
		_submitText		= getXMLNode(_control, 'SubmitButtonText', '');
	}
	
	function _setXML(__xmlText)
	{
		_xmlText 		= __xmlText;
		_form 			= new sisXMLDocument(_xmlText);
		_control		= _form.getElementsByTagName('control')[0];
	}
	
	function _getFormObject()
	{
		return _doc.getElementById(_id);
	}
	
	function _disableField(_name)
	{
		var _field		= _doc.getElementById(_name);
		var _label		= _doc.getElementById('label_' + _name);
		
		if(_field!=null) _field.disabled = true;
		if(_label!=null) _label.style.color = '#707070';
	}
	
	function _setValue(_name, _value)
	{
		var _field		= _doc.getElementById(_name);
		if(_field!=null) _field.value = _value;
	}
	
	function _draw()
	{
		var _fields = _form.getElementsByTagName('field');
		var _str = '<form id="'+_id+'" method="post" action="javascript:void(null)" name="'+_formName+'">';
		 
		_str += '<xml id="formXML" style="display: none;">' + _xmlText + '</xml>';
		_str += '<input type="hidden" name="SubmitTo" value="'+_submitTo+'"/>';
		_str += '<input type="hidden" name="SubmitAs" value="'+_submitAs+'"/>';
		_str += '<input type="hidden" name="SubmitType" value="'+_submitType+'"/>';

		_str += '<center><table class="form_table" border="0" cellpadding="0" cellspacing="0" width="90%" style="font-family: Arial; font-size: 12px">';
		for(var i=0; i<_fields.length; i++)
		{
			var _field 			= _fields[i];
			var _html			= _formField(_field);
			var _fieldType		= _evaluateProperty(_field, 'type');
			var _fieldRequired 	= _evaluateProperty(_field, 'required');
			var _fieldName 		= getXMLNode(_field, 'name', 'unknown');
			
			/*
			if(_fieldType!='hidden')
			{
				_str += '<tr id="row_' + _fieldName + '" class="form_tr" style="vertical-align: top;">';
			} else
			{
				_str += '<tr id="row_' + _fieldName + '" class="form_tr" style="display: none">';
			}
			*/
			
			switch(_fieldType)
			{
			case 'hidden':
				_str += '<tr id="row_' + _fieldName + '" class="form_tr" style="display: none">';
				break;
				
			case 'label':
				_str += '<tr id="row_' + _fieldName + '" class="form_tr" style="vertical-align: top; background-color: #f0f0f0;">';
				break;
				
			default:
				_str += '<tr id="row_' + _fieldName + '" class="form_tr" style="vertical-align: top;">';
				break;
			}
			
			if(_fieldRequired!='false')
			{
				_str += '<td id="req_'+_fieldName+'" class="form_td" style="width: 20px; text-align: center; color: red; font-weight: bold; font-size: 20px;">&middot;</td>';
			} else
			{
				_str += '<td id="req_'+_fieldName+'" class="form_td" style="width: 20px; text-align: center; color: red; font-weight: bold; font-size: 20px;">&nbsp;</td>';
			}
			_str += '<td id="fld_' + _fieldName + '" class="form_td">' + _html + '</td>';
			_str += '</tr>';
		}
		
		_str += '<tr class="form_tr"><td class="form_td" colspan="2">&nbsp;</td></tr>';
		_str += '</table></center></form>';

		var _frame = _target.getFrame();
		var _body	= _frame.contentWindow.document.body;
		_body.style.overflow	='auto';
		_body.style.fontFamily	= 'Georgia';
		_body.style.fontSize	= '8px';
		
		this.SetDocument(_frame.contentWindow.document);
		_body.innerHTML = _str;
	}
	
	function _formField(_field)
	{
		var _fieldName 		= getXMLNode(_field, 'name', 'unknown');
		var _fieldType 		= _evaluateProperty(_field, 'type');
		var _fieldSize 		= _evaluateProperty(_field, 'size');
		var _fieldLabel 	= _evaluateProperty(_field, 'label');
		var _fieldRequired 	= _evaluateProperty(_field, 'required');
		var _fieldBinding 	= _evaluateProperty(_field, 'binding');

		return _renderField(_fieldName, _fieldType, _fieldSize, _fieldLabel, _fieldRequired, _fieldBinding);
	}
	
	function _renderField(_fieldName, _fieldType, _fieldSize, _fieldLabel, _fieldRequired, _fieldBinding)
	{
		switch(_fieldType)
		{
			case 'hidden': 		return _renderFieldTypeHidden(_fieldName, _fieldType, _fieldSize, _fieldLabel, _fieldRequired, _fieldBinding);
			case 'label': 		return _renderFieldTypeLabel(_fieldName, _fieldType, _fieldSize, _fieldLabel, _fieldRequired, _fieldBinding);
			case 'textarea': 	return _renderFieldTypeTextarea(_fieldName, _fieldType, _fieldSize, _fieldLabel, _fieldRequired, _fieldBinding);
			case 'password': 	return _renderFieldTypePassword(_fieldName, _fieldType, _fieldSize, _fieldLabel, _fieldRequired, _fieldBinding);
			case 'list': 		return _renderFieldTypeList(_fieldName, _fieldType, _fieldSize, _fieldLabel, _fieldRequired, _fieldBinding);
			case 'file':		return _renderFieldTypeFile(_fieldName, _fieldType, _fieldSize, _fieldLabel, _fieldRequired, _fieldBinding);
			case 'text':		return _renderFieldTypeText(_fieldName, _fieldType, _fieldSize, _fieldLabel, _fieldRequired, _fieldBinding);
		}
		
		return '';
	}
	
	function _renderFieldTypeFile(_fieldName, _fieldType, _fieldSize, _fieldLabel, _fieldRequired, _fieldBinding)
	{
		var _str = '';
		
		_str += '<input disabled id="'+_fieldName+'" name="'+_fieldName+'" type="text" style="padding-top: 2px; margin: 2px; font-size: 10px; line-height: 10px; height: 18px; width: '+_fieldSize+'px"/>';
		_str += '&nbsp;<button class="form" onclick="filePickWindow(\''+_fieldName+'\')">pick file</button>';
		_str += '&nbsp;&nbsp;' + '<span id="label_'+_fieldName+'">' +_fieldLabel + '</span>';
		
		return _str;
	}
	
	function _renderFieldTypeText(_fieldName, _fieldType, _fieldSize, _fieldLabel, _fieldRequired, _fieldBinding)
	{
		return '<input onKeyUp="parent.formRefactor(this)" onChange="parent.formRefactor(this)" id="'+_fieldName+'" name="'+_fieldName+'" type="text" style="padding-top: 2px; margin: 2px; font-size: 10px; line-height: 10px; height: 18px; width: '+_fieldSize+'px"/>&nbsp;&nbsp;&nbsp;' + '<span id="label_'+_fieldName+'">' +_fieldLabel + '</span>';
	}
	
	function _renderFieldTypeList(_fieldName, _fieldType, _fieldSize, _fieldLabel, _fieldRequired, _fieldBinding)
	{
		return fetchFormsListToSelect(_fieldBinding, _fieldName, _fieldSize) + '&nbsp;&nbsp;&nbsp;' + _fieldLabel;
	}
	
	function _renderFieldTypePassword(_fieldName, _fieldType, _fieldSize, _fieldLabel, _fieldRequired, _fieldBinding)
	{
		return '<input onChange="parent.formRefactor(this)" id="'+_fieldName+'" name="'+_fieldName+'" type="password" style="font-size: 10px; line-height: 10px; margin: 2px; padding-top: 2px; height: 18px; width: '+_fieldSize+'px"/>&nbsp;&nbsp;&nbsp;' + _fieldLabel;
	}
	
	function _renderFieldTypeTextarea(_fieldName, _fieldType, _fieldSize, _fieldLabel, _fieldRequired, _fieldBinding)
	{
		return '<textarea onChange="parent.formRefactor(this)" id="'+_fieldName+'" name="'+_fieldName+'" cols="'+_fieldSize+'" rows="10"></textarea>&nbsp;&nbsp;&nbsp;<span style="vertical-align: top">' + _fieldLabel + '</span>';
	}
	
	function _renderFieldTypeHidden(_fieldName, _fieldType, _fieldSize, _fieldLabel, _fieldRequired, _fieldBinding)
	{
		return '<input id="'+_fieldName+'" name="'+_fieldName+'" type="hidden"/>';
	}
	
	function _renderFieldTypeLabel(_fieldName, _fieldType, _fieldSize, _fieldLabel, _fieldRequired, _fieldBinding)
	{
		return '<p class="formLabel" style="line-height: 14px; font-weight: bold; font-size: 12px; padding-left: 4px; padding-top: 4px;">' + _fieldLabel + '</p>';
	}
	
	function _evaluateProperty(_field, _propName)
	{
		var _node = _field.getElementsByTagName(_propName);
		if(_node!=null && _node.length>0) _node = _node[0];
		
		// check for conditional content
		var _conditional = _node.getElementsByTagName('conditional');
		if(_conditional.length == 0)
		{
			// not conditional, so just return simple value
			return getXMLNode(_field, _propName, '');
		}
		
		// get the default condition
		var _default = getXMLNode(_conditional[0], 'default', '');
		return _default;
	}
	
	function _PropertyIsConditional(_field, _property)
	{
		var _node = _field.getElementsByTagName(_property);
		
		try {
			if(_node!=null && _node.length>0) _node = _node[0];
			var _conditional = _node.getElementsByTagName('conditional');
			if(_conditional.length > 0) return true;
		} catch(e) { }
		return false;
	}
	
	function _refactor(_changedField)
	{
		var _fields 	= _form.getElementsByTagName('field');
		
		for(var i=0; i<_fields.length; i++)
		{
			var _field			= _fields[i];
			var _fieldName		= getXMLNode(_field, 'name', '');
			var _fieldLabel		= getXMLNode(_field, 'label', '');
			var _fieldType		= _evaluateProperty(_field, 'type');
			var _fieldBinding 	= _evaluateProperty(_field, 'binding');
			var _fieldSize 		= _evaluateProperty(_field, 'size');
			var _fieldRequired	= _evaluateProperty(_field, 'required');
			
			if(_fieldType=='label') continue;
			
			var _fieldObj		= _doc.getElementById('fld_' + _fieldName);
			var _rowObj			= _doc.getElementById('row_' + _fieldName);
			var _fieldValue		= _doc.getElementById(_fieldName).value;
			
			var _props = ['type','binding'];
			for(var p=0; p<_props.length; p++)
			{
				try {
					if(_PropertyIsConditional(_field, _props[p]))
					{
						var _cond 		= _field.getElementsByTagName(_props[p])[0].getElementsByTagName('conditional')[0];
						var _def		= getXMLNode(_cond, 'default', '');
						var _conds		= _cond.getElementsByTagName('condition');
						var _matched	= false;
						
						for(var c=0; c<_conds.length; c++)
						{
							var _c 			= _conds[c];
							var _lhs		= _c.getAttribute('lhs');
							var _con		= _c.getAttribute('con');
							var _rhs		= _c.getAttribute('rhs');
							
							if(_hasConditionOnField(_changedField, _lhs, _rhs))
							{
								if(_conditionIsMatched(_changedField, _lhs, _con, _rhs)==true)
								{
									_matched			= true;
									var _newValue		= _c.firstChild.nodeValue;
									
									switch(_props[p])
									{
										case 'type':
											var _str = '';
											switch(_newValue)
											{
												case 'hidden':
													_rowObj.style.display = 'none';
													_str += _renderFieldTypeHidden(_fieldName, _fieldType, _fieldSize, _fieldLabel, _fieldRequired, _fieldBinding);
													break;
													
												case 'list':
													_rowObj.style.display = null; //'inline';
													_str += _renderFieldTypeList(_fieldName, _fieldType, _fieldSize, _fieldLabel, _fieldRequired, _fieldBinding);
													break;
												
												case 'file':
													_rowObj.style.display = null; //'inline';
													_str += _renderFieldTypeFile(_fieldName, _fieldType, _fieldSize, _fieldLabel, _fieldRequired, _fieldBinding);
													break;
													
												case 'text':
													_rowObj.style.display = null; //'inline';
													_str += _renderFieldTypeText(_fieldName, _fieldType, _fieldSize, _fieldLabel, _fieldRequired, _fieldBinding);
													break;
													
												case 'password':
													_rowObj.style.display = null; //'inline';
													_str += _renderFieldTypePassword(_fieldName, _fieldType, _fieldSize, _fieldLabel, _fieldRequired, _fieldBinding);
													break;
											}
											_fieldObj.innerHTML = _str;
											_setValue(_fieldName, _fieldValue);
											_fieldType = _newValue;
											break;
										
										case 'binding':
											var _fldtyp = _doc.getElementById(_fieldName).nodeName;
											if(_fldtyp=='SELECT')
											{
												_fieldObj.innerHTML = fetchFormsListToSelect(_newValue, _fieldName, _fieldSize)  + '&nbsp;&nbsp;&nbsp;' + _fieldLabel;
											}
											break;
											
										case 'size':
										case 'required':
									}
									
									break;
								}
							} else
							{
								_matched = true;
							}
						}
						
						if(_matched==false)
						{
							// we are conditional but no conditions are matched so we need to grab the default for this property
							switch(_props[p])
							{
								case 'type':
									var _str = '';
									switch(_def)
									{
										case 'hidden':
											_rowObj.style.display = 'none';
											_str += _renderFieldTypeHidden(_fieldName, _fieldType, _fieldSize, _fieldLabel, _fieldRequired, _fieldBinding);
											break;
											
										case 'list':
											_rowObj.style.display = null; //'inline';
											_str += _renderFieldTypeList(_fieldName, _fieldType, _fieldSize, _fieldLabel, _fieldRequired, _fieldBinding);
											break;
										
										case 'file':
											_rowObj.style.display = null; //'inline';
											_str += _renderFieldTypeFile(_fieldName, _fieldType, _fieldSize, _fieldLabel, _fieldRequired, _fieldBinding);
											break;
											
										case 'text':
											_rowObj.style.display = null; //'inline';
											_str += _renderFieldTypeText(_fieldName, _fieldType, _fieldSize, _fieldLabel, _fieldRequired, _fieldBinding);
											break;
											
										case 'password':
											_rowObj.style.display = null; //'inline';
											_str += _renderFieldTypePassword(_fieldName, _fieldType, _fieldSize, _fieldLabel, _fieldRequired, _fieldBinding);
											break;
											
									}
									_fieldObj.innerHTML = _str;
									_setValue(_fieldName, _fieldValue);
									_fieldType = _newValue;
									break;
								
								case 'binding':
									var _fldtyp = _doc.getElementById(_fieldName).nodeName;
									if(_fldtyp=='SELECT')
									{
										_fieldObj.innerHTML = fetchFormsListToSelect(_def, _fieldName, _fieldSize)  + '&nbsp;&nbsp;&nbsp;' + _fieldLabel;
									}
									break;
									
								case 'size':
								case 'required':
							}
						}
					}
				} catch(e) { }
			}
		}

	}
	
	function _conditionIsMatched(_changedField, _lhs, _con, _rhs)
	{
		var _lhsParts 	= _lhs.split('.');
		var _rhsParts 	= _rhs.split('.');
		var _valLHS		= _lhs;
		var _valRHS		= _rhs;
		
		if(_lhsParts[0] == '$field') _valLHS = _doc.getElementById(_lhsParts[1]).value;
		if(_rhsParts[0] == '$field') _valRHS = _doc.getElementById(_rhsParts[1]).value;

		switch(_con)
		{
			case 'EQ':
				if(_valLHS == _valRHS) { return true; }
				break;
				
			case 'NEQ':
				if(_valLHS != _valRHS) { return true; }
				break;
				
			case 'GT':
				if(_valLHS > _valRHS) { return true; }
				break;
				
			case 'LT':
				if(_valLHS < _valRHS) { return true; }
				break;
				
			case 'GTE':
				if(_valLHS >= _valRHS) { return true; }
				break;
				
			case 'LTE':
				if(_valLHS <= _valRHS) { return true; }
				break;
				
		}
		
		return false;
	}
	
	function _hasConditionOnField(_changedField, _lhs, _rhs)
	{
		var _lhsParts = _lhs.split('.');
		var _rhsParts = _rhs.split('.');
		
		if(_lhsParts[0] == '$field' && _lhsParts[1] == _changedField.id) return true;
		if(_rhsParts[0] == '$field' && _rhsParts[1] == _changedField.id) return true;
		
		return false;
	}
	
}

function formRefactor(_changedField)
{
	var _form = null;

	for(var i=0; i<_Objects.length; i++)
	{
		try {
		if(_Objects[i].key == _changedField.form.name)
		{
			_form = _Objects[i].value;
			break;
		}
		} catch(e) { }
	}

	if(_form!=null) _form.Refactor(_changedField);
	
}

function fetchFormsListToSelect(_listName, _selectName, _selectSize)
{
	var _parts = _listName.split(':');

	switch(_parts[0])
	{
		case 'list':
			return fetchListToSelectFromList(_parts[1], _selectName, _selectSize);
			break;
			
		case 'xml':
			return fetchListToSelectFromXML(_listName, _selectName, _selectSize);
			break;
	}
}

function fetchListToSelectFromXML(_listName, _selectName, _selectSize)
{
	var _parts 	= _listName.split(':');
	
	var _ajax	= new sisAJAXConnector();
	var _url	= _parts[1];
	
	_ajax.open('POST', GetURL(_url), false);
	_ajax.send('<test/>');

	var _str = '<select onChange="parent.formRefactor(this)" id="'+_selectName+'" name="'+_selectName+'" style="width:'+_selectSize+'px">';
	try
	{
		var _doc = new sisXMLDocument(_ajax.responseText);
		var _items = _doc.getElementsByTagName(_parts[2]);

		for(var i=0; i<_items.length; i++)
		{
			var _label = (_parts[4].substring(0,1)=='@')? _items[i].getAttribute(_parts[4].substring(1)) : _items[i].getElementsByTagName(_parts[4])[0].firstChild.nodeValue;
			var _value = (_parts[3].substring(0,1)=='@')? _items[i].getAttribute(_parts[3].substring(1)) : _items[i].getElementsByTagName(_parts[3])[0].firstChild.nodeValue;
			
			_str += '<option value="'+_value+'">'+_label+'</option>'
		}
	} catch(e) { }
	
	_str += '</select>';

	return _str;

}

function fetchListToSelectFromList(_listName, _selectName, _selectSize)
{
	var _ajax	= new sisAJAXConnector();
	var _url	= 'xml/lists/' + _listName + '.xml';

	_ajax.open('GET', GetURL(_url), false);
	_ajax.send(null);

	var _str = '<select onChange="parent.formRefactor(this)" id="'+_selectName+'" name="'+_selectName+'" style="width:'+_selectSize+'px">';
	try
	{
		var _doc = new sisXMLDocument(_ajax.responseText);
		var _items = _doc.getElementsByTagName('item');

		for(var i=0; i<_items.length; i++)
		{
			var _label = _items[i].getElementsByTagName("label")[0].firstChild.nodeValue;
			var _value = _items[i].getElementsByTagName("value")[0].firstChild.nodeValue;
			
			_str += '<option value="'+_value+'">'+_label+'</option>'
		}
	} catch(e) { }
	
	_str += '</select>';

	return _str;
}


_fuploadToolbar				= null;
_fuploadLayout				= null;
_fuploadGrid				= null;
_fieldUpdate				= null;
function filePickWindow(_fieldname)
{
	_fieldUpdate	 	= _fieldname;
	var _win 			= parent.dhxWins.createWindow('filePicker',50,0,400,500);
	
	_win.setModal(true);
	_win.center();
	_win.denyResize(true);
	_win.setText('files: ' + getCookie('pickPath'));

	_fuploadLayout = _win.attachLayout('2E');
	_fuploadLayout.attachEvent('onContentLoaded', _filePickerLoaded);
	_fuploadLayout.cells('a').hideHeader();
	_fuploadLayout.cells('b').hideHeader();
	_fuploadLayout.cells('b').setHeight(50);
	_fuploadLayout.cells('b').attachURL("../../FileUpload.html");
	
	_fuploadToolbar	= _fuploadLayout.cells('a').attachToolbar();
	_fuploadToolbar.setIconsPath("../../scripts/dhtmlx/dhtmlxToolbar/codebase/imgs/");
	_fuploadToolbar.addButton("use", "1", "pick selected file", "new.gif", "new_dis.gif");
	_fuploadToolbar.disableItem("use");
	_fuploadToolbar.attachEvent('onClick', _pickButtonClick);
	
	_fuploadGrid 	= _fuploadLayout.cells('a').attachGrid();
	_fuploadGrid.setHeader("name,size");
	_fuploadGrid.setInitWidths("250,*");
	_fuploadGrid.setColSorting("str,int");
	_fuploadGrid.setColAlign('left,right');
	_fuploadGrid.setColTypes("ro,ro");
	_fuploadGrid.attachEvent('onRowSelect', _enablePickButton);
	_fuploadGrid.init();
	_fuploadGrid.setImagePath("../../scripts/dhtmlx/dhtmlxGrid/codebase/imgs/");

}

function _pickButtonClick(_but)
{
	// picker button has been clicked
	if(_but=='use')
	{
		document.getElementById(_fieldUpdate).value = _fuploadGrid.cells(_fuploadGrid.getSelectedRowId(),0).getValue();
		parent.dhxWins.window('filePicker').close();
	}
	
}

function _enablePickButton(_item)
{
	if(_fuploadToolbar == null) return;
	
	_fuploadToolbar.enableItem("use");
}

function _filePickerLoaded(_id)
{
	var _ajax	= new sisAJAXConnector();
	var _url	= 'AutoDeployment?Action=ListFilesInFolder';

	_ajax.open('POST', _url, false);
	_ajax.send('<folder>' + getCookie('pickPath') + '</folder>');

	var _files = _ajax.responseXML.getElementsByTagName('file');
	var _a		= new Array();
	for(var i=0; i<_files.length; i++)
	{
		var _file = _files[i];
		var _size = _file.getAttribute('size');
		var _name = _file.firstChild.nodeValue;
		_a[i] = [_name,_size];
	}
	_fuploadGrid.clearAll();
	_fuploadGrid.parse(_a, "jsarray");
}

//utility to set the focus on the first editable field in the form
function findFocusField(doc)
{
	if(doc==null) return;
	if(doc.forms==null) return;
	if(doc.forms.length == 0) return;
	
	for(var i=0; i<doc.forms[0].elements.length; i++)
	{
		if(doc.forms[0].elements[i].type == "hidden") continue;
		
		doc.forms[0].elements[i].focus();
		break;
	}
	
	return;
}