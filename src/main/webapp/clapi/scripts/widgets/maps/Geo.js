/**
 * geo()
 * Mapstraction integration.
 */
function Geo(__id, __target, __xml)
{
	this.type					= 'Geo';
	
	var _id								= __id;
	var _hideShowId			= __id;
	var _target						= __target;
	var _xml							= __xml;
	var _handler					= null;
	var _dashboard				= null;
	
	var _type							= "google";
	var _map						= null;
	var _markers					= new Array();
	var _locations				= new Array();
	var _icons						= new Array();
	var _regions					= null;
	var _countries				= null;
	var _latitudes					= new Array();
	var _longitudes				= new Array();
	var _iconsFrom				= null;
	var _me							= this;
	var _markersFrom				= '';
	var _markersRegion			= '';
	var _markersCountry		= '';
	var _markersLatitude		= '';
	var _markersLongitude	= '';
	var _markersIcon				= '';
	var _markerBubble			= '';
	var _zoom							= 1;
	var _index							= 0;
	
	var _by								= 0;
	var _BY_LATLON				= 1;
	var _BY_LOCATION			= 2;
	
	// public methods
	this.Draw												= _draw;
	this.Redraw											= _redraw;
	this.Resize												= _resize;
	this.GetProperty									= function _getProperty() { return null; }
	this.SetEventHandler							= function _setEventHandler(__handler) { _handler = __handler; }
	this.GetId												= function _getID() { return _id; }
	this.SetHideShowId								= function _setHideShowId(_value) { _hideShowId = _value; }
	this.SetDashboard									= function _setDashboard(_value) { _dashboard = _value; }

	this.GeocodeReturn								= _geocode_return;
	this.GeocodeError									= _geocode_error;
	this.DoGeocoding									= _doGeocoding;
	
	// convert map events into our events
	this.MapClickEvent								= _mapClickEvent;
	this.MapOpenBubbleEvent					= _mapOpenBubbleEvent;
	this.MapCloseBubbleEvent					= _mapCloseBubbleEvent;

	if(_xml.getAttribute('type')!=null) _type = _xml.getAttribute('type');
	if(_xml.getAttribute('zoom')!=null) _zoom = parseInt(_xml.getAttribute('zoom'));
	
	/**
	 * mapFireEvent()
	 * we capture some events from the underlying map object and find the marker related to it.
	 * We then fire our own event into the EventHandler with the id of the marker.
	 */
	function _mapFireEvent(_evtName, _evtSrc, _evtArgs, _ourEventName)
	{
		var _latlon	= _evtSrc.location.toString().split(',');
		var found	= -1;
		
		for(var i=0; i<_latitudes.length; i++)
		{
			if(parseFloat(_latlon[0])==_latitudes[i] && parseFloat(_latlon[1])==_longitudes[i])
			{
				// we found our marker
				found = i;
				break;
			}
		}
//		alert(_ourEventName);
		// only fire the event if we found it
		if(found != -1) _handler.FireEvent(_id + "^" + found, _ourEventName);
	}
	
	function _mapOpenBubbleEvent(_evtName, _evtSrc, _evtArgs)
	{
		_mapFireEvent(_evtName, _evtSrc, _evtArgs, "onOpenBubble");
	}
	
	function _mapCloseBubbleEvent(_evtName, _evtSrc, _evtArgs)
	{
		_mapFireEvent(_evtName, _evtSrc, _evtArgs, "onCloseBubble");
	}
	
	function _mapClickEvent(_evtName, _evtSrc, _evtArgs)
	{
		_mapFireEvent(_evtName, _evtSrc, _evtArgs, "onClick");
	}
	
	function _draw()
	{
		if(_debug=="true") _addTimeline(_id, new Date(), null, 'draw geo');
		
		_map = new mxn.Mapstraction(_target.id, _type);
		
		_map.addControls({
		        pan: true, 
		        zoom: 'small',
		        scale: true,
		        map_type: true
		    });
		    
		var _markers = _xml.getElementsByTagName('markers');
		if(_markers==null || _markers.length==0) return;
		
		_markersFrom 		= _markers[0].getAttribute('from');
		_markersRegion		= _markers[0].getAttribute('region');
		_markersCountry 	= _markers[0].getAttribute('country');
		_markersLatitude	= _markers[0].getAttribute('latitude');
		_markersLongitude	= _markers[0].getAttribute('longitude');
		
		try {
			_markerBubble = _xml.getElementsByTagName('infoBubble')[0].firstChild.nodeValue;
		} catch(e) { }
		
		// determine if we have lat/lon or postcode/country
		if(_markersLatitude!=null && _markersLongitude!=null) _by = _BY_LATLON;
		if(_by==0) _by = _BY_LOCATION;
		
		var _obj = _getObjectByName(_markersFrom);
		if(_obj==null) return;
		
		// add that we want to know if the grid is filtered so we can filter the markers
//		_handler.WantEvent(_id, _obj.GetId(), "onFilterEnd", "Redraw", "always");
//		_handler.WantEvent(_id, _obj.GetId(), "Refresh", "Redraw", "always");
		_handler.WantEvent(_id, _obj.GetId(), "*", "Redraw", "always");
		
		_redraw();
		
		if(_debug=="true") _updateTimeline(_id, new Date());
	}
	
	function _redraw()
	{
		_map.removeAllMarkers();
		
		var _markers = _xml.getElementsByTagName('markers');
		if(_markers==null || _markers.length==0) return;
		
		var _obj = _getObjectByName(_markersFrom, _me);
		if(_obj==null) return;
		
		var _nodeIcons	= _markers[0].getElementsByTagName('icons');
		if(_nodeIcons!=null && _nodeIcons.length>0)
		{
			_markersIcon	= _nodeIcons[0].getAttribute('default');
			_iconsFrom		= _obj.GetColumnValuesByName(_nodeIcons[0].getAttribute('from'));
			var _nodes		= _nodeIcons[0].getElementsByTagName('icon');
			for(var i=0; i<_nodes.length; i++)
			{
				_icons[_icons.length] = new kvp(_nodes[i].getAttribute('for'), _nodes[i].getAttribute('is'));
			}
		}
		
		switch(_by)
		{
			case _BY_LATLON:
				_latitudes 	= _obj.GetColumnValuesByName(_markersLatitude);
				_longitudes	= _obj.GetColumnValuesByName(_markersLongitude);
				_doMarkers();
				break;
				
			case _BY_LOCATION:
				_regions 	= _obj.GetColumnValuesByName(_markersRegion);
				_countries	= _obj.GetColumnValuesByName(_markersCountry);
				_index		= 0;
				_doGeocoding();
				break;
		}
	}
	
	function _resize()
	{
		_map.resizeTo(parseInt(_target.parentNode.style.width,10), parseInt(_target.parentNode.style.height,10));
	}
	
	/**
	 * _parseBubbleTemplateFor()
	 * probably the smallest template parser in the world.
	 *
	 * this takes any html and coverts the #var# strings into the actual values for
	 * the specified object.
	 */
	function _parseBubbleTemplateFor(_row)
	{
		if(_markerBubble==null || _markerBubble=='') return '';
		// return _evaluate(_me, _markerBubble, false);
		
		var _obj = _getObjectByName(_markersFrom);
		if(_obj==null) return;
		
		var _parts 	= _markerBubble.split('#');
		var _result	= '';
		
		// below is the actual parser ...
		for(var i=0; i<_parts.length; i++) _result += (i%2==0)? _parts[i] : _obj.GetPropertyForRow(_row, _parts[i]);
		
		return _result;
	}
	
	function _doMarkers()
	{
		for(var i=0; i<_latitudes.length; i++)
		{
			var geocode_marker 			= new mxn.Marker(new mxn.LatLonPoint(_latitudes[i], _longitudes[i]));
			_markers[_markers.length] 	= geocode_marker;
			
			geocode_marker.setIcon("clapi/images/icons/" + _findIconForType(_iconsFrom[i]));
			if(_markerBubble!=null && _markerBubble!='') geocode_marker.setInfoBubble(_parseBubbleTemplateFor(i));
			
			geocode_marker.click.addHandler(_me.MapClickEvent);
			geocode_marker.openInfoBubble.addHandler(_me.MapOpenBubbleEvent);
			geocode_marker.closeInfoBubble.addHandler(_me.MapCloseBubbleEvent);
			
			// display marker 
			_map.addMarker(geocode_marker);
		}
		
		_map.autoCenterAndZoom();
	}
	
	function _doGeocoding()
	{
		if(_index>=_regions.length)
		{
			_map.autoCenterAndZoom();
			return;
		}
		
		var _address 		= new Object();
		_address.region 	= _regions[_index];
		_address.country 	= _countries[_index];

		var _geocoder = new mxn.Geocoder("googlev3", _me.GeocodeReturn, _me.GeocodeError);
		
		_geocoder.geocode(_address);
		
	}
	
	function _geocode_error()
	{
		alert("GEOCODING ERROR FOR: " + _regions[_index] + "," + _countries[_index]);
		// now we do the next one
		_index++;
		_me.DoGeocoding();
	}
	
	function _geocode_return(geocoded_location)
	{
		var geocode_marker = new mxn.Marker(geocoded_location.point);
		
		// save the item in the array
		_latitudes[_index]				= geocoded_location.point.lat;
		_longitudes[_index]				= geocoded_location.point.lon;
		_locations[_locations.length] 	= geocoded_location;
		_markers[_markers.length] 		= geocode_marker;
		
		geocode_marker.setIcon("clapi/images/icons/" + _findIconForType(_iconsFrom[_index]));
		if(_markerBubble!=null && _markerBubble!='') geocode_marker.setInfoBubble(_parseBubbleTemplateFor(_index));
		
		geocode_marker.click.addHandler(_me.MapClickEvent);
		
		// display marker 
		_map.addMarker(geocode_marker);
		
		// now we do the next one
		_index++;
		_me.DoGeocoding();
	}
	
	function _findIconForType(_type)
	{
		for(var i=0; i<_icons.length; i++)
		{
			if(_icons[i].key==_type) return _icons[i].value;
		}
		
		// otherwise return the default
		return _markersIcon;
	}
}
