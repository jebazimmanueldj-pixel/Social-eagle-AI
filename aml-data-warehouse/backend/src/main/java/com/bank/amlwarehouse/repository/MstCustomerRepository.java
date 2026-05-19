package com.bank.amlwarehouse.repository;

import com.bank.amlwarehouse.entity.MstCustomer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MstCustomerRepository extends JpaRepository<MstCustomer, String> {

    @Query("""
        select c from MstCustomer c
        where (:q is null or :q = ''
               or lower(c.customerName) like lower(concat('%', :q, '%'))
               or lower(c.customerId) like lower(concat('%', :q, '%'))
               or lower(c.mobile) like lower(concat('%', :q, '%'))
               or lower(coalesce(c.email,'')) like lower(concat('%', :q, '%')))
          and (:risk is null or :risk = '' or c.riskRating = :risk)
          and (:kyc is null or :kyc = '' or c.kycStatus = :kyc)
          and (:branch is null or :branch = '' or c.branchCode = :branch)
        """)
    Page<MstCustomer> search(@Param("q") String q,
                             @Param("risk") String risk,
                             @Param("kyc") String kyc,
                             @Param("branch") String branch,
                             Pageable pageable);

    long countByRiskRating(String riskRating);
}
