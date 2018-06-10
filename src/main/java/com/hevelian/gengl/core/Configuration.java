package com.hevelian.gengl.core;

import java.util.HashMap;

import javax.naming.Context;
import javax.naming.InitialContext;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.hevelian.gengl.service.api.ApplicationController;
import com.hevelian.gengl.session.PropertyConstants;
import com.hevelian.gengl.session.SessionStore;

@Component
public class Configuration {
	private static final Logger logger = LogManager.getLogger(ApplicationController.class);
	
	Context ctx 								= null;
	HashMap<String,String> config 				= new HashMap<String,String>();
	String homePath								= null;

	private final String CONTEXT_NAME			= "hevelian.gengl.home";
	private final String FOLDER_AUTHENTICATORS	= "authenticators/";
	private final String FOLDER_COLLECTIONS		= "collections/";
	private final String FOLDER_CONNECTORS		= "connectors/";
	private final String FOLDER_LAYOUTS			= "layouts/";
	private final String ADMIN_AUTHENTICATOR	= "exonite_admin";
	private final String CLASS_MAPPING			= "hevelian.xml";

	@Autowired
	private SessionStore sessionStore;

	public Configuration() {
		
		try {
		    
			ctx = new InitialContext();
			try {
				homePath = (String) ctx.lookup(CONTEXT_NAME);
			} catch(Exception e) {
				ctx = (Context) ctx.lookup("java:comp/env");
				homePath = (String) ctx.lookup(CONTEXT_NAME);
			}
			
			if(homePath==null) {
				if(logger.isDebugEnabled()) { logger.debug("Content 'hevelian' not found via JNDI"); }
				return;
			}
			
			if(sessionStore!=null) {
				String applicationName = sessionStore.getProperty(PropertyConstants.APPLICATION);
				if(applicationName!=null) {
					homePath += "applications/" + applicationName + "/";
				}
			}
			
			config.put("folder_home", homePath);
			config.put("folder_collections", FOLDER_COLLECTIONS);
			config.put("folder_authenticators", FOLDER_AUTHENTICATORS);
			config.put("folder_connectors", FOLDER_CONNECTORS);
			config.put("folder_layouts", homePath + FOLDER_LAYOUTS);

			config.put("admin_authenticator", ADMIN_AUTHENTICATOR);
			config.put("class_mapping", CLASS_MAPPING);
			
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	public String getProperty(String _name) {
		return (String) config.get(_name);
	}
	
}
