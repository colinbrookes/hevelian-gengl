/**
 * (C) Brookes Management B.V. - Colin Brookes - 2012
 *
 * include: based on the URL parameters it decides which HEAD stuff needs to be included,
 * for example, whether to add the MAPS JS script tags etc.
 *
 */

function _addTimeline(_object, _start, _end, _description) { _timeline[_timeline.length] = {start: _start, end: _end, object: _object, description: _description}}
function _updateTimeline(_object, _end) { for(var i=_timeline.length-1; i>=0; i--) if(_object == _timeline[i].object && _timeline[i].end==null) { _timeline[i].end = _end; return; }}

_timeline						= new Array();
_Objects						= new Array();
_Collections					= new Array();
_Containers						= new Array();

_dictionary						= new Dictionary();
_Objects[_Objects.length]		= new kvp('Dictionary', _dictionary);

var _without 					= miniGetParam('without').toLowerCase();
var _debug						= miniGetParam('debug').toLowerCase();
var _cid						= miniGetParam('cid').toLowerCase();
var _style						= miniGetParam('style').toLowerCase();
var _script						= miniGetParam('script').toLowerCase();
var _charts						= miniGetParam('charts').toLowerCase();

if(_charts=='') _charts = '215';

if(_debug=="true") _addTimeline('page', new Date(), null, 'core page load');
if(_debug=="true") _addTimeline('includes', new Date(), null, 'include libraries'); 

function miniGetParam(_name) {
	var _url = new String(document.location.href);
	try { var _parts = _url.split("?")[1].split("&"); } catch(_e) { return ''; }
	for(var i=0; i<_parts.length; i++) { var _arg = _parts[i].split('='); if(_arg[0] == _name) { return _arg[1]; }}
	return '';
}

function BlockMove(event)
{
	// this prevents the 'body' moving to make it look like a native app on iOS
	if(_snooper.IsiPhoneOS) event.preventDefault();
}

function BrowserSnooper()
{
	this.IsiPhone 				= navigator.userAgent.indexOf("iPhone") != -1 ;
	this.IsiPod 				= navigator.userAgent.indexOf("iPod") != -1 ;
	this.IsiPad 				= navigator.userAgent.indexOf("iPad") != -1 ;
	this.IsiPhoneOS				= this.IsiPhone || this.IsiPad || this.IsiPod ;
	this.IsAndroid				= navigator.userAgent.indexOf("Android") != -1 ;
	
	this.IsMobile				= this.IsAndroid || this.IsiPhone || this.IsiPad || this.IsiPod;
}

var _snooper 					= new BrowserSnooper();

document.write('<meta http-equiv="content-type" content="text/html; charset=utf-8" />');

if(_snooper.IsiPhoneOS)
{
	document.write('<meta name="apple-mobile-web-app-capable" content="yes" />');
	document.write('<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />');
	document.write('<link rel="apple-touch-icon" href="clapi/images/apple-touch-icon.png" />');
}

// stylesheets
document.write('<link type="text/css" rel="stylesheet" href="clapi/dhtmlx/dhtmlx_material.css" charset="utf-8">');
//document.write('<link type="text/css" rel="stylesheet" href="clapi/ui/dhtmlx.css" charset="utf-8">');
//document.write('<link type="text/css" rel="stylesheet" href="clapi/ui/message_default.css" charset="utf-8">');
document.write('<link type="text/css" rel="stylesheet" href="clapi/css/960.css" charset="utf-8">');
document.write('<link type="text/css" rel="stylesheet" href="clapi/css/clapi.css" charset="utf-8">');

if(_style!="")
{
	document.write('<link type="text/css" rel="stylesheet" href="clapi/ui/custom/'+_style+'/custom.css">');
}

if(_cid!="")
{
	var _defaultImgsPath = 'clapi/ui/custom/'+_cid+'/imgs/';
	document.write('<link type="text/css" rel="stylesheet" href="clapi/ui/custom/'+_cid+'/dhtmlx_custom.css" charset="utf-8">');
} else
{
	var _defaultImgsPath = 'clapi/dhtmlx/imgs/';
}

if(_script!="")
{
	document.write('<script language="javascript" src="clapi/ui/custom/'+_script+'/custom.js" charset="utf-8"></script>');
}


// math js library
document.write('<script language="javascript" src="clapi/scripts/lib/math.min.js" charset="utf-8"></script>');

// default DHTMLX scripts
document.write('<script language="javascript" src="clapi/dhtmlx/dhtmlx.js" charset="utf-8"></script>');
//document.write('<script language="javascript" src="clapi/ui/dhtmlx.js" charset="utf-8"></script>');
//document.write('<script language="javascript" src="clapi/ui/message.js" charset="utf-8"></script>');

// essential libs
document.write('<script language="javascript" src="clapi/scripts/lib/encoder.js" charset="utf-8"></script>');
document.write('<script language="javascript" src="clapi/scripts/lib/date.format.js" charset="utf-8"></script>');
document.write('<script language="javascript" src="clapi/scripts/lib/svg.js" charset="utf-8"></script>');
document.write('<script language="javascript" src="clapi/scripts/core/ajax.js" charset="utf-8"></script>');
//document.write('<script language="javascript" src="clapi/scripts/core/Utils.js" charset="utf-8"></script>');

//jQuery Colour animations
document.write('<script language="javascript" src="clapi/scripts/lib/jquery-1.11.1.min.js" charset="utf-8"></script>');
document.write('<script language="javascript" src="clapi/scripts/lib/jquery-ui.min.js" charset="utf-8"></script>');
document.write('<script language="javascript" src="clapi/scripts/lib/jquery.color.js" charset="utf-8"></script>');

//Manta session and desktop mode scripts
document.write('<script language="javascript" src="clapi/scripts/core/MantaActions.js" charset="utf-8"></script>');
document.write('<script language="javascript" src="clapi/scripts/core/Manta.js" charset="utf-8"></script>');
document.write('<script language="javascript" src="clapi/scripts/core/MantaSession.js" charset="utf-8"></script>');
document.write('<script language="javascript" src="clapi/scripts/core/MantaUser.js" charset="utf-8"></script>');

// Core GenGL scripts
document.write('<script language="javascript" src="clapi/scripts/core/Container.js" charset="utf-8"></script>');
document.write('<script language="javascript" src="clapi/scripts/core/Events.js" charset="utf-8"></script>');
document.write('<script language="javascript" src="clapi/scripts/core/Constant.js" charset="utf-8"></script>');
document.write('<script language="javascript" src="clapi/scripts/core/ItemCollection.js" charset="utf-8"></script>');
document.write('<script language="javascript" src="clapi/scripts/core/Item.js" charset="utf-8"></script>');
document.write('<script language="javascript" src="clapi/scripts/core/Dashboard.js" charset="utf-8"></script>');
document.write('<script language="javascript" src="clapi/scripts/core/ForEach.js" charset="utf-8"></script>');
document.write('<script language="javascript" src="clapi/scripts/core/If.js" charset="utf-8"></script>');
document.write('<script language="javascript" src="clapi/scripts/core/Set.js" charset="utf-8"></script>');

// the connector objects
document.write('<script language="javascript" src="clapi/scripts/connectors/core_rotate.js" charset="utf-8"></script>');
document.write('<script language="javascript" src="clapi/scripts/connectors/core_subset.js" charset="utf-8"></script>');
document.write('<script language="javascript" src="clapi/scripts/connectors/core_xml.js" charset="utf-8"></script>');
document.write('<script language="javascript" src="clapi/scripts/connectors/core_range.js" charset="utf-8"></script>');
document.write('<script language="javascript" src="clapi/scripts/connectors/core_list.js" charset="utf-8"></script>');
document.write('<script language="javascript" src="clapi/scripts/connectors/core_exonite.js" charset="utf-8"></script>');
document.write('<script language="javascript" src="clapi/scripts/connectors/core_post.js" charset="utf-8"></script>');

document.write('<script language="javascript" src="clapi/scripts/connectors/socialmedia/media_rss.js" charset="utf-8"></script>');

document.write('<script language="javascript" src="clapi/scripts/connectors/information_builders/webfocus.js" charset="utf-8"></script>');

// default HIGHCHARTS scripts
if(_without.indexOf('highcharts')==-1)
{
	switch(_charts)
	{
		case 'uv':
			document.write('<script language="javascript" src="clapi/scripts/widgets/charts/uv/uvcharts.js" charset="utf-8"></script>');
			document.write('<script language="javascript" src="clapi/scripts/widgets/charts/uv/Chart.js" charset="utf-8"></script>');
			break;
			
		case '235':
//			document.write('<script language="javascript" src="clapi/scripts/widgets/charts/235/jquery.min.js" charset="utf-8"></script>');
			document.write('<script language="javascript" src="clapi/scripts/widgets/charts/235/highcharts.js" charset="utf-8"></script>');
			document.write('<script language="javascript" src="clapi/scripts/widgets/charts/235/canvas-tools.js" charset="utf-8"></script>');
			document.write('<script language="javascript" src="clapi/scripts/widgets/charts/235/data.js" charset="utf-8"></script>');
			document.write('<script language="javascript" src="clapi/scripts/widgets/charts/235/highcharts-more.js" charset="utf-8"></script>');
			document.write('<script language="javascript" src="clapi/scripts/widgets/charts/235/exporting.js" charset="utf-8"></script>');
			
			// GenGL Charts Component
			document.write('<script language="javascript" src="clapi/scripts/widgets/charts/235/Chart.js" charset="utf-8"></script>');
			break;
			
		default:
//			document.write('<script language="javascript" src="clapi/scripts/widgets/charts/215/jquery.min.js" charset="utf-8"></script>');
			document.write('<script language="javascript" src="clapi/scripts/widgets/charts/215/highcharts.js" charset="utf-8"></script>');
			document.write('<script language="javascript" src="clapi/scripts/widgets/charts/215/exporting.js" charset="utf-8"></script>');
			
			// GenGL Charts Component
			document.write('<script language="javascript" src="clapi/scripts/widgets/charts/215/Chart.js" charset="utf-8"></script>');
				
	}
}

// default MAP scripts
if(_without.indexOf('maps')==-1)
{
//	document.write('<script src="http://dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=6" charset="utf-8"></script>');
//	document.write('<script src="http://maps.google.com/maps/api/js?sensor=false&v=3" charset="utf-8"></script>');
//	document.write('<script type="text/javascript" src="clapi/scripts/widgets/maps/mapstraction/mxn.js?(microsoft,googlev3)" charset="utf-8"></script>');
//	document.write('<script type="text/javascript" src="clapi/scripts/widgets/maps/mapstraction/mxn.geocoder.js" charset="utf-8"></script>');
//	document.write('<script type="text/javascript" src="clapi/scripts/widgets/maps/mapstraction/mxn.googlev3.geocoder.js" charset="utf-8"></script>');
	
	// GenGL Maps Component
//	document.write('<script language="javascript" src="clapi/scripts/widgets/maps/Geo.js" charset="utf-8"></script>');
}

// GenGL Widgets
document.write('<script language="javascript" src="clapi/scripts/widgets/core/Layout.js" charset="utf-8"></script>');
document.write('<script language="javascript" src="clapi/scripts/widgets/core/Grid.js" charset="utf-8"></script>');
document.write('<script language="javascript" src="clapi/scripts/widgets/core/View.js" charset="utf-8"></script>');
document.write('<script language="javascript" src="clapi/scripts/widgets/core/Tree.js" charset="utf-8"></script>');
document.write('<script language="javascript" src="clapi/scripts/widgets/core/Tabbar.js" charset="utf-8"></script>');
document.write('<script language="javascript" src="clapi/scripts/widgets/core/URL.js" charset="utf-8"></script>');
document.write('<script language="javascript" src="clapi/scripts/widgets/core/Window.js" charset="utf-8"></script>');
document.write('<script language="javascript" src="clapi/scripts/widgets/core/Toolbar.js" charset="utf-8"></script>');
document.write('<script language="javascript" src="clapi/scripts/widgets/core/Panel.js" charset="utf-8"></script>');
document.write('<script language="javascript" src="clapi/scripts/widgets/core/Menu.js" charset="utf-8"></script>');
document.write('<script language="javascript" src="clapi/scripts/widgets/core/Accordion.js" charset="utf-8"></script>');
document.write('<script language="javascript" src="clapi/scripts/widgets/core/Image.js" charset="utf-8"></script>');
document.write('<script language="javascript" src="clapi/scripts/widgets/core/Region.js" charset="utf-8"></script>');
document.write('<script language="javascript" src="clapi/scripts/widgets/core/Message.js" charset="utf-8"></script>');

// GenGL Forms
document.write('<script language="javascript" src="clapi/scripts/widgets/forms/input_text.js" charset="utf-8"></script>');
document.write('<script language="javascript" src="clapi/scripts/widgets/forms/input_password.js" charset="utf-8"></script>');
document.write('<script language="javascript" src="clapi/scripts/widgets/forms/input_hidden.js" charset="utf-8"></script>');
document.write('<script language="javascript" src="clapi/scripts/widgets/forms/input_label.js" charset="utf-8"></script>');
document.write('<script language="javascript" src="clapi/scripts/widgets/forms/input_button.js" charset="utf-8"></script>');
document.write('<script language="javascript" src="clapi/scripts/widgets/forms/input_spacer.js" charset="utf-8"></script>');
document.write('<script language="javascript" src="clapi/scripts/widgets/forms/input_list.js" charset="utf-8"></script>');
document.write('<script language="javascript" src="clapi/scripts/widgets/forms/input_editor.js" charset="utf-8"></script>');

// if we are on a mobile device and we dont want to have the 'page' move ...
if(_snooper.IsMobile)
{
	document.body.ontouchmove 		= "BlockMove(event)";
	document.body.style.marginTop 	= "20px";
}

if(_debug=="true")
{
	document.write('<script language="javascript" src="clapi/scripts/core/Debugger.js" charset="utf-8"></script>');
}

if(_debug=="true") _updateTimeline('includes', new Date());
