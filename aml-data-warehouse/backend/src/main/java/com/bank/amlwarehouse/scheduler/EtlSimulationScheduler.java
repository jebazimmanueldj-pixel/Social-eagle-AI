package com.bank.amlwarehouse.scheduler;

import com.bank.amlwarehouse.entity.DwEtlJob;
import com.bank.amlwarehouse.repository.DwEtlJobRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

/**
 * In a real system, ETL jobs are orchestrated by Airflow / Informatica / Glue.
 * For the prototype we simulate progress every 60 seconds so the UI feels live.
 */
@Component
public class EtlSimulationScheduler {

    private static final Logger log = LoggerFactory.getLogger(EtlSimulationScheduler.class);

    private final DwEtlJobRepository repo;

    public EtlSimulationScheduler(DwEtlJobRepository repo) {
        this.repo = repo;
    }

    @Scheduled(fixedDelay = 60_000, initialDelay = 30_000)
    public void simulate() {
        List<DwEtlJob> jobs = repo.findAll();
        if (jobs.isEmpty()) return;
        DwEtlJob j = jobs.get(ThreadLocalRandom.current().nextInt(jobs.size()));
        if ("RUNNING".equals(j.getStatus())) {
            boolean ok = ThreadLocalRandom.current().nextInt(10) > 1;
            j.setStatus(ok ? "SUCCESS" : "FAILED");
            j.setEndTime(OffsetDateTime.now());
            if (!ok) j.setErrorMessage("Simulated source-system timeout");
            j.setRecordsLoaded((j.getRecordsExtracted() == null ? 0 : j.getRecordsExtracted()) -
                (j.getRecordsRejected() == null ? 0 : j.getRecordsRejected()));
            repo.save(j);
            log.debug("ETL job {} -> {}", j.getJobId(), j.getStatus());
        }
    }
}
