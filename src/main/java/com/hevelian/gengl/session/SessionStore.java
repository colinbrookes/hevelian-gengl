package com.hevelian.gengl.session;

import java.util.HashMap;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextListener;

/**
 * The sessionStore contains some specific components such as the EntitlementDecisionStore
 * and stores general session properties (simple key-value pairs as strings).
 * 
 * @author cb
 *
 */
@Component
public class SessionStore {
	private static final Logger logger = LogManager.getLogger(SessionStore.class);
	private HashMap<String,String> properties = new HashMap<String, String>();

	// TODO: this should probably not be autowired ... test multiple user scenario with multiple sessions
	@Autowired
	private EntitlementDecisionStore entitlementDecisionStore;
	
	/**
	 * apparently, this ensures we have a new SessionStore per session context.
	 * @return
	 */
	@Bean public RequestContextListener requestContextListener(){
	    return new RequestContextListener();
	}
	
	public EntitlementDecisionStore getEntitlementDecisionStore() {
		logger.debug("SessionStore: entitlementDecisionStore: {}", entitlementDecisionStore);
		return entitlementDecisionStore;
	}
	
	/**
	 * basic getters and setters of any general property
	 * @param name
	 * @return
	 */
	public String getProperty(String name) {
		return properties.get(name);
	}
	
	public void setProperty(String name, String value) {
		properties.put(name, value);
	}
}
