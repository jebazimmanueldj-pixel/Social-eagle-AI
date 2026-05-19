package com.bank.amlwarehouse.repository;

import com.bank.amlwarehouse.entity.AiConversationLog;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AiConversationLogRepository extends MongoRepository<AiConversationLog, String> {
    List<AiConversationLog> findTop50ByUsernameOrderByCreatedAtDesc(String username);
}
