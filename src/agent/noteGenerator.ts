import cli from "../utility/cli";
import { apiFetch, writeToFile } from "../utility/utility";
import { CaseRecord, providerInformation } from "../data/caseRecord";
import { readFileSync } from "fs";

export type NoteRequest = {
    encounter_information:{
        patient_information?: string;
        provider_information?: string;
        encounter_transcript?: string;
        dictation_transcript?: string;
        scratch_notes?: string;
        intake_form_information?: string;
        past_follow_up_notes?: string;
        past_evaluation_notes?: string;
        referral_information?: string;
    },
    transcript_correction_instructions?: string;
    medical_terminology?: string;
    template_instructions?: string;
}   

export type MultiSessionPatientListRequest = {
    encounter_information:{
        schedule_information?: string;
        provider_information?: string;
        encounter_transcript?: string;
        scratch_notes?: string;
    }
    template_instructions?: string;
}

export type MultiNote = {
    id: number;
    name: string | null;
    dob: string | null;
    mrn: string | null;
    visit_type: string | null;
    scratchNotes: string[];
}

export default class NoteGenerator {

    public noteRequest: NoteRequest = {
        encounter_information: {
        },
        template_instructions: "Create a JSON SOAP note"
    }

    public multiSessionPatientListRequest: MultiSessionPatientListRequest = {
        encounter_information: {
        }
    }

    public noteResponse: any;
    public multiSessionPatientListResponse: any;

    public note: any;

    constructor() {
    }

    load(fileName: string) {

        cli.startClock(`Loading note ...`);
        this.noteResponse = JSON.parse(readFileSync(fileName, 'utf8'));
        this.note = JSON.parse(this.noteResponse.note);
        cli.stopClock(`Note loaded`);
    }

    async generateNote(caseRecord: CaseRecord, transcript: string) {

        cli.startClock(`Generating note for ${caseRecord.name} ...`);

        const noteRequest: NoteRequest = {
            encounter_information: {
                provider_information: providerInformation,
                patient_information: caseRecord.patientInformation
            },
            template_instructions: "Create a JSON SOAP note include any patient information provided."
            + "if date of service is missing use today's date. "
            + "if patient information is missing, use the patient information provided in the patient_information field."
            + "leave out any fields that that would be blank."
        };

        if (caseRecord.diarize) {
            noteRequest.encounter_information.encounter_transcript = transcript;
        } else {
            noteRequest.encounter_information.dictation_transcript = transcript;
        }

        //cli.json(noteRequest, COLORS.gray);
        
        writeToFile(`output/${caseRecord.name}-note-request.json`, noteRequest);
        this.noteResponse = await apiFetch('noteGenerator', noteRequest);
        writeToFile(`output/${caseRecord.name}-note-response.json`, this.noteResponse);
        
        //cli.json(this.noteResponse, COLORS.white);

        this.note = this.noteResponse.note;
        writeToFile(`output/${caseRecord.name}-note.json`, this.note);
        //cli.json(this.note, COLORS.white);

        cli.stopClock(`Note generated for ${caseRecord.name}`);

    }

    async loadMultiSessionPatientList(fileName: string) {

        cli.startClock(`Loading multi-session patient list ...`);
        this.multiSessionPatientListResponse = JSON.parse(readFileSync(fileName, 'utf8'));
        cli.stopClock(`Multi-session patient list loaded`);
    }
    
    async generateMultiSessionPatientList(caseRecord: CaseRecord, transcript: string) {

        cli.startClock("Generating multi-session patient list...");

        this.multiSessionPatientListRequest = {
            encounter_information: {
                provider_information: providerInformation,
                encounter_transcript: transcript,
            },
        };

        //cli.json(this.multiSessionPatientListRequest, COLORS.gray);

        writeToFile(`output/multi-session-patient-list-request.json`, this.multiSessionPatientListRequest);
        this.multiSessionPatientListResponse = await apiFetch('multiSessionGenerator', this.multiSessionPatientListRequest);
        writeToFile(`output/multi-session-patient-list-response.json`, this.multiSessionPatientListResponse);

        //cli.json(this.multiSessionPatientListResponse, COLORS.white);

        cli.stopClock("Multi-session patient list generated");

    }

    async generateMultiNotes(onNoteGenerated?: (name:string) => Promise<void>) {

        if (Array.isArray(this.multiSessionPatientListResponse)) {
            for (const item of this.multiSessionPatientListResponse) {
                const multiNote: MultiNote = {
                    id: item.id,
                    name: item.name,
                    dob: item.dob,
                    mrn: item.mrn,
                    visit_type: item.visit_type,
                    scratchNotes: item.scratchNotes || []
                };
                await this.generateMultiNote(multiNote);
                if (onNoteGenerated) {
                    await onNoteGenerated(item.name);
                }
            }
        }
    }

    async generateMultiNote(multiNote: MultiNote) {

        cli.startClock(`Generating multi-note for ${multiNote.name} ...`);

        this.noteRequest = {
            encounter_information: {
                provider_information: providerInformation,
                scratch_notes: multiNote.scratchNotes.join("\n")
            },
            template_instructions: "Create a JSON SOAP note include any patient information provided"
        };

        if (multiNote.name) {
            let patientInformation = `patient name: ${multiNote.name}`;
            if (multiNote.dob) {
                patientInformation += ` date of birth ${multiNote.dob}`;
            }
            this.noteRequest.encounter_information.patient_information = patientInformation;
        }

        //cli.json(this.noteRequest, COLORS.gray);

        writeToFile(`output/${multiNote.name}-multi-note-request.json`, this.noteRequest);
        this.noteResponse = await apiFetch('noteGenerator', this.noteRequest);
        writeToFile(`output/${multiNote.name}-multi-note-response.json`, this.noteResponse);

        //cli.json(this.noteResponse, COLORS.white);

        this.note = this.noteResponse.note;
        writeToFile(`output/${multiNote.name}-multi-note.json`, this.note);
        //cli.json(this.note, COLORS.white);

        cli.stopClock(`Multi-note generated for ${multiNote.name}`);

    }
}