/**
 * SubsetConnector()
 */
function SubsetConnector(_xml)
{
	var _handler					= null;
	var _collection					= null;
	var _master						= null;
	var _groupBys					= [];
	var _me							= this;
	var _refresh					= _xml.getAttribute('refresh');
	var _max						= _xml.getAttribute('max');
	
	this.where						= [];
	this.SetItemCollection			= function _setItemCollection(__collection) { _collection = __collection; }
	this.SetEventHandler			= function _setEventHandler(__handler) { _handler = __handler; }
	this.Select						= _select;
	this.NextPage					= function _nextPage() { return; }
	this.PreviousPage				= function _previousPage() { return; }
	
	try {
	
		if(_refresh==null) _refresh = 'always';
		
		switch(_xml.nodeName)
		{
			case 'select':
				try {
					var _groupBy 		= _xml.getElementsByTagName('group')[0].getAttribute('by');
					var _groupColumn	=_xml.getElementsByTagName('group')[0].getAttribute('column');
					_groupBys[_groupBys.length] = new kvp(_groupColumn, _groupBy);
					
					// we can specif the number of decimal places for the numeric values
					_groupBys[_groupBys.length-1].toFixed = _xml.getElementsByTagName('group')[0].getAttribute('toFixed');
				} catch(e) { }
				break;
				
			default:
				alert("CRUD action '" + _xml.nodeName + "' not supported by connector type 'subset'");
		}

		var _where		= _findChild('where', _xml);
		
		if(_where!=null) 
		{
			for(var i=0; i<_where.childNodes.length; i++)
			{
				if(_where.childNodes[i].nodeType!=1) continue;
				var _node	= _where.childNodes[i];
				
				var _from	= _node.getAttribute('equals');
				var _action = '=';
				
				if(_from==null) { _from = _node.getAttribute('notEquals'); _action = '!='; }
				if(_from==null) { _from = _node.getAttribute('greaterThan'); _action = '>'; }
				if(_from==null) { _from = _node.getAttribute('lessThan'); _action = '<'; }
				if(_from==null) { _from = _node.getAttribute('contains'); _action = 'contains'; }
				
				switch(_node.nodeName)
				{
					case 'and':
					case 'AND':
						var _type 			= 'AND';
						var _text			= (_node.firstChild!=null)? _node.firstChild.nodeValue : null;
						var _column			= _node.getAttribute('column');
						
						this.where[this.where.length] = new jdbcWhereClause(_type, _text, _column, _action, _from);
						break;
					
					case 'or':
					case 'OR':
						var _type 			= 'OR';
						var _text			= (_node.firstChild!=null)? _node.firstChild.nodeValue : null;
						var _column			= _node.getAttribute('column');
						
						this.where[this.where.length] = new jdbcWhereClause(_type, _text, _column, _action, _from);
						break;
				}
			}
		}		
	} catch(e) { }
	
	function _selectDebug()
	{
		var _ar = [];
		
		_ar[_ar.length] = {id:"select", data:["SELECT * FROM " + _master.GetId()]};
		
		if(_me.where!=null && _me.where.length>0) _ar[_ar.length] = {id:"where", data:["WHERE"]};
		
		try {
			for(var w=0; w<_me.where.length; w++)
			{
				var _from	= _evaluate(_collection, _me.where[w].from, false);
				var _parts 	= _from.split('.');
				var _obj	= (_parts.length==2 || _parts.length==3)? _getObjectByName(_parts[0], _collection) : null;
				var _val	= (_obj!=null)? _obj.GetProperty(_parts[1], _parts[2]) : _from;
				
				// special case to allow 'select all' from reference component (i.e. a pulldown)
				if(_val=='...') break;
				
				var _column = _evaluate(_collection, _me.where[w].column, false);
				
				var _d = {id:"where_"+w, data:["&nbsp;&nbsp;&nbsp;" + _me.where[w].type + " " + _column + " " + _me.where[w].action + " " + _val]};
				_ar[_ar.length] = _d;
			}
		} catch(e) { }
		
		try {
			if(_groupBys.length > 0)
			{
				var _groupBy	= _groupBys[0];
				_ar[_ar.length] = {id:"groupby", data:["GROUP BY " + _groupBy.key + ", " + _groupBy.value]};
			}
		} catch(e) { }
		return _ar;
	}
	
	function _select(_debug)
	{
	
		var _srcName = _evaluate(_collection, _xml.getAttribute('src'), true, _collection.GetId());
		_master = _getObjectByName(_srcName, _collection);
		
		if(_debug==true) return _selectDebug();
		
		try {
			if(_refresh!='never')
			{
				for(var i=0; i<_me.where.length; i++)
				{
					_handler.WantEvent(_collection.GetId(), _me.where[i].from.split('.')[0], 'Refresh', 'FetchData', _refresh);
					if(_me.where[i].from.split('.').length==3) _handler.WantEvent(_collection.GetId(), _me.where[i].from.split('.')[1], 'Refresh', 'FetchData', _refresh);
				}
				
				_handler.WantEvent(_collection.GetId(), _master.GetId(), 'Refresh', 'FetchData', _refresh);
			}
		} catch(e) { }
		
		if(_master==null)
		{
			return;
		}
		
		_items				= [];
		var _allItems 		= [];
		
		var _masterItems 	= _master.GetAllItems();
		var _error			= false;
		var _limit			= (_max!=null)? parseInt(_max) : 0;
		for(var i=0; i<_masterItems.length; i++)
		{
			if(_limit>0 && _limit==_allItems.length) break;
			
			var _item 		= _masterItems[i];
			
			// first match against the 'where' clause
			if(_me.where.length>0)
			{
				var _curWhere = 0;
				for(var w=0; w<_me.where.length; w++)
				{
					var _from			= _evaluate(_collection, _me.where[w].from, (w==0 && i==0 && _refresh!='never')? true : false);
					var _parts 			= _from.split('.');
					var _obj			= (_parts.length==2 || _parts.length==3)? _getObjectByName(_parts[0], _collection) : null;
					var _val			= (_obj!=null)? _obj.GetProperty(_parts[1], _parts[2]) : _from;
					
					// special case to allow 'select all' from reference component (i.e. a pulldown)
					if(_val=='...') {
						_curWhere = 1;
						break;
					}
					
					var _column = _evaluate(_collection, _me.where[w].column, (w==0 && i==0 && _refresh!='never')? true : false);
					
					switch(_me.where[w].action)
					{
						case 'contains':
							var _contains = (_item.GetProperty(_column).toLowerCase().indexOf(_val.toLowerCase()) == -1)? false : true;
							if(_val=='') _contains = true;
							
							if(_me.where[w].type=='AND') {
								if(w==0) _curWhere = 1;
								_curWhere &= (_contains == true)? 1 : 0;
							} else {
								_curWhere |= (_contains == true)? 1 : 0;
							}
							break;
							
						case '=':
							if(_me.where[w].type=='AND') {
								if(w==0) _curWhere = 1;
								_curWhere &= (_item.GetProperty(_column)==_val)? 1 : 0;
							} else {
								_curWhere |= (_item.GetProperty(_column)==_val)? 1 : 0;
							}
							break;
							
						case '!=':
							if(_me.where[w].type=='AND') {
								if(w==0) _curWhere = 1;
								_curWhere &= (_item.GetProperty(_column)!=_val)? 1 : 0;
							} else {
								_curWhere |= (_item.GetProperty(_column)!=_val)? 1 : 0;
							}
							break;
							
						case '<':
							if(_me.where[w].type=='AND') {
								if(w==0) _curWhere = 1;
								_curWhere &= (parseFloat(_item.GetProperty(_column)) < parseFloat(_val))? 1 : 0;
							} else {
								_curWhere |= (parseFloat(_item.GetProperty(_column)) < parseFloat(_val))? 1 : 0;
							}
							break;
							
						case '>':
							if(_me.where[w].type=='AND') {
								if(w==0) _curWhere = 1;
								_curWhere &= (parseFloat(_item.GetProperty(_column)) > parseFloat(_val))? 1 : 0;
							} else {
								_curWhere |= (parseFloat(_item.GetProperty(_column)) > parseFloat(_val))? 1 : 0;
							}
							break;
							
					}

					if(_parts.length>1 && _obj==null) continue;

				}
				
				if(_error==true) break;
			}
			
			if(_error==true) break;
			
			// check if we filter this record out
			if(_curWhere==0) continue;
			
			if(_groupBys.length > 0)
			{
				var _groupBy	= _groupBys[0];
				var _property 	= _item.GetProperty(_evaluate(_collection, _groupBy.key, (_refresh=='never')? false : true, null, _refresh));
				var _toUpdate	= -1;
				
				for(var c=0; c<_items.length; c++)
				{
					if(_items[c].key==_property)
					{
						_toUpdate = c;
						break;
					}
				}
	
				// if doesnt exist already then add it
				if(_toUpdate==-1)
				{
					_items[_items.length] = new kvp(_property, parseFloat("0.0"));
					_toUpdate = _items.length - 1;
					
					_items[_toUpdate].x_cnt = 0.0;
					_items[_toUpdate].x_sum = 0.0;
					_items[_toUpdate].x_min = null;
					_items[_toUpdate].x_max = null;
					_items[_toUpdate].x_avg = 0.0;
				}
				
				var _grpValue = _evaluate(_collection, _groupBy.value, (_refresh=='never')? false : true, null, _refresh).split('.');
				
				// we try adding all the values for a given entry
				_items[_toUpdate].x_cnt = _items[_toUpdate].x_cnt + 1;
				_items[_toUpdate].x_sum = _items[_toUpdate].x_sum + parseFloat(_item.GetProperty(_grpValue[0]));
				
				if(_items[_toUpdate].x_min==null) {
					_items[_toUpdate].x_min = parseFloat(_item.GetProperty(_grpValue[0]));
				} else {
					_items[_toUpdate].x_min = (_items[_toUpdate].x_min > parseFloat(_item.GetProperty(_grpValue[0])))? parseFloat(_item.GetProperty(_grpValue[0])) : _items[_toUpdate].x_min;
				}
				
				if(_items[_toUpdate].x_max==null) {
					_items[_toUpdate].x_max = parseFloat(_item.GetProperty(_grpValue[0]));
				} else {
					_items[_toUpdate].x_max = (_items[_toUpdate].x_max < parseFloat(_item.GetProperty(_grpValue[0])))? parseFloat(_item.GetProperty(_grpValue[0])) : _items[_toUpdate].x_max;
				}
				
				_items[_toUpdate].x_avg = ((_items[_toUpdate].x_avg * (_items[_toUpdate].x_cnt-1))+parseFloat(_item.GetProperty(_grpValue[0])))/_items[_toUpdate].x_cnt;
				
				// now we aggregate the value
				switch(_grpValue[1])
				{
					case 'COUNT':
						_items[_toUpdate].value = _items[_toUpdate].x_cnt;		break;
					case 'SUM':
						_items[_toUpdate].value = _items[_toUpdate].x_sum;		break;
					case 'MIN':
						_items[_toUpdate].value = _items[_toUpdate].x_min;		break;
					case 'MAX':
						_items[_toUpdate].value = _items[_toUpdate].x_max;		break;
					case 'AVERAGE':
						_items[_toUpdate].value = _items[_toUpdate].x_avg;		break;
					
					default:
						break;
				}
			} else
			{
				_allItems[_allItems.length] = _item;
			}
		}

		if(_allItems.length==0)
		{
			for(var i=0; i<_items.length; i++)
			{
				var _itemObj = [];
				_itemObj[0] = new kvp(_evaluate(_collection, _groupBy.key, (_refresh=='never')? false : true, null, _refresh), _items[i].key);
				_itemObj[1] = new kvp(_grpValue[1], (isNaN(_items[i].value) || _groupBy.toFixed==null)? _items[i].value : _items[i].value.toFixed(_groupBy.toFixed));
				
				_itemObj[2] = new kvp('X_CNT', _items[i].x_cnt);
				_itemObj[3] = new kvp('X_SUM', (isNaN(_items[i].x_sum) || _groupBy.toFixed==null)? _items[i].x_sum : _items[i].x_sum.toFixed(_groupBy.toFixed));
				_itemObj[4] = new kvp('X_MIN', (isNaN(_items[i].x_min) || _groupBy.toFixed==null)? _items[i].x_min : _items[i].x_min.toFixed(_groupBy.toFixed));
				_itemObj[5] = new kvp('X_MAX', (isNaN(_items[i].x_max) || _groupBy.toFixed==null)? _items[i].x_max : _items[i].x_max.toFixed(_groupBy.toFixed));
				_itemObj[6] = new kvp('X_AVG', (isNaN(_items[i].x_avg) || _groupBy.toFixed==null)? _items[i].x_avg : _items[i].x_avg.toFixed(_groupBy.toFixed));
				
				_allItems[_allItems.length] = new Item(_itemObj, "array");
			}
		}
		return _allItems;
	}
}
