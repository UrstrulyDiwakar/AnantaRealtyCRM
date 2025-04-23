package com.anantarealty.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.anantarealty.model.OutBoundMails;
import com.anantarealty.repository.OutBoundMailsRepository;

@Service
public class OutBoundMailService {
	
	@Autowired
	private OutBoundMailsRepository outBoundMailsRepository;
	
	public List<OutBoundMails> getAllOutBoundMails(){
		return outBoundMailsRepository.findAll();
	}

}
