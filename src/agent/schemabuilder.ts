import { readFileSync, existsSync } from "fs";
import config from "../configuration/configuration";
import cli from "../utility/cli";
import { apiFetch, outputFile, outputFileName } from "../utility/utility";

export type BuildSchemaRequest = {
    "samples": string;
    "schema": string;
    "recorded_actions": string;
}

export default class SchemaBuilder {

    public buildSchemaRequest: BuildSchemaRequest = {
        samples: "",
        schema: "",
        recorded_actions: ""
    };
    public buildSchemaResponse: any = undefined;

    constructor() {
        this.loadSchema();
    }

    public loadSchema(): boolean {

        const filename:string = outputFileName(config.schemaBuilder.schemaFile);

        if (existsSync(filename)) {
        
            cli.info("Loading schema...");
            const buffer:string = readFileSync(filename, 'utf8');
            this.buildSchemaResponse = JSON.parse(buffer);

            return true;
        }

        return false;
    }

    public async buildSchemaIfNeeded() {
        if (!this.buildSchemaResponse) {
            await this.buildSchema();
        }
    }

    async buildSchema() {

        cli.startClock("Building schema...");
        
        const samples = readFileSync(config.schemaBuilder.samplesFile, 'utf8');

        this.buildSchemaRequest = {
            samples: samples,
            schema: "",
            recorded_actions: ""
        };

        //cli.json(this.buildRulesRequest, COLORS.gray);

        outputFile(`build-schema-request.json`, this.buildSchemaRequest);
        this.buildSchemaResponse = await apiFetch('build_schema', this.buildSchemaRequest);
        outputFile(config.schemaBuilder.schemaFile, this.buildSchemaResponse);
        
        cli.stopClock("Schema built");

    } 
}