package com.bank.amlwarehouse;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AmlWarehouseApplication {
    public static void main(String[] args) {
        SpringApplication.run(AmlWarehouseApplication.class, args);
    }
}
