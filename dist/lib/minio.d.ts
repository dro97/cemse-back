import { Client } from 'minio';
declare const minioClient: Client;
export declare const BUCKETS: {
    readonly VIDEOS: "videos";
    readonly IMAGES: "images";
    readonly DOCUMENTS: "documents";
    readonly COURSES: "courses";
    readonly LESSONS: "lessons";
    readonly RESOURCES: "resources";
    readonly AUDIO: "audio";
};
export declare function initializeBuckets(): Promise<void>;
export declare function uploadToMinio(bucketName: string, objectName: string, fileBuffer: Buffer, contentType: string): Promise<string>;
export declare function deleteFromMinio(bucketName: string, objectName: string): Promise<void>;
export declare function getSignedUrl(bucketName: string, objectName: string, expirySeconds?: number): Promise<string>;
export declare function fileExists(bucketName: string, objectName: string): Promise<boolean>;
export default minioClient;
//# sourceMappingURL=minio.d.ts.map