<%@ page language="java" contentType="text/xml; charset=UTF-8"
    pageEncoding="UTF-8" import="com.hevelian.gengl.core.*, javax.servlet.http.*, java.io.*"%><%
    
    Configuration conf = new Configuration();
    
    String root_path = conf.getProperty("folder_layouts");
    String filename  = root_path + request.getParameter("layout") + ".xml";
    
    BufferedReader reader = new BufferedReader(new FileReader(filename));
    
    String line;
    while ((line = reader.readLine()) != null) { %><%=line%><% } 
    
    reader.close();
    %>