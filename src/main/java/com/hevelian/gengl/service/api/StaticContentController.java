package com.hevelian.gengl.service.api;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.xml.parsers.ParserConfigurationException;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.hevelian.gengl.content.StaticContent;
import com.hevelian.gengl.content.StaticContentService;

/**
 * API controller for static content contained in the docroot folder or any sub-folder of an application.
 * @author cb
 *
 */
@Controller
public class StaticContentController {
	private static final Logger logger = LogManager.getLogger(StaticContentController.class);
	private final StaticContentService staticContentService;
	
	@Autowired
	public StaticContentController(StaticContentService staticContentService) {
		this.staticContentService = staticContentService;
	}
	
	@RequestMapping(value="/docroot/**/{fileName}.{fileExtension}", method=RequestMethod.GET)
	public ResponseEntity<byte[]> getFromDocroot(HttpServletRequest request, @PathVariable String fileName, @PathVariable String fileExtension) throws ParserConfigurationException, IOException {
		if(logger.isDebugEnabled()) { logger.debug("getFromDocroot: {}.{}", fileName, fileExtension); }
		
		String realPath = extractRealPathFrom(request.getPathInfo(), "docroot");
		StaticContent staticContent = staticContentService.getFromDocroot(realPath, fileName, fileExtension);

		HttpHeaders responseHeaders = new HttpHeaders();
		responseHeaders.setContentType(staticContent.getMimeType());
		
		return new ResponseEntity<byte[]>(staticContent.getContent(), responseHeaders, HttpStatus.OK);
	}
	
	@RequestMapping(value="/application/{application}/docroot/**/{fileName}.{fileExtension}", method=RequestMethod.GET)
	public ResponseEntity<byte[]> getFromDocrootForApplication(HttpServletRequest request, @PathVariable String application, @PathVariable String fileName, @PathVariable String fileExtension) throws ParserConfigurationException, IOException {
		if(logger.isDebugEnabled()) { logger.debug("getFromDocroot: {}.{}", fileName, fileExtension); }
		
		String realPath = extractRealPathFrom(request.getPathInfo(), "docroot");
		StaticContent staticContent = staticContentService.getFromDocroot(application, realPath, fileName, fileExtension);
		
		HttpHeaders responseHeaders = new HttpHeaders();
		responseHeaders.setContentType(staticContent.getMimeType());
		
		return new ResponseEntity<byte[]>(staticContent.getContent(), responseHeaders, HttpStatus.OK);
	}

	/**
	 * Extracts the remaining path, without the filename, from the request url.
	 * @param path
	 * @param root
	 * @return
	 */
	private String extractRealPathFrom(String path, String root) {
		String realPath = new String();		
		String[] pathParts = path.split("/");

		boolean found = false;
		for(int i=0; i<pathParts.length-1; i++) {
			if(found==true) {
				realPath += pathParts[i] + "/";
				continue;
			}
			
			if(pathParts[i].equalsIgnoreCase(root)) {
				found = true;
			}
		}
		return realPath;
	}

}
