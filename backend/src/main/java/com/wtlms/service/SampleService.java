package com.wtlms.service;

import com.wtlms.dto.SampleRequestDto;
import com.wtlms.dto.SampleStatusUpdateDto;
import com.wtlms.exception.BadRequestException;
import com.wtlms.exception.ResourceNotFoundException;
import com.wtlms.model.*;
import com.wtlms.repository.AuditLogRepository;
import com.wtlms.repository.CustomerRepository;
import com.wtlms.repository.SampleRepository;
import com.wtlms.security.UserPrincipal;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SampleService {

    private final SampleRepository sampleRepository;
    private final CustomerRepository customerRepository;
    private final AuditLogRepository auditLogRepository;

    public SampleService(SampleRepository sampleRepository,
                         CustomerRepository customerRepository,
                         AuditLogRepository auditLogRepository) {
        this.sampleRepository = sampleRepository;
        this.customerRepository = customerRepository;
        this.auditLogRepository = auditLogRepository;
    }

    public synchronized String generateNextSampleId() {
        int currentYear = Year.now().getValue();
        String prefix = "WTL-" + currentYear + "-";
        long count = sampleRepository.count() + 1;
        String idStr = prefix + String.format("%04d", count);
        while (sampleRepository.existsBySampleId(idStr)) {
            count++;
            idStr = prefix + String.format("%04d", count);
        }
        return idStr;
    }

    public Sample createSample(SampleRequestDto dto, UserPrincipal currentUser) {
        Sample sample = new Sample();
        sample.setSampleId(generateNextSampleId());
        sample.setCustomerName(dto.getCustomerName());
        sample.setCustomerEmail(dto.getCustomerEmail());
        sample.setCustomerPhone(dto.getCustomerPhone());
        sample.setCustomerId(dto.getCustomerId());

        sample.setCollectionDateTime(dto.getCollectionDateTime() != null ? dto.getCollectionDateTime() : LocalDateTime.now());
        sample.setCollectionLocation(dto.getCollectionLocation());
        sample.setWaterSource(dto.getWaterSource());
        sample.setSampleType(dto.getSampleType() != null ? dto.getSampleType() : "Potable Water");
        sample.setSampleDescription(dto.getSampleDescription());

        if (dto.getRequestedTests() != null && !dto.getRequestedTests().isEmpty()) {
            sample.setRequestedTests(dto.getRequestedTests());
        }

        sample.setSampleReceivedDate(dto.getSampleReceivedDate());
        sample.setSampleReceivedBy(dto.getSampleReceivedBy());
        sample.setSampleCondition(dto.getSampleCondition() != null ? dto.getSampleCondition() : "Good");
        sample.setPriority(dto.getPriority() != null ? dto.getPriority() : "Normal");
        sample.setAdditionalRemarks(dto.getAdditionalRemarks());

        // Determine initial status based on creator role
        boolean isCustomer = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_CUSTOMER"));

        if (isCustomer) {
            sample.setStatus(SampleStatus.REQUESTED);
            sample.setCustomerEmail(currentUser.getUsername());
            sample.setCustomerName(currentUser.getFullName());
            sample.setCustomerId(currentUser.getId());
            sample.getStatusHistory().add(new StatusHistoryItem(
                    SampleStatus.REQUESTED,
                    currentUser.getUsername(),
                    "Sample testing requested by customer"
            ));
        } else {
            sample.setStatus(SampleStatus.REGISTERED);
            sample.getStatusHistory().add(new StatusHistoryItem(
                    SampleStatus.REGISTERED,
                    currentUser.getUsername(),
                    "Sample formally registered at laboratory intake"
            ));
        }

        Sample saved = sampleRepository.save(sample);

        // Update customer total samples if customer exists
        if (dto.getCustomerEmail() != null) {
            customerRepository.findByEmail(dto.getCustomerEmail()).ifPresent(c -> {
                c.setTotalSamples(c.getTotalSamples() + 1);
                customerRepository.save(c);
            });
        }

        auditLogRepository.save(new AuditLog(
                "CREATE_SAMPLE",
                currentUser.getUsername(),
                currentUser.getAuthorities().iterator().next().getAuthority(),
                "Sample",
                saved.getSampleId(),
                "Registered sample from " + saved.getCustomerName() + " (" + saved.getWaterSource() + ")"
        ));

        return saved;
    }

    public List<Sample> getAllSamples(String search, String waterSource, SampleStatus status, UserPrincipal currentUser) {
        boolean isCustomer = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_CUSTOMER"));

        List<Sample> list = sampleRepository.findAll();

        return list.stream()
                .filter(s -> {
                    // Role security check: customers can only view their own samples
                    if (isCustomer) {
                        boolean emailMatches = s.getCustomerEmail() != null && s.getCustomerEmail().equalsIgnoreCase(currentUser.getUsername());
                        boolean idMatches = s.getCustomerId() != null && s.getCustomerId().equals(currentUser.getId());
                        if (!emailMatches && !idMatches) {
                            return false;
                        }
                    }

                    if (status != null && s.getStatus() != status) {
                        return false;
                    }

                    if (waterSource != null && !waterSource.isBlank() && !waterSource.equalsIgnoreCase("All")) {
                        if (s.getWaterSource() == null || !s.getWaterSource().equalsIgnoreCase(waterSource)) {
                            return false;
                        }
                    }

                    if (search != null && !search.isBlank()) {
                        String q = search.toLowerCase();
                        boolean matchId = s.getSampleId() != null && s.getSampleId().toLowerCase().contains(q);
                        boolean matchCustomer = s.getCustomerName() != null && s.getCustomerName().toLowerCase().contains(q);
                        boolean matchEmail = s.getCustomerEmail() != null && s.getCustomerEmail().toLowerCase().contains(q);
                        boolean matchLoc = s.getCollectionLocation() != null && s.getCollectionLocation().toLowerCase().contains(q);
                        if (!matchId && !matchCustomer && !matchEmail && !matchLoc) {
                            return false;
                        }
                    }

                    return true;
                })
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public Sample getSampleById(String id, UserPrincipal currentUser) {
        Sample sample = sampleRepository.findById(id)
                .or(() -> sampleRepository.findBySampleId(id))
                .orElseThrow(() -> new ResourceNotFoundException("Sample not found with id: " + id));

        // Customer access check
        boolean isCustomer = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_CUSTOMER"));

        if (isCustomer) {
            boolean emailMatches = sample.getCustomerEmail() != null && sample.getCustomerEmail().equalsIgnoreCase(currentUser.getUsername());
            boolean idMatches = sample.getCustomerId() != null && sample.getCustomerId().equals(currentUser.getId());
            if (!emailMatches && !idMatches) {
                throw new BadRequestException("Access denied: You are not authorized to view this sample");
            }
        }

        return sample;
    }

    public Sample updateSample(String id, SampleRequestDto dto, UserPrincipal currentUser) {
        Sample sample = sampleRepository.findById(id)
                .or(() -> sampleRepository.findBySampleId(id))
                .orElseThrow(() -> new ResourceNotFoundException("Sample not found with id: " + id));

        if (dto.getCustomerName() != null) sample.setCustomerName(dto.getCustomerName());
        if (dto.getCustomerEmail() != null) sample.setCustomerEmail(dto.getCustomerEmail());
        if (dto.getCustomerPhone() != null) sample.setCustomerPhone(dto.getCustomerPhone());
        if (dto.getCollectionLocation() != null) sample.setCollectionLocation(dto.getCollectionLocation());
        if (dto.getWaterSource() != null) sample.setWaterSource(dto.getWaterSource());
        if (dto.getSampleType() != null) sample.setSampleType(dto.getSampleType());
        if (dto.getSampleDescription() != null) sample.setSampleDescription(dto.getSampleDescription());
        if (dto.getRequestedTests() != null) sample.setRequestedTests(dto.getRequestedTests());
        if (dto.getSampleReceivedDate() != null) sample.setSampleReceivedDate(dto.getSampleReceivedDate());
        if (dto.getSampleReceivedBy() != null) sample.setSampleReceivedBy(dto.getSampleReceivedBy());
        if (dto.getSampleCondition() != null) sample.setSampleCondition(dto.getSampleCondition());
        if (dto.getPriority() != null) sample.setPriority(dto.getPriority());
        if (dto.getAdditionalRemarks() != null) sample.setAdditionalRemarks(dto.getAdditionalRemarks());

        sample.setUpdatedAt(LocalDateTime.now());
        return sampleRepository.save(sample);
    }

    public Sample updateSampleStatus(String id, SampleStatusUpdateDto dto, UserPrincipal currentUser) {
        Sample sample = sampleRepository.findById(id)
                .or(() -> sampleRepository.findBySampleId(id))
                .orElseThrow(() -> new ResourceNotFoundException("Sample not found with id: " + id));

        SampleStatus newStatus = dto.getStatus();
        SampleStatus currentStatus = sample.getStatus();

        // Validate allowed transitions
        if (!isValidStatusTransition(currentStatus, newStatus)) {
            throw new BadRequestException("Invalid status transition from " + currentStatus + " to " + newStatus);
        }

        sample.setStatus(newStatus);
        sample.setUpdatedAt(LocalDateTime.now());

        String remarks = dto.getComments() != null && !dto.getComments().isBlank()
                ? dto.getComments()
                : "Status transitioned from " + currentStatus + " to " + newStatus;

        sample.getStatusHistory().add(new StatusHistoryItem(newStatus, currentUser.getUsername(), remarks));

        Sample saved = sampleRepository.save(sample);

        auditLogRepository.save(new AuditLog(
                "STATUS_CHANGE",
                currentUser.getUsername(),
                currentUser.getAuthorities().iterator().next().getAuthority(),
                "Sample",
                saved.getSampleId(),
                "Updated status to " + newStatus + ": " + remarks
        ));

        return saved;
    }

    private boolean isValidStatusTransition(SampleStatus current, SampleStatus next) {
        if (current == next) return true;
        if (next == SampleStatus.CANCELLED || next == SampleStatus.REJECTED) return true;

        switch (current) {
            case REQUESTED:
                return next == SampleStatus.REGISTERED || next == SampleStatus.SAMPLE_RECEIVED;
            case REGISTERED:
                return next == SampleStatus.SAMPLE_RECEIVED || next == SampleStatus.TESTING_IN_PROGRESS;
            case SAMPLE_RECEIVED:
                return next == SampleStatus.TESTING_IN_PROGRESS;
            case TESTING_IN_PROGRESS:
                return next == SampleStatus.TESTING_COMPLETED || next == SampleStatus.REPORT_PENDING_APPROVAL;
            case TESTING_COMPLETED:
                return next == SampleStatus.REPORT_PENDING_APPROVAL || next == SampleStatus.TESTING_IN_PROGRESS;
            case REPORT_PENDING_APPROVAL:
                return next == SampleStatus.APPROVED || next == SampleStatus.TESTING_IN_PROGRESS;
            case APPROVED:
                return false; // Terminal state unless formal revision
            case REJECTED:
            case CANCELLED:
                return false;
            default:
                return false;
        }
    }

    public void deleteSample(String id, UserPrincipal currentUser) {
        Sample sample = sampleRepository.findById(id)
                .or(() -> sampleRepository.findBySampleId(id))
                .orElseThrow(() -> new ResourceNotFoundException("Sample not found with id: " + id));

        sampleRepository.delete(sample);

        auditLogRepository.save(new AuditLog(
                "DELETE_SAMPLE",
                currentUser.getUsername(),
                currentUser.getAuthorities().iterator().next().getAuthority(),
                "Sample",
                sample.getSampleId(),
                "Deleted sample " + sample.getSampleId()
        ));
    }
}
