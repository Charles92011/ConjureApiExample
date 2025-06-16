import caseData from  './caseRecords.json';
export const providerInformation = "Dr. Goofy Goof, PT, DPT";

export type CaseRecord = {
    name: string;
    path: string;
    patientInformation: string;
    diarize: boolean;
    multi: boolean;
}

export const caseRecords: Map<string, CaseRecord> = new Map(caseData.caseRecords.map((caseRecord: CaseRecord) => {
    return [caseRecord.name, caseRecord];
}));


