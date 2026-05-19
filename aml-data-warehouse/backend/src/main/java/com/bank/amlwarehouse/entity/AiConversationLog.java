package com.bank.amlwarehouse.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.OffsetDateTime;
import java.util.List;

/** MongoDB document — AI Query Assistant conversation history. */
@Document(collection = "ai_conversation_history")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AiConversationLog {

    @Id
    private String id;

    private String username;
    private String prompt;
    private String generatedSql;
    private String explanation;
    private String module;          // DASHBOARD / STR / ALERT etc.
    private List<String> tags;
    private Integer feedbackScore;  // 1..5
    private OffsetDateTime createdAt;
}
