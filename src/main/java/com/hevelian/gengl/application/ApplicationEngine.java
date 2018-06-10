package com.hevelian.gengl.application;

import java.util.HashMap;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.hevelian.gengl.session.SessionStore;

/**
 * The ApplicationStore loads and caches the Applications. 
 * @author cb
 *
 */

@Component
public class ApplicationEngine {
	
	private static final Logger logger = LogManager.getLogger(ApplicationEngine.class);
	private final HashMap<String, Application> applications;
	
	@Autowired
	private SessionStore sessionStore;
	
	public ApplicationEngine() {
		applications = new HashMap<String, Application>();
	}
	
	public Application getApplication(String name) {
		
		if(sessionStore==null) {
			logger.debug("ApplicationEngine: SESSION IS NULL!");
		}
		
		Application application = applications.get(name);
		if(application==null) {
			try {
				application = new Application(name);
				applications.put(name, application);
				if(logger.isDebugEnabled()) { logger.debug("Application created successfully: {}", name); }
			} catch(Exception e) {
				logger.error("failed to create Application {}", name);
				return null;
			}
			
		}
		return application;
	}
}
