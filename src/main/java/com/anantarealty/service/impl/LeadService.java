package com.anantarealty.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.anantarealty.model.Lead;
import com.anantarealty.model.Profile;
import com.anantarealty.model.User;
import com.anantarealty.repository.LeadRepository;
import com.anantarealty.repository.UserRepository;
import com.anantarealty.service.UserDetailsServiceImpl;

@Service
public class LeadService {
	@Autowired
	private UserDetailsServiceImpl detailsServiceImpl;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private LeadRepository leadRepository;

	public List<Lead> getAllLeads() {
		// return the current login User email(user name)
		String loginUserEmailId = detailsServiceImpl.getLoginUser();

		if (loginUserEmailId == null) {
			throw new RuntimeException("User not authenticated");
		}
		// fetching data
		User logInUser = userRepository.findByemail(loginUserEmailId);
		List<String> usernames = userRepository.findUserNamesByManagerName(loginUserEmailId);
		
		System.out.println();

		if (logInUser.getProfile().equals(Profile.ADMIN)) {
			return leadRepository.findAll();
		} else if (logInUser.getProfile().equals(Profile.MANAGER)) {
			return leadRepository.findByLeadOwnerIn(usernames);
		} else if (logInUser.getProfile().equals(Profile.EMPLOYEE)) {
			String UserName= userRepository.findUsernameByEmail(loginUserEmailId);
			System.out.println(UserName);
			return leadRepository.findByLeadOwner(UserName);
		}
		return null;
	}
	
	
	 public List<Lead> getAllLeadsByUser() {
		// return the current login User email(user name)
		String loginUserEmailId = detailsServiceImpl.getLoginUser();

		if (loginUserEmailId == null) {
			throw new RuntimeException("User not authenticated");
		}
		// fetching data
		String UserName= userRepository.findUsernameByEmail(loginUserEmailId);
		return leadRepository.findByLeadOwner(UserName);
		
	}

}
