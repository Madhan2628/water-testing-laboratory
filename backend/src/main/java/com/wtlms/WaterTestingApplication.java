package com.wtlms;

import com.wtlms.config.MongoConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EnableMongoRepositories
public class WaterTestingApplication {

    public static void main(String[] args) {
        // Guarantee MongoDB is listening on 127.0.0.1:27017 before Spring Data MongoDB initializes
        MongoConfig.ensureMongoRunning();
        SpringApplication.run(WaterTestingApplication.class, args);
    }
}
