package com.bank.amlwarehouse.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "dw_data_catalogue", indexes = {
    @Index(name = "idx_cat_table", columnList = "table_name"),
    @Index(name = "idx_cat_aml_relevance", columnList = "aml_relevance")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DwDataCatalogue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "catalogue_id")
    private Long id;

    @Column(name = "source_system", length = 64)
    private String sourceSystem;

    @Column(name = "source_table", length = 128)
    private String sourceTable;

    @Column(name = "source_field", length = 128)
    private String sourceField;

    @Column(name = "table_name", length = 128)
    private String tableName;

    @Column(name = "column_name", length = 128)
    private String columnName;

    @Column(name = "data_type", length = 64)
    private String dataType;

    @Column(name = "business_definition", length = 1024)
    private String businessDefinition;

    @Column(name = "data_owner", length = 128)
    private String dataOwner;

    @Column(name = "data_quality_score")
    private Integer dataQualityScore;

    @Column(name = "pii_flag")
    private Boolean piiFlag;

    @Column(name = "aml_relevance", length = 16)     // HIGH / MEDIUM / LOW / NONE
    private String amlRelevance;

    @Column(name = "domain", length = 64)            // Customer / Account / Transaction / Risk / LOS
    private String domain;
}
