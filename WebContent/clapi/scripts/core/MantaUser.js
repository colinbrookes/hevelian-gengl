/*
 * (c) Brookes Management B.V. - 2012 - Colin Brookes
 * All Rights Reserved
 * 
 */

function MantaUser(__session)
{
	this.type							= 'User';
	var _id								= 'user';
	
	var _session						= __session;
	
	this.Role							= null;
	this.Preferences				= null;
	this.Properties					= null;
	this.Tokens						= null;
	
	
	this.GetId							= function _getId() { return _id; }
	this.Redraw						= function _redraw() { }
	this.Draw							= function _draw() { }
	this.FetchProperties			= _fetchProperties;
	this.GetProperty				= _getProperty;
	this.GetAllProperties			= function _getAllProperties() { return this.Properties.all(); }
	this.HasToken					= _hasToken;
	
	if(_session.IsLoggedIn() == true)
	{
		this.FetchProperties();
	}
	
	/**
	 * GetProperty
	 * @returns {String}
	 */
	function _getProperty(_name)
	{
		return this.Properties.get(_name);
	}
	
	/**
	 * FetchProperties()
	 * retrieves the person properties.
	 */
	function _fetchProperties()
	{
		this.Properties = _session.AJAX.GetNowAsArray(_MantaRoot + _MantaActions.get('FetchUserProperties'), 'record');
	}
	
	/**
	 * HasToken()
	 * Checks to see if the user has the specified token or not. Users not logged in (i.e. guest users) automatically do not have access to anything with a token defined.
	 * @param _name
	 * @returns true if the user has this token, otherwise false
	 */
	function _hasToken(_name)
	{
		if(_session.IsLoggedIn() == false) return false;
		
		if(this.Tokens == null) _session.AJAX.GetNowAsArray(_MantaRoot + _MantaActions.get('FetchUserTokens'), 'tokens');
		
		return (this.Tokens.get(_name)==null)? false : true;
	}
}
