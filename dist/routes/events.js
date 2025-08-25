"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const minioUpload_1 = require("../middleware/minioUpload");
const EventController_1 = require("../controllers/EventController");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.get('/', EventController_1.getEvents);
router.get('/my-municipality', EventController_1.getEventsByMunicipality);
router.get('/:id', EventController_1.getEvent);
router.get('/my-events', EventController_1.getMyEvents);
router.get('/my-attendances', EventController_1.getMyAttendances);
router.post('/:id/attend', EventController_1.attendEvent);
router.delete('/:id/unattend', EventController_1.unattendEvent);
router.post('/', minioUpload_1.uploadImageToMinIO, EventController_1.createEvent);
router.put('/:id', minioUpload_1.uploadImageToMinIO, EventController_1.updateEvent);
router.delete('/:id', EventController_1.deleteEvent);
router.get('/:id/attendees', EventController_1.getEventAttendees);
router.put('/:id/attendees/:attendeeId', EventController_1.updateAttendeeStatus);
exports.default = router;
//# sourceMappingURL=events.js.map