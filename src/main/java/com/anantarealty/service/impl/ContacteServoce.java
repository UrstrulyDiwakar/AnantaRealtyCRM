package com.anantarealty.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.anantarealty.model.Contacts;
import com.anantarealty.repository.ContactsRepository;

@Service
public class ContacteServoce {
	
	@Autowired
	private ContactsRepository contactsRepository;
	
	public List<Contacts> getAllcontacts(){
		return contactsRepository.findAll();
	}

}
