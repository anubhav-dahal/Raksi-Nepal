import { Router } from 'express';
import { getLatestVersion } from '../controllers/appVersionController.js';

const router = Router();

router.get('/version', getLatestVersion);

export default router;
