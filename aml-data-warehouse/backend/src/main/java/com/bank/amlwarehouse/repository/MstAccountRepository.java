package com.bank.amlwarehouse.repository;

import com.bank.amlwarehouse.entity.MstAccount;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MstAccountRepository extends JpaRepository<MstAccount, String> {

    List<MstAccount> findByCustomerId(String customerId);

    @Query("""
        select a from MstAccount a
        where (:q is null or :q = ''
               or lower(a.accountNumber) like lower(concat('%', :q, '%'))
               or lower(a.customerId) like lower(concat('%', :q, '%')))
          and (:status is null or :status = '' or a.status = :status)
          and (:product is null or :product = '' or a.productCode = :product)
          and (:branch is null or :branch = '' or a.branchCode = :branch)
        """)
    Page<MstAccount> search(@Param("q") String q,
                            @Param("status") String status,
                            @Param("product") String product,
                            @Param("branch") String branch,
                            Pageable pageable);
}
