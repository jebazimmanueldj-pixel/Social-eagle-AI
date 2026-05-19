package com.bank.amlwarehouse.repository;

import com.bank.amlwarehouse.entity.FactTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public interface FactTransactionRepository extends JpaRepository<FactTransaction, String> {

    List<FactTransaction> findByAccountNumberOrderByTransactionDateDesc(String accountNumber);
    List<FactTransaction> findByCustomerIdOrderByTransactionDateDesc(String customerId);

    Page<FactTransaction> findByIsHighValueTrue(Pageable pageable);
    Page<FactTransaction> findByIsCashTrue(Pageable pageable);
    Page<FactTransaction> findByIsCrossBorderTrue(Pageable pageable);

    @Query("""
        select t from FactTransaction t
        where (:q is null or :q = ''
               or lower(t.transactionId) like lower(concat('%', :q, '%'))
               or lower(t.accountNumber) like lower(concat('%', :q, '%'))
               or lower(coalesce(t.counterpartyName,'')) like lower(concat('%', :q, '%')))
          and (:type is null or :type = '' or t.transactionType = :type)
          and (:mode is null or :mode = '' or t.transactionMode = :mode)
          and (:minAmt is null or t.amount >= :minAmt)
          and (:maxAmt is null or t.amount <= :maxAmt)
          and (:from is null or t.transactionDate >= :from)
          and (:to is null or t.transactionDate <= :to)
        """)
    Page<FactTransaction> search(@Param("q") String q,
                                 @Param("type") String type,
                                 @Param("mode") String mode,
                                 @Param("minAmt") BigDecimal minAmt,
                                 @Param("maxAmt") BigDecimal maxAmt,
                                 @Param("from") OffsetDateTime from,
                                 @Param("to") OffsetDateTime to,
                                 Pageable pageable);
}
