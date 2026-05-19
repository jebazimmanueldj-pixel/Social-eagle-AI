package com.bank.amlwarehouse.repository;

import com.bank.amlwarehouse.entity.AiConversationLog;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

/**
 * Only registered when the postgres profile is active (Mongo available).
 * The h2 profile excludes MongoAutoConfiguration entirely so this bean is
 * never created — AiQueryController falls back to a no-op stub instead.
 */
@Profile("postgres")
public interface AiConversationLogRepository extends MongoRepository<AiConversationLog, String> {
    List<AiConversationLog> findTop50ByUsernameOrderByCreatedAtDesc(String username);
}
