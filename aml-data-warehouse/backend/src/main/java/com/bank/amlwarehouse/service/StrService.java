package com.bank.amlwarehouse.service;

import com.bank.amlwarehouse.dto.CommonDtos.StrCreateRequest;
import com.bank.amlwarehouse.dto.CommonDtos.StrDto;
import com.bank.amlwarehouse.dto.PageResponse;
import org.springframework.data.domain.Pageable;

public interface StrService {
    PageResponse<StrDto> list(String status, Pageable pageable);
    StrDto get(String strId);
    StrDto create(StrCreateRequest req, String username);
    StrDto update(String strId, StrCreateRequest req);
    StrDto submit(String strId);
    StrDto approve(String strId, String checker);
    StrDto returnDraft(String strId, String checker);
    StrDto file(String strId, String authority);
    String  exportText(String strId);
}
