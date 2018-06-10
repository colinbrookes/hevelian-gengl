/**
 * Form()
 * builds an input form based on an xml description of the form.
 * 
 * @param __formName
 * @returns {Form}
 */
function Form(__xml)
{
	this.type					= 'Form';
	
	var _id				= __xml.getAttribute('id');
	var _collection		= __xml.getAttribute('collection');
	var _formName		= _id;
	var _handler		= null;
	var _sets			= [];
	
	this.SetEventHandler		= function _setEventHandler(__handler) { _handler = __handler; }
	this.GetId					= function _getID() { return _id; }
	this.AddFormFieldSet		= function _addFormFieldSet(_set) { _sets[_sets.length] = _set; }
	this.Draw					= _draw;
	
	function _draw()
	{
		// nothing to draw for a form ...
	}	
}

function FormFieldSet(__id, __target, __prefix, __xml)
{
	this.type					= 'FormFieldSet';
	
	var _id						= __prefix + __id;
	var _target					= __target;
	var _prefix					= __prefix;
	var _xml					= __xml;
	var _form					= null;
	var _fields					= [];
	var _backgroundColor		= __xml.getAttribute('backgroundColor');
	
	this.SetEventHandler		= function _setEventHandler(__handler) { _handler = __handler; }
	this.GetId					= function _getID() { return _id; }
	this.SetForm				= function _setForm(_value) { _form = _value; }
	this.AddField				= _addField;
	this.Draw					= _draw;
	
	function _draw()
	{
		var _str = '';
		
		_str += '<center><table class="form_table" border="0" cellpadding="0" cellspacing="0" width="90%" style="font-family: Arial; font-size: 12px">';
		
		for(var i=0; i<_fields.length; i++)
		{
			_str += _fields[i].Draw();
		}
		
		_str += '<tr class="form_tr"><td class="form_td" colspan="2">&nbsp;</td></tr>';
		_str += '</table></center>';
		
		// now the actual rendering of the HTML into the view.
		var _frame = _target.getFrame();
		var _body	= _frame.contentWindow.document.body;
		
		// do some styling
		if(_backgroundColor!=null) _body.style.backgroundColor = _backgroundColor;
		_body.style.overflow	='auto';
		_body.style.fontFamily	= 'Tahoma';
		_body.style.fontSize	= '12px';
		_body.innerHTML			= _str;
	}
	
	function _addField(_node)
	{
		_fields[_fields.length] = new FormField(_node);
	}
}

function FormField(_node)
{
	this.node				= _node;
	this.type				= _node.nodeName;
	this.id					= _node.getAttribute('id');
	this.label				= _node.getAttribute('label');
	this.width				= _node.getAttribute('width');
	this.height				= _node.getAttribute('height');
	this.validate			= _node.getAttribute('validate');
	this.enabled			= _node.getAttribute('enabled');
	this.align				= _node.getAttribute('align');
	this.visible			= _node.getAttribute('visible');
	
	var _cssAll		= 'font-family: Tahoma; font-size: 12px; line-height: 16px; padding-top: 0px; margin: 0px;';
	var _validates	= (this.validate!=null)? this.validate.split(',') : [];
	var _me			= this;
	
	this.Draw		= _draw;
	
	function _draw()
	{
		var _str = '';
		
		switch(_me.type)
		{
		case 'inputHidden':
			_str += '<tr id="row_' + _me.id + '" class="form_tr" style="display: none">';
			break;
			
		case 'inputLabel':
			_str += '<tr id="row_' + _me.id + '" class="formLabel">';
			break;
			
		default:
			_str += '<tr id="row_' + _me.id + '" class="form_tr" style="vertical-align: top;">';
			break;
		}
		
		if(_hasValidate('NotEmpty'))
		{
			_str += '<td id="req_'+_me.id+'" class="form_td" style="width: 20px; text-align: center; color: red; font-weight: bold; font-size: 20px;">&middot;</td>';
		} else
		{
			_str += '<td id="req_'+_me.id+'" class="form_td" style="width: 20px; text-align: center; color: red; font-weight: bold; font-size: 20px;">&nbsp;</td>';
		}
		_str += '<td id="fld_' + _me.id + '" class="form_td">'
		
		switch(_me.type)
		{
			case 'inputHidden': 	_str += _renderFieldTypeHidden();			break;
			case 'inputLabel': 		_str += _renderFieldTypeLabel();			break;
			case 'inputTextarea': 	_str += _renderFieldTypeTextarea();			break;
			case 'inputPassword': 	_str += _renderFieldTypePassword();			break;
			case 'inputList':		_str += _renderFieldTypeList();				break;
			case 'inputFile':		_str += _renderFieldTypeFile();				break;
			case 'inputText':		_str += _renderFieldTypeText();				break;
			case 'inputButton':		_str += _renderFieldTypeButton();			break;
			default:
				alert("UNKNOWN FIELD TYPE: " + _me.type);
		}
		
		_str += '</td></tr>';
		
		return _str;
	}
	
	function _hasValidate(_validateName)
	{
		if(_validates==null) return;
		for(var i=0; i<_validates.length; i++) if(_validates[i]==_validateName) return true;
		return false;
	}
	
	function _renderFieldTypeButton()
	{
		var _str = '';
		
		_str += '<button id="'+_me.id+'" style="border: 0px; line-height: 16px;"';
		_str += '>';
		if(_me.node.getAttribute('icon')!=null)
		{
			_str += '<img style="vertical-align: top;" height="14px; border: 0px"';
			_str += ' src="clapi/images/icons/'+_me.node.getAttribute('icon')+'"/>&nbsp;';
		}
		_str += '<span style="vertical-align: top">' + _me.label + '</span>';
		_str += '</button>';
		
		return _str;
	}
	
	function _renderFieldTypeText()
	{
		var _css = _cssAll + 'height: 20px; width: '+_me.width+'px';
		var _str = '';
		
		_str += '<input id="'+_me.id+'" name="'+_me.id+'" type="text" style="'+_css+'"/>';
		_str += '&nbsp;<img src="clapi/images/icons/info.png" height="14px" style="vertical-align: top; padding-top: 3px;"/>';
		_str += '&nbsp;&nbsp;' + '<span id="label_'+_me.id+'" style="vertical-align: top;">' +_me.label + '</span>';
		
		return _str;
	}
	
	function _renderFieldTypePassword()
	{
		var _css = _cssAll + ' height: 20px; width: '+_me.width+'px';
		return '<input id="'+_me.id+'" name="'+_me.id+'" type="password" style="'+_css+'"/>&nbsp;&nbsp;&nbsp;' + _me.label;
	}
	
	function _renderFieldTypeTextarea()
	{
		var _css = _cssAll; //'font-size: 12px; line-height: 20px;';
		return '<textarea " id="'+_me.id+'" name="'+_me.id+'" cols="'+_me.width+'" rows="10" style="'+_css+'"></textarea>&nbsp;&nbsp;&nbsp;<span style="vertical-align: top">' + _me.label + '</span>';
	}
	
	function _renderFieldTypeHidden()
	{
		return '<input id="'+_me.id+'" name="'+_me.id+'" type="hidden"/>';
	}

	function _renderFieldTypeLabel()
	{
		var _css = 'font-size: 12px;font-weight: bold;line-height: 20px;padding-top: 6px;border-bottom: 1px solid black;';
		return '<h2 style="'+_css+'">' + _me.label + '</h2>';
	}
}
