package com.bank.amlwarehouse.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String BEARER = "bearerAuth";

    @Bean
    public OpenAPI amlOpenApi() {
        return new OpenAPI()
            .info(new Info()
                .title("AML Data Warehouse API")
                .version("1.0.0")
                .description("Enterprise REST API for AML Data Warehousing — customers, "
                    + "accounts, transactions, alerts, STR/CTR, dormant accounts, LOS, "
                    + "data catalogue, AI assistant, query builder, ETL, audit and more.")
                .contact(new Contact().name("AML Platform Team").email("aml-platform@bank.local")))
            .addSecurityItem(new SecurityRequirement().addList(BEARER))
            .components(new Components().addSecuritySchemes(BEARER,
                new SecurityScheme()
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")));
    }
}
