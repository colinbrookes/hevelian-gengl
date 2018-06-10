/**
 * (C) Hevelian 2016
 *
 * DS3/UVChart implementation of the charting component. This should be used instead of the Highchart version if you
 * do not have a licence for Highcharts.
 * 
 */

_dictionary.words.set('chart', new DictionaryItem('chart', _initChart, GenGLChart));

function _initChart(_node, _to, _prefix, _me)
{
	var _n_id					= _prefix + _node.getAttribute('id');
	var _object					= new GenGLChart(_n_id, _to, _node);
	
	_object.SetDashboard(_me);
	_object.SetEventHandler(_EventHandler);
	_Objects[_Objects.length] 	= new kvp(_n_id, _object);
	
	console.log("DRAW UVCHART");
	
	_object.Draw();
	return _object;
}

function GenGLChart(__id, __target, __node)
{
	this.type								= 'Chart';
	
	var _id									= __id;
	var _target								= __target;
	var _handler							= null;
	var _node 								= __node;
	var _dashboard							= null;

	var _xml								= __node;
	var _hideShowId							= _id;
	var _properties							= [];
	var _me									= this;

	/* uvChart specific stuff */
	var CHART								= null;
	var configuration						= null;
	var configurationXML					= null;
	var datasetXML							= null;
	var chartType							= null; 
	
	/* common methods and functions */
	this.Draw								= _draw;
	this.Redraw								= _redraw;
	this.Resize								= _resize;
	this.GetProperty						= _getProperty;
	this.Hide								= _hide;
	this.Show								= _show;
	this.ToggleHideShow						= _toggleHideShow;
	this.SetEventHandler					= function _setEventHandler(__handler) { _handler = __handler; }
	this.SetHideShowId						= function _setHideShowId(_value) { _hideShowId = _value; }
	this.SetDashboard						= function _setDashboard(_value) { _dashboard = _value; }
	this.GetId								= function _getID() { return _id; }

	/**
	 * These are the chart specific methods that need to be implemented.
	this.TypeToPie			= _typeToPie;
	this.TypeToLine			= _typeToLine;
	this.TypeToBar			= _typeToBar;
	this.TypeToSpline		= _typeToSpline;
	this.TypeToArea			= _typeToArea;
	this.DrillDownEvent		= _drillDownEvent;
	this.DrillUpEvent		= _drillUpEvent;
	 */

	function _getPhysicalTarget() {
		var _body; 
		if(_target.getFrame==null)
		{
			_body = _target;
		} else
		{
			try {
				var _frame = _target.getFrame();
				_body	= (_frame.contentWindow!=null)? _frame.contentWindow.document.body : _frame.contentDocument.document.body;
			} catch(e) { }
			if(_body==null) _body = _target;
			var _other = _findHTMLObject(_body, 'dhxMainCont');
			if(_other!=null)
			{
				_body = _other;
			}
		}
		
		if(_body.id==null || _body.id=='undefined' || _body.id=='') {
			_body.setAttribute("id", _id);
		}
		return _body;
	}
	
	function _resize() {
		var _body = _getPhysicalTarget();
		
		if(_body==null || configuration==null || configuration.dimension==null) return;
		if(_body.style.width != configuration.dimension.width || _body.style.height != configuration.dimension.height) {
			_draw();
		}
	}
	
	/**
	 * Draw()
	 * Should draw the static parts of the object, create any internal objects required and generally initialise stuff. 
	 * Included in the initialisation is the mapping of events from an underlying object to events fired off to the EventHandler.
	 * Normally this method gets called once when the page is loaded and then never again.
	 * It usually calls the _redraw() method once the initialisation has been done.
	 */
	function _draw()
	{
		if(_debug=="true") _addTimeline(_id, new Date(), null, 'draw chart');
		
		
		var _body = _getPhysicalTarget();
		
		for(var i=0; i<_xml.childNodes.length; i++)
		{
			var _child = _xml.childNodes[i];
			switch(_child.nodeName) {
			case 'configuration':
				configurationXML = _child;
				break;
				
			case 'datasets':
				datasetXML = _child;
				break;
			}
		}

		_redraw();
		if(_debug=="true") _updateTimeline(_id, new Date());
	}
	
	/**
	 * Redraw()
	 * When an event occurs that causes a 'refresh' the Redraw method gets called for any objects that want that event.
	 * The Redraw() method is where actual redering to the screen takes place - theoretically the only place.
	 */
	function _redraw()
	{
		var _body = _getPhysicalTarget();
		_body.innerHTML = "";
		
		configuration = xmlToJson(configurationXML);
		configuration.meta.position = '#' + _body.id;
		configuration.dimension = {}; 
		configuration.dimension.width = parseInt(_body.style.width) - 152;
		configuration.dimension.height = parseInt(_body.style.height) - 152;
		
		var graphdef = {};
		graphdef.categories = [];
		graphdef.dataset = {};
		
		for(var i=0; i<datasetXML.childNodes.length; i++) {
			var _child = datasetXML.childNodes[i];
			switch(_child.nodeName) {
			case 'dataset':
				var _dataset = _createDataSetObject(_child);
				if(_dataset!=null) {
					var _datasetId = _child.getAttribute('id');
					graphdef.dataset[_datasetId] = _dataset;
					graphdef.categories.push(_datasetId);
				}
				break;
			case 'forEach':
				/* we allow a dynamic number of datasets on the chart */
				break;
			}
		}
		
		var _chartType = _evaluate(_me, _xml.getAttribute('type'), true, _id);
		this.CHART = uv.chart(_chartType, graphdef, configuration);
	}
	
	/**
	 * builds a data set in the format required by uv charts.
	 * it is assumed that the labels and values are synchronised and therefore have the same number of items.
	 * 
	 * @param xml
	 * @returns
	 */
	function _createDataSetObject(xml) {
		var _values = xml.getElementsByTagName('values');
		var _labels = xml.getElementsByTagName('labels');
		
		if(_values==null || _values.length==0 || _labels==null || _labels.length==0) {
			return null;
		}
		
		_values = _evaluate(_me, _values.item(0).firstChild.nodeValue, true, _id);
		_labels = _evaluate(_me, _labels.item(0).firstChild.nodeValue, true, _id);
		
		var _valuesParts = _values.split('.');
		var _valuesObject = _getObjectByName(_valuesParts[0], _me, _id);
		var _actualValues = _valuesObject.GetColumnValuesByName(_valuesParts[1]);
		
		var _labelsParts = _labels.split('.');
		var _labelsObject = _getObjectByName(_labelsParts[0], _me, _id);
		var _actualLabels = _labelsObject.GetColumnValuesByName(_labelsParts[1]);
		
		var _set = [];
		for(var i=0; i<_actualLabels.length; i++) {
			_set.push({name : _actualLabels[i], value: parseFloat(_actualValues[i]) });
		}
		
		return _set;
	}
	
	/**
	 * GetProperty()
	 * returns the value associated with the 'name'. The actual properties could be stored in the internal array or may be fetched from an underlying object,
	 * or a combination of both.
	 * 
	 * @param _name
	 */
	function _getProperty(_name)
	{
		
	}
	
	/**
	 * ToggleHideShow()
	 * Flips the hide/show status. 
	 * 
	 * @returns {String}
	 */
	function _toggleHideShow()
	{
		var _div = document.getElementById(_hideShowId);
		if(_div==null) return;
		
		if(_div.style.display=='none') return _div.style.display = 'block';
		_div.style.display = 'none';
	}
	
	/**
	 * Hide()
	 * Hides the main div for this object.
	 */
	function _hide()
	{
		var _div = document.getElementById(_hideShowId);
		if(_div==null) return;
		
		if(_div.style.display=='none') return;
		_div.style.display = "none";
		
	}
	
	/**
	 * Show()
	 * Shows the main div for this object.
	 */
	function _show()
	{
		var _div = document.getElementById(_hideShowId);
		if(_div==null) return;
		
		if(_div.style.display=='block') return;
		_div.style.display = "block";
		
	}

	function xmlToJson(xml) {
		var obj = {};
		
		if(!HasChildNodes(xml)) return _evaluate(_me, xml.textContent, true, _id);
		
		for(var i=0; i<xml.childNodes.length; i++) {
			var _child = xml.childNodes.item(i);
			if(HasChildNodes(_child)) {
				var ret = xmlToJson(_child);
			}
			
			if(_child.nodeType==1) {
				obj[_child.nodeName] = xmlToJson(_child); 
			}
		}
		
		return obj;
	}

}
