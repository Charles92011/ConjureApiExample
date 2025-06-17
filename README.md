# Conjure API Example - Clinical Documentation Workflow

This project demonstrates how to use the Conjure API to process clinical documentation, specifically for physical therapy notes. It shows a complete workflow from audio transcription to SOAP note generation and compliance checking.

## Overview

This example showcases the Conjure API's capabilities for:
- **Audio Transcription**: Converting audio files to text with speaker diarization
- **Transcript Editing**: Correcting and improving transcription quality
- **SOAP Note Generation**: Creating structured medical notes from transcripts
- **Compliance Checking**: Validating documentation against audit rules
- **Multi-Session Processing**: Handling multiple patients in a single session
- **Schema Building**: Creating JSON schemas for structured note generation

## Prerequisites

- Node.js (v16 or higher)
- Conjure API key
- AWS S3 credentials (for audio file access)
- TypeScript compiler

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your API credentials in `src/configuration/config.conjure.json`

## Configuration

Create or update `src/configuration/config.conjure.json` with your credentials:

```json
{
  "conjureApiKey": "your-conjure-api-key",
  "baseUrl": "https://api.dev.scribept.com/v2",
  "outputFolder": "output",
  "caseName": "Multiple Patients",
  "ruleBuilder": {
    "rulesFile": "aaa-rules.json",
    "samplesFile": "src/agent/samplenote.json",
    "requirementsFile": "src/agent/requirements.txt"
  },
  "schemaBuilder": {
    "samplesFile": "src/agent/samplenote.json",
    "schemaFile": "aaa-schema.json"
  },
  "aws": {
    "region": "us-east-1",
    "accessKeyId": "your-aws-access-key",
    "secretAccessKey": "your-aws-secret-key",
    "bucket": "your-s3-bucket"
  },
  "endpoints": [
    {"key": "transcribe", "url": "/sensor/voice_to_text/transcribe"},
    {"key": "edit", "url": "/agent/transcript_editor/edit"},
    {"key": "build_schema", "url": "/agent/scribe/schema"},
    {"key": "noteGenerator", "url": "/agent/scribe/note"},
    {"key": "multiSessionGenerator", "url": "/agent/scribe/multisession"},
    {"key": "check", "url": "/agent/compliance/considerations"},
    {"key": "build_rules", "url": "/agent/compliance/rules"}
  ]
}
```

## Project Structure

```
ConjureApiExample/
├── src/
│   ├── agent/
│   │   ├── compliance.ts          # Compliance checking functionality
│   │   ├── noteGenerator.ts       # SOAP note generation
│   │   ├── schemabuilder.ts       # JSON schema building
│   │   ├── transcriber.ts         # Audio transcription
│   │   ├── samplenote.json        # Sample SOAP note for schema building
│   │   └── requirements.txt       # Compliance requirements
│   ├── configuration/
│   │   ├── config.conjure.json    # Main configuration file
│   │   ├── config.example.json    # Example configuration
│   │   └── configuration.ts       # Configuration loader
│   ├── data/
│   │   ├── caseRecord.ts          # Case record types
│   │   ├── caseRecords.json       # Patient case definitions
│   │   └── caseRecords.example.json # Example case records
│   ├── utility/
│   │   ├── cli.ts                 # CLI utilities with colored output
│   │   └── utility.ts             # General utility functions
│   └── app.ts                     # Main application entry point
├── dist/                          # Compiled JavaScript output
├── output/                        # Generated API logs and results
├── package.json                   # Node.js dependencies
└── tsconfig.json                  # TypeScript configuration
```

## API Workflow

The program demonstrates the following API call sequence:

### 1. Audio Transcription (`/sensor/voice_to_text/transcribe`)
**Purpose**: Convert audio file to text transcript
```typescript
POST /sensor/voice_to_text/transcribe
{
  "url": "presigned-s3-url",
  "timestamped": false,
  "diarize": true/false
}
```

### 2. Transcript Editing (`/agent/transcript_editor/edit`)
**Purpose**: Correct transcription errors and improve quality
```typescript
POST /agent/transcript_editor/edit
{
  "encounter_information": {
    "encounter_transcript": "raw-transcript",
    "provider_information": "provider-details",
    "patient_information": "patient-details"
  },
  "transcript_correction_instructions": "correction-guidelines"
}
```

### 3. Schema Building (`/agent/scribe/schema`)
**Purpose**: Create JSON schemas for structured note generation
```typescript
POST /agent/scribe/schema
{
  "samples": "sample-notes-json",
  "schema": "",
  "recorded_actions": ""
}
```

### 4. SOAP Note Generation (`/agent/scribe/note`)
**Purpose**: Generate structured medical notes from transcript
```typescript
POST /agent/scribe/note
{
  "encounter_information": {
    "provider_information": "provider-details",
    "patient_information": "patient-details",
    "encounter_transcript": "corrected-transcript"
  },
  "template_instructions": "Create a JSON SOAP note..."
}
```

### 5. Multi-Session Processing (`/agent/scribe/multisession`)
**Purpose**: Handle multiple patients in a single session
```typescript
POST /agent/scribe/multisession
{
  "encounter_information": {
    "provider_information": "provider-details",
    "encounter_transcript": "multi-patient-transcript"
  }
}
```

### 6. Compliance Rules Building (`/agent/compliance/rules`)
**Purpose**: Create audit rules from requirements and samples
```typescript
POST /agent/compliance/rules
{
  "audit_requirements": "compliance-requirements-text",
  "samples": "sample-documentation"
}
```

### 7. Compliance Checking (`/agent/compliance/considerations`)
**Purpose**: Validate documentation against audit rules
```typescript
POST /agent/compliance/considerations
{
  "clinical_note": "JSON-SOAP-note",
  "encounter_information": {
    "encounter_transcript": "transcript"
  },
  "chart_audit_rules": "audit-rules"
}
```

## Running the Program

### Build and Run
```bash
# Build TypeScript to JavaScript
npm run build

# Run the program
npm start
```

### Development Mode
```bash
# Build and run in one command
npm run dev
```

## Program Flow

1. **Initialize**: Load configuration and create API client instances
2. **Audio Processing**: 
   - Generate presigned S3 URL for audio file
   - Transcribe audio to text
   - Edit transcript for accuracy
3. **Schema Building**:
   - Build JSON schema from sample notes (if not cached)
4. **Note Generation**:
   - For single patients: Generate SOAP note directly
   - For multi-session: Extract patient list, then generate individual notes
5. **Compliance Checking**:
   - Build audit rules (if not cached)
   - Validate each generated note against compliance requirements
6. **Output**: Save all requests/responses to `output/` directory

## Output Files

The program generates detailed logs of all API interactions:

- `{patient}-transcribe-request.json` / `{patient}-transcriber-response.json`
- `{patient}-edit-request.json` / `{patient}-editor-response.json`
- `build-schema-request.json` / `aaa-schema.json`
- `{patient}-note-request.json` / `{patient}-note-response.json`
- `{patient}-note.json` (final SOAP note)
- `{patient}-check-request.json` / `{patient}-check-response.json`
- `aaa-rules.json` (cached compliance rules)

## Case Records

The program includes multiple case records in `src/data/caseRecords.json`:

- **Charles Johnson**: 56-year-old male with high blood pressure
- **Abigail Nightshade**: 10-year-old female
- **Erica Nocturne**: 40-year-old female (with diarization)
- **Nan Blackthorn**: 45-year-old female (with diarization)
- **Multiple Patients**: Multi-session processing with speaker diarization

Each case can be configured with different settings:
- `diarize`: Enable/disable speaker diarization
- `multi`: Single vs. multi-patient session
- `patientInformation`: Patient demographics and medical history

## CLI Utilities

The project includes a comprehensive CLI utility (`src/utility/cli.ts`) with:
- **Colored Output**: ANSI color codes for different message types
- **Emojis**: Visual indicators for different operations
- **Timing**: Built-in performance measurement
- **Logging Levels**: Info, success, error, warning, and loading states

## Error Handling

The program includes comprehensive error handling:
- API call failures with status codes
- File I/O errors
- Configuration validation
- Graceful degradation for missing data

## Customization

To add new cases:
1. Add case record to `src/data/caseRecords.json`
2. Update `caseName` in `src/configuration/config.conjure.json`
3. Ensure audio file exists in S3 bucket

## Dependencies

The project uses the following key dependencies:
- `@aws-sdk/client-s3`: AWS S3 client for file access
- `@aws-sdk/s3-request-presigner`: Generate presigned URLs
- `@types/node`: TypeScript definitions for Node.js

## API Rate Limits

Be aware of Conjure API rate limits when processing multiple files. The program includes built-in timing information to help monitor API usage.

## Support

For API-specific questions, refer to the [Conjure API documentation](https://docs.scribept.com). This example demonstrates best practices for integrating the Conjure API into clinical documentation workflows. 