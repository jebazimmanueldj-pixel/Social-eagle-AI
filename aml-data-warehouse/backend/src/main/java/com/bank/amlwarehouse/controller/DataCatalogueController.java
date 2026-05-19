package com.bank.amlwarehouse.controller;

import com.bank.amlwarehouse.audit.Audited;
import com.bank.amlwarehouse.dto.CommonDtos.*;
import com.bank.amlwarehouse.dto.PageResponse;
import com.bank.amlwarehouse.entity.DwDataCatalogue;
import com.bank.amlwarehouse.exception.ApiException;
import com.bank.amlwarehouse.mapper.Mappers;
import com.bank.amlwarehouse.repository.DwDataCatalogueRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/data-catalogue")
@Tag(name = "Data Catalogue", description = "Searchable warehouse data catalogue with grouped + flat exports")
public class DataCatalogueController {

    private final DwDataCatalogueRepository repo;

    public DataCatalogueController(DwDataCatalogueRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    @Audited(module = "CATALOGUE", action = "SEARCH")
    public PageResponse<DataCatalogueDto> search(@RequestParam(required = false) String q,
                                                 @RequestParam(required = false) String domain,
                                                 @RequestParam(required = false) String relevance,
                                                 Pageable pageable) {
        return PageResponse.from(repo.search(q, domain, relevance, pageable), Mappers::toDto);
    }

    @GetMapping("/{id}")
    public DataCatalogueDto get(@PathVariable Long id) {
        return Mappers.toDto(repo.findById(id)
            .orElseThrow(() -> ApiException.notFound("Catalogue", id)));
    }

    @GetMapping("/grouped")
    public List<CatalogueGroupDto> grouped() {
        Map<String, List<DataCatalogueDto>> byDomain = new LinkedHashMap<>();
        for (DwDataCatalogue c : repo.findAllByOrderByDomainAscTableNameAscColumnNameAsc()) {
            String domain = c.getDomain() == null ? "Other" : c.getDomain();
            byDomain.computeIfAbsent(domain, k -> new java.util.ArrayList<>()).add(Mappers.toDto(c));
        }
        return byDomain.entrySet().stream()
            .map(e -> new CatalogueGroupDto(e.getKey(), e.getValue())).toList();
    }

    @GetMapping(value = "/export", produces = MediaType.TEXT_PLAIN_VALUE)
    @Audited(module = "CATALOGUE", action = "EXPORT")
    public ResponseEntity<String> exportFlat() {
        StringBuilder sb = new StringBuilder();
        sb.append("DOMAIN|TABLE|COLUMN|TYPE|SOURCE_SYSTEM|SOURCE_TABLE|SOURCE_FIELD|OWNER|DQ_SCORE|PII|AML_RELEVANCE|DEFINITION\n");
        for (DwDataCatalogue c : repo.findAllByOrderByDomainAscTableNameAscColumnNameAsc()) {
            sb.append(s(c.getDomain())).append('|').append(s(c.getTableName())).append('|')
              .append(s(c.getColumnName())).append('|').append(s(c.getDataType())).append('|')
              .append(s(c.getSourceSystem())).append('|').append(s(c.getSourceTable())).append('|')
              .append(s(c.getSourceField())).append('|').append(s(c.getDataOwner())).append('|')
              .append(c.getDataQualityScore() == null ? "" : c.getDataQualityScore()).append('|')
              .append(Boolean.TRUE.equals(c.getPiiFlag()) ? "Y" : "N").append('|')
              .append(s(c.getAmlRelevance())).append('|')
              .append(s(c.getBusinessDefinition()).replace('\n', ' ')).append('\n');
        }
        return ResponseEntity.ok()
            .header("Content-Disposition", "attachment; filename=data-catalogue.csv")
            .body(sb.toString());
    }

    @PostMapping
    @Audited(module = "CATALOGUE", action = "CREATE")
    public DataCatalogueDto create(@RequestBody DataCatalogueDto dto) {
        DwDataCatalogue c = DwDataCatalogue.builder()
            .sourceSystem(dto.sourceSystem()).sourceTable(dto.sourceTable()).sourceField(dto.sourceField())
            .tableName(dto.tableName()).columnName(dto.columnName()).dataType(dto.dataType())
            .businessDefinition(dto.businessDefinition()).dataOwner(dto.dataOwner())
            .dataQualityScore(dto.dataQualityScore())
            .piiFlag(dto.piiFlag()).amlRelevance(dto.amlRelevance()).domain(dto.domain())
            .build();
        return Mappers.toDto(repo.save(c));
    }

    private static String s(String v) { return v == null ? "" : v; }
}
