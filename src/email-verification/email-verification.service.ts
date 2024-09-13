import { Injectable } from '@nestjs/common';
import * as dns from 'dns';
import { SMTPClient } from 'smtp-client';

@Injectable()
export class EmailVerificationService {
  async verifyEmail(email: string): Promise<string> {
    const domain = email.split('@')[1];

    return new Promise((resolve, reject) => {
     
      dns.resolveMx(domain, async (err, addresses) => {
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
          
        });

        try {
          await client.connect();
          await client.greet({ hostname: 'yourdomain.com' }); 
          await client.mail({ from: 'you@yourdomain.com' });  
          await client.rcpt({ to: email });

          await client.quit();
          resolve('Email is valid!');
        } catch (error) {
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
