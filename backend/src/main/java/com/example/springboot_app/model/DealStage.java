package com.example.springboot_app.model;

public enum DealStage {
    NEW, QUALIFIED, PROPOSAL, WON, LOST;

    public boolean isOpen() {
        return this != WON && this != LOST;
    }
}
