import config from "../configuration/configuration";
import cli, { COLORS } from "../utility/cli";
import { apiFetch, createPresignedUrl, outputFile } from "../utility/utility";
import { CaseRecord, caseRecords, providerInformation } from "../data/caseRecord";
import { readFileSync } from "fs";

export type TranscribeRequest = {
    url: string;
    timestamped: boolean;
    diarize: boolean;
}

export type EditRequest = {
    encounter_information: {
        encounter_transcript: string;
        provider_information?: string;
        patient_information?: string;
    },
    transcript_correction_instructions: string;
}

export default class Transcriber {
    
    public transcribeRequest: TranscribeRequest = {
        url: "",
        diarize: false,
        timestamped: false
    };
    public transcriberResponse: any;

    public editorRequest: EditRequest = {
        encounter_information: {
            encounter_transcript: "",
        },
        transcript_correction_instructions: ""
    }
    public editorResponse: any;

    public transcript: string = "";
    

    constructor() {
    }

    load(fileName: string) {

        cli.startClock(`Loading Transcript ...`);
        const response = JSON.parse(readFileSync(fileName, 'utf8'));
        this.transcript = response.transcript;
        cli.stopClock(`Transcript Loaded`);

    }

    async transcribe(url: string, caseRecord: CaseRecord) {

        cli.startClock(`Transcribing ${caseRecord.name} ...`);

        this.transcribeRequest = {
            url: url,
            diarize: caseRecord.diarize,
            timestamped: false
        }

        //cli.json(this.transcribeRequest, COLORS.gray);

        outputFile(`${caseRecord.name}-transcribe-request.json`, this.transcribeRequest);
        this.transcriberResponse = await apiFetch('transcribe', this.transcribeRequest);
        outputFile(`${caseRecord.name}-transcriber-response.json`, this.transcriberResponse);

        //cli.json(this.transcriberResponse, COLORS.white);

        this.transcript = this.transcriberResponse.transcript;

        cli.stopClock(`Transcribing ${caseRecord.name} complete`);

    }

    async edit(caseRecord: CaseRecord) {

        this.editorRequest = {
            encounter_information: {
                encounter_transcript: this.transcript,
                provider_information: providerInformation,
            },
            transcript_correction_instructions: 
                "Please correct the transcription to remove any errors and ensure it is grammatically correct. " 
                + "Please also update the patient and provider information to be correct. "
        }

        if (caseRecord.diarize) {
            this.editorRequest.transcript_correction_instructions += 
                "Sometimes, speaker labels are misplaced—parts of one speaker's sentence may be wrongly attached to another speaker. "
                + "Fix the speaker tags so that each sentence makes logical and grammatical sense and belongs to the correct speaker.";
        }

        if (!caseRecord.multi) {
            this.editorRequest.encounter_information.patient_information = caseRecord.patientInformation;
        }

        //cli.json(this.editorRequest, COLORS.gray);

        cli.startClock(`Editing ${caseRecord.name} ...`);
        
        outputFile(`${caseRecord.name}-edit-request.json`, this.editorRequest);
        this.editorResponse = await apiFetch('edit', this.editorRequest);
        outputFile(`${caseRecord.name}-editor-response.json`, this.editorResponse);

        //cli.json(this.editorResponse, COLORS.white);

        this.transcript = this.editorResponse.transcript;

        cli.stopClock(`Editing ${caseRecord.name} complete`);

    }
}
