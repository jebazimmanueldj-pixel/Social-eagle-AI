package com.bank.amlwarehouse.repository;

import com.bank.amlwarehouse.entity.FactAlert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FactAlertRepository extends JpaRepository<FactAlert, String> {

    List<FactAlert> findByCustomerId(String customerId);
    List<FactAlert> findByAccountNumber(String accountNumber);

    @Query("""
        select a from FactAlert a
        where (:type is null or :type = '' or a.alertType = :type)
          and (:status is null or :status = '' or a.status = :status)
          and (:priority is null or :priority = '' or a.priority = :priority)
          and (:assignee is null or :assignee = '' or a.assignedTo = :assignee)
          and (:q is null or :q = ''
               or lower(a.alertId) like lower(concat('%', :q, '%'))
               or lower(coalesce(a.customerId,'')) like lower(concat('%', :q, '%'))
               or lower(coalesce(a.ruleName,'')) like lower(concat('%', :q, '%')))
        """)
    Page<FactAlert> search(@Param("type") String type,
                           @Param("status") String status,
                           @Param("priority") String priority,
                           @Param("assignee") String assignee,
                           @Param("q") String q,
                           Pageable pageable);

    long countByAlertTypeAndStatus(String alertType, String status);
    long countByAlertType(String alertType);
}
