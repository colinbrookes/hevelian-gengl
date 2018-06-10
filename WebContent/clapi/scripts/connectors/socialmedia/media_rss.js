/**
 * (c) brookes management b.v. - 2012 - C.Brookes
 */
 
function RSSConnector(__xml)
{
	var _XML					= __xml;
	var _src						= _XML.getAttribute('src');
	var _handler				= null;
	var _collection			= null;
	var _channel				= null;
	
	this.SetItemCollection		= function _setItemCollection(__collection) { _collection = __collection; }
	this.SetEventHandler		= function _setEventHandler(__handler) { _handler = __handler; }
	this.Select							= _select;

	function _selectDebug()
	{
		var _ar = [];
		_ar[_ar.length] = {id:"select", data:["RSS FEED " + _src]};
		return _ar;
		
	}
	
	function _select(_debug)
	{
		if(_debug==true) return _selectDebug();
		
		var _items		= [];
		
		var _ajax 		= new sisAJAXConnector();

		_parameters		= _processParameters(_XML, _collection, _handler);
		
		_ajax.open("GET", _evaluate(_collection, _src, true) + _parameters, false);
		_ajax.send(null);
		
		var _doc = new sisXMLDocument(_ajax.responseText);
		
//		alert('returned XML: ' + _ajax.responseText);
		
		switch(DetermineFeedType(_doc))
		{
			case 'RSS2':
				_channel = new RSS2Channel(_doc);
				break;
				
			case 'Atom':
				_channel = new AtomChannel(_doc, _evaluate(_collection, _src, true));
				break;
		}
		
	    for (var i=0; i<_channel.items.length; i++)
	    {
			var _ar 				= [];
			
			try {
				// channel properties
				_ar[_ar.length]				= new kvp('channel_category_domain', _channel.category.domain);
				_ar[_ar.length]				= new kvp('channel_category_value', _channel.category.value);
			} catch(e) {}
			
			try {
				_ar[_ar.length]				= new kvp('channel_image_url', _channel.image.url);
				_ar[_ar.length]				= new kvp('channel_image_width', _channel.image.width);
				_ar[_ar.length]				= new kvp('channel_image_height', _channel.image.height);
			} catch(e) {}
				
			try {
				_ar[_ar.length]				= new kvp('channel_title', _channel.title);
				_ar[_ar.length]				= new kvp('channel_link', _channel.link);
				_ar[_ar.length]				= new kvp('channel_language', _channel.language);
				_ar[_ar.length]				= new kvp('channel_copyright', _channel.copyright);
			} catch(e) {}
				
				// item properties
			try {
				_ar[_ar.length]				= new kvp('title', _channel.items[i].title);
				_ar[_ar.length]				= new kvp('link', _channel.items[i].link);
				_ar[_ar.length]				= new kvp('description', _channel.items[i].description);
				_ar[_ar.length]				= new kvp('author', _channel.items[i].author);
				_ar[_ar.length]				= new kvp('comments', _channel.items[i].comments);
				_ar[_ar.length]				= new kvp('pubDate', _channel.items[i].pubDate);
			} catch(e) {}
				
			try {
				if(_channel.items[i].thumbnail.url!='' && _channel.items[i].thumbnail.url!=null)
				{
					_ar[_ar.length]				= new kvp('image_url', _channel.items[i].thumbnail.url);
					_ar[_ar.length]				= new kvp('image_width', _channel.items[i].thumbnail.width);
					_ar[_ar.length]				= new kvp('image_height', _channel.items[i].thumbnail.height);
				} else
				{
					_ar[_ar.length]				= new kvp('image_url', _channel.image.url);
					_ar[_ar.length]				= new kvp('image_width', _channel.image.width);
					_ar[_ar.length]				= new kvp('image_height', _channel.image.height);
				}
			} catch(e) {}
			
			// if we got any properties, then add it here
			if(_ar.length>0)		_items[_items.length]	= new Item(_ar, 'array');
	    }
		
//		alert('found ' + _items.length + ' items for ' + _src + _parameters);
		return _items;
	}
}

function DetermineFeedType(xml)
{
	var _root = findRootNode(xml);
	
	switch(_root.nodeName)
	{
		case 'feed': case 'FEED':
			return 'Atom';
			
		case 'rss': case 'RSS':
			return 'RSS2';
	}
}

function AtomChannel(rssxml, _url)
{
    this.link = _url;
    this.title;
    this.description;
    this.language;
    this.copyright;
    this.managingEditor;
    this.webMaster;
    this.pubDate;
    this.lastBuildDate;
    this.generator;
    this.docs;
    this.ttl;
    this.rating;
    this.category;
    this.image;

    this.items = new Array();
    
    var chanElement = rssxml.getElementsByTagName("feed")[0];
    var itemElements = rssxml.getElementsByTagName("entry");

	if(chanElement.getElementsByTagName('title')[0]!=null) 						this.title 						= chanElement.getElementsByTagName('title')[0].childNodes[0].nodeValue;
	if(chanElement.getElementsByTagName('updated')[0]!=null) 				this.pubDate 				= chanElement.getElementsByTagName('updated')[0].childNodes[0].nodeValue;
	if(chanElement.getElementsByTagName('generator')[0]!=null) 			this.generator 			= chanElement.getElementsByTagName('generator')[0].childNodes[0].nodeValue;
	
	this.lastBuildDate 		= this.pubDate;
	this.description			= this.title;
	
	this.category 				= new RSS2Category();	// just create the empty values
	this.image					= new RSS2Image();			// create empty values, will fill later
	
	this.image.url			= chanElement.getElementsByTagName('logo')[0].childNodes[0].nodeValue;

	var _link = AtomFindLink(chanElement, 'self');
	if(_link!=null) this.link = _link.getAttribute('href');
	
    for (var i=0; i<itemElements.length; i++)
    {
        var Item = new AtomEntry(itemElements[i]);
        this.items.push(Item);
    }

}

function AtomEntry(itemxml)
{
    this.title;
    this.link;
    this.description;
    this.author;
    this.comments;
    this.pubDate;
    this.category;
    this.enclosure;
    this.guid;
    this.source;
    this.thumbnail;

	if(itemxml.getElementsByTagName('title')[0]!=null) 						this.title 						= itemxml.getElementsByTagName('title')[0].childNodes[0].nodeValue;
	if(itemxml.getElementsByTagName('published')[0]!=null) 			this.pubDate 				= itemxml.getElementsByTagName('published')[0].childNodes[0].nodeValue;

	this.description 	= this.title;
	
	this.category			= new RSS2Category();
	this.thumbnail 		= new RSS2Image();
	
	var _link = AtomFindLink(itemxml, 'self');
	if(_link!=null) this.link = _link.getAttribute('href');
	
	// fix youtube link and thumbnail
	if(this.link!=null)
	{
		if(this.link.indexOf('youtube.com')>0)
		{
			// it is a youtube video - fix the link
			this.thumbnail.url = this.link.replace('http://gdata.youtube.com/feeds/base/videos', 'http://img.youtube.com/vi') + '/2.jpg';
			this.link = this.link.replace('http://gdata.youtube.com/feeds/base/videos', 'http://www.youtube.com/embed');
		}
	}
	
}

function AtomFindLink(xml, _type)
{
	var _links = xml.getElementsByTagName('link');
	
	for(var i=0; i<_links.length; i++)
	{
		var _rel = _links[i].getAttribute('rel');
		if(_rel==_type) return _links[i];
	}
	
	return null;
}

function RSS2Channel(rssxml)
{
    this.title;
    this.link;
    this.description;
    this.language;
    this.copyright;
    this.managingEditor;
    this.webMaster;
    this.pubDate;
    this.lastBuildDate;
    this.generator;
    this.docs;
    this.ttl;
    this.rating;
    this.category;
    this.image;

    this.items = new Array();

    var chanElement = rssxml.getElementsByTagName("channel")[0];
    var itemElements = rssxml.getElementsByTagName("item");

    var properties = new Array("title", "link", "description", "language", "copyright", "managingEditor", "webMaster", "pubDate", "lastBuildDate", "generator", "docs", "ttl", "rating");
    var tmpElement = null;
    for (var i=0; i<properties.length; i++)
    {
    	try {
	        tmpElement = chanElement.getElementsByTagName(properties[i])[0];
	        if (tmpElement!= null)
	            eval("this."+properties[i]+"=tmpElement.childNodes[0].nodeValue");
		} catch(e) { }
    }

	try {
		this.category = new RSS2Category(chanElement.getElementsByTagName("category")[0]);
	} catch(e) { }

	try {
		this.image = new RSS2Image(chanElement.getElementsByTagName("image")[0]);
	} catch(e) { }
    
    for (var i=0; i<itemElements.length; i++)
    {
    	try {
        	var Item = new RSS2Item(itemElements[i]);
        } catch(e) { continue; }
        
        this.items.push(Item);
    }
}

function RSS2Category(catElement)
{
    if (catElement == null) {
        this.domain = null;
        this.value = null;
    } else {
        this.domain = catElement.getAttribute("domain");
        this.value = catElement.childNodes[0].nodeValue;
    }
}

function RSS2Image(imgElement)
{
    this.url = null;
    this.link = null;
    this.width = null;
    this.height = null;
    this.description = null;
    
    if (imgElement == null) return;

	if(imgElement.attributes.length>0)
	{
		if(imgElement.getAttribute('url')!=null) 			this.url 			= imgElement.getAttribute('url');
		if(imgElement.getAttribute('width')!=null) 		this.width 		= imgElement.getAttribute('width');
		if(imgElement.getAttribute('height')!=null) 	this.height 		= imgElement.getAttribute('height');
		return;
    }
    
    this.url					= getXMLNode(imgElement, 'url', '');
    this.width				= getXMLNode(imgElement, 'width', '');
    this.height				= getXMLNode(imgElement, 'height', '');
}

function RSS2Item(itemxml)
{
    this.title = '';
    this.link = '';
    this.description = '';
    this.author = '';
    this.comments = '';
    this.pubDate = '';
    this.category;
    this.enclosure;
    this.guid;
    this.source;
    this.thumbnail;

    var properties = new Array("title", "link", "description", "author", "comments", "pubDate");
    var tmpElement = null;
    for (var i=0; i<properties.length; i++)
    {
    	try {
	        tmpElement = itemxml.getElementsByTagName(properties[i])[0];
	        if (tmpElement != null)
	            eval("this."+properties[i]+"=tmpElement.childNodes[0].nodeValue");
		} catch(e) { }
    }

	try {
	    this.category 			= new RSS2Category(itemxml.getElementsByTagName("category")[0]);
	} catch(e) { }

	try {
	    this.enclosure 		= new RSS2Enclosure(itemxml.getElementsByTagName("enclosure")[0]);
	} catch(e) { }

	try {
	    this.guid 				= new RSS2Guid(itemxml.getElementsByTagName("guid")[0]);
	} catch(e) { }

	try {
	    this.source 			= new RSS2Source(itemxml.getElementsByTagName("source")[0]);
	} catch(e) { }

	try {
	    this.thumbnail 		= new RSS2Image(itemxml.getElementsByTagName("thumbnail")[0]);
	} catch(e) { }
	
}

function RSS2Enclosure(encElement)
{
    if (encElement == null) {
        this.url = null;
        this.length = null;
        this.type = null;
    } else {
        this.url = encElement.getAttribute("url");
        this.length = encElement.getAttribute("length");
        this.type = encElement.getAttribute("type");
    }
}

function RSS2Guid(guidElement)
{
    if (guidElement == null) {
        this.isPermaLink = null;
        this.value = null;
    } else {
        this.isPermaLink = guidElement.getAttribute("isPermaLink");
        this.value = guidElement.childNodes[0].nodeValue;
    }
}

function RSS2Source(souElement)
{
    if (souElement == null) {
        this.url = null;
        this.value = null;
    } else {
        this.url = souElement.getAttribute("url");
        this.value = souElement.childNodes[0].nodeValue;
    }
}




