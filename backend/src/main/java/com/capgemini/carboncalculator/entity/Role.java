package com.capgemini.carboncalculator.entity;

public enum Role {
    SUPER_ADMIN,  // Gère toutes les organisations
    ADMIN,        // Gère son organisation (invite membres, crée/supprime sites)
    MEMBER        // Consulte et saisit des données dans son organisation
}
