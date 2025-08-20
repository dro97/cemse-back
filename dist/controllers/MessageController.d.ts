import { Request, Response } from "express";
export declare function getConversations(req: Request, res: Response): Promise<Response>;
export declare function getConversationMessages(req: Request, res: Response): Promise<Response>;
export declare function sendMessage(req: Request, res: Response): Promise<Response>;
export declare function markMessageAsRead(req: Request, res: Response): Promise<Response>;
export declare function getMessagingStats(req: Request, res: Response): Promise<Response>;
export declare function deleteMessage(req: Request, res: Response): Promise<Response>;
//# sourceMappingURL=MessageController.d.ts.map