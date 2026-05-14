import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');
  private isProductionMode = process.env.NODE_ENV === 'production';

  use(req: Request, res: Response, next: NextFunction) {
    // Only log in development mode
    if (this.isProductionMode) {
      next();
      return;
    }

    const { method, originalUrl } = req;

    const start = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      const duration = Date.now() - start;

      // Only log non-sensitive routes
      if (!this.isSensitiveRoute(originalUrl)) {
        // Silent logging - don't output to console in development
        // This prevents sensitive data exposure in console
      }
    });

    next();
  }

  private isSensitiveRoute(url: string): boolean {
    // Don't log sensitive information
    const sensitiveRoutes = [
      '/auth/login',
      '/auth/register',
      '/auth/logout',
      '/users/change-password',
      '/users/profile',
    ];
    return sensitiveRoutes.some((route) => url.includes(route));
  }
}

