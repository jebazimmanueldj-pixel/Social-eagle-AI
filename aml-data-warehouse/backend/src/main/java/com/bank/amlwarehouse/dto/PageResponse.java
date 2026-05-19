package com.bank.amlwarehouse.dto;

import org.springframework.data.domain.Page;

import java.util.List;
import java.util.function.Function;

public record PageResponse<T>(
    List<T> content,
    int     page,
    int     size,
    long    totalElements,
    int     totalPages,
    boolean last
) {
    public static <S, T> PageResponse<T> from(Page<S> p, Function<S, T> mapper) {
        return new PageResponse<>(
            p.getContent().stream().map(mapper).toList(),
            p.getNumber(),
            p.getSize(),
            p.getTotalElements(),
            p.getTotalPages(),
            p.isLast()
        );
    }
}
