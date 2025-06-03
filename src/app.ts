import config from "./configuration/configuration";
import { createPresignedUrl } from "./utility/utility";
import Transcriber from './agent/transcriber';
import NoteGenerator from './agent/noteGenerator';
import ComplianceChecker from './agent/compliance';
import { CaseRecord, caseRecords } from './data/caseRecord';
import cli from './utility/cli';

async function main() {

    const transcriber = new Transcriber();
    const generator = new NoteGenerator();
    const checker = new ComplianceChecker();
    
    try {

        const caseName = "Charles Johnson";
        const caseRecord: CaseRecord = caseRecords.get(caseName)!;
        if (!caseRecord) {
            throw `Case record not found: ${caseName}`;
        }
        const url = await createPresignedUrl(config.aws.bucket, caseRecord.path);
        cli.info(`Audio file: ${url}`);

        await transcriber.transcribe(url, caseRecord);
        await transcriber.edit(caseRecord);
        //transcriber.load(`output/Abigail Nightshade-editor-response.json`);

        if (!caseRecord.multi) {
            await generator.generateNote(caseRecord, transcriber.transcript);
            checker.name = caseRecord.name;
            await checker.check(generator.note, transcriber.transcript);

        } else {
            await generator.generateMultiSessionPatientList(caseRecord, transcriber.transcript);
            await generator.generateMultiNotes(async (name:string) => {
                checker.name = name;
                await checker.check(generator.note, transcriber.transcript);
            });
        }

    } catch (error) {
        cli.error(String(error));
    }

}

main();
