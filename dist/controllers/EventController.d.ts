import { Request, Response } from 'express';
export declare function getEvents(req: Request, res: Response): Promise<Response>;
export declare function getEvent(req: Request, res: Response): Promise<Response>;
export declare function createEvent(req: Request, res: Response): Promise<Response>;
export declare function updateEvent(req: Request, res: Response): Promise<Response>;
export declare function deleteEvent(req: Request, res: Response): Promise<Response>;
export declare function attendEvent(req: Request, res: Response): Promise<Response>;
export declare function unattendEvent(req: Request, res: Response): Promise<Response>;
export declare function getEventAttendees(req: Request, res: Response): Promise<Response>;
export declare function updateAttendeeStatus(req: Request, res: Response): Promise<Response>;
export declare function getMyEvents(req: Request, res: Response): Promise<Response>;
export declare function getEventsByMunicipality(req: Request, res: Response): Promise<Response>;
export declare function getMyAttendances(req: Request, res: Response): Promise<Response>;
//# sourceMappingURL=EventController.d.ts.map