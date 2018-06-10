package com.hevelian.gengl.content;

import java.io.File;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import com.hevelian.gengl.core.Configuration;

@Component
@Scope("singleton")
public class StaticContentEngine {
	private static final Logger logger = LogManager.getLogger(StaticContentEngine.class);
	private final Configuration configuration = new Configuration();
	
	/**
	 * Creates and returns a static content object that contains the data content and the mime type for
	 * the file. The file is always relative to the application name, to ensure isolation and protection
	 * against naughty people who try to grab system files.
	 * 
	 * @param applicationName
	 * @param pathInfo
	 * @param filename
	 * @param fileExtension
	 * @return
	 */
	public StaticContent getStaticContent(String applicationName, String pathInfo, String filename, String fileExtension) {
		String fullFilename = configuration.getProperty("folder_home") + "applications/" + applicationName + "/docroot/" +  pathInfo + filename + "." + fileExtension;

		if(logger.isDebugEnabled()) { logger.debug("StaticContentEngine, File {}", fullFilename); }
		
		File file = new File(fullFilename);
		StaticContent staticContent = new StaticContent(file);
		
		if(logger.isDebugEnabled()) { logger.debug("StaticContentEngine, MIME type {}", staticContent.getMimeType()); }
		
		return staticContent;
	}
}
