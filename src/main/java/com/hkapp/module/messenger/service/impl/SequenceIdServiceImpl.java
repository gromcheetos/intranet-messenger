package com.hkapp.module.messenger.service.impl;

import com.hkapp.module.common.exception.SequenceIdException;
import com.hkapp.module.messenger.service.SequenceIdService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * Oracle-backed implementation of {@link SequenceIdService}.
 *
 * <p><b>ID format</b>
 * <pre>
 *   {PREFIX} + {YYYYMM} + {zero-padded seq, 6 digits}
 *   e.g.  ORD202603000001
 *         USR202603000042
 * </pre>
 *
 * <p><b>Oracle sequence naming</b>: {@code SEQ_{PREFIX}} (upper-cased).
 *
 * <p>Sequences are created lazily on first use and tracked in-memory so the
 * DDL check is executed at most once per JVM lifetime per prefix.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SequenceIdServiceImpl implements SequenceIdService {

    private static final DateTimeFormatter YYYYMM = DateTimeFormatter.ofPattern("yyyyMM");
    private static final int SEQ_PADDING = 6;
    private static final String SEQ_NAME_PREFIX = "SEQ_";

    /** Tracks prefixes whose sequences are confirmed to exist in this JVM session. */
    private final ConcurrentMap<String, Boolean> initializedSequences = new ConcurrentHashMap<>();

    private final JdbcTemplate jdbcTemplate;

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    @Override
    public String nextId(String prefix) {
        validatePrefix(prefix);
        String upperPrefix = prefix.toUpperCase();

        ensureSequenceExists(upperPrefix);

        long seq = fetchNextVal(upperPrefix);
        String yyyymm = LocalDate.now().format(YYYYMM);
        String paddedSeq = String.format("%0" + SEQ_PADDING + "d", seq);

        String id = upperPrefix + yyyymm + paddedSeq;

        if (id.length() > 50) {
            throw new IllegalStateException(
                    "Generated ID exceeds VARCHAR(50): '%s' (%d chars)".formatted(id, id.length()));
        }

        log.debug("Generated ID: {}", id);
        return id;
    }

    @Override
    public void ensureSequenceExists(String prefix) {
        String upperPrefix = prefix.toUpperCase();

        // Skip if already verified in this JVM session
        if (initializedSequences.containsKey(upperPrefix)) {
            return;
        }

        String seqName = sequenceName(upperPrefix);

        try {
            /*
             * Oracle 18c+ supports CREATE SEQUENCE IF NOT EXISTS.
             * For older versions (12c/19c without that syntax), we check
             * USER_SEQUENCES first and create only when absent.
             */
            boolean exists = sequenceExists(seqName);
            if (!exists) {
                createSequence(seqName);
                log.info("Created Oracle sequence: {}", seqName);
            } else {
                log.debug("Oracle sequence already exists: {}", seqName);
            }

            initializedSequences.put(upperPrefix, Boolean.TRUE);

        } catch (DataAccessException e) {
            throw new SequenceIdException(
                    "Failed to ensure sequence exists for prefix '%s'".formatted(upperPrefix), e);
        }
    }

    // -------------------------------------------------------------------------
    // Internal helpers
    // -------------------------------------------------------------------------

    private long fetchNextVal(String upperPrefix) {
        String sql = "SELECT %s.NEXTVAL FROM DUAL".formatted(sequenceName(upperPrefix));
        try {
            Long val = jdbcTemplate.queryForObject(sql, Long.class);
            if (val == null) {
                throw new SequenceIdException("NEXTVAL returned null for prefix: " + upperPrefix);
            }
            return val;
        } catch (DataAccessException e) {
            throw new SequenceIdException(
                    "Failed to fetch NEXTVAL for prefix '%s'".formatted(upperPrefix), e);
        }
    }

    private boolean sequenceExists(String seqName) {
        String sql = "SELECT COUNT(*) FROM USER_SEQUENCES WHERE SEQUENCE_NAME = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, seqName);
        return count != null && count > 0;
    }

    private void createSequence(String seqName) {
        String sql = """
            CREATE SEQUENCE %s
                START WITH 1
                INCREMENT BY 1
                NOCACHE
                NOCYCLE
            """.formatted(seqName);
        jdbcTemplate.execute(sql);
    }

    private static String sequenceName(String upperPrefix) {
        return SEQ_NAME_PREFIX + upperPrefix;
    }

    private static void validatePrefix(String prefix) {
        if (prefix == null || prefix.isBlank()) {
            throw new IllegalArgumentException("ID prefix must not be blank");
        }
        if (!prefix.matches("[A-Za-z0-9_]+")) {
            throw new IllegalArgumentException(
                    "ID prefix must be alphanumeric/underscore only, got: " + prefix);
        }
    }
}