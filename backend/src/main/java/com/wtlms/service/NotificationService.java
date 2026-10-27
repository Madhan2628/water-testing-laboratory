package com.wtlms.service;

import com.wtlms.model.Notification;
import com.wtlms.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<Notification> getNotificationsForUser(String userId, String role) {
        return notificationRepository.findForUser(userId, role).stream()
                .sorted(Comparator.comparing(Notification::getCreatedAt).reversed())
                .limit(30)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(String userId, String role) {
        return notificationRepository.countUnreadForUser(userId, role);
    }

    public void markAsRead(String id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    public void markAllAsRead(String userId, String role) {
        List<Notification> list = notificationRepository.findForUser(userId, role);
        for (Notification n : list) {
            if (!n.isRead()) {
                n.setRead(true);
            }
        }
        notificationRepository.saveAll(list);
    }

    public Notification createNotification(String recipientId, String targetRole, String type, String title, String message, String sampleId, String reportId) {
        Notification notification = new Notification(recipientId, targetRole, type, title, message, sampleId, reportId);
        return notificationRepository.save(notification);
    }
}
