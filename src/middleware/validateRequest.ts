import { Request, Response, NextFunction } from "express";
import { validationResult } from 'express-validator';

const validateRequest = (req: Request, res: Response, next: NextFunction) => {
    // Check for failed request model validations
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Check authentication

    next();
}

export default validateRequest;