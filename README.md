# Conjure API Example - Clinical Documentation Workflow

This project demonstrates how to use the Conjure API to process clinical documentation, specifically for physical therapy notes. It shows a complete workflow from audio transcription to SOAP note generation and compliance checking.

## Overview

This example showcases the Conjure API's capabilities for:
- **Audio Transcription**: Converting audio files to text with speaker diarization
- **Transcript Editing**: Correcting and improving transcription quality
- **SOAP Note Generation**: Creating structured medical notes from transcripts
- **Compliance Checking**: Validating documentation against audit rules
- **Multi-Session Processing**: Handling multiple patients in a single session

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
  "baseUrl": "https://api.conjure.com",
  "outputFolder": "output",
  "endpoints": [
    {"key": "transcribe", "url": "/transcribe"},
    {"key": "edit", "url": "/edit"},
    {"key": "noteGenerator", "url": "/note-generator"},
    {"key": "multiSessionGenerator", "url": "/multi-session-generator"},
    {"key": "build_rules", "url": "/build-rules"},
    {"key": "check", "url": "/check"}
  ],
  "aws": {
    "region": "us-east-1",
    "accessKeyId": "your-aws-access-key",
    "secretAccessKey": "your-aws-secret-key",
    "bucket": "your-s3-bucket"
  }
}
```

## API Workflow

The program demonstrates the following API call sequence:

### 1. Audio Transcription (`/transcribe`)
**Purpose**: Convert audio file to text transcript
```typescript
POST /transcribe
{
  "url": "presigned-s3-url",
  "timestamped": false,
  "diarize": true/false
}
```

### 2. Transcript Editing (`/edit`)
**Purpose**: Correct transcription errors and improve quality
```typescript
POST /edit
{
  "encounter_information": {
    "encounter_transcript": "raw-transcript",
    "provider_information": "provider-details",
    "patient_information": "patient-details"
  },
  "transcript_correction_instructions": "correction-guidelines"
}
```

### 3. SOAP Note Generation (`/note-generator`)
**Purpose**: Generate structured medical notes from transcript
```typescript
POST /note-generator
{
  "encounter_information": {
    "provider_information": "provider-details",
    "patient_information": "patient-details",
    "encounter_transcript": "corrected-transcript"
  },
  "template_instructions": "Create a JSON SOAP note..."
}
```

### 4. Multi-Session Processing (`/multi-session-generator`)
**Purpose**: Handle multiple patients in a single session
```typescript
POST /multi-session-generator
{
  "encounter_information": {
    "provider_information": "provider-details",
    "encounter_transcript": "multi-patient-transcript"
  }
}
```

### 5. Compliance Rules Building (`/build-rules`)
**Purpose**: Create audit rules from requirements and samples
```typescript
POST /build-rules
{
  "audit_requirements": "compliance-requirements-text",
  "samples": "sample-documentation"
}
```

### 6. Compliance Checking (`/check`)
**Purpose**: Validate documentation against audit rules
```typescript
POST /check
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
3. **Note Generation**:
   - For single patients: Generate SOAP note directly
   - For multi-session: Extract patient list, then generate individual notes
4. **Compliance Checking**:
   - Build audit rules (if not cached)
   - Validate each generated note against compliance requirements
5. **Output**: Save all requests/responses to `output/` directory

## Output Files

The program generates detailed logs of all API interactions:

- `{patient}-transcribe-request.json` / `{patient}-transcriber-response.json`
- `{patient}-edit-request.json` / `{patient}-editor-response.json`
- `{patient}-note-request.json` / `{patient}-note-response.json`
- `{patient}-note.json` (final SOAP note)
- `{patient}-check-request.json` / `{patient}-check-response.json`
- `aaa-rules.json` (cached compliance rules)

## Case Records

The program includes sample case records in `src/data/caseRecord.ts`:
- **Single Patient**: "Charles Johnson" - Basic SOAP note generation
- **Multi-Session**: "Multiple Patients" - Multiple patient processing

## Error Handling

The program includes comprehensive error handling:
- API call failures with status codes
- File I/O errors
- Configuration validation
- Graceful degradation for missing data

## Customization

To add new cases:
1. Add case record to `src/data/caseRecord.ts`
2. Update `caseName` in `src/app.ts`
3. Ensure audio file exists in S3 bucket

## API Rate Limits

Be aware of Conjure API rate limits when processing multiple files. The program includes built-in timing information to help monitor API usage.

## Support

For API-specific questions, refer to the [Conjure API documentation](https://docs.scribept.com). This example demonstrates best practices for integrating the Conjure API into clinical documentation workflows. 