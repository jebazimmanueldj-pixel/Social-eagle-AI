package com.bank.amlwarehouse.repository;

import com.bank.amlwarehouse.entity.DwDataCatalogue;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DwDataCatalogueRepository extends JpaRepository<DwDataCatalogue, Long> {

    @Query("""
        select c from DwDataCatalogue c
        where (:q is null or :q = ''
               or lower(c.tableName) like lower(concat('%', :q, '%'))
               or lower(c.columnName) like lower(concat('%', :q, '%'))
               or lower(coalesce(c.businessDefinition,'')) like lower(concat('%', :q, '%')))
          and (:domain is null or :domain = '' or c.domain = :domain)
          and (:relevance is null or :relevance = '' or c.amlRelevance = :relevance)
        """)
    Page<DwDataCatalogue> search(@Param("q") String q,
                                 @Param("domain") String domain,
                                 @Param("relevance") String relevance,
                                 Pageable pageable);

    List<DwDataCatalogue> findAllByOrderByDomainAscTableNameAscColumnNameAsc();
}
