const { decrypt } = require('@metamask/browser-passworder');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const fs = require('fs').promises;

async function bruteforceWorker(start, end, passwords, ciphertext) {
    for (let i = start; i < end; i++) {
        try {
            const decryptedData = await decrypt(passwords[i], ciphertext);
            const keyringsWithEncodedMnemonic = decryptedData.map(keyring => {
                if ('mnemonic' in keyring.data) {
                    return {
                        ...keyring,
                        data: {
                            ...keyring.data,
                            mnemonic: decodeMnemonic(keyring.data.mnemonic)
                        }
                    };
                } else {
                    return keyring;
                }
            });
            console.log(`Decrypted data:\n${JSON.stringify(keyringsWithEncodedMnemonic)}`);
            console.log(`Password: ${passwords[i]}`);
            parentPort.postMessage({ result: keyringsWithEncodedMnemonic });
            return;
        } catch (error) {

        }
    }
    parentPort.postMessage({ result: null });
}

function decodeMnemonic(mnemonic) {
    if (typeof mnemonic === 'string') {
        return mnemonic;
    } else {
        return Buffer.from(mnemonic).toString('utf8');
    }
}

async function bruteforce() {
    if (isMainThread) {
        try {
            const ciphertext = await fs.readFile('text.txt', 'utf8');
            const passwords = await fs.readFile('pass.txt', 'utf8');
            const passwordsArray = passwords.split('\n').map(password => password.trim());
            const numWorkers = passwordsArray.length;
            const passwordsPerWorker = 1;
            const workerPromises = [];

            for (let i = 0; i < numWorkers; i++) {
                const start = i * passwordsPerWorker;
                const end = start + passwordsPerWorker;
                const workerPromise = new Promise((resolve) => {
                    const worker = new Worker(__filename, { workerData: { start, end, passwords: passwordsArray, ciphertext } });
                    worker.on('message', (message) => {
                        if (message.result !== null) {
                            resolve(message.result);
                            worker.terminate();
                        }
                    });
                });
                workerPromises.push(workerPromise);
            }

            Promise.all(workerPromises).then((results) => {
                console.log('\nNone of the passwords matched.');
            });
        } catch (error) {
            console.error('Failed to read files:', error);
        }
    } else {
        const { start, end, passwords, ciphertext } = workerData;
        bruteforceWorker(start, end, passwords, ciphertext);
    }
}


bruteforce();


