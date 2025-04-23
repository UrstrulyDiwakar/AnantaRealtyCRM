package com.anantarealty.service;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.anantarealty.model.User;

public class CustomUser  implements UserDetails{
	//load the User entity
	private final User user;
	
	//Initialize the user entity while CustomerUser object is created.
	public CustomUser(User user) {
		this.user=user;
	}
	
	
	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return List.of(new SimpleGrantedAuthority(user.getProfile().toString()));
	}

	@Override
	public String getPassword() {
		return user.getPassword();
	}

	@Override
	public String getUsername() {
		return user.getEmail();
	}
	
	@Override
	public boolean isAccountNonExpired() {
		
		return true;
	}
	
	@Override
	public boolean isAccountNonLocked() {
		
		return user.getLoginAllowed();
	}
	
	@Override
	public boolean isCredentialsNonExpired() {
		return true;
	}
	
	@Override
	public boolean isEnabled() {
		return user.getUserStatus().equalsIgnoreCase("ACTIVE");
	}

}
