package com.bank.amlwarehouse.controller;

import com.bank.amlwarehouse.audit.Audited;
import com.bank.amlwarehouse.dto.CommonDtos.AlertActionRequest;
import com.bank.amlwarehouse.dto.CommonDtos.AlertDto;
import com.bank.amlwarehouse.dto.PageResponse;
import com.bank.amlwarehouse.service.AlertService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/negative-alerts")
@Tag(name = "Negative Alerts", description = "Rule no-match / false-positive alerts and closure with checker approval")
public class NegativeAlertController {

    private final AlertService service;

    public NegativeAlertController(AlertService service) {
        this.service = service;
    }

    @GetMapping
    @Audited(module = "NEGATIVE_ALERT", action = "SEARCH")
    public PageResponse<AlertDto> list(@RequestParam(required = false) String status,
                                       @RequestParam(required = false) String q,
                                       Pageable pageable) {
        return service.search("NEGATIVE", status, null, null, q, pageable);
    }

    @GetMapping("/{alertId}")
    public AlertDto get(@PathVariable String alertId) {
        return service.get(alertId);
    }

    @PostMapping("/{alertId}/close")
    @Audited(module = "NEGATIVE_ALERT", action = "CLOSE")
    public AlertDto close(@PathVariable String alertId, @RequestBody AlertActionRequest req) {
        return service.close(alertId, req);
    }
}
