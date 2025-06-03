import { readFileSync } from "fs";
import config from "../configuration/configuration";
import cli from "../utility/cli";
import { apiFetch, writeToFile } from "../utility/utility";

export type CheckRequest = {
    clinical_note: string;
    encounter_information: {
        encounter_transcript: string;
    };
    chart_audit_rules: any;
} 

export type BuildRulesRequest = {
    audit_requirements: string;
    samples: string;
}

export default class ComplianceChecker {

    public buildRulesRequest: BuildRulesRequest = {
        audit_requirements: "",
        samples: ""
    }

    public name?: string;

    public buildRulesResponse: any = undefined;

    public checkRequest: CheckRequest = {
        clinical_note: "",
        encounter_information: {
            encounter_transcript: ""
        },
        chart_audit_rules: ""
    }

    public checkResponse: any;

    constructor() {
        if (!config.ruleBuilder.buildRules) {
            this.loadRules();
        }
    }

    public loadRules(){

        cli.startClock("Loading rules...");

        this.buildRulesResponse = JSON.parse(readFileSync(config.ruleBuilder.rulesFile, 'utf8'));

        cli.stopClock("Rules Loaded");
    }

    async buildRules() {

        cli.startClock("Building rules...");
        
        const requirements = readFileSync(config.ruleBuilder.requirementsFile, 'utf8');
        const samples = readFileSync(config.ruleBuilder.samplesFile, 'utf8');

        this.buildRulesRequest = {
            audit_requirements: requirements,
            samples: samples
        };

        //cli.json(this.buildRulesRequest, COLORS.gray);

        writeToFile(`output/build-rules-request.json`, this.buildRulesRequest);
        this.buildRulesResponse = await apiFetch('build_rules', this.buildRulesRequest);
        writeToFile(`output/build-rules-response.json`, this.buildRulesResponse);
        
        //cli.json(this.buildRulesResponse, COLORS.white);
        
        cli.stopClock("Rules built");

    } 

    async check(note: any, transcript: string) {

        cli.startClock("Checking note...");

        if (!this.buildRulesResponse) {
            if (config.ruleBuilder.buildRules) {
                await this.buildRules();
            } else {
                this.loadRules();
            }
        }

        const noteToCheck = typeof note === 'object' ? 
            JSON.stringify(note, null, 2) :
            note;

        this.checkRequest = {
            clinical_note: noteToCheck,
            encounter_information: {
                encounter_transcript: transcript
            },
            chart_audit_rules: this.buildRulesResponse //JSON.stringify(this.buildRulesResponse, null, 2)
        }
        //cli.json(this.checkRequest, COLORS.gray);

        let filename = this.name ? `output/${this.name}-check-request.json` : `output/check-request.json`;
        writeToFile(filename, this.checkRequest);
        this.checkResponse = await apiFetch('check', this.checkRequest);

        filename = this.name ? `output/${this.name}-check-response.json` : `output/check-response.json`;
        writeToFile(filename, this.checkResponse);

        //cli.json(this.checkResponse, COLORS.white);

        if (this.didFail()) {
            cli.failure(`Note ${this.name} failed compliance check`);
        } else {
            cli.success(`Note ${this.name} passed compliance check`);
        }

        cli.stopClock("Note checked");

    }

    didFail(): boolean {
        if (!Array.isArray(this.checkResponse)) {
            return false;
        }
        return this.checkResponse.some(item => item.status === "FAIL");
    }
}