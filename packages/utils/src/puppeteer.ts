import puppeteer from 'puppeteer';

export function waitForPageError(page: puppeteer.Page): Promise<never> {
    return new Promise((_, reject) => {
        page.on('pageerror', (errorText: string) => {
        reject(new Error(errorText));
        });

        page.on('error', () => {
        reject(new Error('Page crashed'));
        });
    });
}
