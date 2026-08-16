// enums/TaskStatus.java
package com.project.management.enums;

public enum TaskStatus {
    TODO("To Do", "bg-blue-500"),
    IN_PROGRESS("In Progress", "bg-yellow-500"),
    REVIEW("Review", "bg-purple-500"),
    DONE("Done", "bg-green-500"),
    BLOCKED("Blocked", "bg-red-500");

    private final String label;
    private final String color;

    TaskStatus(String label, String color) {
        this.label = label;
        this.color = color;
    }

    public String getLabel() {
        return label;
    }

    public String getColor() {
        return color;
    }
}