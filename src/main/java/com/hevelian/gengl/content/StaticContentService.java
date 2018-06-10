package com.hevelian.gengl.content;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hevelian.gengl.session.PropertyConstants;
import com.hevelian.gengl.session.SessionStore;

@Service
public class StaticContentService {

	private final StaticContentEngine staticContentEngine;
	
	@Autowired
	private SessionStore sessionStore;
	
	@Autowired
	public StaticContentService(StaticContentEngine staticContentEngine) {
		this.staticContentEngine = staticContentEngine;
	}
	
	public StaticContent getFromDocroot(String pathInfo, String filename, String fileExtension) {
		String applicationName = sessionStore.getProperty(PropertyConstants.APPLICATION);
		StaticContent staticContent = staticContentEngine.getStaticContent(applicationName, pathInfo, filename, fileExtension);
		return staticContent;
	}

	public StaticContent getFromDocroot(String applicationName, String pathInfo, String filename, String fileExtension) {
		StaticContent staticContent = staticContentEngine.getStaticContent(applicationName, pathInfo, filename, fileExtension);
		sessionStore.setProperty(PropertyConstants.APPLICATION, applicationName);
		return staticContent;
	}
}
