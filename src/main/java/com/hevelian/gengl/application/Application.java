package com.hevelian.gengl.application;

import java.io.FileReader;
import java.util.HashMap;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;

import com.hevelian.gengl.application.layout.LayoutDocument;
import com.hevelian.gengl.core.Configuration;
import com.hevelian.gengl.session.SessionStore;

public class Application {

	private static final Logger logger = LogManager.getLogger(Application.class);
	private Configuration configuration = new Configuration();
	private String applicationName = null;

	private HashMap<String, LayoutDocument> layouts = new HashMap<String, LayoutDocument>();
	
	@Autowired
	private SessionStore sessionStore;
	
	public Application() {
		
	}
	
	public Application(String name) {
		applicationName = name;
	}
	
	public LayoutDocument getLayout(String name) {

		if(sessionStore==null) {
			logger.debug("Application: SESSION IS NULL!");
		}
		
		String layoutFile = configuration.getProperty("folder_home") + "applications/" + applicationName + "/layouts/" +  name + ".xml";
		LayoutDocument layoutDocument = null;
		
		if(layouts.containsKey(layoutFile)) {
			return layouts.get(layoutFile);
		}
		
		try {
			layoutDocument = new LayoutDocument(new FileReader(layoutFile));
			if(layoutDocument!=null) {
				layouts.put(layoutFile, layoutDocument);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	    
		return layoutDocument;
	}
}
