#!/usr/bin/env node
// Usage: ./client.js <poser|solver>
// Please provide a client.json to store the information.
const http = require('http');
const querystring = require('querystring');
const { spawn } = require('child_process');
const { id, pid, code, hostname, port } = require('./client.json');
const role = process.argv[2];
console.log(`Your role: ${role}`); // either "poser" or "solver"

let consume_response = (cb) => {
    return (res) => {
        const { statusCode } = res;
        if (statusCode == 200) {
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => { rawData += chunk; });
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(rawData);
                    console.log(parsedData);
                    cb(parsedData); // callback!
                } catch (e) {
                    console.error(e.message);
                }
            });
            return;
        }
        res.resume();
        process.exit(1);
    };
};

// open your program!
const subprocess = spawn(`sol/${role}.sh`, []);
let output = '';
subprocess.stdout.on('data', (data) => { output += data; });
subprocess.on('close', (exitCode) => {
    console.log(`subprocess exited with ${exitCode}.`);
    console.log(output);
    // when the program finishes, submit it!
    const postData = querystring.stringify({ data: output });
    const options = {
        hostname: hostname,
        port: port,
        path: `/api/submit?role=${role}&id=${id}&pid=${pid}&code=${code}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    const req = http.request(options, consume_response((obj) => {}));
    req.on('error', (e) => { console.error(e.message); });
    req.write(postData);
    req.end();
});

// retrieve input
http.get(
        `http://${hostname}:${port}/api/get?role=${role}&id=${id}&pid=${pid}&code=${code}`,
        consume_response((obj) => {
            if (!obj.hasOwnProperty('data')) {
                process.exit(1);
            }
            subprocess.stdin.write(obj.data);
        }));
