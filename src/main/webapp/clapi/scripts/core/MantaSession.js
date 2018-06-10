/*
 * (c) Brookes Management B.V. - 2010 - Colin Brookes
 * All Rights Reserved
 * 
 * This is the main class for interacting with the manta server.
 * It creates a session with the server, authenticating the user as required
 * and handled the user-specific properties and access control.
 * 
 * You can access the object hierarchy very simply, via the MantaSession class.
 */

function MantaSession()
{
	this.type							= 'Session';
	var _id								= 'session';
	var _me							= this;
	var _username					= 'guest';
	
	// public data
	this.User							= null;									// the current logged-in user
	this.Roles							= new Array();						// the role objects for the current user
	this.Preferences				= null;									// the preferences for the current tenant
	this.AJAX							= new MantaAJAX();				// this is the ajax controller for all ajax calls
	
	// public methods
	this.GetId							= function _getId() { return _id; }
	this.Login							= _login;
	this.IsLoggedIn					= _isLoggedIn;
	this.GetProperty				= _getProperty;
	this.GetAllProperties			= _getAllProperties;
	
	/**
	 * GetAllProperties
	 * Returns an array of all the properties
	 * @returns {Array}
	 */
	function _getAllProperties()
	{
		var _ar = new Array();
		
		_ar[_ar.length] = new kvp('id', _id);
		_ar[_ar.length] = new kvp('isLoggedIn', this.IsLoggedIn());
		_ar[_ar.length] = new kvp('username', _username);
		
		return _ar;
	}
	
	/**
	 * GetProperty
	 * @returns {String}
	 */
	function _getProperty(_name)
	{
		// TODO
		switch(_name)
		{
			case 'isLoggedIn':
				return this.IsLoggedIn();
				
			case 'username':
				return _username;
				
			default:
				return '';
		}
	}
	
	/**
	 * IsLoggedIn()
	 * checks that there is a valid session on the server and that the user is logged in.
	 * 
	 * @returns {Boolean}
	 */
	function _isLoggedIn()
	{
		var _result = this.AJAX.GetNowAsText('GET', _MantaRoot + _MantaActions.get('IsLoggedIn'));
		_result = this.AJAX.GetResultAsXML(_result);
		
		_username = getXMLNode(_result, 'username', 'guest');
		
		if(getXMLNode(_result, 'status', 'false') == 'true') return true;
		return false;
	}
	
	/**
	 * @method _login
	 * @param __username: authentication username for this session
	 * @param __password: authentication password for this session
	 * @returns boolean
	 * 
	 * Logs the user in with supplied credentials, or as guest.
	 */
	function _login(__username, __password, __authenticator)
	{
		if(__username==null) __username = 'guest';
		_username = __username;
		
		var _result = this.AJAX.GetNowAsText('POST', _MantaRoot + _MantaActions.get('login'), 'frm_username=' + escape(__username) + '&frm_password=' + escape(__password) + '&frm_authenticator=' + escape(__authenticator));
		
		_result = this.AJAX.GetResultAsXML(_result);
		
		
		if(getXMLNode(_result, 'status', '') == 'true')
		{
			window.location.href = getXMLNode(_result, 'url', '#');
		} else
		{
			document.getElementById('msg').innerHTML = getXMLNode(_result, 'message', 'unknown error during login attempt');
			setTimeout(clearMessage, 5000);
		}
	}
	
}
