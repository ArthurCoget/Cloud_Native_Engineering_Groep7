import * as dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import * as bodyParser from 'body-parser';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { customerRouter } from './controller/customer.routes';
import { discountCodeRouter } from './controller/discountCode.routes';
import { cartRouter } from './controller/cart.routes';
import { orderRouter } from './controller/order.routes';
import { productRouter } from './controller/product.routes';
import { paymentRouter } from './controller/payment.routes';
import { expressjwt } from 'express-jwt';
import helmet from 'helmet';
import { healthRouter } from './controller/health.routes';

const app = express();
app.use(helmet());

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            connectSrc: ["'self'"],
        },
    })
);
dotenv.config();
const port = process.env.PORT || process.env.APP_PORT || 3000;

const allowedOrigins = ['http://localhost:8080', 'https://storagegroep7.z28.web.core.windows.net', 'http://localhost:3000'];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    })
);
app.use(bodyParser.json());

app.use(
    expressjwt({
        secret: process.env.JWT_SECRET!,
        algorithms: ['HS256'],
    }).unless({
        path: ['/api-docs', /^\/api-docs\/.*/, '/customers/login', '/customers/signup', '/status'],
    })
);

app.use('/customers', customerRouter);
app.use('/discounts', discountCodeRouter);
app.use('/carts', cartRouter);
app.use('/orders', orderRouter);
app.use('/products', productRouter);
app.use('/payments', paymentRouter);
app.use('/', healthRouter);

app.get('/status', (req, res) => {
    res.json({ message: 'Back-end is running...' });
});

const swaggerOpts = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Courses API',
            version: '1.0.0',
        },
    },
    apis: ['./controller/*.routes.ts'],
};
const swaggerSpec = swaggerJSDoc(swaggerOpts);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({ status: 'unauthorized', message: err.message });
    } else {
        res.status(400).json({ status: 'application error', message: err.message });
    }
});

app.listen(port || 3000, () => {
    console.log(`Back-end is running on port ${port}.`);
});
