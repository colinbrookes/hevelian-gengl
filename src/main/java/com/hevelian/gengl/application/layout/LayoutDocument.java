package com.hevelian.gengl.application.layout;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.StringWriter;
import java.io.Writer;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

//import com.hevelian.gengl.core.Configuration;
import com.hevelian.gengl.session.SessionStore;

/**
 * Wraps the DOM document. The document is cached in the Application and is adjusted during
 * runtime based on the user permissions. 
 * 
 * The returned document is checked for whether authentication is required, and whether the user is
 * logged in. It also scans all the nodes in the document tree looking for authorisation tags (authAllow and authDeny)
 * and filters the document content accordingly.
 * 
 * @author cb
 *
 */

@Component
public class LayoutDocument {
	private static final Logger logger = LogManager.getLogger(LayoutDocument.class);
//	private Configuration config = new Configuration();

	private Document document;
	private DocumentBuilderFactory dbFactory	= null;
	private DocumentBuilder dBuilder			= null;
	
	private boolean authRequired				= false;
	
	private SessionStore sessionStore;

	public LayoutDocument() {
		
	}
	
	@Autowired
	public LayoutDocument(SessionStore sessionStore) {
		this.sessionStore = sessionStore;
	}
	
	public LayoutDocument(FileReader file) {
		try {
			dbFactory = DocumentBuilderFactory.newInstance();
			dBuilder = dbFactory.newDocumentBuilder();

			BufferedReader reader = new BufferedReader(file);
		    document = dBuilder.parse(new InputSource(reader));
		    reader.close();
			
		} catch(Exception e) {
			e.printStackTrace();
		}
		
		if(document!=null) {
			checkAuthRequired();
		}
	}
	
	public LayoutDocument(Document document) {
		this.document = document;

		if(document!=null) {
			checkAuthRequired();
		}
	}
	
	/**
	 * default toString works on the original document. to get the version for the
	 * current user you must provide the sessionStore object.
	 */
	public String toString(SessionStore sessionStore) {
		this.sessionStore = sessionStore;
		return PrettyPrint(applyEntitlement());
	}
	
	/**
	 * default toString works on the original document. to get the version for the
	 * current user you must provide the sessionStore object.
	 */
	public String toString() {
		return PrettyPrint(document);
	}

	/**
	 * scans the layout document, node for node, looking for authAllow and authDeny attributes.
	 * These attributes define whether the current user can see specific nodes within the layout document.
	 * The nodes where the user is not allowed to see are removed from the xml, along with all child nodes.
	 * The attributes are removed everywhere, even if the user is allowed to see the node.
	 * 
	 * The modified xml Document is returned.
	 * 
	 * @return
	 */
	private Document applyEntitlement() {
		
		Document filtered = (Document) document.cloneNode(true);
		
		logger.debug("LayoutDocument: SesionStore: {}", sessionStore);
		
		NodeList nodes = filtered.getChildNodes();
		for(int i=0; i<nodes.getLength(); i++) {
			boolean remove = checkEntitlementOfNode(filtered, nodes.item(i));
			if(remove==true) {
				i--;
			}
		}
		
		return filtered;
	}
	
	/**
	 * the entitlement check recurses into all child nodes in the document.
	 * @param doc
	 * @param fromNode
	 */
	private void recurseApplyEntitlement(Document doc, Node fromNode) {
		NodeList nodes = fromNode.getChildNodes();
		for(int i=0; i<nodes.getLength(); i++) {
			boolean remove = checkEntitlementOfNode(doc, nodes.item(i));
			if(remove==true) {
				i--;
			}
		}
		
	}
	
	/**
	 * examines the attributes to see if authAllow or authDeny attributes are present.
	 * @param doc
	 * @param node
	 */
	private boolean checkEntitlementOfNode(Document doc, Node node) {
		Node authAllow = null;
		Node authDeny = null;

		NamedNodeMap nodeMap = node.getAttributes();
		if(nodeMap!=null) {
			authAllow = nodeMap.getNamedItem("authAllow");
			authDeny = nodeMap.getNamedItem("authDeny");
		}
		
		if(node.getNodeType()==1) {
			recurseApplyEntitlement(doc, node);
		}

		if(authAllow==null && authDeny==null) {
			return false;
		}
		
		/**
		 * 'deny' overrides 'allow' so we process this first. If the 'deny' decision is true
		 * then we remove the node completely, otherwise we check for the 'allow' decision, if applicable.
		 */
		if(authDeny!=null) {
			logger.debug("LayoutDocument: Node {} has authDeny: {}", node.getNodeName(), authDeny.getTextContent());
			Boolean decision = sessionStore.getEntitlementDecisionStore().getDecision(authDeny.getTextContent());
			if(decision==true) {
				node.getParentNode().removeChild(node);
				return true;
			}
			nodeMap.removeNamedItem("authDeny");
		}

		if(authAllow!=null) {
			logger.debug("LayoutDocument: Node {} has authAllow: {}", node.getNodeName(), authAllow.getTextContent());
			Boolean decision = sessionStore.getEntitlementDecisionStore().getDecision(authAllow.getTextContent());
			if(decision==false) {
				node.getParentNode().removeChild(node);
				return true;
			}
			nodeMap.removeNamedItem("authAllow");
		}
		
		return false;
	}
	
	/**
	 * Checks the root node (page) for requireAuthentication attribute. This is done just once, when the
	 * document is created.
	 */
	private void checkAuthRequired() {
		NodeList nodes = document.getElementsByTagName("page");
		Node node = nodes.item(0);
		NamedNodeMap nodeMap = node.getAttributes();
		Node auth = nodeMap.getNamedItem("requireAuthentication");
		if(auth!=null && auth.getTextContent().equalsIgnoreCase("true")) {
			authRequired = true;
		}
		
		if(logger.isDebugEnabled()) { logger.debug("LayoutDocument: authRequired: {}", authRequired); }
	}
	
	private String PrettyPrint(Document doc) {
		String buf = new String();
		
		try {
			Transformer tf = TransformerFactory.newInstance().newTransformer();
			tf.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
			tf.setOutputProperty(OutputKeys.INDENT, "yes");
			tf.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "no");
			tf.setOutputProperty(OutputKeys.STANDALONE, "yes");
			
			Writer out = new StringWriter();
			tf.transform(new DOMSource(doc), new StreamResult(out));
			
			buf += out.toString();
			
		} catch(Exception e) { }
		
		return buf;
	}
}
