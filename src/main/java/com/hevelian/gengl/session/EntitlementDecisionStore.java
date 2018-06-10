package com.hevelian.gengl.session;

import java.util.HashMap;

import org.springframework.stereotype.Component;

/**
 * The entitlement decision store remembers the results of requesting access control information
 * from the PDP. This reduces the amount of times, during a single session, that PDP requests need
 * to be made.
 * 
 * @author cb
 *
 */
@Component
public class EntitlementDecisionStore {

	private HashMap<String, Boolean> decisions = new HashMap<String, Boolean>();
	
	public Boolean getDecision(String question) {
		
		/* first check if we already have a decision on the question */
		if(decisions.get(question)!=null) {
			return decisions.get(question);
		}
		
		fetchDecision(question);
		
		return true;
	}
	
	/**
	 * If the deicision is not already known then we need to ask the PDP for an answer.
	 * The question may be in several parts, so we also cache the results for each part individually.
	 * 
	 * @param question
	 */
	private void fetchDecision(String question) {
		/**
		 * TODO: integrate with PDP stuff from Yuriy
		 * For now we simply say that all decisions are 'true'.
		 */
		
		decisions.put(question, true);
		String[] questionParts = question.split(" ");
		if(questionParts.length==1) {
			return;
		}
	}
}
