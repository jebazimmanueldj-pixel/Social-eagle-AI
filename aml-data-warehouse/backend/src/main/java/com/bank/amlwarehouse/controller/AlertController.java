package com.bank.amlwarehouse.controller;

import com.bank.amlwarehouse.audit.Audited;
import com.bank.amlwarehouse.dto.CommonDtos.AlertActionRequest;
import com.bank.amlwarehouse.dto.CommonDtos.AlertDto;
import com.bank.amlwarehouse.dto.PageResponse;
import com.bank.amlwarehouse.service.AlertService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/alerts")
@Tag(name = "Alerts", description = "AML alert lifecycle: assign, escalate, close, convert to case / STR")
public class AlertController {

    private final AlertService service;

    public AlertController(AlertService service) {
        this.service = service;
    }

    @GetMapping
    @Audited(module = "ALERT", action = "SEARCH")
    public PageResponse<AlertDto> search(@RequestParam(required = false, defaultValue = "AML") String type,
                                         @RequestParam(required = false) String status,
                                         @RequestParam(required = false) String priority,
                                         @RequestParam(required = false) String assignee,
                                         @RequestParam(required = false) String q,
                                         Pageable pageable) {
        return service.search(type, status, priority, assignee, q, pageable);
    }

    @GetMapping("/{alertId}")
    public AlertDto get(@PathVariable String alertId) {
        return service.get(alertId);
    }

    @PostMapping("/{alertId}/assign")
    @Audited(module = "ALERT", action = "ASSIGN")
    public AlertDto assign(@PathVariable String alertId, @RequestBody AlertActionRequest req) {
        return service.assign(alertId, req);
    }

    @PostMapping("/{alertId}/escalate")
    @Audited(module = "ALERT", action = "ESCALATE")
    public AlertDto escalate(@PathVariable String alertId, @RequestBody AlertActionRequest req) {
        return service.escalate(alertId, req);
    }

    @PostMapping("/{alertId}/close")
    @Audited(module = "ALERT", action = "CLOSE")
    public AlertDto close(@PathVariable String alertId, @RequestBody AlertActionRequest req) {
        return service.close(alertId, req);
    }

    @PostMapping("/{alertId}/convert-to-case")
    @Audited(module = "ALERT", action = "CONVERT_TO_CASE")
    public AlertDto convertToCase(@PathVariable String alertId) {
        return service.convertToCase(alertId);
    }

    @PostMapping("/{alertId}/convert-to-str")
    @Audited(module = "ALERT", action = "CONVERT_TO_STR")
    public AlertDto convertToStr(@PathVariable String alertId, Authentication auth) {
        return service.convertToStr(alertId, auth.getName());
    }
}
