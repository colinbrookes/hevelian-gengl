/**
 * (C) Brookes Management B.V. - 2012 - Colin Brookes
 *
 */

/*
 * 
 * The old PHP versions of the ACL functions ...
 * 
_MantaRoot		= "http://localhost/hevelian/server/php/";
_MantaActions 	= new MantaArray()

_MantaActions.set('login', 										'access_control/login.php');

_MantaActions.set('IsLoggedIn', 								'access_control/Action_IsLoggedIn.php');
_MantaActions.set('FetchUserProperties', 				'access_control/Action_FetchUserProperties.php');
*/

_MantaRoot		= "../exoniteJ/";
_MantaActions 	= new MantaArray()

_MantaActions.set('login', 								'Login.jsp');
_MantaActions.set('IsLoggedIn', 						'isLoggedIn.jsp');
_MantaActions.set('FetchUserProperties', 				'fetchUserProperties.jsp');
