/*
 * (c) Brookes Management B.V. - 2010 - Colin Brookes
 * All Rights Reserved
 * 
 */

function attemptLogin(_form)
{
	document.MantaSession = new MantaSession();
	document.MantaSession.Login(document.getElementById('frm_username').value, document.getElementById('frm_password').value, document.getElementById('frm_authenticator').value);
}

function clearMessage()
{
	document.getElementById('msg').innerHTML = '&nbsp;';
}

function toggleMenu()
{
	var _menuObj = document.getElementById('mainmenu');
	
	_menuObj.style.display = (_menuObj.style.display=='none')? 'inline' : 'none';
}

function hideMenu()
{
	var _menuObj = document.getElementById('mainmenu');
	_menuObj.style.display = 'none';
}

function findFocusField(doc)
{
	if(doc==null) return;
	if(doc.forms==null) return;
	if(doc.forms.length == 0) return;
	
	for(var i=0; i<doc.forms[0].elements.length; i++)
	{
		if(doc.forms[0].elements[i].type == "hidden") continue;
		
		doc.forms[0].elements[i].focus();
		break;
	}
	
	return;
}