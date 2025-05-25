import { Router, Request, Response } from 'express';

const healthRouter = Router();

/**
 * @swagger
 * /status:
 *   get:
 *     summary: Health check to verify the server is running
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is up and running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 */
healthRouter.get('/status', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK' });
});

export { healthRouter };
