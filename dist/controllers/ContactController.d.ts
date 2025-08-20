import { Request, Response } from "express";
export declare function searchYouthUsers(req: Request, res: Response): Promise<Response>;
export declare function sendContactRequest(req: Request, res: Response): Promise<Response>;
export declare function getReceivedContactRequests(req: Request, res: Response): Promise<Response>;
export declare function acceptContactRequest(req: Request, res: Response): Promise<Response>;
export declare function rejectContactRequest(req: Request, res: Response): Promise<Response>;
export declare function getContacts(req: Request, res: Response): Promise<Response>;
export declare function removeContact(req: Request, res: Response): Promise<Response>;
export declare function getNetworkStats(req: Request, res: Response): Promise<Response>;
//# sourceMappingURL=ContactController.d.ts.map