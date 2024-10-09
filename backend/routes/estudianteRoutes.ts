import { Router } from 'express';
import { getEstudiantes, registrarEstudiante } from '../controllers/estudianteController';

const router = Router();

router.get('/estudiantes', getEstudiantes);
router.post('/estudiantes', registrarEstudiante);

export default router;
