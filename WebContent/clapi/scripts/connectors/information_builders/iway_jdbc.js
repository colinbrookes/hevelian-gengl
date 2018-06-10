/**
 * jdbcPagingClause()
 * Storage object for a 'paging' definition for a jdbc connector.
 */
function jdbcPagingClause(_column, _start, _step)
{
	this.column		= _column;
	this.start		= _start;
	this.step		= _step;
	this.origStart	= _start;
}

/**
 * jdbcConnector()
 * This provides the CRUD controls for talking to an iWay JDBC data source. This is probably the most
 * complicated/advanced of the connectors as it is the only one that provides 'paging' and advanced
 * selection/filtering server side. The SQL is generated dynamically and can be dependent on properties
 * of other components in the layout - for example a 'where' clause can get its value from an ItemGrid.
 */
function jdbcConnector(_xml)
{
	var _handler	= null;
	var _collection	= null;
	
	this.fields		= [];
	this.where		= [];
	this.from		= '';
	this.orderby	= '';
	this.provider	= '';
	this.paging		= null;
	
	this.SetItemCollection	= function _setItemCollection(__collection) { _collection = __collection; }
	this.SetEventHandler	= function _setEventHandler(__handler) { _handler = __handler; }
	this.Select				= _select;
	this.Update				= _update;
	this.Insert				= _insert;
	this.Delete				= _delete;
	this.NextPage			= _nextPage;
	this.PreviousPage		= _previousPage;
	this.FirstPage			= _firstPage;
	
	var _me			= this;
	
	try {
		var _fields		= _xml.getElementsByTagName('fields')[0].childNodes;
		for(var i=0; i<_fields.length; i++)
		{
			var _field = _fields[i];
			if(_field.nodeType!=1) continue;
			
			this.fields[this.fields.length] = new kvp(_field.nodeName, _field.getAttribute('from'), _field.getAttribute('type'));
		}
		
		this.from		= _xml.getElementsByTagName('from')[0].firstChild.nodeValue;
		this.orderby	= _xml.getElementsByTagName('orderby')[0].firstChild.nodeValue;
		this.provider	= _xml.getAttribute('name');
		
		try {
			var _paging		= _xml.getElementsByTagName('paging')[0];
			if(_paging!=null)
			{
				var _pColumn	= _paging.getAttribute("column");
				var _pStart		= parseInt(_paging.getAttribute("start"));
				var _pStep		= parseInt(_paging.getAttribute("step"));
				this.paging		= new jdbcPagingClause(_pColumn, _pStart, _pStep);
			}
		} catch(e) { }
		
		var _where		= _xml.getElementsByTagName('where')[0];
		for(var i=0; i<_where.childNodes.length; i++)
		{
			if(_where.childNodes[i].nodeType!=1) continue;
			
			var _node			= _where.childNodes[i];
			var _from			= _node.getAttribute('equals');
			var _action			= '=';
			
			if(_from==null) { _from = _node.getAttribute('notEquals'); _action = '!='; }
			if(_from==null) { _from = _node.getAttribute('greaterThan'); _action = '>'; }
			if(_from==null) { _from = _node.getAttribute('lessThan'); _action = '<'; }
			
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
		
	}  catch(e) { }
	
	/**
	 * NextPage()
	 * If paging is defined, we increment the start position by the step-size and return. Note, the
	 * ItemCollection tells the Connector when to refresh the data, typically directly after calling this method.
	 */
	function _nextPage(_itemCount)
	{
		if(this.paging == null || _itemCount < parseInt(this.paging.step)) return;
		this.paging.start += parseInt(this.paging.step);
	}
	
	/**
	 * PreviousPage()
	 * If paging is defined, we decrement the start position by the step-size and return. Note, the
	 * ItemCollection tells the Connector when to refresh the data, typically directly after calling this method.
	 * We dont allow the start position to be less than the original start position as defined in the layout XML.
	 */
	function _previousPage(_itemCount)
	{
		if(this.paging == null) return;
		this.paging.start -= parseInt(this.paging.step);
		if(this.paging.start <= this.paging.origStart) this.paging.start = this.paging.origStart;
	}
	
	function _firstPage(_itemCount)
	{
		if(this.paging == null) return;
		this.paging.start = this.paging.origStart;
	}
	
	function _selectDebug()
	{
		var _ar = [];
		
		_ar[_ar.length] = {id:"select", data:["SELECT"]};
		
		// fields
		try {
			for(var i=0; i<_me.fields.length; i++)
			{
				_ar[_ar.length] = {id: "field_" + i, data: ["&nbsp;&nbsp;&nbsp;" +_me.fields[i].value + " AS " + _me.fields[i].key] };
			}
		} catch(e) { }
		
		// from
		try {
			_ar[_ar.length] = {id:"from", data:["FROM " + _evaluate(_collection, _me.from, false)]};
		} catch(e) { }
		
		// where
		try {
			if(_me.where.length>0) _ar[_ar.length] = {id:"where", data:["WHERE"]};
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
			// now we add the paging where clause
			if(_me.paging!=null)
			{
				var _s = '';
				if(_me.where.length > 0) _s = "&nbsp;&nbsp;&nbsp;AND";
				
				_s += " (" + _me.paging.column + ">=" + _me.paging.start + " AND " + _me.paging.column + "<" + (parseInt(_me.paging.start)+parseInt(_me.paging.step)) + ")";
				
				_ar[_ar.length] = {id: "paging", data: [_s]};
			}
		} catch(e) { }
		
		try {
			// finally, we add the 'order by' stuff
			if(_me.orderby!=null)
			{
				_ar[_ar.length] = {id: "orderby", data: ["ORDER BY "	+ _evaluate(_collection, _me.orderby, false)]};
			}
		} catch(e) { }
		
//		alert(_ar);
		
		return _ar;
	}
	
	/**
	 * Select()
	 * One of the CRUD functions - builds the SQL query and retrieves data from the data source. The
	 * data is then converted into Item objects and the array of items is returned to the collection.
	 * Note, the incoming XML is 'normalized' due to some quirky bugs in FireFox: it breaks large text
	 * values into chunks of 4096 bytes and creates adjacent '#text' elements in the XML. 
	 */ 
	function _select(_debug)
	{
	
		if(_debug==true) return _selectDebug();
		
		var _sql		= _buildSelectStatement();
		var _items		= [];
		
		if(_sql==null) return;
		
		_log('DEBUG', _collection, 'JDBC SQL: ' + _sql);
		
		var _str 		= '<query>';
		
		_str += '<provider>'+this.provider+'</provider>';
		_str += '<sql><![CDATA['+_sql+']]></sql>';
		_str += '</query>';

		var _ajax = new sisAJAXConnector();
		_ajax.open("POST", GetURL('/JNDI'), false);
		_ajax.send(_str);

		var _xml 	= new sisXMLDocument(_ajax.responseText);
		var _Nodes	= _xml.getElementsByTagName('row');

		for(var i=0; i<_Nodes.length; i++)
		{
			_Nodes[i].normalize();
			_items[_items.length] = new Item(_Nodes[i], null, _me.fields);
		}
		
		return _items;
	}
	
	/**
	 * Update()
	 * One of the CRUD functions - TODO.
	 */
	function _update()
	{
	}
	
	/**
	 * Delete()
	 * One of the CRUD functions - TODO.
	 */
	function _delete()
	{
	}
	
	/**
	 * Insert()
	 * One of the CRUD functions - TODO.
	 */
	function _insert()
	{
	}
	
	/**
	 * BuildSelectStatement()
	 * Creates the actual SQL query sent to the server to be executed against the iWay data source.
	 * Pretty much any SQL can be generated, which allows for the different quirks/implementations of
	 * the SQL syntax. The core SELECT statement remains standard however. The generated SQL will also
	 * map the table column names into the named properties as defined in the layout XML. This is
	 * necessary for fields which contain functions rather than table column names.
	 */
	function _buildSelectStatement()
	{
		var _sql = "SELECT ";
		
		for(var i=0; i<_me.fields.length; i++)
		{
			if(i>0) _sql += ",";
			_sql += _me.fields[i].value + " AS " + _me.fields[i].key;
		}
		
		_sql += (_me.from!=null)? 		" FROM " 		+ _evaluate(_collection, _me.from, true)		: '';
		
		// now we do the clever 'where' clause stuff
		if(_me.where.length > 0)
		{
			for(var i=0; i<_me.where.length; i++)
			{
				var _where = _me.where[i];
				if(_where.text!=null)
				{
					if(i==0)	_sql += " WHERE ";
					if(i>0)		_sql += " " + _where.type;
					_sql += _evaluate(_collection, _where.text, true);
					continue;
				}
				
				// not a text entry, so we need to process the options
				var _fromParts	= _where.from.split('.');
				
				// we need to indicate to the EventHandler that we are interested in getting
				// any event from the specified source item
				try {
					_handler.WantEvent(_collection.GetId(), _fromParts[0], 'Refresh', 'FetchData', 'always');
				} catch(e) { alert('error setting WantEvent'); }
				
				// now we need to see if the object exists already, and fetch the value
				var _property	= _evaluate(_collection, _where.from, true);
				
				_log('DEBUG', _collection, 'JDBC: Evaluate: ' + _where.from + ' INTO ' + _property);
				
				var _object 	= _getObjectByName(_fromParts[0], _collection);
				if(_object!=null)
				{
					var _p = _object.GetProperty(_fromParts[1]);
					if(_p!=null) _property = _p;
				} else
				{
					_log('DEBUG', _collection, 'JDBC, WHERE: Could not find object: ' + _fromParts[0]);
				}
				
				// fix single quotes in the data to avoid sql errors in the server
				if(_property!=null)
				{
					_property = _property.replace(/'/g, "''");
					
					if(i==0) 	_sql += " WHERE ";
					if(i>0)		_sql += " " + _where.type;
					_sql += " " +_where.column + " " + _where.action + " '" + _property + "'";
				} else
				{
					_log('DEBUG', _collection, 'JDBC, WHERE: property ' + _fromParts[1] + ' OF ' + _fromParts[0] + ' IS NULL');
				}
			}
		}
		
		// now we add the paging where clause
		if(_me.paging!=null)
		{
			if(_me.where.length > 0) _sql += " AND";
			
			_sql += " (" + _me.paging.column + ">=" + _me.paging.start + " AND " + _me.paging.column + "<" + (parseInt(_me.paging.start)+parseInt(_me.paging.step)) + ")";
		}
		
		// finally, we add the 'order by' stuff
		try {
			_sql += (_me.orderby!=null)?	" ORDER BY "	+ _evaluate(_collection, _me.orderby, true)	: '';
		} catch(e) { }
		
		return _sql;
		
	}
}
