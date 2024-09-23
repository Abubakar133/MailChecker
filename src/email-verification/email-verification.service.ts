import { Injectable } from '@nestjs/common';
import * as dns from 'dns';
import { SMTPClient } from 'smtp-client';

@Injectable()
export class EmailVerificationService {
  async verifyEmail(email: string): Promise<string> {
    const domain = email.split('@')[1];

    return new Promise((resolve, reject) => {
      // Set a timeout for DNS lookup
      const dnsTimeout = setTimeout(() => {
        reject('DNS lookup timeout.');
      }, 5000); // 5 seconds timeout

      dns.resolveMx(domain, async (err, addresses) => {
        clearTimeout(dnsTimeout);

        if (err) {
          return reject('Error during DNS lookup: ' + err.message);
        }
        if (!addresses || addresses.length === 0) {
          return reject('Domain does not exist or has no MX records.');
        }

        const mxHost = addresses[0].exchange;

        const client = new SMTPClient({
          host: mxHost,
          port: 25,
           // SMTP connection timeout set to 5 seconds
        });

        try {
          await client.connect();
          await client.greet({ hostname: 'yourdomain.com' });
          await client.mail({ from: 'you@yourdomain.com' });
          await client.rcpt({ to: email });

          await client.quit();
          resolve('Email is valid!');
        } catch (error) {
          console.error('SMTP Error:', error); // Log the error details
          if (error.code === 'ECONNREFUSED') {
            resolve('SMTP server refused the connection.');
          } else if (error.message.includes('550')) {
            resolve('Email does not exist.');
          } else {
            resolve('Email is invalid!');
          }
          await client.quit();
        }
      });
    });
  }
}

@Injectable()
export class EmailVerificationService2 {
  async verifyEmail(email: string): Promise<string> {
  return 'Server is running successfully not!';
  }
}