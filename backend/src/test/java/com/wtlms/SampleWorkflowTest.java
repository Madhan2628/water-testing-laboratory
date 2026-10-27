package com.wtlms;

import com.wtlms.dto.SampleStatusUpdateDto;
import com.wtlms.exception.BadRequestException;
import com.wtlms.model.Sample;
import com.wtlms.model.SampleStatus;
import com.wtlms.repository.AuditLogRepository;
import com.wtlms.repository.CustomerRepository;
import com.wtlms.repository.SampleRepository;
import com.wtlms.security.UserPrincipal;
import com.wtlms.service.SampleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class SampleWorkflowTest {

    private SampleRepository sampleRepository;
    private CustomerRepository customerRepository;
    private AuditLogRepository auditLogRepository;
    private SampleService sampleService;
    private UserPrincipal adminPrincipal;

    @BeforeEach
    void setUp() {
        sampleRepository = Mockito.mock(SampleRepository.class);
        customerRepository = Mockito.mock(CustomerRepository.class);
        auditLogRepository = Mockito.mock(AuditLogRepository.class);
        sampleService = new SampleService(sampleRepository, customerRepository, auditLogRepository);

        adminPrincipal = new UserPrincipal("admin-id", "admin@watertest.com", "pass", "Admin",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN")), true);
    }

    @Test
    void testValidStatusTransition() {
        Sample sample = new Sample();
        sample.setSampleId("WTL-2026-0001");
        sample.setStatus(SampleStatus.REGISTERED);

        when(sampleRepository.findById("WTL-2026-0001")).thenReturn(Optional.of(sample));
        when(sampleRepository.save(any(Sample.class))).thenAnswer(i -> i.getArgument(0));

        SampleStatusUpdateDto updateDto = new SampleStatusUpdateDto(SampleStatus.SAMPLE_RECEIVED, "Checked in to lab intake");
        Sample updated = sampleService.updateSampleStatus("WTL-2026-0001", updateDto, adminPrincipal);

        assertEquals(SampleStatus.SAMPLE_RECEIVED, updated.getStatus());
        assertEquals(1, updated.getStatusHistory().size());
        assertEquals("Checked in to lab intake", updated.getStatusHistory().get(0).getComments());
    }

    @Test
    void testInvalidStatusTransitionThrowsBadRequest() {
        Sample sample = new Sample();
        sample.setSampleId("WTL-2026-0001");
        sample.setStatus(SampleStatus.REQUESTED);

        when(sampleRepository.findById("WTL-2026-0001")).thenReturn(Optional.of(sample));

        // Skipping straight from REQUESTED to APPROVED should be rejected!
        SampleStatusUpdateDto invalidUpdate = new SampleStatusUpdateDto(SampleStatus.APPROVED, "Attempting skip");

        assertThrows(BadRequestException.class, () -> {
            sampleService.updateSampleStatus("WTL-2026-0001", invalidUpdate, adminPrincipal);
        });
    }
}
