# Clinical Documentation Compliance Checker

This project provides a system for validating and checking compliance of clinical documentation, with a specific focus on physical therapy notes. It ensures that medical documentation meets payer requirements and follows standard SOAP note formatting.

## Overview

The system processes clinical notes in JSON format and validates them against a comprehensive compliance checklist. It checks for:
- Proper JSON formatting
- Required SOAP note structure (Subjective, Objective, Assessment, Plan)
- Minimum documentation requirements
- Patient identification
- Specific section requirements for each SOAP component

## File Structure

- `output/check-request.json`: Contains the clinical note and compliance checklist
  - `clinical_note`: The actual medical documentation in JSON format
  - `encounter_information`: Contains the encounter transcript
  - `compliance_checklist`: Defines the validation rules and requirements

## Compliance Requirements

The system validates documentation against several key criteria:

### General Documentation Requirements
- Minimum word count (100+ words)
- Patient identification
- JSON format compliance
- Complete SOAP note structure

### Section-Specific Requirements
1. **Subjective Section**
   - Patient information (name + demographics)
   - Chief complaint documentation

2. **Objective Section**
   - Objective data inclusion (physical examination, vital signs, functional tests)

3. **Assessment Section**
   - Diagnosis documentation

4. **Plan Section**
   - Treatment plan documentation

## Usage

The system processes clinical notes in JSON format and validates them against the defined compliance checklist. Each criterion has specific pass/fail conditions and audit weights for scoring.

## Compliance Checklist Structure

The compliance checklist is organized by:
- Payers
- Plans
- Encounter Types
- Sections
- Individual Criteria

Each criterion includes:
- Unique identifier
- Name
- Description
- Pass/fail conditions
- Required elements
- Audit weight
- Active status

## Example

The included example shows a physical therapy note for a patient with low back pain, demonstrating:
- Proper SOAP note structure
- Detailed subjective information
- Objective measurements
- Clear assessment and plan
- Compliance with documentation requirements

## Requirements

- JSON-compatible system
- Support for JSON Schema validation
- Ability to process and validate structured medical documentation

## Note

This system is designed to help healthcare providers maintain compliant documentation while following best practices for medical record-keeping. It is not a substitute for professional medical judgment or legal advice regarding documentation requirements. 