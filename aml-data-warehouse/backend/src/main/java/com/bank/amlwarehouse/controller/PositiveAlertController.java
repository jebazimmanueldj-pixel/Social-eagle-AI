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
@RequestMapping("/api/positive-alerts")
@Tag(name = "Positive Alerts", description = "Rule-triggered positive alerts (threshold breaches)")
public class PositiveAlertController {

    private final AlertService service;

    public PositiveAlertController(AlertService service) {
        this.service = service;
    }

    @GetMapping
    @Audited(module = "POSITIVE_ALERT", action = "SEARCH")
    public PageResponse<AlertDto> list(@RequestParam(required = false) String status,
                                       @RequestParam(required = false) String priority,
                                       @RequestParam(required = false) String q,
                                       Pageable pageable) {
        return service.search("POSITIVE", status, priority, null, q, pageable);
    }

    @GetMapping("/{alertId}")
    public AlertDto get(@PathVariable String alertId) {
        return service.get(alertId);
    }

    @PostMapping("/{alertId}/review")
    @Audited(module = "POSITIVE_ALERT", action = "REVIEW")
    public AlertDto review(@PathVariable String alertId, @RequestBody AlertActionRequest req) {
        return service.assign(alertId, req);
    }
}
