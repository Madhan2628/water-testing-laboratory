package com.wtlms.repository;

import com.wtlms.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {

    @Query("{ '$or': [ { 'recipientId': ?0 }, { 'targetRole': ?1 }, { 'targetRole': null } ] }")
    List<Notification> findForUser(String userId, String role);

    @Query(value = "{ '$or': [ { 'recipientId': ?0 }, { 'targetRole': ?1 }, { 'targetRole': null } ], 'isRead': false }", count = true)
    long countUnreadForUser(String userId, String role);
}
