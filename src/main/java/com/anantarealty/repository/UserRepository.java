package com.anantarealty.repository;

//import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


import com.anantarealty.model.User;

//@Repository
//public interface UserRepository extends JpaRepository<User, String> {
//    // This method is used to authenticate users based on username and password.
//    User findByUsernameAndPassword(String username, String password);
//
//    // This method will be used by Spring Security to load a user by username only.
//    User findByUsername(String username);
//}


@Repository
public interface UserRepository extends JpaRepository<User, String> {
	// This method is used to authenticate users based on username and password.
	User findByUsernameAndPassword(String username, String password);

	// This method will be used by Spring Security to load a user by username only.
	User findByemail(String email);

	@Query(value = "SELECT u.username FROM users u WHERE u.reporting_to = :email", nativeQuery = true)
	List<String> findUserNameByManagerName(@Param("email") String email);
	
	@Query(value = "SELECT u.username FROM users u WHERE u.email = :email", nativeQuery = true)
	String findUsernameByEmail(@Param("email") String email);


    
    User findByusername(String username);
    
    // ✅ Fetch multiple employees by name list
    List<User> findByusernameIn(List<String> usernames);
    

	
	
}