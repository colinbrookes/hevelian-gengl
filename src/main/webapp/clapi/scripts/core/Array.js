/**
 * MantaArray
 * Wrapper for JS array with additional functions and features to make [my] life easier.
 * @returns {MantaArray}
 */
function MantaArray()
{
	var _ar							= new Array();
	this.length						= 0;
	
	this.set						= _set;
	this.get						= _get;
	this.sort						= _sort;
	this.all						= _all;
	this.atIndex					= _atIndex;
	this.getItem					= _getItem;
	
	/**
	 * sort()
	 * sorts the keys using the method _by.
	 * 
	 * @param _by
	 */
	function _sort(_by)
	{
		_ar.sort(_by);
	}
	
	/**
	 * all()
	 * returns an array of kvp objects as stored in this instance.
	 * 
	 * @returns {Array}
	 */
	function _all()
	{
		return _ar;
	}

	/**
	 * atIndex()
	 * returns the item in the array as specified by the index.
	 * 
	 * @param _index
	 * @returns {object}
	 */
	function _atIndex(_index)
	{
		return _ar[_index];
	}
	
	/**
	 * set()
	 * sets the value of _key to _value if it already exists, otherwise it adds a new _key with _value.
	 * 
	 * @param _key
	 * @param _value
	 * @returns {_set}
	 */
	function _set(_key, _value)
	{
		for(var i=0; i<_ar.length; i++)
		{
			if(_ar[i].key == _key)
			{
				_ar[i].value = _value;
				return;
			}
		}
		
		_ar[_ar.length] = new kvp(_key, _value);
		this.length = _ar.length;
	}

	/**
	 * getItem()
	 * returns the entire kvp object and not just the value, or null if not found
	 * @param _key
	 * @returns kvp
	 */
	function _getItem(_key)
	{
		for(var i=0; i<_ar.length; i++)
		{
			if(_ar[i].key == _key)
			{
				return _ar[i];
			}
		}
		
		return null;
	}
	
	/**
	 * get()
	 * returns the value specified by 'key' or '_default' if key is not found.
	 * 
	 * @param _key
	 * @param _default
	 * @returns
	 */
	function _get(_key, _default)
	{
		for(var i=0; i<_ar.length; i++)
		{
			if(_ar[i].key == _key)
			{
				return _ar[i].value;
			}
		}
		
		if(_default!=null) return _default;
		return null;
	}
}