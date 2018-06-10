/**
 * ForEach Object.
 * Allows you to create an object instance for each item in a collection.
 */
 
function ForEach(__id, __target, __xml)
{
	this.type						= 'ForEach';
	
	var _id							= __id;
	var _xml						= __xml;
	var _hideShowId			= __id;
	var _target					= __target;
	var _dashboard				= null;
	var _collection				= null;
	var _allItems					= new Array();
	var _curItem					= 0;
	var _me						= this;
	
	var _f_first					= false;
	
	this.Draw						= _draw;
	this.Redraw					= _redraw;
	this.GetProperty			= _getProperty;
	this.GetAllProperties		= _getAllProperties;
	this.SetEventHandler		= function _setEventHandler(__handler) { _handler = __handler; }
	this.SetHideShowId		= function _setHideShowId(_value) { _hideShowId = _value; }
	this.SetDashboard			= function _setDashboard(_value) { _dashboard = _value; }
	this.GetId						= function _getID() { return _id; }
	
	this.GotoFirst				= _gotoFirst;
	this.GotoLast				= _gotoLast;
	
	function _gotoFirst()
	{
		_curItem 		= 0;
		_f_first		= false;
	}
	
	function _gotoLast()
	{
		_curItem		= _allItems.length-1;
	}
	
	function _getAllProperties()
	{
		var _ar = new Array();
		
		try {
			_ar[_ar.length]						= new kvp('id', _id);
			_ar[_ar.length]						= new kvp('CollectionName', _me.GetProperty('CollectionName'));
			_ar[_ar.length]						= new kvp('COUNT', _me.GetProperty('COUNT'));
		} catch(e) { }
		
		return _ar;
	}
	
	function _getProperty(_name)
	{
		switch(_name)
		{
			case 'NEXT':
				if(_f_first==false)
				{
					_f_first = true;
					return _allItems[_curItem].GetAllProperties()[0].value;
				}
				_curItem++;
				if(_curItem==_allItems.length)
				{
					 _handler.FireEvent(_id, 'Reset');
					 _curItem=0;
				}
				
				return  _allItems[_curItem].GetAllProperties()[0].value;
				break;
				
			case 'PREVIOUS':
				break;
				
			case 'Value':
				return  _allItems[_curItem].GetAllProperties()[0].value;
				break;
				
			case 'COUNT':
				return _allItems.length;
				break;
				
			case 'CollectionName':
				return _collection.GetId();
				break;
				
			default:
				if(_allItems!=null)
				{
					var _item	= _allItems[_curItem];			
					return _item.GetProperty(_name);
				}
				return '';
		}
	}
	
	function _draw()
	{
		if(_debug=="true") _addTimeline(_id, new Date(), null, 'draw forEach');
		
		var _div = document.createElement('DIV');
		
		_div.style.display	= 'inline-block';
		_div.style.float	= 'left';
		
		_div.setAttribute('id', 'forEach_' + _id);
		_target.appendChild(_div);
		
		_target = _div;
		_redraw();
		
//		LateLoading();
		
		if(_debug=="true") _updateTimeline(_id, new Date());
	}
	
	function _redraw()
	{
		_target.innerHTML				= '';
		_curItem						= 0;
		_f_first						= false;
		_collection						= _getObjectByName(_evaluate(_me, _xml.getAttribute('ItemInCollection'), true, _id), _me, _id);
		if(_collection==null)
		{
			alert('cannot find collection: ' + _xml.getAttribute('ItemInCollection'));
			return;
		}
		
		_handler.WantEvent(_id, _collection.GetId(), "Refresh", "Redraw", "always");
		
		for(var i=0; i<_allItems.length; i++)
		{
			_dashboard.RemoveObjectsForInstance(_id + '_' + i);
			_handler.CancelEventsForInstance(_id + '_' + i);
		}
		
		_allItems			= _collection.GetAllItems();
		
		var _snapTo		= _findChild('snapTo', _xml);
		for(var i=0; i<_allItems.length; i++)
		{
			_curItem 		= i;
			var _prefix		= _id + '_' + i + '.';
			var _divMain 		= document.createElement('div');
			
			_divMain.style.display = 'inline-block';
			_divMain.style.float = 'left';
			
			_divMain.setAttribute('id', 'container_' + _id + '_' + i);
			_target.appendChild(_divMain);
			
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
				_div.style.display 	= 'inline-block';
				_div.style.float	= 'left';
				
				_div.setAttribute('id','inner_' +  _prefix + _node.getAttribute('id'));
				_divMain.appendChild(_div);

				var _object = _dashboard.InitObject(_node, _div, _prefix);
				
			}
		}
		LateLoading();
	}
}
 