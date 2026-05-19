package com.bank.amlwarehouse.config;

import com.mongodb.client.MongoClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory;

/**
 * Makes MongoDB truly optional.
 *
 * - h2  profile  : Mongo auto-config is excluded entirely in application.yml.
 *                  This class produces nothing so Spring ignores Mongo repos.
 * - postgres profile : Mongo is enabled. We wrap the connection attempt so a
 *                  missing Mongo does not prevent the app from starting.
 */
@Configuration
public class MongoConfig {

    private static final Logger log = LoggerFactory.getLogger(MongoConfig.class);

    /**
     * Only active in the 'postgres' profile where MongoDB IS expected.
     * Registers MongoTemplate so Spring Data Mongo repositories work.
     */
    @Profile("postgres")
    @ConditionalOnProperty(name = "spring.data.mongodb.uri")
    @Bean
    public MongoTemplate mongoTemplate(@Value("${spring.data.mongodb.uri}") String uri) {
        try {
            MongoDatabaseFactory factory = new SimpleMongoClientDatabaseFactory(uri);
            // Ping the server so we fail fast with a useful message
            MongoTemplate tpl = new MongoTemplate(factory);
            tpl.getDb().runCommand(new org.bson.Document("ping", 1));
            log.info("MongoDB connected successfully");
            return tpl;
        } catch (Exception e) {
            log.warn("MongoDB unavailable ({}). AI conversation history will not be persisted. " +
                     "Start MongoDB or use Docker Compose to enable full functionality.", e.getMessage());
            // Return null — Spring will skip injection where MongoTemplate is @Autowired(required=false)
            return null;
        }
    }
}
