package com.anantarealty.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.anantarealty.model.WonInfo;

@Repository
public interface WonInfoRepository extends JpaRepository<WonInfo, Long> {

}
