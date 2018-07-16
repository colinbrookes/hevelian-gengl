package com.hevelian.gengl.content;

import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

import javax.activation.MimetypesFileTypeMap;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.MediaType;

/**
 * Wrapper for any static content in the docroot folder or any sub-folders thereof. We provide the wrapper so we
 * can add security to the access to any file, and to ensure that no system files can be accessed.
 * 
 * @author cb
 *
 */
public class StaticContent {
	private static final Logger logger = LogManager.getLogger(StaticContent.class);
	
	File file;
	
	public StaticContent(File file) {
		this.file = file;
	}
	
	/**
	 * Returns the MediaType for the mime type as detected.
	 * @return
	 */
	public MediaType getMimeType() {
		MimetypesFileTypeMap map = new MimetypesFileTypeMap();
		map.addMimeTypes("image/svg+xml svg");
		
		String mimeType = map.getContentType(file);
		if(logger.isDebugEnabled()) { logger.debug("StaticContent MIME: {}", mimeType); }
		if(mimeType==null) {
			mimeType = "application/octet-stream";
		}
		
		return MediaType.parseMediaType(mimeType);
	}
	
	/**
	 * returns the entire file contents as a byte array, with no content conversion or filtering.
	 * @return
	 * @throws IOException
	 */
	public byte[] getContent() throws IOException {
		FileInputStream fis = null;
		DataInputStream dis = null;
		byte[] b = null;
		
		try {
			fis = new FileInputStream(file);
			dis = new DataInputStream(fis);
			b = new byte[dis.available()];
			dis.readFully(b);
		} catch(Exception e) {
			if(fis!=null) fis.close();
			if(dis!=null) dis.close();
		}
		return b;
	}
}
