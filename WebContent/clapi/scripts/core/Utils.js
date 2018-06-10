/**
 * Utils:
 * Miscellaneous functions for processing parameters and manipulating objects.
 */
 
function _getCollectionByName(_name, _fromObj)
{
	return _getObjectByName(_name, _fromObj);
}

/**
 * getObjectByName()
 * first looks for the specific object '_name' in the same instance as '_fromObj'. then looks for any other
 * object, in any instance, with _name.
 */
function _getObjectByName(_name, _fromObject, _forId)
{
	var _nameParts			= _name.split('.');
	var _fromParts			= (_fromObject!=null)? _fromObject.GetId().split('.') : null;
	var _object				= _getObjectByExactName(_name);
	
	if(_object!=null) return _object;
	
	if(_forId!=null)
	{
		_object = _getObjectByIterationId(_name, _fromObject, _forId);
		if(_object!=null) { return _object; }
	}
	
	if(_fromObject!=null) _object =  _getObjectByIterationId(_name, _fromObject, _fromObject.GetId());
	if(_object!=null) { return _object; }
	
	if(_nameParts.length==2)
	{
		_object = _getObjectByExactName(_name);
		if(_object==null)
		{
			if(_fromParts!=null && _fromParts.length==2)
			{
				_object = _getObjectByExactName(_fromParts[0] + '.' + _nameParts[1]);
				if(_object==null)
				{
					_object = _getObjectByExactName(_nameParts[1]);
					if(_object==null) _object = _getObjectByNearestName(_nameParts[1]);
					if(_object==null) _object = _getObjectByNearestName(_nameParts[0]);
				}
			} else
			{
				_object = _getObjectByExactName(_nameParts[1]);
				if(_object==null) _object = _getObjectByNearestName(_nameParts[1]);
				if(_object==null) _object = _getObjectByNearestName(_nameParts[0]);
			}
		}
	} else
	{
		if(_fromParts!=null && _fromParts.length==2)
		{
			_object = _getObjectByExactName(_fromParts[0] + '.' + _name);
			if(_object==null)
			{
				_object = _getObjectByNearestName(_name);
			}
		} else
		{
			_object = _getObjectByExactName(_name);
			if(_object==null) _object = _getObjectByNearestName(_name);
		}
	}

	if(_object==null)
	{
		// now we are desperate ... it must be embedded in a region or iteration of some kind ... could be many of them.
		_object = _getObjectWithoutRegionId(_name, _forId);
	}
	
	return _object;
}


function _getObjectWithoutRegionId(_name, _forId)
{
	var _forParts 		= (_forId==null)? [] : _forId.split('.');
	var _nameParts		= _name.split('.');
	
	
	for(var i=0; i<_Objects.length; i++)
	{
		try {
			var _objParts 	= _Objects[i].key.split('.');
			
			if(_forParts[0] == _objParts[0] && _nameParts[_nameParts.length-1] == _objParts[_objParts.length-1]) return _Objects[i].value;
		} catch(e) { }
	}
	
	return null;
}

function _getObjectByIterationId(_name, _fromObject, _forId)
{
	if(_forId==null) return null;
	
	var _forIdParts		= _forId.split('.');
	_forIdParts.length--;
	
	var _joinedParts 	= _forIdParts.join('.') + '.' + _name;
	var _object			= _getObjectByExactName(_joinedParts);
	if(_object!=null) return _object;
	
	while(_forIdParts.length>0)
	{
		var _findId			= _forIdParts.join('.');
		_findId += '.' + _name; // _findId.substr(0, _findId.lastIndexOf('_'));
		
		_object = _getObjectByExactName(_findId);
		if(_object!=null) return _object;
		
		_forIdParts.length--;
	}
	
	_forIdParts		= _forId.split('.');
	_forIdParts.length--;
	
	var _findId			= _forIdParts.join('.');
	_findId = _findId.substr(0, _findId.lastIndexOf('_'));
	
	return _getObjectByExactName(_findId);

}

function _getObjectByNearestName(_name)
{
	var _nameParts 	= _name.split('.');
	var _findPart	= (_nameParts.length>1)? _nameParts[1] : _nameParts[0];

	for(var i=0; i<_Objects.length; i++)
	{
		try {
		var _objParts 	= _Objects[i].key.split('.');
		var _findObj	= (_objParts.length>1)? _objParts[1] : _objParts[0];
		if(_findPart == _findObj) return _Objects[i].value;
		} catch(e) { }
	}
	
	return null;
}

function _getObjectByExactName(_name)
{
	for(var i=0; i<_Objects.length; i++) if(_name==_Objects[i].key) return _Objects[i].value;
	return null;
}

/**
 * findHTMLObject()
 * dhtmlx objects dont have an 'id' they have a an 'ida'. The main content div inside a layout
 * is typically called 'dhxMainCont' and we need to traverse the html hierarchy to find it so
 * that we can create custom elements inside it - primarily for the chart objects.
 */
function _findHTMLObject(_in, _ida)
{
	for(var i=0; i<_in.childNodes.length; i++)
	{
		try {
			if(_in.childNodes[i].getAttribute('ida')==_ida) return _in.childNodes[i];
			if(_in.childNodes[i].hasChildNodes()) var _node = _findHTMLObject(_in.childNodes[i], _ida);
			if(_node!=null) return _node;
		} catch(e) { }
	}
	
	return null;
}

function _findHTMLObjectBy(_in, _by, _is)
{
	for(var i=0; i<_in.childNodes.length; i++)
	{
		try {
			if(_in.childNodes[i].getAttribute(_by)==_is) return _in.childNodes[i];
			if(_in.childNodes[i].hasChildNodes()) var _node = _findHTMLObjectBy(_in.childNodes[i], _by, _is);
			if(_node!=null) return _node;
		} catch(e) { }
	}
	
	return null;
}

/**
 * _evaluate()
 * parses a string for vertical bars and try to convert the variables into values using a
 * simple object notation.
 */
function _evaluateORIG(_from, _this, _withEvents, _forId, __refresh)
{
	if(_this==null) return '';
	var _refresh		= (__refresh==null)? 'always' : __refresh;
	
	var _parts			= _this.split('|');
	var _str			= "";
	
	for(var i=0; i<_parts.length; i++)
	{
		if(i%2==0) { _str += _parts[i]; continue; }
		
//		var _mathParts = _mathEvaluate(_parts[i]);
		
		var _objParts		= _parts[i].split('.');
		
		// we need to trap events for the object and throw it at 'from' ...
		if(_withEvents==true)
		{
			if(_objParts.length==2)	_EventHandler.WantEvent(_from.GetId(), _objParts[0], 'Refresh', 'Redraw', _refresh);
			if(_objParts.length==3)	_EventHandler.WantEvent(_from.GetId(), _objParts[1], 'Refresh', 'Redraw', _refresh);
		}
		
		// we have a variable, so lets try and resolve it, otherwise we remove it
		var _obj			= _getObjectByName(_objParts[0], _from, _forId);
		if(_obj==null) 
		{
			if(_objParts[0]=='get') {
				// built-in case where we want to fetch a url parameter
				_str += decodeURIComponent(GetURLParameter(_objParts[1]));
				continue;
			}
			_log('DEBUG', _from, 'GetObjectByName Returned null for: ' + _objParts[0] + ' with ForId of: ' + _forId);
			continue;
		}
		
		
		// first case: is just a property of an object
		if(_objParts.length==2)
		{
			var _val	= _obj.GetProperty(_objParts[1]);
			if(_val!=null) _str += _val;
			continue;
		}
		
		// second case: is a property with sub-property - like a toolbar or menubar
		if(_objParts.length==3)
		{
			var _val = _obj.GetProperty(_objParts[1], _objParts[2]);
			if(_val!=null) _str += _val;
			continue;
		}
	}
	
	return _str;
}

function _evaluate(_from, _this, _withEvents, _forId, __refresh)
{
	if(_this==null) return '';
	var _refresh		= (__refresh==null)? 'always' : __refresh;
	
	var _parts			= _this.split('|');
	var _str			= "";
	var _vars			= [];
	
	try {
		for(var i=0; i<_parts.length; i++)
		{
			if(i%2==0) { _str += _parts[i]; continue; }
			
			if(_parts[i].charAt(0)!='*') {
				var _mathParts = _mathEvaluate(_parts[i]);
				for(var m=0; m<_mathParts.length; m++) {
					var p = _mathParts[m];
					var v = _variableEvaluate(_from, p, _withEvents, _forId, __refresh);
					
					_vars[_vars.length] = [p,v];
				}
				
				for(v=0; v<_vars.length; v++) {
					_parts[i] = _parts[i].replace(_vars[v][0], _vars[v][1]);
				}
				try {
					_str += math.eval(_parts[i]);				
				} catch(e) {
					_str += _parts[i];
				}				
			} else {
				// we do not want 'math' evaluation
				_str += _variableEvaluate(_from, _parts[i].substring(1), _withEvents, _forId, __refresh);
			}
		}
		
	} catch(e) {
		console.log(e);
	}
	
	return _str;
	
	// fallback if we find issues with the math library
//	return _evaluateORIG(_from, _this, _withEvents, _forId, __refresh);
}

function _variableEvaluate(_from, _this, _withEvents, _forId, __refresh) {

	var _refresh		= (__refresh==null)? 'always' : __refresh;
	var _objParts		= _this.split('.');
	var _str			= "";
	
	// we need to trap events for the object and throw it at 'from' ...
	if(_withEvents==true)
	{
		if(_objParts.length==2)	_EventHandler.WantEvent(_from.GetId(), _objParts[0], 'Refresh', 'Redraw', _refresh);
		if(_objParts.length==3)	_EventHandler.WantEvent(_from.GetId(), _objParts[1], 'Refresh', 'Redraw', _refresh);
	}
	
	// we have a variable, so lets try and resolve it, otherwise we remove it
	var _obj			= _getObjectByName(_objParts[0], _from, _forId);
	if(_obj==null) 
	{
		if(_objParts[0]=='get') {
			// built-in case where we want to fetch a url parameter
			_str += decodeURIComponent(GetURLParameter(_objParts[1]));
			return _str;
		}
		_log('DEBUG', _from, 'GetObjectByName Returned null for: ' + _objParts[0] + ' with ForId of: ' + _forId);
		return "";
	}
	
	
	// first case: is just a property of an object
	if(_objParts.length==2)
	{
		var _val	= _obj.GetProperty(_objParts[1]);
		if(_val!=null) return _val;
		return "";
	}
	
	// second case: is a property with sub-property - like a toolbar or menubar
	if(_objParts.length==3)
	{
		var _val = _obj.GetProperty(_objParts[1], _objParts[2]);
		if(_val!=null) return _val;
		return "";
	}

	return "";
}

/**
 * you can use complex mathematics inside the vertical bars to create any mathematical expression
 * you like, including nested parenthesis.
 * @param _str
 */
function _mathEvaluate(_str) {
	var _r = /([a-zA-Z]+[a-zA-Z0-9_]*\.[a-zA-Z0-9_]+[a-z]*(\.[a-z]+[a-zA-Z0-9_]*)?)/g;
	var m;
	
	var _parts = [];
	while((m = _r.exec(_str)) != null) {
		_parts[_parts.length] = m[0];
	}
	
	return _parts;
}

/**
 * parseBool()
 * converts a string boolean into a real boolean
 */
function _parseBool(_value)
{
	var _v = new String(_value);
	if(_value.toLowerCase()=="true") return true;
	return false;
}

/**
 * log()
 * adds a message to the logger grid if debug is enabled.
 */
var rowId = 0;
function _log(_level, _from, _msg)
{
	
	try {
		
		var _msgType = '';
		switch(_level)
		{
			case 'ERROR': 			_msgType = 'onError'; 			break;
			case 'WARNING': 		_msgType = 'onWarning'; 		break;
			case 'INFO': 				_msgType = 'onInfo'; 			break;
		}
		
		if(_EventHandler!=null && _msgType!='' && _from.GetId() != 'EventHandler')
		{
			_EventHandler.SetLastLogMessage(_level, _msg);
			_EventHandler.FireEvent(_from.GetId(), _msgType);
		}
		
	} catch(e) { }
	
	if(_debug!="true") return;

	try {
		var _state = _debugMessagesToolbar.getItemState('enabled');	
		if(_state == false) return;
		
		var _max = parseInt(_debugMessagesToolbar.getValue('msgMax'), 10);
		
		var _date = new Date();
		var _dateStr		= _date.getFullYear() + '-' + (_date.getMonth()+1) + '-' + _date.getDate() + ' ' + _date.getHours() + ':' + _date.getMinutes() + ':' + _date.getSeconds();
		var _id				= (_from==null || _from.GetId==null)? 'dont know' : _from.GetId();
	
		rowId++;
		_debugMessagesGrid.addRow(rowId, _dateStr + ',' + _level + ',' + _id + ',' + _msg, 0);
		
		// check to see if we have reached the max rows	
		if(_debugMessagesGrid.getRowsNum() >= _max)
		{
			var _rowId = _debugMessagesGrid.getRowId(_max);
			_debugMessagesGrid.deleteRow(_rowId);
		}
		
	} catch(e) { }
}

/**
 * processParameters()
 * processes a <parameters> section of a url or xml/wf collection and returns a string representing the
 * GET url parameters.
 */
function _processParameters(_xml, _collection, _handler, _event, __refresh, _forceDelim, _forId)
{
	var _src					= _xml.getAttribute('src');
	var _params			= _xml.getElementsByTagName('parameters');
	var _paramStr		= '';
	var _defEvent		= (_event!=null)? _event : 'FetchData';
	var _refresh			= (__refresh!=null)? __refresh : "always";
	var _failed				= false;
	var _prefix			= (_forId!=null)? _forId.split('.')[0] + '.' : '';
	
	if(_params==null) return '';
	if(_params[0]==null || _params[0].childNodes==null || _params[0].childNodes.length==0) return '';

	for(var i=0; i<_params[0].childNodes.length; i++)
	{
		var _param = _params[0].childNodes[i];
		if(_param.nodeType!=1) continue;
		
		var _paramName				= _param.nodeName;
		var _paramFrom				= _param.getAttribute('from');
		var _fromParts					= _paramFrom.split('.');
		var _ignoreMissing			= _param.getAttribute('ignoreMissing');
		var _paramRefresh			= _param.getAttribute('refresh');
		var _obj							= _getObjectByName(_prefix + _fromParts[0], _collection, _forId);
		
		if(_obj==null)
		{
			_log('DEBUG', null, 'Object Not Found in processParams:  ' + _prefix + _fromParts[0] + ' with ForID ' + _forId);
		}
		
		if(_paramRefresh==null) _paramRefresh = _refresh;
		
		// TODO - ClickedItem issue here from chart ...
		if(_paramRefresh!='once' && _paramRefresh!='never') 
		{
			(_fromParts.length==2)? _handler.WantEvent(_collection.GetId(), _fromParts[0], "Refresh", _defEvent, _paramRefresh) : _handler.WantEvent(_collection.GetId(), _fromParts[1], "Refresh", _defEvent, _paramRefresh);
		}
		
		var _paramValue = null;
		if(_obj==null)
		{
			if(_fromParts.length==1)
			{
				_paramValue = _paramFrom;
			} else
			{
				if(_ignoreMissing!='true')
				{
					_failed = true;
					//no we don't break out. If we do the event handlers will not be set for all other params
				}
				continue;
			}
		} else
		{
			_paramValue	= _obj.GetProperty(_fromParts[1], _fromParts[2]);
		}
		
		if(_paramValue!=null && _paramValue.length==0) 
		{
			if(_ignoreMissing!='true')
			{
				_failed = true;
				//again, no explicit break
			}
			continue;
		}
		
		_paramStr += (_paramStr.length==0)? '' : '&';
		_paramStr += _paramName + "=" + encodeURIComponent(_paramValue);
	}
	
	if(_failed==true) return null;
	if(_paramStr.length==0) return '';
	
	if(_src==null) return _paramStr;
	
	if(_forceDelim!=null) return _forceDelim + _paramStr;
	if(_src.indexOf('?',0)>=0) return '&' + _paramStr;
	return '?' + _paramStr;
}

/**
 * FindValueByKey()
 * Returns a value from an array of key-value pairs and returns the value for a given key.
 */
function _findValueByKey(_kvp, _key)
{
	for(var i=0; i<_kvp.length; i++) if(_kvp[i].key==_key) return _kvp[i].value;
	return '';
}

/**
 * kvp()
 * Adjusted KVP to allow for column level 'dirty' and 'built in' flag.
 * The kvp stores the value type as supplied by, for example, the jdbc connector.
 * The Refresh flag is used when the content contained evaluated values. The default is set
 * 'always' evaluate but can be changed to 'once' or 'never' as desired.
 */
function kvp(_key, _value, _type)
{
	this.key 			= _key;
	this.value 			= _value;
	this.type			= (_type!=null)? _type : 'str';
	
	this.isDirty		= false;
	this.isBuiltIn		= false;
	this.Refresh		= "always";
}

/**
 * findChild
 * look for an immediate descendent of _node with the name _name.
 */
function _findChild(_name, _node)
{
	if(_name==null || _node==null) return null;
	
	for(var i=0; i<_node.childNodes.length; i++)
	{
		if(_node.childNodes[i].nodeType==1 && _node.childNodes[i].nodeName.toLowerCase()==_name.toLowerCase())
		{
			return _node.childNodes[i];
		}
	}
	return null;
}

