function RangeConnector(__xml)
{
	var _XML		= __xml;
	var _from		= _XML.getAttribute('from');
	var _to			= _XML.getAttribute('to');
	var _step		= _XML.getAttribute('step');
	var _handler	= null;
	var _collection	= null;
	
	this.SetItemCollection	= function _setItemCollection(__collection) { _collection = __collection; }
	this.SetEventHandler	= function _setEventHandler(__handler) { _handler = __handler; }
	this.Select				= _select;

	function _selectDebug()
	{
		var _ar = [];
		_ar[_ar.length] = {id:"select", data:["RANGE FROM " + _from + ' TO ' + _to + ' STEP ' + _step]};
		return _ar;
		
	}
	
	function _select(_debug)
	{
		if(_debug==true) return _selectDebug();
		
		var _items		= [];
		var _cnt		= 0;
		
		try {
			var _f = _evaluate(_collection, _from, true);
			var _t = _evaluate(_collection, _to, true);
			var _s = _evaluate(_collection, _step, true);
		
			var _ff = parseFloat(_f);
			var _ft = parseFloat(_t);
			var _fs = parseFloat(_s);
			
			for(var i=_ff; i<=_ft; i+=_fs)
			{
				_cnt++;

				var _ar 				= [];
				_ar[0]					= new kvp("From", (i>0)?i-_fs:i);
				_ar[1]					= new kvp('Value', i);
				_ar[2]					= new kvp("StepCount", _cnt);
				
				_items[_items.length]	= new Item(_ar, 'array');
			}
		} catch(e) { console.log(e.message); }
		
		if(_ft%_fs != 0) {
			// we have a remainder which we should also add
			_cnt++;
			
			var _ar = [];
			_ar[0] = new kvp("From", _ft - (_ft%_fs));
			_ar[1] = new kvp("Value", _ft);
			_ar[2] = new kvp("StepCount", _cnt);
			
			_items[_items.length] = new Item(_ar, "array");
		}
		
		return _items;
	}
	
}
