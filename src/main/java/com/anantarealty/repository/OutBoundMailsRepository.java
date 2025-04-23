package com.anantarealty.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.anantarealty.model.OutBoundMails;

@Repository
public interface OutBoundMailsRepository extends JpaRepository<OutBoundMails, Long> {

}
