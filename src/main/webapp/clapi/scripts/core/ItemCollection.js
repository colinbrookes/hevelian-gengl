/**
 * ItemCollection Class
 *
 * An item collection object manages the data sets used for populating the visual components.
 * It provides an abstract interface to different data sources and follows the CRUD approach.
 * Each item collection can have upto 4 different 'connectors' for the 4 CRUD methods. These
 * connectors can be of the same or different types - for example the 'select' method could
 * be an XML source via a URL, and the 'update' could be an iWay Service call or via jdbc.
 *
 */
 
// var _orderByColumn				= null;

function ItemCollection(_xml, _prefix)
{
	this.type								= 'Collection';
	
	var _id									= (_prefix!=null)? _prefix + _xml.getAttribute('id') : _xml.getAttribute('id');
	var _me								= this;
	var _items								= [];
	var _headers							= [];
	var _collections						= {};
	var _select							= null;
	var _update							= null;
	var _insert							= null;
	var _delete							= null;
	var _handler							= null;
	var _curItem							= 0;
	var _roundSize						= parseInt(_xml.getAttribute('roundRobin'),10);
	var _roundRobin					= (_roundSize>0)? true : false;
	var _roundByProperty			= _xml.getAttribute('byProperty');
	var _treatAs							= null;
	var _direction						= null;
	var _orderByColumn				= null;
	var _f_first							= false;
	
	var _countSelect					= 0;
	var _countUpdate					= 0;
	var _countDelete					= 0;
	var _countCreate					= 0;
	
	var _typeSelect						= 'none';
	var _typeUpdate						= 'none';
	var _typeDelete						= 'none';
	var _typeCreate						= 'none';
	
	this.isDirty							= false;
	
	this.SetEventHandler							= _setEventHandler;
	this.FetchData									= _fetchData;
	this.Redraw										= _fetchData;
	this.Refresh									= _fetchData;
	this.Update										= _callUpdate;
	
	this.IsDirty									= _isDirty;
	this.GetItem									= _getItem;
	this.GetItemBy									= _getItemBy;
	this.GetItemsBy									= _getItemsBy;
	this.GetAllItems								= _getAllItems;
	this.GetItemByRowId								= _getItemByRowId;
	this.GetUnique									= _getUnique;
	this.GetHeaders									= _getHeaders;
	this.GetAllItemsAsJSON							= _getAllItemsAsJSON;
	this.GetProperty								= _getProperty;
	this.GetPropertyForRow							= _getPropertyForRow;
	this.GetColumnValuesByName						= _getColumnValuesByName;
	this.GetAllProperties							= _getAllProperties;
	this.GetId										= function _getId() { return _id; }
	this.SetId										= function _setId(_value) { _id = _value; }
	
	this.SortAsString					= _sortAsString;
	this.SortAsNumber					= _sortAsNumber;
	this.SortAsDate						= _sortAsDate;
	
	this.GetCountSelect					= function _getCountSelect() { return _countSelect; }
	this.GetTypeSelect					= function _getTypeSelect() { return _typeSelect; }
	this.GetCountDelete					= function _getCountDelete() { return _countDelete; }
	this.GetTypeDelete					= function _getTypeDelete() { return _typeDelete; }
	this.GetCountUpdate					= function _getCountUpdate() { return _countUpdate; }
	this.GetTypeUpdate					= function _getTypeUpdate() { return _typeUpdate; }
	this.GetCountCreate					= function _getCountCreate() { return _countCreate; }
	this.GetTypeCreate					= function _getTypeCreate() { return _typeCreate; }
	this.GetQueryDebug					= _getQueryDebug;
	
	this.NextPage						= _eventNextPage;
	this.PreviousPage					= _eventPreviousPage;
	this.FirstPage						= _eventFirstPage;
	
	this.GotoNext						= _gotoNext;
	this.GotoPrevious					= _gotoPrevious;
	this.GotoFirst						= _gotoFirst;
	this.GotoLast						= _gotoLast;
	
	try {
		_select				= _xml.getElementsByTagName('select')[0];
	} catch(e) { }
	try {
		_update				= _xml.getElementsByTagName('update')[0];
	} catch(e) { }
	try {
		_insert				= _xml.getElementsByTagName('insert')[0];
	} catch(e) { }
	try {
		_delete				= _xml.getElementsByTagName('delete')[0];
	} catch(e) { }
	
	if(_select!=null)
	{
		_typeSelect = _select.getAttribute('type');
		switch(_select.getAttribute('type'))
		{
			case 'jdbc':					_collections.Select		= new jdbcConnector(_select);			break;
			case 'xml':						_collections.Select		= new XMLConnector(_select);			break;
			case 'service':				_collections.Select		= new ServiceConnector(_select);		break;
			case 'webfocus':			_collections.Select		= new WFConnector(_select);				break;
			case 'subset':				_collections.Select		= new SubsetConnector(_select);		break;
			case 'range':					_collections.Select		= new RangeConnector(_select);		break;
			case 'list':						_collections.Select 	= new ListConnector(_select);			break;
			case 'feed':					_collections.Select 	= new RSSConnector(_select);			break;
			case 'myq':					_collections.Select 	= new ExoniteConnector(_select);		break;		// OBSOLETE - dont use.
			case 'exonite':				_collections.Select 	= new ExoniteConnector(_select);		break;
			case 'rotate':				_collections.Select 	= new RotateConnector(_select);		break;
			
			default:
				_log('ERROR', _me, "COLLECTION " + _id + 'unsupported connector type for SELECT: ' + _select.getAttribute('type'));
		}
	}
	
	if(_update!=null)
	{
		_typeUpdate = _update.getAttribute('type');
		switch(_update.getAttribute('type'))
		{
			case 'jdbc':			_collections.Update	= new jdbcConnector(_update);			break;
			case 'service':		_collections.Update	= new ServiceConnector(_update);		break;
			case 'post':			_collections.Update	= new PostConnector(_update);			break;

			default:
				_log('ERROR', _me, "COLLECTION " + _id + 'unsupported connector type for UPDATE: ' + _select.getAttribute('type'));
		}
	}
	
	if(_insert!=null)
	{
		_typeInsert = _insert.getAttribute('type');
		switch(_insert.getAttribute('type'))
		{
			case 'jdbc':			_collections.Insert	= new jdbcConnector(_insert);			break;
			case 'service':		_collections.Insert	= new ServiceConnector(_insert);		break;
			case 'post':			_collections.Insert	= new PostConnector(_insert);			break;

			default:
				_log('ERROR', _me, "COLLECTION " + _id + 'unsupported connector type for INSERT: ' + _select.getAttribute('type'));
		}
	}
	
	if(_delete!=null)
	{
		_typeDelete = _delete.getAttribute('type');
		switch(_delete.getAttribute('type'))
		{
			case 'jdbc':			_collections.Delete	= new jdbcConnector(_delete);		break;
			case 'service':		_collections.Delete	= new ServiceConnector(_delete);	break;

			default:
				_log('ERROR', _me, "COLLECTION " + _id + 'unsupported connector type for DELETE: ' + _select.getAttribute('type'));
		}
	}
	
	if(_collections.Select!=null) 		_collections.Select.SetItemCollection(this);
	if(_collections.Insert!=null) 		_collections.Insert.SetItemCollection(this);
	if(_collections.Delete!=null) 		_collections.Delete.SetItemCollection(this);
	if(_collections.Update!=null) 		_collections.Update.SetItemCollection(this);

	function _callUpdate()
	{
		var _connector = _collections.Update;
		if(_connector==null) return [];
		
		if(_debug=="true") _addTimeline(_id, new Date(), null, 'collection callUpdate');
		
		_log('INFO', _me, "COLLECTION " + _id + " Pushing Update");
		
		_countUpdate++;		
		
		var _response 	= _connector.Update();
		
		_handler.FireEvent(_id, "UpdateComplete");
		
		if(_debug=="true") _updateTimeline(_id, new Date());
	}
	
	function _gotoFirst()
	{
		_curItem 		= 0;
		_f_first		= false;
	}
	
	function _gotoLast()
	{
		_curItem		= _items.length-1;
	}
	
	function _gotoNext()
	{
		_getProperty('NEXT');
	}
	
	function _gotoPrevious()
	{
		_getProperty('PREVIOUS');
	}
	
	
	/**
	 * EventNextPage()
	 * This is a callback function for telling the Connector to fetch the next set of data.
	 * This only applies for connectors that can fetch data in 'pages', such as the jdbc connector.
	 */	
	function _eventNextPage()
	{
		if(_collections.Select!=null) _collections.Select.NextPage(_items.length);
		_fetchData(true);
	}
	
	/**
	 * EventPreviousPage()
	 * This is a callback function for telling the Connector to fetch the previous set of data.
	 * This only applies for connectors that can fetch data in 'pages', such as the jdbc connector.
	 */	
	function _eventPreviousPage()
	{
		if(_collections.Select!=null) _collections.Select.PreviousPage(_items.length);
		_fetchData(true);
	}
	
	/**
	 * EventFirstPage()
	 * This resets the paging back to the beginning of the dataset.
	 */
	function _eventFirstPage()
	{
		if(_collections.Select!=null) _collections.Select.FirstPage(_items.length);
		_fetchData(true);
	}
	
	/**
	 * SetEventHandler()
	 * The ItemCollections need to be able to recieve events as well as send events.
	 * If a connector is dependent on a given value from a GUI component (i.e. a selected row
	 * in a grid) then the data source needs to update itself when the row changes. At
	 * the same time, if a component is bound to a specific connector then the ItemCollection
	 * needs to issue a 'Refresh' event to those components.
	 */
	function _setEventHandler(__handler)
	{
		_handler = __handler;
		
		if(_collections.Select!=null) _collections.Select.SetEventHandler(__handler);
		if(_collections.Insert!=null) _collections.Insert.SetEventHandler(__handler);
		if(_collections.Delete!=null) _collections.Delete.SetEventHandler(__handler);
		if(_collections.Update!=null) _collections.Update.SetEventHandler(__handler);
	}
	
	function _getColumnValuesByName(_name)
	{
		var _values = [];
		
		for(var i=0; i<_items.length; i++)
		{
			_values[_values.length] = (_items[i].GetProperty(_name)!='')? _items[i].GetProperty(_name) : "unknown";
		}
		
		return _values;
	}
	
	function _getPropertyForRow(_rowid, _name)
	{
		return _getItemByRowId(_rowid).GetProperty(_name);
	}
	
	function _getQueryDebug()
	{
		var _connector = _collections.Select;
		if(_connector==null) return [];
		
		var _debug = _connector.Select(true);
		return _debug;
	}
	
	/**
	 * processJoins()
	 * process any join definitions to link collections together
	 */
	function _processJoins(_newItems)
	{
		var _joins			= _select.getElementsByTagName('join');
		
		for(var i=0; i<_joins.length; i++)
		{
			var _join						= _joins[i];
			var _prefix					= (_join.getAttribute('prefix')==null)? '' : _join.getAttribute('prefix');
			var _src						= _join.getAttribute('to');
			var _type						= _join.getAttribute('type');
			
			switch(_type.toLowerCase())
			{
				case 'right':
					var _joinCollection 	= _getObjectByName(_src, _me);
					var _joinItems			= _joinCollection.GetAllItems();
					var _matchCriteria		= _buildCriteria(_join.getElementsByTagName('where')[0]);
					
					_addHeaders(_joinCollection, _prefix);
					
					// for each record in this collection, find the records in the joined collection
					for(var _r=0; _r<_newItems.length; _r++)
					{
						var _matchedItems	 = _matchItems(_newItems[_r], _joinItems, _matchCriteria);
						if(_matchedItems!=null && _matchedItems.length>0) _newItems[_r] = _joinRecords(_newItems[_r], _matchedItems, _prefix);
					}
					break;
					
				case 'append':
					var _joinCollection 	= _getObjectByName(_src, _me);
					var _joinItems			= _joinCollection.GetAllItems();
					var _matchCriteriaL		= _join.getElementsByTagName('where');
					
					if(_matchCriteriaL!=null && _matchCriteriaL.length>0)
					{
						var _matchCriteria		= _buildCriteria(_matchCriteriaL[0]);
						var _matchedItems	= _matchAgainstClause(_joinItems, _matchCriteria);
						
						if(_matchedItems.length==0) alert('no items matched');
						
						// for each record in this collection, find the records in the joined collection
						if(_matchedItems!=null && _matchedItems.length>0)
						{
							for(var j=0; j<_matchedItems.length; j++)
							{
								_newItems[_newItems.length] = _matchedItems[j];
							}
						}
						
					} else
					{ 
						var _matchedItems	= _joinItems;
						
						for(var j=0; j<_matchedItems.length; j++)
						{
							_newItems[_newItems.length] = _matchedItems[j];
						}
					}
					
					break;
					
				default:
					_log('ERROR', _me, "COLLECTION " + _id + " Unsupported join type: " + _type);
					break;
			}
		}
		
	}
	
	function _addHeaders(_fromCollection, _prefix)
	{
		if(_fromCollection==null) return;
		
		var _fromHeaders				= _fromCollection.GetHeaders().split(',');
		for(var i=0; i<_fromHeaders.length; i++)
		{
			for(var h=0; h<_headers.length; h++) if(_headers[h]==(_prefix + _fromHeaders[i])) continue;
			 
			_headers[_headers.length] = _prefix + _fromHeaders[i];
		}
	}
	
	function _joinRecords(_item, _joinTo, _prefix)
	{
		for(var i=0; i<_joinTo.length; i++)
		{
			var _joinProperties			= _joinTo[i].GetAllProperties();
			for(var p=0; p<_joinProperties.length; p++)
			{
				_item.SetProperty(_prefix + _joinProperties[p].key, _joinProperties[p].value);
			}
		}
		
		return _item;
	}
	
	/**
	 * buildCriteria()
	 * parses 'where' clauses to create criteria for matching on.
	 */
	function _buildCriteria(_where)
	{
		var _clause			= new Array();
		
		for(var i=0; i<_where.childNodes.length; i++)
		{
			if(_where.childNodes[i].nodeType!=1) continue;
			
			var _node			= _where.childNodes[i];
			var _from			= _node.getAttribute('equals');
			var _action 		= '=';
			var _refresh		= _node.getAttribute('refresh');
			var _refreshFlag	= true;
			if(_refresh=="false") {
				_refreshFlag = false;
			}
			
			if(_from==null) { _from = _node.getAttribute('notEquals');		_action = '!=';	}
			if(_from==null) { _from = _node.getAttribute('greaterThan'); 	_action = '>'; 	}
			if(_from==null) { _from = _node.getAttribute('lessThan'); 		_action = '<'; 	}
			if(_from==null) { _from = _node.getAttribute('contains'); 		_action = 'c'; 	}
			if(_from==null) { _from = _node.getAttribute('startsWith'); 	_action = 'sw'; }
			
			switch(_node.nodeName)
			{
				case 'and':
				case 'AND':
					var _type 					= 'AND';
					var _text						= (_node.firstChild!=null)? _node.firstChild.nodeValue : null;
					var _column				= _node.getAttribute('column');
					
					_clause[_clause.length] = new jdbcWhereClause(_type, _text, _column, _action, _from, _refreshFlag);
					break;
				
				case 'or':
				case 'OR':
					var _type 					= 'OR';
					var _text						= (_node.firstChild!=null)? _node.firstChild.nodeValue : null;
					var _column				= _node.getAttribute('column');
					
					_clause[_clause.length] = new jdbcWhereClause(_type, _text, _column, _action, _from, _refreshFlag);
					break;
			}
		}
		return _clause;
	}
	
	function _matchAgainstClause(_joinItems, _where)
	{
		var _matched			= new Array();
		
		for(var i=0; i<_joinItems.length; i++)
		{
			var _curWhere = 0;
			for(var w=0; w<_where.length; w++)
			{
				var _item				= _joinItems[i];
				var _val				= _evaluate(_me, _where[w].from, _where[w].flag, _id);
				var _column 			= _evaluate(_me, _where[w].column, _where[w].flag, _id);
				
				switch(_where[w].action)
				{
					case 'sw':
						if(_where[w].type=='AND') {
							if(w==0) _curWhere = 1;
							_curWhere &= (_item.GetProperty(_column).indexOf(_val)==0)? 1 : 0;
						} else {
							_curWhere |= (_item.GetProperty(_column).indexOf(_val)==0)? 1 : 0;
						}
						break;
						
					case 'c':
						alert("WE HAVE CONTAINS: column:" + _column + ", VALUE: " + _val);
						if(_where[w].type=='AND') {
							if(w==0) _curWhere = 1;
							_curWhere &= (~_item.GetProperty(_column).indexOf(_val))? 1 : 0;
						} else {
							_curWhere |= (~_item.GetProperty(_column).indexOf(_val))? 1 : 0;
						}
						break;

					case '=':
						if(_where[w].type=='AND') {
							if(w==0) _curWhere = 1;
							_curWhere &= (_item.GetProperty(_column)==_val)? 1 : 0;
						} else {
							_curWhere |= (_item.GetProperty(_column)==_val)? 1 : 0;
						}
						break;
						
					case '!=':
						if(_where[w].type=='AND') {
							if(w==0) _curWhere = 1;
							_curWhere &= (_item.GetProperty(_column)!=_val)? 1 : 0;
						} else {
							_curWhere |= (_item.GetProperty(_column)!=_val)? 1 : 0;
						}
						break;
						
					case '<':
						if(_where[w].type=='AND') {
							if(w==0) _curWhere = 1;
							_curWhere &= (parseFloat(_item.GetProperty(_column)) < parseFloat(_val))? 1 : 0;
						} else {
							_curWhere |= (parseFloat(_item.GetProperty(_column)) < parseFloat(_val))? 1 : 0;
						}
						break;
						
					case '>':
						if(_where[w].type=='AND') {
							if(w==0) _curWhere = 1;
							_curWhere &= (parseFloat(_item.GetProperty(_column)) > parseFloat(_val))? 1 : 0;
						} else {
							_curWhere |= (parseFloat(_item.GetProperty(_column)) > parseFloat(_val))? 1 : 0;
						}
						break;
						
				}

			}
			
			// check if we filter this record out
			if(_curWhere==0) continue;
			
			_matched[_matched.length] = _joinItems[i];
		}
		
		return _matched;
		
	}
	
	/**
	 * matchItems()
	 * uses 'where' criteria to match records from one collection to a record in another
	 */
	function _matchItems(_item, _joinItems, _where)
	{
		var _matched			= new Array();
		
		for(var i=0; i<_joinItems.length; i++)
		{
			var _curWhere = 0;
			for(var w=0; w<_where.length; w++)
			{
				var _val			= _joinItems[i].GetProperty(_where[w].from);
				var _column 		= _evaluate(_me, _where[w].column, _where[w].flag);
				
				switch(_where[w].action)
				{
					case '=':
						if(_where[w].type=='AND') {
							if(w==0) _curWhere = 1;
							_curWhere &= (_item.GetProperty(_column)==_val)? 1 : 0;
						} else {
							_curWhere |= (_item.GetProperty(_column)==_val)? 1 : 0;
						}
						break;
						
					case '!=':
						if(_where[w].type=='AND') {
							if(w==0) _curWhere = 1;
							_curWhere &= (_item.GetProperty(_column)!=_val)? 1 : 0;
						} else {
							_curWhere |= (_item.GetProperty(_column)!=_val)? 1 : 0;
						}
						break;
						
					case '<':
						if(_where[w].type=='AND') {
							if(w==0) _curWhere = 1;
							_curWhere &= (parseFloat(_item.GetProperty(_column)) < parseFloat(_val))? 1 : 0;
						} else {
							_curWhere |= (parseFloat(_item.GetProperty(_column)) < parseFloat(_val))? 1 : 0;
						}
						break;
						
					case '>':
						if(_where[w].type=='AND') {
							if(w==0) _curWhere = 1;
							_curWhere &= (parseFloat(_item.GetProperty(_column)) > parseFloat(_val))? 1 : 0;
						} else {
							_curWhere |= (parseFloat(_item.GetProperty(_column)) > parseFloat(_val))? 1 : 0;
						}
						break;
						
				}

			}
			
			// check if we filter this record out
			if(_curWhere==0) continue;
			
			_matched[_matched.length] = _joinItems[i];
		}
		
		return _matched;
	}
	
	/**
	 * _sortResults()
	 * orders the results as per the specified column and in the specified direction
	 * @param _items
	 * @param _orderBy
	 * @returns array or sorted items
	 */
	function _sortResults(_xitems, _orderBy)
	{
		_direction 				= _evaluate(_me, _orderBy.getAttribute('direction'), true);
		_treatAs				= _evaluate(_me, _orderBy.getAttribute('treatAs'), true);
		_orderByColumn			= _evaluate(_me, _orderBy.getAttribute('by'), true);
		
		if(_treatAs==null) 	_treatAs 		= 'string';
		if(_direction==null)	_direction 		= 'ascending';
		
		switch(_treatAs)
		{
			case 'string':
			case 'alpha':
				_xitems.sort(_me.SortAsString);
				break;
				
			case 'date':
				_xitems.sort(_me.SortAsDate);
				break;
				
			case 'number':
				_xitems.sort(_me.SortAsNumber);
				break;
				
			default:
				_log('ERROR', _me, "COLLECTION " + _id + " Unknown SORT treatAs criteria");
				break;
		}
		
		return _xitems;
	}
	
	/**
	 * FetchData()
	 * This fires two events, before and after the fetch, to allow other components to update
	 * the data sources if desired. FetchData calls the Select method of the appropriate connector.
	 * The objects using the collection are required to indicate that they 'want' the event.
	 */
	function _fetchData(_refresh)
	{
		var _connector = _collections.Select;
		if(_connector==null) return [];
		
		if(_debug=="true") _addTimeline(_id, new Date(), null, 'collection fetchData');
		
		_log('INFO', _me, "COLLECTION " + _id + " Fetching Data");
		
		_countSelect++;		
		
		var _newItems 	= _connector.Select();
		try {
			if(_newItems!=null && _newItems.length > 0)
			{
				_headers				= _getHeadersFrom(_newItems).split(',');
			}
		} catch(e) { _log('ERROR', _me, "COLLECTION " + _id + " unable to get headers from retrieved data items"); }
		
		if(_select.getElementsByTagName('join')!=null && _select.getElementsByTagName('join').length>0)
		{
			if(_debug=="true") _addTimeline(_id, new Date(), null, 'collection process joins');
			_processJoins(_newItems);
			if(_debug=="true") _updateTimeline(_id, new Date());
		}
		
		if(_select.getElementsByTagName('order')!=null && _select.getElementsByTagName('order').length>0)
		{
			if(_debug=="true") _addTimeline(_id, new Date(), null, 'collection sort result set');
			_newitems = _sortResults(_newItems, _select.getElementsByTagName('order')[0]);
			if(_debug=="true") _updateTimeline(_id, new Date());
		}
		
		// check for round-robin stuff
		if(_roundRobin==true)
		{
			if(_items==null) _items = new Array();
			
			if(_roundByProperty!=null)
			{
				// we keep a set of records for each unique instance of a given property rather than the entire dataset
				for(var i=0; i<_newItems.length; i++)
				{
					var _check = _roundRobinCheck(_roundByProperty, _newItems[i].GetProperty(_roundByProperty), _roundSize);
					if(_check!=-1) _items.splice(_check, 1);
					_items.push(_newItems[i]);
				}
			} else
			{
				// otherwise we keep a single record set for the collection and just push items into the list.
				for(var i=0; i<_newItems.length; i++)
				{
					if(_items.length==_roundSize) _items.shift();
					_items.push(_newItems[i]);
				}
			}
		} else
		{
			if(_items!=null && _itemsHaveChanged(_items, _newItems)==false)
			{
				_handler.FireEvent(_id, "CollectionNotChanged");
				if(_debug=="true") _updateTimeline(_id, new Date());
				return;
			}
			
			_curItem 		= 0;
			_f_first		= false;

			_items = _newItems;
		}
		
		if(_items.length==0)	_handler.FireEvent(_id, "CollectionEmpty");
		if(_handler!=null) 		_handler.FireEvent(_id, "Refresh");
		
		if(_debug=="true") _updateTimeline(_id, new Date());
		
	}

	function _roundRobinCheck(_property, _value, _limit)
	{
		var _first 	= -1;
		var _count	= 0;
		
		for(var i=0; i<_items.length; i++)
		{
			var _v		= _items[i].GetProperty(_property);
			if(_v==_value)
			{
				_count++;
				if(_first==-1) _first = i;
			}
		}
		
		if(_count<_limit) _first = -1;
		return _first;
	}
	
	function _itemsHaveChanged(_original, _newItems)
	{
		// if the number of items is different, something changed
		if(_original.length != _newItems.length) return true;
		
		try
		{
			for(var i=0; i<_original.length; i++)
			{
				var _orProps = _original[i].GetAllProperties();
				var _nwProps = _newItems[i].GetAllProperties();
				
				if(_orProps==null || _nwProps==null) return true;
				
				// if the number of properties are different, something has changed
				if(_orProps.length != _nwProps.length) return true;
				
				for(var p=0; p<_orProps.length; p++)
				{
					var _newProp = _newItems[i].GetProperty(_orProps[p].key);
					if(_newProp != _orProps[p].value) return true;
				}
			}
		} catch(e) {  }
		
		return false;
	}
		
	function _getAllProperties()
	{
		var _ar = new Array();
		
		_ar[_ar.length]				= new kvp('id', _id);
		_ar[_ar.length]				= new kvp('COUNT', _me.GetProperty('COUNT'));
		_ar[_ar.length]				= new kvp('CurItem', _curItem);
		
		if(_items.length > 0)
		{
			var _props = _items[_curItem].GetAllProperties();
			for(var i=0; i<_props.length; i++)
			{
				_ar[_ar.length]		= new kvp('CurItem: ' + _props[i].key, _props[i].value);
			}
		}
		
		return _ar;
	}
	
	/**
	 * GetProperty()
	 * This is a required interface for all objects. An ItemCollection can contain
	 * lots of items, but we always get the named property from the first item.
	 */
	function _getProperty(_name)
	{
		if(_items.length == 0 && _name!='COUNT') return null;
		
		switch(_name)
		{
			case 'CurItem':
				return _curItem;
				break;
				
			case 'COUNT':
				var _cnt = (_items==null)? 0 : _items.length;
				return _cnt;
				
			case 'NEXT':
				if(_f_first==false)
				{
					_f_first = true;
					return _items[_curItem].GetAllProperties()[0].value;
				}
				_curItem++;
				_handler.FireEvent(_id, "Refresh");
				
				if(_curItem==_items.length-1)
				{
					 _handler.FireEvent(_id, 'onReachedLastEntry');
				}
				
				if(_curItem==_items.length)
				{
					 _handler.FireEvent(_id, 'Reset');
					_curItem=0;
				}
				
				return  _items[_curItem].GetAllProperties()[0].value;
				break;
				
			case 'PREVIOUS':
				if(_curItem>0) {
					_curItem--;
					_handler.FireEvent(_id, "Refresh");
				}
				break;
				
			default:
				if(_f_first == false) _f_first = true;
				return _items[_curItem].GetProperty(_name);
		}
	}
	
	function _setProperty(_name, _value)
	{
		switch(_name)
		{
			case 'CurItem': _curitem = parseInt(_value, 10); break;
		}
	}
	
	/**
	 * isDirty()
	 * Checks the isDirty flag of all the items in the collection and returns true if at least one
	 * of the items is marked as 'dirty'.
	 */
	function _isDirty()
	{
		for(var i=0; i<_items.length; i++) if(items[i].isDirty) return true;
		return false;
	}
	
	/**
	 * Converts items to json notation and returns.
	 * @returns
	 */
	function _getAllItemsAsJSON()
	{
		var _arAll	= new Array();
		
		for(var i=0; i<_items.length; i++)
		{
			var _ar 			= {};
			var _properties 	= _items[i].GetAllProperties();
			
			for(var p=0; p<_properties.length; p++)
			{
				_ar[_properties[p].key]		= _properties[p].value;
			}
			_arAll[_arAll.length] = _ar;
		}
		
		return _arAll;
	}
	
	/**
	 * GetHeaders()
	 * Each Item in the collection has been normalised from its data source into a set of
	 * key-value pairs. The 'key' is considered to be the 'name' of the item. This method returns
	 * a list of the 'names' as a comma-separated list. This should probably be an array, but
	 * hasnt been changed for legacy reasons.
	 */
	function _getHeaders(_refreshFlag)
	{
	
		if(_refreshFlag==null && _headers.length!=0) return _headers.join(',');
		
		var _str = "";
		
		var _item 			= _items[0];
		var _properties 	= _item.GetAllProperties();
		var _str			= "";
		
		for(var p=0; p<_properties.length; p++)
		{
			var _property = _properties[p];
			
			if(p>0) _str += ",";
			_str += _property.key;
		}
		
		return _str;
	}
	
	function _getHeadersFrom(_here)
	{
	
		var _str = "";
		
		var _item 			= _here[0];
		var _properties 	= _item.GetAllProperties();
		var _str			= "";
		
		for(var p=0; p<_properties.length; p++)
		{
			var _property = _properties[p];
			
			if(p>0) _str += ",";
			_str += _property.key;
		}
		
		return _str;
	}
	
	/**
	 * GetItemByRowId()
	 * Each item has a numeric row ID, and can be fetched by that ID.
	 */
	function _getItemByRowId(_rowId)
	{
		return(_items[_rowId]);
	}

	function _getItem()
	{
		return _items[_curItem];
	}
	
	/**
	 * GetItemBy()
	 * This will look for the first item where the _named property matches the supplied _value
	 * and where the item is not marked for deletion, and return the entire item.
	 */	
	function _getItemBy(_name, _value)
	{
		for(var i=0; i<_items.length; i++)
		{
			var _item = _items[i];
			if(_item.isDeleted!=true && _item.GetProperty(_name) == _value) return _item;
		}
		return null;
	}
	
	/**
	 * GetItemsBy()
	 * This is the same as GetItemBy except to makes an array of all the items mtching the criteria
	 * and return this array.
	 */
	function _getItemsBy(_name, _value)
	{
		var _ar = new Array();
		
		for(var i=0; i<_items.length; i++)
		{
			var _item = _items[i];
			if(_item.isDeleted!=true && _item.GetProperty(_name) == _value) _ar[_ar.length] = _item;
		}
		
		return _ar;
	}

	/**
	 * GetUnique()
	 * Returns a list of unique values for a _named property in the entire list of items.
	 */
	function _getUnique(_name)
	{
		var _ar = new Array();
		
		for(var i=0; i<_items.length; i++)
		{
			if(_items[i].isDeleted==true) continue;
			
			var _item 	= _items[i];
			var _value 	= _item.GetProperty(_name);
			
			var _found = false;
			for(var n=0; n<_ar.length; n++)
			{
				if(_ar[n] == _value)
				{
					_found = true;
					break;
				}
			}
			
			if(_found==false)
			{
				_ar[_ar.length] = _value;
			}
		}
		
		return _ar;
	}
	
	/**
	 * GetAllItems()
	 * Returns the array of all the items, including deleted items. 
	 */
	function _getAllItems()
	{
		return _items;
	}
	
	function _sortAsString(a, b)
	{
		var _columns 	= _orderByColumn.split(',');
		var _aval			= '';
		var _bval			= '';
		
		for(var i=0; i<_columns.length; i++)
		{
			_aval += a.GetProperty(_columns[i]);
			_bval += b.GetProperty(_columns[i]);
		}
		
		var val = 0;
		
		if(_aval < _bval) val = -1;
		if(_aval > _bval) val = 1;
		
		if(val == 0) return val;
		if(_direction == 'descending')  { val *= -1; }
		return val;
	}

	function _sortAsDate(a, b)
	{
		var _columns 	= _orderByColumn.split(',');
		var _aval			= new Date(a.GetProperty(_columns[0]));
		var _bval			= new Date(b.GetProperty(_columns[0]));
		
		if(_direction == 'ascending')  { return _aval - _bval; }
		return _bval - _aval;
	}

	function _sortAsNumber(a, b)
	{
		var _columns 	= _orderByColumn.split(',');
		var _aval			= 0.0;
		var _bval			= 0.0;
		
		for(var i=0; i<_columns.length; i++)
		{
			_aval += parseFloat(a.GetProperty(_columns[i]));
			_bval += parseFloat(b.GetProperty(_columns[i]));
		}
		
		if(_direction == 'ascending')  { return _aval - _bval; }
		return _bval - _aval;
	}
	
}


/**
 * jdbcWhereClause()
 * Storage object for a 'where' clause for a jdbc connector.
 */
function jdbcWhereClause(_type, _text, _column, _action, _from, _flag)
{
	this.type		= _type;
	this.text		= _text;
	this.column		= _column;
	this.action		= _action;
	this.from		= _from;
	this.flag		= _flag;
	
	if(this.flag==null || this.flag=="") this.flag = true;
}
