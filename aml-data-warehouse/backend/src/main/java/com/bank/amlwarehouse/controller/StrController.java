package com.bank.amlwarehouse.controller;

import com.bank.amlwarehouse.audit.Audited;
import com.bank.amlwarehouse.dto.CommonDtos.StrCreateRequest;
import com.bank.amlwarehouse.dto.CommonDtos.StrDto;
import com.bank.amlwarehouse.dto.PageResponse;
import com.bank.amlwarehouse.service.StrService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/str")
@Tag(name = "STR", description = "Suspicious Transaction Reports — maker / checker workflow")
public class StrController {

    private final StrService service;

    public StrController(StrService service) {
        this.service = service;
    }

    @GetMapping
    @Audited(module = "STR", action = "LIST")
    public PageResponse<StrDto> list(@RequestParam(required = false) String status, Pageable pageable) {
        return service.list(status, pageable);
    }

    @GetMapping("/{strId}")
    public StrDto get(@PathVariable String strId) {
        return service.get(strId);
    }

    @PostMapping
    @Audited(module = "STR", action = "CREATE")
    public StrDto create(@RequestBody StrCreateRequest req, Authentication auth) {
        return service.create(req, auth.getName());
    }

    @PutMapping("/{strId}")
    @Audited(module = "STR", action = "UPDATE")
    public StrDto update(@PathVariable String strId, @RequestBody StrCreateRequest req) {
        return service.update(strId, req);
    }

    @PostMapping("/{strId}/submit")
    @Audited(module = "STR", action = "SUBMIT")
    public StrDto submit(@PathVariable String strId) {
        return service.submit(strId);
    }

    @PostMapping("/{strId}/approve")
    @Audited(module = "STR", action = "APPROVE")
    public StrDto approve(@PathVariable String strId, Authentication auth) {
        return service.approve(strId, auth.getName());
    }

    @PostMapping("/{strId}/return")
    @Audited(module = "STR", action = "RETURN")
    public StrDto returnDraft(@PathVariable String strId, Authentication auth) {
        return service.returnDraft(strId, auth.getName());
    }

    @PostMapping("/{strId}/file")
    @Audited(module = "STR", action = "FILE")
    public StrDto file(@PathVariable String strId,
                       @RequestParam(defaultValue = "FIU-IND") String authority) {
        return service.file(strId, authority);
    }

    @GetMapping(value = "/{strId}/export", produces = MediaType.TEXT_PLAIN_VALUE)
    @Audited(module = "STR", action = "EXPORT")
    public ResponseEntity<String> export(@PathVariable String strId) {
        return ResponseEntity.ok()
            .header("Content-Disposition", "attachment; filename=" + strId + ".txt")
            .body(service.exportText(strId));
    }
}
