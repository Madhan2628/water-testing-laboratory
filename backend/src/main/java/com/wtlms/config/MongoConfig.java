package com.wtlms.config;

import de.bwaldvogel.mongo.MongoServer;
import de.bwaldvogel.mongo.backend.memory.MemoryBackend;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;

import java.net.InetSocketAddress;
import java.net.Socket;

@Configuration
public class MongoConfig {

    private static final Logger log = LoggerFactory.getLogger(MongoConfig.class);
    private static MongoServer embeddedServer;

    public static synchronized void ensureMongoRunning() {
        if (embeddedServer != null) {
            return;
        }

        boolean isLive = isPortInUse("127.0.0.1", 27017);
        if (!isLive) {
            try {
                log.info("No active MongoDB instance detected on 127.0.0.1:27017. Starting embedded in-memory MongoDB server...");
                embeddedServer = new MongoServer(new MemoryBackend());
                embeddedServer.bind("127.0.0.1", 27017);
                log.info("Embedded MongoDB server successfully started on 127.0.0.1:27017");

                Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                    if (embeddedServer != null) {
                        log.info("Stopping embedded MongoDB server...");
                        embeddedServer.shutdown();
                    }
                }));
            } catch (Exception e) {
                log.warn("Could not bind embedded MongoDB to 27017 (may already be in use): {}", e.getMessage());
            }
        } else {
            log.info("Connecting to existing active MongoDB instance on 127.0.0.1:27017");
        }
    }

    private static boolean isPortInUse(String host, int port) {
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(host, port), 600);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
