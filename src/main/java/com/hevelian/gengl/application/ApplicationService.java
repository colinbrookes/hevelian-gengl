package com.hevelian.gengl.application;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hevelian.gengl.application.layout.LayoutDocument;
import com.hevelian.gengl.session.PropertyConstants;
import com.hevelian.gengl.session.SessionStore;

@Service
public class ApplicationService {

	private final ApplicationEngine applicationEngine;
	
	@Autowired
	private SessionStore sessionStore;
	
	@Autowired
	public ApplicationService(ApplicationEngine applicationEngine) {
		this.applicationEngine = applicationEngine;
	}
	
	public String getLayout(String layoutName) {
		String applicationName = sessionStore.getProperty(PropertyConstants.APPLICATION);
		LayoutDocument layout = null;
		try {
			layout = applicationEngine.getApplication(applicationName).getLayout(layoutName);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return layout.toString(sessionStore);
	}

	public String getLayoutForApplication(String applicationName, String layoutName) {
		LayoutDocument layout = null;
		try {
			layout = applicationEngine.getApplication(applicationName).getLayout(layoutName);
			sessionStore.setProperty(PropertyConstants.APPLICATION, applicationName);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return layout.toString(sessionStore);
	}
}
