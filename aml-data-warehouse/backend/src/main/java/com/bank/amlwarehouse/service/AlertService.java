package com.bank.amlwarehouse.service;

import com.bank.amlwarehouse.dto.CommonDtos.AlertActionRequest;
import com.bank.amlwarehouse.dto.CommonDtos.AlertDto;
import com.bank.amlwarehouse.dto.PageResponse;
import org.springframework.data.domain.Pageable;

public interface AlertService {
    PageResponse<AlertDto> search(String type, String status, String priority,
                                  String assignee, String q, Pageable pageable);
    AlertDto get(String alertId);
    AlertDto assign(String alertId, AlertActionRequest req);
    AlertDto escalate(String alertId, AlertActionRequest req);
    AlertDto close(String alertId, AlertActionRequest req);
    AlertDto convertToCase(String alertId);
    AlertDto convertToStr(String alertId, String username);
}
