/**
 * Item
 * When a 'row' of data has been fetched, they are translated into a set of Item objects.
 * The original data source is used to determine the property key value pairs, plus a couple
 * of 'built-in' values.
 */
function Item(_xml, _type, _columns)
{
	var _properties					= [];
	var _me								= this;
	
	this.columns						= _columns;
	this.isDirty							= false;
	this.isDeleted						= false;
	this.isNew							= false;
	this.GetProperty				= _getProperty;
	this.GetAllProperties			= _getAllProperties;
	this.SetProperty					= _setProperty;
	
	/**
	 * On initialisation, the XML is processed to normalise the item data into key-value pairs.
	 * The Item understands three types of XML data - a pre-processed array, flat item list and webfocus xml. 
	 */
	switch(_type)
	{
		case  'array':
			_properties = _xml;
			break;
			
		case 'fxf':
			// webfocus
			var _Cells = _xml.getElementsByTagName('td');
			for(var i=0; i<_Cells.length; i++)
			{
				var _Cell = _Cells[i];
				_properties[_properties.length] = new kvp(_findValueByKey(_columns, _Cell.getAttribute('colnum')), (_Cell.firstChild!=null)?_Cell.firstChild.nodeValue:'');
			}
			break;
			
		default:
			for(var i=0; i<_xml.attributes.length; i++)
			{
				_properties[_properties.length] = new kvp(_xml.attributes[i].name, _xml.attributes[i].value);
			}
			
			if(_xml.childNodes!=null && _xml.childNodes.length>0)
			{
				var _nodeValue = (_xml.firstChild.nodeValue!=null)? _xml.firstChild.nodeValue : '';
				_properties[_properties.length] = new kvp('nodeValue', _nodeValue);
				
				for(var i=0; i<_xml.childNodes.length; i++)
				{
					var _node 		= _xml.childNodes[i];
					
					if(_node.nodeName == '#text') { continue; }
					
					var _nodeName	= _node.nodeName;
					var _nodeValue	= (_node.firstChild==null)? '' : _node.firstChild.nodeValue;
					
					_properties[_properties.length] = new kvp(_nodeName, _nodeValue);
				}
			}
	}
	
	/**
	 * GetAllProperties()
	 * The _properties array contains the key-value pairs for this Item. This function will return the
	 * entire array.
	 */
	function _getAllProperties()
	{
		return _properties; 
	}
	
	/**
	 * GetProperty()
	 * This returns the value for a _named property for the current Item.
	 */
	function _getProperty(_name)
	{
		for(var i=0; i<_properties.length; i++) if(_properties[i].key == _name) return _properties[i].value;
		return '';
	}
	
	/**
	 * SetProperty()
	 * This sets the value for a _named property to the provided _value. It also sets the 'dirty' flag so
	 * we know that the dataset has been changed locally. The property must be a pre-existing property - i.e.
	 * it was a property from the original data-source, so this method cannot be used to 'add' a new property
	 * to the Item. 
	 *
	 * TODO - this should probably fire an event?
	 */
	function _setProperty(_name, _value)
	{
		for(var i=0; i<_properties.length; i++)
		{
			if(_properties[i].key == _name)
			{
				_properties[i].value 		= _value;
				_properties[i].isDirty		= true;
				return;
			}
		}
		
		// we didnt find it, so we add a property
		_properties[_properties.length] = new kvp(_name, _value);
	}
}
