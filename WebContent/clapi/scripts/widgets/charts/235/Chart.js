/**
 * Chart()
 * This is the highcharts implementation in the CL-API framework. 
 */

// we add our own svg symbol for the drill-up button
Highcharts.Renderer.prototype.symbols.drillUp = function() {
    return ['M',5,5,'L',15,5,'L',13,7,'L',15,9,'L',9,15,'L',7,13,'L',5,15,'Z'];  
}

function Chart(__id, __target, __xml)
{
	this.type					= 'Chart';
	
	var _id					= __id;
	var _hideShowId			= __id;
	var _target				= __target;
	var _xml				= __xml;
	var _handler			= null;
	var _chart				= null;
	var _configuration		= {};
	var _series				= new Array();
	var _autoEvents			= "always";
	var _categories			= null;
	var _me					= this;
	var _prefix				= null;
	var _clicked			= null;
	var _drillDepth			= 0;
	var _drillPath			= new Array();
	
	// public methods
	this.GetId				= function _getID() { return _id; }
	this.SetAutoEvents		= function _setAutoEvents(_to) { _autoEvents = _to; }
	this.SetEventHandler	= function _setEventHandler(__handler) { _handler = __handler; }
	this.SetHideShowId		= function _setHideShowId(_value) { _hideShowId = _value; }
	this.GetProperty		= _getProperty;
	this.Draw				= _draw;
	this.Redraw				= _redraw;
	this.Resize				= _resize;
	this.HCPointClicked		= _hcPointClicked;

	// other callback methods
	this.TypeToPie			= _typeToPie;
	this.TypeToLine			= _typeToLine;
	this.TypeToBar			= _typeToBar;
	this.TypeToSpline		= _typeToSpline;
	this.TypeToArea			= _typeToArea;
	this.Hide				= _hide;
	this.Show				= _show;
	this.ToggleHideShow		= _toggleHideShow;
	
	// for drill down we need to trap when a point has been clicked
	function _fireOnPointClicked(_item)	{ _handler.FireEvent(_item, 'onPointClicked'); _handler.FireEvent(_item, 'Refresh');}
	
	this.DrillDownEvent		= _drillDownEvent;
	this.DrillUpEvent		= _drillUpEvent;
	 
	var _idParts = _id.split('.');
	if(_idParts.length>1) _prefix = _prefix = _idParts[0];
	 
	// initialise drillPath to top level
	_drillPath[0] 	= '...';
	_clicked		= '...';
	 
	function _resize()
	{
		var _mainObj					= document.getElementById('main_' + _id)
		if(_mainObj!=null)
		{
			if(_mainObj.style.position=='absolute') return;
			_chart.setSize(parseInt(_mainObj.parentNode.offsetWidth,10) - 20, parseInt(_mainObj.parentNode.offsetHeight,10) - 20);
		} else
		{
			var _dhxMain = _findHTMLObject(document.getElementById(_target.id).parentNode.parentNode, 'dhxMainCont');
			
			if(_dhxMain!=null && document.getElementById(_target.id).style.position!='absolute')
			{
				document.getElementById(_target.id).style.width = parseInt(_dhxMain.style.width,10);
				document.getElementById(_target.id).style.height = parseInt(_dhxMain.style.height,10);
				
				_dhxMain.style.overflow = 'hidden';
				_chart.setSize(parseInt(_dhxMain.style.width,10)-2, parseInt(_dhxMain.style.height,10)-4);
			} else
			{
				if(document.getElementById(_target.id).style.position=='absolute') return;
				
				var _b = parseInt(document.getElementById(_target.id).style.border);
				_chart.setSize(parseInt(document.getElementById(_target.id).offsetWidth,10)-(_b*2), parseInt(document.getElementById(_target.id).offsetHeight,10) - (_b*2));
			}
		}
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
	 
	function _typeToAny(_item, _toType)
	{
		_drillDepth 		= 0;
		_clicked			= "...";
		_drillPath.length	= 1;
		
		for(var i=0; i<_series.length; i++)
		{
			try {
				_series[i].setAttribute('type', _toType);
				_chart['series'][0].remove();
				
				var _nexts = _series[i].getElementsByTagName('next');
				if(_nexts!=null) for(var n=0; n<_nexts.length; n++) _nexts[n].setAttribute('type', _toType);
			} catch (e) { }
		}
		_handler.FireEvent(_id, "Refresh");

		_redraw();
	}
	
	function _typeToPie(_item)
	{
		_typeToAny(_item, "pie");
	}
	
	function _typeToLine(_item)
	{
		_typeToAny(_item, "line");
	}
	
	function _typeToBar(_item)
	{
		_typeToAny(_item, "bar");
	}
	
	function _typeToSpline(_item)
	{
		_typeToAny(_item, "spline");
	}
	
	function _typeToArea(_item)
	{
		_typeToAny(_item, "area");
	}
	
	/**
	 * HCPointClicked()
	 * we link the highcharts point click to this, which in turn fires the event to
	 * our event handler to be consumed by other stuff
	 */
	function _hcPointClicked(_event)
	{
		try {
			if(_event.point!=null)
			{
				_clicked = _chart.xAxis[0].categories[parseInt(_event.point.x)];
				_fireOnPointClicked(_id + "^" + _clicked);
			}
		} catch(e) { }
		
		// allow default action also
		return true;
	}
	
	function _drillDownEvent(_item)
	{
		_drillDepth++;
		_drillPath[_drillDepth] 	= _item.split('^')[1];
		_drillPath.length			= _drillDepth + 1;
		
		_handler.FireEvent(_id + "^" + _item, "onDrillDown");
		_handler.FireEvent(_id, "Refresh");
		
		_redraw();
	}
	
	function _drillUpEvent(_item)
	{
		if(_drillDepth==0) return;
		
		_drillDepth--;
		_drillPath.length			= _drillDepth + 1;
		
		try {		
			_clicked=_drillPath[_drillDepth];
			_handler.FireEvent(_id + "^" + _drillPath[_drillDepth], "onDrillUp");
			_handler.FireEvent(_id, "Refresh");
		} catch(e) { }

		_redraw();
		
	}
	
	/**
	 * GetProperty()
	 * returns the named property
	 */
	function _getProperty(_propName, _option)
	{
		switch(_propName)
		{
			case 'id':
				return _id;
				
			case 'ClickedItem':
				return _clicked;
				
			case 'DrillDepth':
				return _drillDepth;
			
			case 'DrillPath':
				if(_option!=null)
				{
					var _parts 	= _option.split('=');
					var _delim	= (_parts.length==2)? _parts[1] : ',';
				}
				
				return _drillPath.join(_delim);
				
			default:
				_log('ERROR', _me, "Chart:GetProperty: unknown property: " + _propName);	
		}
		
		return null;
	}
	
	/**
	 * Draw()
	 * parses the XML description of the chart and renders it into the specified HTML object.
	 * We filter the available options from HC by the root property name to make sure we know
	 * we can render it properly. We also need to treat the 'series' differently because this
	 * is needs to be extracted from the specified data source. 
	 */
	function _draw()
	{
		if(_debug=="true") _addTimeline(_id, new Date(), null, 'draw chart');
		
		_configuration 	= new Array();
		_series			= new Array();
		for(var i=0; i<_xml.childNodes.length; i++)
		{
			var _child = _xml.childNodes[i];
			switch(_child.nodeName)
			{
				// we ignore the toolbar because it should have been drawn already by the dashboard
				case 'toolbar':
					break;
					
				case 'series':		
					_addSeries(_child);
					break;
				
				// we rename the chart parameters for HC to 'options' to avoid confusion	
				case 'options':		
					_configuration['chart'] = _xmlToJSON(_child);
					break;
				
				case 'xAxis':
				case 'yAxis':
					// handle multiple instances
					var _ax = _xmlToJSON(_child);
					if(_configuration[_child.nodeName] == null)
					{
						 _configuration[_child.nodeName] = _ax;
						 break;
					}
					
					// already an array, so just append
					if(_configuration[_child.nodeName] instanceof Array)
					{
						_configuration[_child.nodeName][_configuration[_child.nodeName].length] = _ax;
						break;
					}
					
					// not empty, and not an array so ...
					var _also = _configuration[_child.nodeName];
					_configuration[_child.nodeName] = [_also, _ax];
					break;
				
				case 'loading':	
				case 'lang':
				case 'legend':
				case 'title':
				case 'subtitle':
				case 'plotOptions':
				case 'credits':
				case 'point':
				case 'tooltip':
				case 'exporting':
				case 'navigation':
				case 'pane':
					_configuration[_child.nodeName] = _xmlToJSON(_child);
					break;
			}
		}
		
		// callback for click event for drilldown as required ...
		try {
			if(_configuration.plotOptions==null) _configuration.plotOptions = {}
			if(_configuration.plotOptions.series==null) _configuration.plotOptions.series = {}
			_configuration.plotOptions.series.cursor = 'pointer';
			_configuration.plotOptions.series.events = {click: _me.HCPointClicked }
		} catch(e) { }
		
		try {
			if(_configuration.exporting.buttons.drillUp!=null)
			{
				_configuration.exporting.buttons.drillUp.onclick = _me.DrillUpEvent;
			}
		} catch(e) { }
		
		_categories 										= _configuration['xAxis'].categories;
		_configuration['chart'].renderTo 	= _target.id;

		// version 2.3.5 of highcharts now require at least one series to be defined before the chart object can be created. Madness!
		_configuration.series = [];
		_configuration.series[0] = {type: 'column', data: 0}
		
//		_chart = new Highcharts.Chart(_configuration, null);
		_chart = new Highcharts.Chart(_configuration, LateLoading);

		// after we create the chart object we remove the dummy series ... ridiculous ...
		_chart.series[0].remove(false);
		
		// this is for debugging purposes
		this.THECHART = _chart;
		
		_handler.FireEvent(_id, "Refresh");
		
		_redraw();
		
		if(_debug=="true") _updateTimeline(_id, new Date());
		
	}
	
	/**
	 * redraw()
	 * redraws the chart series for us, and should also adjust the categories too
	 */
	function _redraw()
	{
		
		if(_chart['series'].length==0)
		{
			for(var i=0; i<_series.length; i++)
			{
				_addSeriesToChart(_series[i]);
			}
		} else
		{
			// use setData to update the series
			
			for(var i=0; i<_chart['series'].length; i++)
			{
				try {
					var _data = _getSeriesData(_series[i]);
					_chart['series'][i].setData(_data, false);
				} catch (e) { }
			}
		}

		_updateAxis();
		_chart.redraw();
		_resize();
	}
	
	/**
	 * addSeries()
	 * we only save the series definition but do nothing with it right away. Once the basic
	 * chart is drawn we then process the series. When an object fires a redraw to the chart
	 * we then adjust the series and categories based on the saved xml description. 
	 */
	function _addSeries(_node)
	{
		_series[_series.length] = _node;
		
		if(_node.childNodes!=null && _node.childNodes.length>0)
		{
			_handler.WantEvent(_id, _id, 'onPointClicked', 'DrillDownEvent', 'always');
		}		
	}
	
	function _getSeriesData(_nodeX)
	{
		var _node = _nodeX;
		if(_drillDepth>0)
		{
			try {
				_node = _nodeX.getElementsByTagName('next')[_drillDepth-1];
				if(_node==null)
				{
					 _drillPath.length = _drillDepth;
					 _drillDepth--;
				}
			} catch(e) { _node = _nodeX;}
		}
		
		var _type		= _node.getAttribute('type');
		var _data		= _node.getAttribute('data');
		var _json		= _xmlToJSON(_node);
		
		if(_type=='scatter')
		{
			// we have two data sources not one
			var _vals				= _data.split(',');
			if(_vals.length!=2)
			{
				alert('scatter graph requires TWO data sources');
				_log('ERROR', _me, 'Scatter graph requires TWO data sources - ' + _id);
				return null;
			}
			var _val_x				= _vals[0].split('.');
			var _val_y				= _vals[1].split('.');
			var _collect			= _getObjectByName(_val_x[0], _me);
			var _collect_y			= _getObjectByName(_val_y[0], _me);
		} else
		{
			var _parts		= _data.split('.');
			var _collect	= _getObjectByName(_parts[0], _me);
		}

		if(_collect!=null)
		{
			// then we have a collection - process that
			switch(_type)
			{
				case 'pie':
					var _values 	= _arrayToFloat(_collect.GetColumnValuesByName(_parts[1]));
					var _labels 	= _getAxisValues(_node);
					_json['data']	= _mergeArray(_labels, _values);
					break;
					
				case 'scatter':
					var _xvalues 	= _arrayToFloat(_collect.GetColumnValuesByName(_val_x[1]));
					var _yvalues 	= _arrayToFloat(_collect.GetColumnValuesByName(_val_y[1]));
					_json['data']	= _mergeArray(_xvalues, _yvalues);
					break;
					
				default:
					var _values		= _arrayToFloat(_collect.GetColumnValuesByName(_parts[1]));
					_json['data']	= _values;
					break;
			}
			
			// add the automatic events now
			_handler.WantEvent(_id, _collect.GetId(), 'onSortingEnd', 'Redraw', 'always');
			_handler.WantEvent(_id, _collect.GetId(), 'onFilterEnd', 'Redraw', 'always');
			_handler.WantEvent(_id, _collect.GetId(), 'Refresh', 'Redraw', 'always');
			
			return _json['data'];
		} else
		{
			_log('DEBUG', _me, 'CHART: Cannot Find data object: ' + _parts[0]);
		}
	}
	
	/**
	 * addSeriesToChart()
	 * This process the saved 'series' data and creates the JSON info for adding a series to the
	 * actual chart object. We need to convert the entire node to JSON and then fetch the actual
	 * data from the collection or grid object.
	 */
	function _addSeriesToChart(_node, _toType)
	{
		var _type		= _node.getAttribute('type');
		var _data		= _node.getAttribute('data');
		var _json		= _xmlToJSON(_node);
		
		if(_toType!=null) _type = _toType;
		
		if(_type=='scatter')
		{
			// we have two data sources not one
			var _vals				= _data.split(',');
			if(_vals.length!=2)
			{
				alert('scatter graph requires TWO data sources');
				_log('ERROR', _me, 'Scatter graph requires TWO data sources - ' + _id);
				return null;
			}
			var _val_x				= _vals[0].split('.');
			var _val_y				= _vals[1].split('.');
			var _collect			= _getObjectByName(_val_x[0], _me);
			var _collect_y			= _getObjectByName(_val_y[0], _me);
		} else
		{
			var _parts		= _data.split('.');
			var _collect	= _getObjectByName(_parts[0], _me);
		}
		
		if(_collect!=null)
		{
			// then we have a collection - process that
			switch(_type)
			{
				case 'pie':
					var _values 	= _arrayToFloat(_collect.GetColumnValuesByName(_parts[1]));
					var _labels 	= _getAxisValues(_node);
					_json['data']	= _mergeArray(_labels, _values);
					break;
					
				case 'scatter':
					var _xvalues 	= _arrayToFloat(_collect.GetColumnValuesByName(_val_x[1]));
					var _yvalues 	= _arrayToFloat(_collect.GetColumnValuesByName(_val_y[1]));
					_json['data']	= _mergeArray(_xvalues, _yvalues);
					break;
					
				default:
					var _values		= _arrayToFloat(_collect.GetColumnValuesByName(_parts[1]));
					_json['data']	= _values;
					break;
			}
			
			var _series = _chart.addSeries(_json, false, true);
			
			// add the automatic events now
			_handler.WantEvent(_id, _collect.GetId(), 'Refresh', 'Redraw', 'always');
			_handler.WantEvent(_id, _collect.GetId(), 'onSortingEnd', 'Redraw', 'always');
			_handler.WantEvent(_id, _collect.GetId(), 'onFilterEnd', 'Redraw', 'always');
			
			return _values;
		} else
		{
			_log('DEBUG', _me, 'CHART: Cannot Find data object: ' + _parts[0]);
		}

	}
	
	function _mergeArray(_a, _b)
	{
		var _ar = new Array();
		
		for(var i=0; i<_a.length; i++)
		{
			var a = new Array();
			a[0] = _a[i];
			a[1] = _b[i];
			_ar[_ar.length] = a;
		}
		
		return _ar;
	}
	
	/**
	 * arrayToFloat()
	 * the chart values need to be numeric, floats, but the collections and grids only
	 * give us strings - so we convert the entire dataset into floats.
	 */
	function _arrayToFloat(_array)
	{
		var _ar = [];
		for(var i=0; i<_array.length; i++) 
		{
			if(_array[i]=='unknown') _array[i] = 0.0;
            if(_array[i]=='null') {
                _ar[i] = null;
            } else {
                _ar[i] = parseFloat(_array[i]);
            }
		}
		return _ar;
	}
				
	function _getAxisValues(_forNode)
	{
		var _parts = null;
		
		if(_forNode==null)
		{
			if(_categories.charAt(0) == '[')
			{
				return eval(_categories);
			}
			
			if(_drillDepth>0)
			{
				// TODO - drill depth goes deeper than just one level
				var _node = _series[0].getElementsByTagName('next')[_drillDepth-1];
				_categories = _node.getAttribute('categories');
			} else
			{
				// reset to original categories values
				_categories = _xml.getElementsByTagName('xAxis')[0].getAttribute('categories');
			}
			
			_parts 		= _categories.split('.');
		} else
		{
			var _fromObj = _forNode.getAttribute('categories');
			_parts = _fromObj.split('.');
		}
		
		var _collect	= _getObjectByName(_parts[0], _me);
		if(_collect!=null)
		{
			// then we have a collection - process that
			// is it an object other than a collection so it must be a grid
			// there could be multiple columns specified so we split it again
			var _columns = _parts[1].split(',');
			var _values  = [];
			for(var i=0; i<_columns.length; i++)
			{
				_values[i] = _collect.GetColumnValuesByName(_columns[i]);
			}

			// then we re-assemble the columns side-by-side to create the categories
			// a single space is assumed as the join char
			var _cats = [];
			for(var i=0; i<_values[0].length; i++)
			{
				for(var c=0; c<_values.length; c++)
				{
					if(c==0)
					{
						_cats[_cats.length] = _values[c][i];
						continue;
					}
					
					_cats[_cats.length-1] += " " + _values[c][i];
				}
			}
			
			return _cats;
		}
		
		var _obj		= _getObjectByName(_parts[0], _me);
		if(_obj!=null)
		{
			// is it an object other than a collection so it must be a grid
			// there could be multiple columns specified so we split it again
			var _columns = _parts[1].split(',');
			var _values  = [];
			for(var i=0; i<_columns.length; i++)
			{
				_values[i] = _obj.GetColumnValuesByName(_columns[i]);
			}
			
			// then we re-assemble the columns side-by-side to create the categories
			// a single space is assumed as the join char
			var _cats = [];
			for(var i=0; i<_values[0].length; i++)
			{
				for(var c=0; c<_values.length; c++)
				{
					if(c==0)
					{
						_cats[_cats.length] = _values[c][i];
						continue;
					}
					
					_cats[_cats.length-1] += " " + _values[c][i];
				}
			}
			return _cats;
		}
	}
	
	function _updateAxis()
	{
		if(_categories==null) return;
		if(_chart!=null)
		{
			_chart.xAxis[0].setCategories(_getAxisValues(), false);
		}
	}
	
	/**
	 * xmlToJSON()
	 * This does its best to convert the xml description into a JSON structure automatically for us.
	 * It basically means that if the JSON data we pass to HC isnt good then its the users fault.
	 * We do need to be aware of some of the attribute names though - specifically those that are not
	 * strings. XML only understands strings, but javascript needs to know if its a number, boolean
	 * or a string - so we do a conversion on the parameters we are aware of - assuming string as default. 
	 */
	function _xmlToJSON(_node)
	{
		if(_node.nodeType!=1) return null;
		
		var _json = {}
		
		for(var i=0; i<_node.attributes.length; i++) 
		{
			switch(_node.attributes[i].nodeName)
			{
				/* ARRAY values */
				case 'center': case 'crosshairs':
				case 'linearGradient': case 'stops': case 'months': case 'weeks':
					_json[_node.attributes[i].nodeName] = eval(_node.attributes[i].nodeValue);
					break;
				
				/* FUNCTION values */
				case 'formatter': case 'click': case 'load': case 'selection': case 'addSeries':
				case 'mouseOver': case 'mouseOut': case 'remove': case 'unselect': case 'update':
				case 'labelFormatter': case 'setExtremes':
					 eval('_func = ' + _node.attributes[i].nodeValue) ;
					 _json[_node.attributes[i].nodeName] = _func;
					break;
				
				/* INTEGER values */	
				case 'x': case'y': case 'borderRadius': case 'borderWidth': case 'marginTop':
				case 'marginBottom': case 'marginLeft': case 'marginRight': case 'plotBorderWidth':
				case 'spacingTop': case 'spacingBottom': case 'spacingLeft': case 'spacingRight':
				case 'width': case'itemWidth': case 'lineHeight': case 'symbolPadding':
				case 'symbolWidth': case 'margin': case 'gridLineWidth': 
				case 'linkedTo': case 'maxPadding': case 'maxZoom': case 'radius':
				case 'minorGridLineWidth':  case 'minorTickLength':
				case 'minorTickWidth': case 'minPadding': case 'offset': case 'startOfWeek':
				case 'tickLength': case 'tickPixelInterval': case 'tickWidth': case 'snap':
				case 'zindex': case 'pointInterval': case 'minPointLength': case 'pointWidth':
				case 'pointStart': case 'slicedOffset': case 'hideDuration': case 'showDuration':
				case 'symbolSize': 
					_json[_node.attributes[i].nodeName] = parseInt(_node.attributes[i].nodeValue);
					break;
				
				/* FLOAT values */
				case 'fillOpacity': case 'groupPadding': case 'pointPadding': case 'lineWidth':
				case 'symbolX': case 'symbolY': case 'symbolStrokeWidth': case 'minorTickInterval':
				case 'min': case 'max':  case 'tickInterval':
					_json[_node.attributes[i].nodeName] = parseFloat(_node.attributes[i].nodeValue);
					break;
				
				/* BOOLEAN values */
				case 'alignTicks': case 'ignorHiddenSeries': case 'inverted': case 'plotShadow':
				case 'reflow': case 'shadow': case 'showAxes': case 'enabled': case 'floating':
				case 'endOnTick': case 'opposite': case 'showFirstLabel': case 'showLastLabel':
				case 'startOnTick': case'allowDecimals': case 'shared': case 'allowPointSelect':
				case 'animation': case 'enableMouseTracking': case 'showCheckbox': case 'showInLegend':
				case 'stickyTracking': case 'visible': case 'colorByPoint': case 'sliced': case 'polar':
					_json[_node.attributes[i].nodeName] = parseBool(_node.attributes[i].nodeValue);
					break;
				
				/* STRING values assumed */	
				default:
					_json[_node.attributes[i].nodeName] = _node.attributes[i].nodeValue;
			}
		}

		/**
		 * we need to follow the yellow brick road. 
		 * Sorry. I mean walk the entire hierarchy of XML of course.
		 * Always beware recursion.
		 */
		if(_node.hasChildNodes())
		{
			for(var i=0; i<_node.childNodes.length; i++)
			{
				var _childJson = _xmlToJSON(_node.childNodes[i]);
				if(_childJson!=null) _json[_node.childNodes[i].nodeName] = _childJson;
			}
		}
						
		return _json;
	}
	
	// why doesnt javascript have a parseBool method eh?
	function parseBool(_value)
	{
		var _v = new String(_value);
		if(_value.toLowerCase()=="true") return true;
		return false;
	}
}
