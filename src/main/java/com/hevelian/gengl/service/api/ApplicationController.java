package com.hevelian.gengl.service.api;

import javax.xml.parsers.ParserConfigurationException;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.hevelian.gengl.application.ApplicationService;

@Controller
public class ApplicationController {

	private static final Logger logger = LogManager.getLogger(ApplicationController.class);
	private final ApplicationService applicationService;
	
	@Autowired
	public ApplicationController(ApplicationService applicationService) {
		this.applicationService = applicationService;
	}
	
	/**
	 * returns the layout xml for the 'current' application, for the current user.
	 * if the layout doesnt exist, or the current application is unknown, or the user
	 * does not have permission, then an error xml is returned.
	 * 
	 * @param layout
	 * @return
	 * @throws ParserConfigurationException
	 */
	@RequestMapping(value="/layout", method=RequestMethod.GET)
	public ResponseEntity<String> getLayout(String layout) throws ParserConfigurationException {
		if(logger.isDebugEnabled()) { logger.debug("getLayout: {}", layout); }
		String layoutXML = applicationService.getLayout(layout);
		
		HttpHeaders responseHeaders = new HttpHeaders();
		responseHeaders.setContentType(MediaType.TEXT_XML);
		
		return new ResponseEntity<String>(layoutXML, responseHeaders, HttpStatus.OK);
	}

	/**
	 * returns the layout xml for a specified application.
	 * if the layout doesnt exist, or the  application is unknown, or the user
	 * does not have permission, then an error xml is returned.
	 * 
	 * @param application
	 * @param layout
	 * @return
	 * @throws ParserConfigurationException
	 */
	@RequestMapping(value="/application/{application}/layout", method=RequestMethod.GET)
	public ResponseEntity<String> getLayoutForApplication(@PathVariable String application, String layout) throws ParserConfigurationException {
		if(logger.isDebugEnabled()) { logger.debug("getLayoutForApplication: {}/{}", application, layout); }
		String layoutXML = applicationService.getLayoutForApplication(application, layout);
		
		HttpHeaders responseHeaders = new HttpHeaders();
		responseHeaders.setContentType(MediaType.TEXT_XML);
		
		return new ResponseEntity<String>(layoutXML, responseHeaders, HttpStatus.OK);
	}
}
