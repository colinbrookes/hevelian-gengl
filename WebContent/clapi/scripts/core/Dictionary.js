/**
 * (C) Hevelian 2013
 * 
 * The Dictionary contains a mapping between the XML syntax and the actual objects. If you include or exclude some
 * object types, or if you create custom object types then the dictionary defines where they are and how to load them.
 */

function Dictionary()
{
	this.type							= 'Dictionary';

	
	var _id								= 'Dictionary';
	var _hideShowId						= _id;
	var _properties						= [];
	var _handler						= null;
	var _dashboard						= null;
	var _me								= this;
	
	this.Draw							= _doNothing;
	this.Redraw							= _doNothing;
	this.GetProperty					= _doNothing;
	this.Hide							= _doNothing;
	this.Show							= _doNothing;
	this.ToggleHideShow					= _doNothing;
	this.SetEventHandler				= function _setEventHandler(__handler) { _handler = __handler; }
	this.SetHideShowId					= function _setHideShowId(_value) { _hideShowId = _value; }
	this.SetDashboard					= function _setDashboard(_value) { _dashboard = _value; }
	this.GetId							= function _getID() { return _id; }
	
	this.words 		= new MantaArray();
	
	function _doNothing() { return null; }
}

function DictionaryItem(_tag, _init, _object)
{
	this.tag 			= _tag;
	this.init			= _init;
	this.object			= _object;
}