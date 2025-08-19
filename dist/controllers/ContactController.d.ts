import { Request, Response } from "express";
export declare function searchYouthUsers(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function sendContactRequest(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getReceivedContactRequests(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function acceptContactRequest(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function rejectContactRequest(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getContacts(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function removeContact(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getNetworkStats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=ContactController.d.ts.map