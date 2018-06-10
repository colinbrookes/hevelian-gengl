/**
 * Image()
 * Allows placement of an image on the page, with effects such as rotate and drop-shadow, etc.
 * This uses SVG to render the image, but also places a transparent layer over the top if the 'lightbox' options are enabled.
 */

// add the Layout object to the dictionary
_dictionary.words.set('image', new DictionaryItem('image', _initImage, MyQImage));

function _initImage(_node, _to, _prefix, _me)
{
	var _n_id					= _prefix + _node.getAttribute('id');
	var _container		= new Container(_node, _n_id, _to, _prefix);
	var _toNode 			= _container.target;
	
	var _object				= new MyQImage(_node, _toNode, _prefix)
	
	_object.SetDashboard(_me);
	
	if(_container.hideShowId!=null) _object.SetHideShowId(_container.hideShowId);
	_object.SetEventHandler(_EventHandler);
	
	_Objects[_Objects.length] 			= new kvp(_n_id, _object);
	
	_object.Draw();
	
	return _object;
}


function MyQImage(__node, __target, __prefix)
{
	this.type								= 'Image';
	
	var _id									= __prefix + __node.getAttribute('id');
	var _prefix							= __prefix;
	var _hideShowId				= _id;
	var _target							= __target;
	var _xml								= __node;
	var _handler						= null;
	var _dashboard					= null;
	var _me								= this;
	
	this.Draw							= _draw;
	this.Redraw						= _redraw;
	this.GetProperty				= _getProperty;
	this.SetEventHandler		= function _setEventHandler(__handler) { _handler = __handler; }
	this.SetHideShowId			= function _setHideShowId(_value) { _hideShowId = _value; }
	this.SetDashboard				= function _setDashboard(_value) { _dashboard = _value; }
	this.GetId							= function _getID() { return _id; }
	
	function _getProperty(_name)
	{
		return '';
	}
	
	function _draw()
	{
		_redraw();
	}
	
	function _redraw()
	{
		var _image 					= _evaluate(_me, _xml.getAttribute('src'), true);
		var _rotate						= _xml.getAttribute('rotate');
		var _allowZoom			= _xml.getAttribute('allowZoom');
		var _partOfSet				= _xml.getAttribute('partOfSet');
		var _width						= _xml.getAttribute('width');
		var _height						= _xml.getAttribute('height');
		var _maxWidth				= _xml.getAttribute('maxWidth');
		var _maxHeight				= _xml.getAttribute('maxHeight');
		var _shadowColour		= _xml.getAttribute('shadowColour');
		var _padding					= _xml.getAttribute('padding');
		var _background			= _xml.getElementsByTagName('background');
		var _foreground			= _xml.getElementsByTagName('foreground');
	
		// first add background if defined
		if(_background!=null && _background.length > 0)
		{
			var _divBack		= document.createElement('DIV');
			_target.appendChild(_divBack);
			_divBack.style.zIndex = -1;
			_setDivStyle(_divBack, _width, _height, _padding);
			
			_drawSVG(_divBack, _background[0]);
		}
		
		// then add the div for the object
		var _div 				= document.createElement('DIV');
		_target.appendChild(_div);
		_div.style.zIndex = 1;
		
		// finally add the foreground div
		if(_foreground!=null && _foreground.length > 0)
		{
			var _divFront		= document.createElement('DIV');
			_target.appendChild(_divFront);
			_divFront.style.zIndex = 2;
			_setDivStyle(_divFront, _width, _height, _padding);
			
			_drawSVG(_divFront, _foreground[0]);
		}
		
		// if the user specified a rotation angle, then use it
		if(_rotate!=null)
		{
			_target.style['transform']					= 'rotate('+_rotate+')';
			_target.style['-webkit-transform']	= 'rotate('+_rotate+')';
			_target.style['-ms-transform']			= 'rotate('+_rotate+')';
			_target.style['-moz-transform']		= 'rotate('+_rotate+')';
			_target.style['-o-transform']			= 'rotate('+_rotate+')';
		}

		_target.style.overflow						= 'hidden';
		
		// now we create the IMG object in the DOM
		var _imageObj = document.createElement('IMG');
		_imageObj.setAttribute('src', _image);
		_imageObj.setAttribute('id', 'image_' + _id);
		_div.appendChild(_imageObj);
		
		// allow for percentages as width and height
		try { if(_width.indexOf('%') != -1) 	_width 	= (_target.clientWidth * (parseInt(_width)/100)); } catch(e) { }
		try { if(_height.indexOf('%') != -1) _height 	= (_target.clientHeight * (parseInt(_height)/100)); } catch(e) { }

		if(_maxWidth!=null)			 _imageObj.style.maxWidth 				= parseInt(_maxWidth,10);
		if(_maxHeight!=null)		 	_imageObj.style.maxHeight 				= parseInt(_maxWidth,10);
		if(_width!=null) 				 _imageObj.style.width			 			= parseInt(_width,10);
		if(_height!=null)				 _imageObj.style.height 					= parseInt(_height,10);
		if(_padding!=null)				 _imageObj.style.margin					= parseInt(_padding,10);
		
	}
	
	function _drawSVG(_to, _svg)
	{
		var _nodes 		= _svg.childNodes;
		var _r				= new Raphael(_to);
		
		for(var i=0; i<_nodes.length; i++)
		{
			var _node = _nodes[i];
			if(_node.nodeType!=1) continue;
			
			switch(_node.nodeName.toLowerCase())
			{
				case 'text':
					var _s			= _r.text(parseInt(_node.getAttribute('left'),10), parseInt(_node.getAttribute('top'),10), _node.firstChild.nodeValue);
					_setSVGAttributes(_s, _node);
					break;
				
				case 'ellipse':
					var _s			= _r.ellipse(parseInt(_node.getAttribute('left'),10), parseInt(_node.getAttribute('top'),10), parseInt(_node.getAttribute('radiusHorizontal'),10), parseInt(_node.getAttribute('radiusVertical'),10));
					_setSVGAttributes(_s, _node);
					break;
				
				case 'circle':
					var _s			= _r.circle(parseInt(_node.getAttribute('left'),10), parseInt(_node.getAttribute('top'),10), parseInt(_node.getAttribute('radius'),10));
					_setSVGAttributes(_s, _node);
					break;
				
				case 'path':
					var _s			= _r.path(_node.firstChild.nodeValue);
					_setSVGAttributes(_s, _node);
					break;
					
				case 'rectangle':
					var _radius	= _node.getAttribute('radius');
					if(_radius==null) _radius = '0';
					var _s			= _r.rect(parseInt(_node.getAttribute('left'),10),parseInt(_node.getAttribute('top'),10),parseInt(_node.getAttribute('width'),10),parseInt(_node.getAttribute('height'),10), parseInt(_radius));
					_setSVGAttributes(_s, _node);
					break;
					
				default:
					break;
			}
		}
		
		function _setSVGAttributes(_s, _node)
		{
			var _attributes				= _node.attributes;
			
			for(var i=0; i<_attributes.length; i++)
			{
				var _attribute = _attributes[i];
				switch(_attribute.nodeName)
				{
					case 'fill':										_s.attr({'fill': _attribute.nodeValue});									break;
					case 'fillOpacity':							_s.attr({'fill-opacity': _attribute.nodeValue});					break;

					case 'strokeWidth':						_s.attr({'stroke-width': _attribute.nodeValue});					break;
					case 'strokeColour':						_s.attr({'stroke': _attribute.nodeValue});								break;
					case 'strokeDashArray':				_s.attr({'stroke-dasharray': _attribute.nodeValue});			break;
					case 'strokeLineCap':					_s.attr({'stroke-linecap': _attribute.nodeValue});				break;
					case 'strokeLineJoin':					_s.attr({'stroke-linejoin': _attribute.nodeValue});				break;
					case 'strokeMiterLimit':				_s.attr({'stroke-miterlimit': _attribute.nodeValue});			break;
					case 'strokeOpacity':					_s.attr({'stroke-opacity': _attribute.nodeValue});				break;

					case 'font':										_s.attr({'font': _attribute.nodeValue});								break;
					case 'fontFamily':							_s.attr({'font-family': _attribute.nodeValue});					break;
					case 'fontSize':								_s.attr({'font-size': _attribute.nodeValue});						break;
					case 'fontWeight':							_s.attr({'font-weight': _attribute.nodeValue});					break;
					case 'textAnchor':							_s.attr({'text-anchor': _attribute.nodeValue});					break;

					case 'linkTo':									_s.attr({'href': _attribute.nodeValue});								break;
					case 'linktoTarget':						_s.attr({'target': _attribute.nodeValue});								break;
					
					case 'opacity':								_s.attr({'opacity': _attribute.nodeValue});							break;
					case 'tooltip':									_s.attr({'title': _attribute.nodeValue});									break;

					default:
						break;
				}
			}	
		}
	}
	
	function _setDivStyle(_div, _width, _height, _padding)
	{
		if(_width!=null)
		{
			var _w								= (_padding!=null)? parseInt(_width,10) + (parseInt(_padding,10)*2) : parseInt(_width,10);
			_div.style.width				= _w;
		}
		
		if(_height!=null)
		{
			var _h								= (_padding!=null)? parseInt(_height,10) + (parseInt(_padding,10)*2) : parseInt(_height,10);
			_div.style.height			= _h;
		}
		
		_div.style.top					= 0;
		_div.style.left					= 0;
		_div.style.position			= 'absolute';
		_div.style.border			= '0px solid black';
	}
	
}
