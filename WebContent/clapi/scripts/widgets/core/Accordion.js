/**
 * Accordion()
 * An accordion component doesnt actually draw anything for itself - it handles drawing the <accordion> components.
 */
function Accordion(__id, __target,__effect)
{
	this.type				= 'Accordion';
	
	var _id					= __id;
	var _hideShowId			= __id;
	var _target				= __target;
	var _handler			= null;
	var _items				= new Array();
	var _labels				= new Array();
	var _dhtmlxAccordion	= null;
	var _effect				= __effect;
	var _me					= this;
	
	// public methods
	this.Draw				= _draw;
	this.Redraw				= _redraw;
	this.AddItem			= _addItem;
	this.GetProperty		= _getProperty;
	this.SetEventHandler	= function _setEventHandler(__handler) { _handler = __handler; }
	this.SetHideShowId		= function _setHideShowId(_value) { _hideShowId = _value; }
	this.GetId				= function _getID() { return _id; }
	this.GetAccordion		= function _getAccordion() { return _dhtmlxAccordion; }
	this.GetDHTMLXObject	= this.GetAccordion;
	
	// allowed callbacks
	this.SwitchTo			= _switchTo;
	this.Hide				= _hide;
	this.Show				= _show;
	this.ToggleHideShow		= _toggleHideShow;
	
	// fired events
	this.FireOnActive		= _fireOnActive;
	this.FireOnBeforeActive	= _fireOnBeforeActive;

	// initialise the accordion
	_dhtmlxAccordion = (_target.attachAccordion!=null)? _target.attachAccordion() : new dhtmlXAccordion(_id);
	_dhtmlxAccordion.setSkin('dhx_skyblue');
	_dhtmlxAccordion.setEffect(_effect);
	_dhtmlxAccordion.setIconsPath(_defaultImgsPath);
	
	_dhtmlxAccordion.attachEvent('onActive', this.FireOnActive);
	_dhtmlxAccordion.attachEvent('onBeforeActive', this.FireOnBeforeActive);
	
	function _fireOnActive(_item)
	{
		_handler.FireEvent(_id + '^' + _item, 'onSelect');
		_handler.FireEvent(_id + '^' + _item, 'Refresh');
		return true;
	}
	
	function _fireOnBeforeActive(_item)
	{
		_handler.FireEvent(_id + '^' + _item, 'onBeforeSelect');
		return true;
	}
	
	function _getProperty(_item, _prop)
	{
		switch(_item)
		{
			case 'IsOpen':
				if(_prop==null) return "false";
				return (_dhtmlxAccordion.cells(_prop).isOpened())? "true" : "false";
				break;
				
			case 'OpenItemId':
				for(var i=0; i<_items.length; i++)
				{
					if(_dhtmlxAccordion.cells(_items[i].key).isOpened()) return _items[i].key;
				}
				break;
				
			case 'OpenItemName':
				for(var i=0; i<_items.length; i++)
				{
					if(_dhtmlxAccordion.cells(_items[i].key).isOpened()) return _dhtmlxAccordion.cells(_items[i].key).getText();
				}
				break;
				
			default:
				return '';
		}
	}
	
	function _switchTo(_something)
	{
		var _parts = _something.split('^');
		
		if(_getProperty('OpenItemId') == _parts[1]) return;
		
		_dhtmlxAccordion.cells(_parts[1]).open();
		_handler.FireEvent(_id + '^' + _getProperty('OpenItemId'), 'Refresh');
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
	
	function _addItem(__id, __label, __icon)
	{
		var _item 				= _dhtmlxAccordion.addItem(__id, _evaluate(_me, __label, true));
		
		_items[_items.length] 	= new kvp(__id, _item);
		_labels[_labels.length]	= new kvp(__id, __label);
		
		if(__icon!=null) _dhtmlxAccordion.cells(__id).setIcon(__icon);
		
		return _item;
	}
	
	function _draw()
	{
		_handler.FireEvent(_id + '^' + _getProperty('OpenItemId'), 'Refresh');
	}
	
	function _redraw()
	{
		for(var i=0; i<_labels.length; i++)
		{
			var _label 	= _labels[i];
			var _eval	= _evaluate(_me, _label.value, true);
			
			if(_eval!=_label.value) _dhtmlxAccordion.cells(_label.key).setText(_eval);
		}
		
		_handler.FireEvent(_id + '^' + _getProperty('OpenItemId'), 'Refresh');
	}
}
