import fs from 'fs/promises';
import { buffer } from 'stream/consumers';
import os from 'os'

async function readFileData() {
    try {
        const data = await fs.readFile('filePath', 'utf8');
        console.log('file', data);
    } catch(error){
        console.log(error)
    }
}

async function testWrite() {
    const user = { name: 'nikem', role: 'developer'};
    const textDat = JSON.stringify(user, null, 2);
    await fs.writeFile('user.json', textDat, 'utf8');
    console.log('step 1 done ')
}

async function testUpdateFile () {
    const fileName = 'user.json';
    const reawText = await fs.readFile(fileName, 'utf8');
    const user = JSON.parse(reawText);
    console.log('Current data from file', reawText),

    user.lastLogin ='2026-09-11';
    const updatedUser =JSON.stringify(user, null, 2);
    await fs.writeFile(updatedUser, updatedUser, 'utf8');
    cons
}

async function readFileContent () {
    let fileContent = await fs.readFile('user.json');
    console.log(fileContent)
}

async function deleteFile() {
 await fs.unlink('user.json');
 console.log('file deleted')
}

const myBuffer = Buffer.alloc(4);
console.log(myBuffer);


