import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { RequestHandler } from "express";

export const validateRequest =
  (schema: AnyZodObject): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: "Validation failed",
          errors: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
        return;
      }

      res.status(500).json({
        message: "Internal validation error",
      });
      return;
    }
  };
