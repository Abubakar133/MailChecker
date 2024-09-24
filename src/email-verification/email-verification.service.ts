import { Injectable } from '@nestjs/common';
import * as dns from 'dns';
import { SMTPClient } from 'smtp-client';
import { promisify } from 'util';

// Convert dns.resolveMx to return a promise
const resolveMxAsync = promisify(dns.resolveMx);

@Injectable()
export class EmailVerificationService {
  async verifyEmail(email: string): Promise<string> {
    const domain = email.split('@')[1];

    try {
      // Await DNS lookup for MX records
      const addresses = await resolveMxAsync(domain);
      if (!addresses || addresses.length === 0) {
        throw new Error('Domain does not exist or has no MX records.');
      }

      const mxHost = addresses[0].exchange;

      const client = new SMTPClient({
        host: mxHost,
        port: 25, // Standard SMTP port
        // Timeout for SMTP operations
      });

      try {
        // Perform the SMTP verification with timeout
        await Promise.race([
          this.performSmtpVerification(client, email),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('SMTP connection timeout')), 10000),
          ), // 5 seconds timeout
        ]);

        return 'Email is valid!';
      } catch (error) {
        console.error('SMTP Error:', error.message);
        return this.handleSmtpError(error);
      } finally {
        // Ensure the client quits in case of any issues
        try {
          await client.quit();
        } catch (e) {
          console.error('Error closing SMTP client:', e.message);
        }
      }
    } catch (error) {
      console.error('DNS Lookup Error:', error.message);
      return `Error during DNS lookup: ${error.message}`;
    }
  }

  // Separate function to handle SMTP verification
  private async performSmtpVerification(client: SMTPClient, email: string): Promise<void> {
    await client.connect();
    await client.greet({ hostname: 'yourdomain.com' }); // Update this to your domain
    await client.mail({ from: 'you@yourdomain.com' }); // Update this to your email
    await client.rcpt({ to: email });
    await client.quit();
  }

  // Function to handle SMTP errors
  private handleSmtpError(error: any): string {
    if (error.message === 'SMTP connection timeout') {
      return 'SMTP connection timed out.';
    }
    if (error.code === 'ECONNREFUSED') {
      return 'SMTP server refused the connection.';
    }
    if (error.message.includes('550')) {
      return 'Email does not exist.';
    }
    return 'Email is invalid!';
  }
}
