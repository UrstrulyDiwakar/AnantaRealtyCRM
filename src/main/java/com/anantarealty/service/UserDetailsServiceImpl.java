package com.anantarealty.service;

import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.anantarealty.model.User;
import com.anantarealty.repository.UserRepository;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Override
	public UserDetails loadUserByUsername(String userEmail) throws UsernameNotFoundException {
		User appUser = userRepository.findByemail(userEmail);
		if (appUser == null) {
			throw new UsernameNotFoundException("User not found with username: " + userEmail);
		}
		return new CustomUser(appUser);

	}

	public User saveUser(User user) {
		// bCrypting the and and saved it Db.
		user.setPassword(passwordEncoder.encode(user.getPassword()));
		return userRepository.save(user);
	}

	// return the current user details
	public String getLoginUser() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
			return ((UserDetails) authentication.getPrincipal()).getUsername();
		} else
			return null;
	}
}
