/**
 * Region Object.
 * Similar to a panel, except this allows you to define a group of components as a set, which can then be multi-instanced within the region.
 */

// add the Layout object to the dictionary
_dictionary.words.set('region', new DictionaryItem('region', _initRegion, Region));

function _initRegion(_node, _to, _prefix, _me)
{
	var _n_id				= _prefix + _node.getAttribute('id');
	var _div_hide			= _node.getAttribute('HideOnOpen');

	var _container			= new Container(_node, _n_id, _to, _prefix);
	var _toNode 			= _container.target;
	
	var _object				= new Region(_n_id, _toNode, _node);
	
	_object.SetDashboard(_me);
	
	_addEffectsTo(_node, _object, _container, _n_id);
	
	if(_container.hideShowId!=null) _object.SetHideShowId(_container.hideShowId);
	_object.SetEventHandler(_EventHandler);
	_Objects[_Objects.length] 			= new kvp(_n_id, _object);
	
	_object.Draw();
	
	if(_div_hide!=null && _div_hide=="true") _object.Hide();
	
	return _object;
}


function Region(__id, __target, __xml)
{
	this.type						= 'Region';
	
	var _id							= __id;
	var _xml						= __xml;
	var _hideShowId					= __id;
	var _target						= __target;
	var _dashboard					= null;
	var _collection					= null;
	var _itemCnt					= 1;
	var _curItem					= 0;
	var _me							= this;
	
	var _f_first					= false;
	
	this.Draw						= _draw;
	this.Redraw						= _redraw;
	this.GetProperty				= _getProperty;
	this.SetEventHandler			= function _setEventHandler(__handler) { _handler = __handler; }
	this.SetHideShowId				= function _setHideShowId(_value) { _hideShowId = _value; }
	this.SetDashboard				= function _setDashboard(_value) { _dashboard = _value; }
	this.GetId						= function _getID() { return _id; }
	
	this.GotoFirst					= _gotoFirst;
	this.GotoLast					= _gotoLast;
	
	this.Hide						= _hide;
	this.Show						= _show;
	this.ToggleHideShow				= _toggleHideShow;
	
	// event firing methods
	this.fireOnMouseOut				= function _onMouseOut(_e) { _handler.FireEvent(_id, 'onMouseOut'); _cancelBubble(_e); }
	this.fireOnMouseOver			= function _onMouseOver(_e) { _handler.FireEvent(_id, 'onMouseOver'); _cancelBubble(_e); }
	this.fireOnLoad					= function _onLoad() { _handler.FireEvent(_id, 'onLoad'); }
	this.fireOnClick				= function _onClick() { _handler.FireEvent(_id, 'onClick'); }
	
	function _cancelBubble(e)
	{
		if (!e) var e = window.event;
		e.cancelBubble = true;
		if (e.stopPropagation) e.stopPropagation();
		if (e.preventDefault) e.preventDefault();
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

	function _gotoFirst()
	{
		_curItem 			= 0;
		_f_first			= false;
	}
	
	function _gotoLast()
	{
		_curItem				= _itemCnt-1;
	}
	
	function _getProperty(_name)
	{
		return '';
	}
	
	function _draw()
	{
		if(_debug=="true") _addTimeline(_id, new Date(), null, 'draw Region');
		
		var _div = document.createElement('DIV');
		_div.setAttribute('id', 'Region_' + _id);
		_target.appendChild(_div);
		
		_target = _div;

		_target.addEventListener('mouseover', _me.fireOnMouseOver, false);
		_target.addEventListener('mouseout', 	_me.fireOnMouseOut, false);
		_target.addEventListener('click', 	_me.fireOnClick, false);
		_target.addEventListener('load', 		_me.fireOnLoad, false);
		
		_redraw();
		
		if(_debug=="true") _updateTimeline(_id, new Date());
	}
	
	function _redraw()
	{
		_target.innerHTML			= '';
		_curItem					= 0;
		_f_first					= false;
		
		for(var i=0; i<_itemCnt; i++)
		{
			_dashboard.RemoveObjectsForInstance(_id + '_' + i);
			_handler.CancelEventsForInstance(_id + '_' + i);
		}
		
		var _snapTo		= _findChild('snapTo', _xml);
		for(var i=0; i<_itemCnt; i++)
		{
			_curItem 					= i;
			var _prefix					= _id + '_' + i + '.';
			var _divMain 				= document.createElement('div');
			
			_divMain.setAttribute('id', 'container_' + _id + '_' + i);
			_target.appendChild(_divMain);
			_divMain.style.float = 'left';
			
			for(var n=0; n<_xml.childNodes.length; n++)
			{
				var _node = _xml.childNodes[n];
				
				if(_node.nodeType!=1) continue;
				if(_node.nodeName=='containerStyle') continue;
				if(_node.nodeName=='snapTo') continue;
				
				if(_snapTo!=null)
				{
					try {
						_dashboard.AddCellSnapTo({ id: _prefix + _node.getAttribute('id'), cell: _target, snap: _snapTo });
					} catch(e) { }
				}

				var _div = document.createElement('div');
				_div.setAttribute('id', _prefix + _node.getAttribute('id'));
				_divMain.appendChild(_div);
				
				var _object = _dashboard.InitObject(_node, _div, _prefix);
				
			}
		}
		LateLoading();
	}
}
 