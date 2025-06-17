'use strict';
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import config from '../configuration/configuration';
import cli from './cli';
import { mkdirSync, existsSync, writeFileSync } from "fs";

export function generateUuid(): string {

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r: number = Math.random() * 16 | 0;
        const v: number = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function now(): string {

    const now: Date = new Date();

    const formattedDate = now.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: '2-digit'
    });
    const formattedTime = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    return `${formattedDate} ${formattedTime}`;
}

export async function apiFetch(endpoint: string, body: any): Promise<any> {

    const headers = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-conjure-key": config.conjureApiKey
        },
        body: JSON.stringify(body)
    }
    //cli.json(headers);
    const response = await fetch(config.getEndpoint(endpoint), headers);

    const status = response.status;
    if (status !== 200) {
        const data = await response.text();
        cli.error(`${endpoint} failed: status ${status}`);
        cli.error(data);
        throw new Error(`${endpoint} failed: status ${status}`);
    }

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        const data = await response.text();
        cli.error(`${endpoint} failed: response was not JSON`);
        cli.error(data);

        throw new Error('Response was not JSON');
    }

    return response.json();
}


export async function createPresignedUrl(bucket: string, path: string) {

    const expiresIn = 900;

    const s3Client = new S3Client({ region: config.aws.region,
        credentials: {
            accessKeyId: config.aws.accessKeyId,
            secretAccessKey: config.aws.secretAccessKey
        }
     });
    const command = new GetObjectCommand({ Bucket: bucket, Key: path });
    return getSignedUrl(s3Client, command, { expiresIn });
};

export async function writeFile(filename: string, body: any, append: boolean = false): Promise<void> {

    try {
        const data = typeof body === 'string' ? body : JSON.stringify(body, null, 2);
        writeFileSync(filename, data, { flag: append ? 'a' : 'w' });
    } catch (error) {
        cli.error(`Failed to write to file ${filename}`);
        throw error;
    }

}
export async function outputFile(filename: string, body: any, append: boolean = false): Promise<void> {

    try {

        filename = outputFileName(filename);
        return writeFile(filename, body, append);
    } catch (error) {
        cli.error(`Failed to write to file ${filename}`);
        throw error;
    }
}

export function outputFileName(filename: string) {

    const folder = config.outputFolder;
    if (!existsSync(folder)) {
        mkdirSync(folder, { recursive: true });
    }

    filename = `${folder}/${filename}`;

    return filename;

}
