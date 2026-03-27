package com.hkapp.module.common.exception;

public class SequenceIdException extends RuntimeException {

    public SequenceIdException(String message) {
        super(message);
    }

    public SequenceIdException(String message, Throwable cause) {
        super(message, cause);
    }
}

