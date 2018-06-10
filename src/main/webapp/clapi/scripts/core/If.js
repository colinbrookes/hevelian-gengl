/**
 * If Object.
 * Conditional content. Add content only when a simple condition has been met.
 */
 
function If(__id, __target, __xml)
{
	this.type								= 'If';
	
	var _id									= __id;
	var _xml								= __xml;
	var _hideShowId					= __id;
	var _target							= __target;
	var _dashboard						= null;
	var _me								= this;
	
	this.Draw								= _draw;
	this.Redraw							= _redraw;
	this.GetProperty					= function _getProperty(_name) { return ''; }
	this.GetAllProperties				= _getAllProperties;
	this.SetEventHandler				= function _setEventHandler(__handler) { _handler = __handler; }
	this.SetHideShowId				= function _setHideShowId(_value) { _hideShowId = _value; }
	this.SetDashboard					= function _setDashboard(_value) { _dashboard = _value; }
	this.GetId								= function _getID() { return _id; }
	
	/**
	 * GetAllProperties
	 * Returns an array of all the properties
	 * @returns {Array}
	 */
	function _getAllProperties()
	{
		var _ar = new Array();
		
		_ar[_ar.length]					= new kvp('id', _id);
		
		return _ar;
	}
	
	function _draw()
	{
		if(_debug=="true") _addTimeline(_id, new Date(), null, 'draw If');
		
		var _div = document.createElement('DIV');
		_div.setAttribute('id', 'container_' + _id);
		_target.appendChild(_div);
		
		_target = _div;
		_redraw(true);
		
		if(_debug=="true") _updateTimeline(_id, new Date());
	}
	
	function _redraw(_flag)
	{
		var _value		= _evaluate(_me, _xml.getAttribute('value'), true, _id);
		var _from		= _xml.getAttribute('equals');
		var _action 	= '=';
		var _parts		= _id.split('.');
		
		// now we see if the condition has been met or not ...
		if(_from==null) { _from = _xml.getAttribute('notEquals');			_action = '!=';	}
		if(_from==null) { _from = _xml.getAttribute('greaterThan'); 		_action = '>'; 	}
		if(_from==null) { _from = _xml.getAttribute('lessThan'); 			_action = '<'; 	}
		
		_from = _evaluate(_me, _from, false, _id);
		
		// now check the condition
		var _f_show		= false;
		switch(_action)
		{
			case '=':
				_f_show				= (_from == _value)? true : false;
				break;
				
			case '!=':
				_f_show				= (_from != _value)? true : false;
				break;
				
			case '>':
				_f_show				= (parseFloat(_value) > parseFloat(_from))? true : false;
				break;
				
			case '<':
				_f_show				= (parseFloat(_value) < parseFloat(_from))? true : false;
				break;
				
		}
		
		if(_f_show!=true)
		{
			_target.style.display 		= 'none';
			_target.innerHTML			= '';
			return;
		} else
		{
			_target.style.display 		= 'inline';
			try {
				_target.innerHTML			= '';
				var _prefix					= (_parts.length>1)? _parts[0] + '.' : '';
				var _snapTo					= _findChild('snapTo', _xml);
				
				for(var n=0; n<_xml.childNodes.length; n++)
				{
					var _node = _xml.childNodes[n];
					
					if(_node.nodeType!=1) continue;
					
					if(_snapTo!=null)
					{
						try {
							_dashboard.AddCellSnapTo({ id: _prefix + _node.getAttribute('id'), cell: _target, snap: _snapTo });
						} catch(e) { }
					}
						var _div = document.createElement('div');
						_div.setAttribute('id', _prefix + _node.getAttribute('id'));
						
						_target.appendChild(_div);
						
						if(_node.getAttribute('height')!=null)		_div.style.height 	= _node.getAttribute('height');
						if(_node.getAttribute('width')!=null)		_div.style.width	= _node.getAttribute('width');
						
					_dashboard.InitObject(_node, _div, _prefix);
				}
			} catch(e) { }
		}
		
/*		if(_flag==true || _f_show==true)
		{
			try {
					_target.innerHTML			= '';
					var _prefix					= (_parts.length>1)? _parts[0] + '.' : '';
					var _snapTo					= _findChild('snapTo', _xml);
					
					for(var n=0; n<_xml.childNodes.length; n++)
					{
						var _node = _xml.childNodes[n];
						
						if(_node.nodeType!=1) continue;
						
						if(_snapTo!=null)
						{
							try {
								_dashboard.AddCellSnapTo({ id: _prefix + _node.getAttribute('id'), cell: _target, snap: _snapTo });
							} catch(e) { }
						}
							var _div = document.createElement('div');
							_div.setAttribute('id', _prefix + _node.getAttribute('id'));
							
							_target.appendChild(_div);
							
							if(_node.getAttribute('height')!=null)		_div.style.height 	= _node.getAttribute('height');
							if(_node.getAttribute('width')!=null)		_div.style.width	= _node.getAttribute('width');
							
						_dashboard.InitObject(_node, _div, _prefix);
					}
				} catch(e) { }
		}
*/
	}
}