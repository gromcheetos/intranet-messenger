package com.hkapp.module.messenger.service;

public interface SequenceIdService {

    String nextId(String prefix);
    void ensureSequenceExists(String prefix);

}
