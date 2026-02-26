import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { branchContext } from '../branch-context';

@Injectable()
export class BranchMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const branchId = req.headers['x-branch-id'];
        if (branchId) {
            branchContext.run(Number(branchId), () => next());
        } else {
            next();
        }
    }
}
