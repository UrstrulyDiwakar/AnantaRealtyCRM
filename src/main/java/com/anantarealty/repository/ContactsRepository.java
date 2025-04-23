package com.anantarealty.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.anantarealty.model.Contacts;

@Repository
public interface ContactsRepository  extends JpaRepository<Contacts, Long>{

}
