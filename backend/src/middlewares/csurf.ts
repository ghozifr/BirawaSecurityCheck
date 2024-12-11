import csrf from "csurf";
import { Request, Response } from "express";

declare global {
    namespace Express {
      interface Request {
        csrfToken(): string;
      }
    }
  }

export const csrfProtection = csrf({
    cookie: {
        httpOnly: false, // Allow JavaScript access to the CSRF token
        secure: true,
        sameSite: 'strict'
    }
});

export const csrfToken = (req: Request, res: Response) => {
    res.json({csrfToken: req.csrfToken()})
}