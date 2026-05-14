 export class CustomLogger {
  private isProductionMode = process.env.NODE_ENV === 'production';

  log(message: string, context?: string) {
    if (!this.isProductionMode) {
      console.log(`[${context || 'LOG'}] ${message}`);
    }
  }

  error(message: string, context?: string) {
    // Always log errors even in production
    console.error(`[ERROR] [${context || 'ERROR'}] ${message}`);
  }

  warn(message: string, context?: string) {
    if (!this.isProductionMode) {
      console.warn(`[WARN] [${context || 'WARN'}] ${message}`);
    }
  }

  debug(message: string, context?: string) {
    if (!this.isProductionMode) {
      console.debug(`[DEBUG] [${context || 'DEBUG'}] ${message}`);
    }
  }
}

export const logger = new CustomLogger();

