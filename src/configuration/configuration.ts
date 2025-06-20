import configuration from  './config.conjure.json';

class Configuration{
    private static instance: Configuration;
    
    configuration: any;

    public conjureApiKey: string = '';
    public audioUrl: string = '';
    public baseUrl: string = '';
    public outputFolder: string = '';
    public caseName: string = '';
    public ruleBuilder: {
        rulesFile: string,
        samplesFile: string,
        requirementsFile: string
    } = {rulesFile: '', samplesFile: '', requirementsFile: ''};
    public schemaBuilder: {
        samplesFile: string,
        schemaFile: string
    } = {samplesFile: '', schemaFile: ''};
    public endpoints: {key: string, url: string}[] = [];
    public aws: {
        region: string,
        accessKeyId: string,
        secretAccessKey: string,
        bucket: string
    } = {region: '', accessKeyId: '', secretAccessKey: '', bucket: ''};

 
    private constructor() {
        this.configuration = configuration;
        Object.assign(this, configuration);
    }

    public getEndpoint(key: string): string {

        const endpoint = this.endpoints.find(endpoint => endpoint.key === key)?.url || '';
        let completeUrl = 
            (this.baseUrl.endsWith('/') || endpoint.startsWith('/')) ?
                this.baseUrl + endpoint :
                this.baseUrl + '/' + endpoint;

        return completeUrl;
    }

    public static getInstance(): Configuration {
        if (!Configuration.instance) {
            Configuration.instance = new Configuration();
        }
        return Configuration.instance;
    }
}

const config = Configuration.getInstance();
export default config;