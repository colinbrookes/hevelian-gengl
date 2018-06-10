<%@ page contentType="text/html; charset=UTF-8" session="false"
    pageEncoding="UTF-8" import="com.hevelian.gengl.core.*, javax.servlet.http.*, java.io.*" %><%
    
//    HttpSession r_session = request.getSession(true);
    Configuration conf = new Configuration();
    
    String index_signature = conf.getProperty("index_signature");
    if(index_signature==null) index_signature = "";
    
%><html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml">
	<head>
		<title>eXonite Administrator</title>
		<link type="text/css" rel="stylesheet" href="clapi/css/clapi.css"></link>
		<link type="text/css" rel="stylesheet" href="clapi/css/admin.css"></link>
		<script language="javascript" src="clapi/scripts/core/ajax.js"></script>
		<script language="javascript" src="clapi/scripts/core/Utils.js"></script>
		<script language="javascript" src="clapi/scripts/core/Array.js"></script>
		<script language="javascript" src="clapi/scripts/core/MantaActions.js"></script>
		<script language="javascript" src="clapi/scripts/core/Manta.js"></script>
		<script language="javascript" src="clapi/scripts/core/MantaSession.js"></script>
		<script langauge="javascript">

		function clearMessage()
		{
			document.getElementById('msg').innerHTML = '&nbsp;';
		}
		
		function initDoc()
		{
			findFocusField(document);
			var msg = GetURLParameter('message');

			if(msg!=null && msg!='') 
			{
				document.getElementById('msg').innerHTML = unescape(msg);
				setTimeout(clearMessage, 5000);
			}
		}
		
		</script>
	</head>
	<body onload="initDoc()" style="background-image: url(clapi/images/bgs/3.jpg)">
		<table cellpadding="0" cellspacing="0" border="0" width="100%" height="100%">
			<tr><td>&nbsp;</td><td>&nbsp;</td>
			</tr>
			<tr><td style="width: 60%">&nbsp;</td>
				<td class="login-outer">
					<form onSubmit="attemptLogin(this)" method="GET" action="javascript:void(null)">
						<table cellpadding="0" cellspacing="0" border="0" width="400px" height="200px">
							<tr><td class="login-inner">
								<input type="hidden" id="frm_authenticator" name="frm_authenticator" value="exonite_default"/>
							
								<input type="text" id="frm_username" name="frm_username">&nbsp;username<br/>
								<input type="password" id="frm_password" name="frm_password">&nbsp;password<br/><br/>
								
								<button type="submit">login</button><br/><br/>
								<span id="msg">&nbsp;</span>
							</td></tr>
						</table>
					</form>
				</td>
			</tr>
			<tr><td>&nbsp;</td><td class="manta-logo"><%=index_signature%></td>
			</tr>
		</table>
	</body>
</html>