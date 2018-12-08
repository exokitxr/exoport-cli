#!/usr/bin/env node

const fs = require('fs');
const http = require('http');
const https = require('https');
const minimist = require('minimist');
const FormData = require('form-data');
const archiver = require('archiver');

const EXOPORT_HOSTNAME = `https://build.webmr.io`;
const EXOPORT_URL = `${EXOPORT_HOSTNAME}/mpk`;

const args = minimist(process.argv.slice(2), {
  string: [
    'appName',
    'packageName',
    'buildType',
    'model',
    'portal',
    'contentDir',
    'output',
    'cert',
    'privkey',
  ],
  alias: {
    a: 'appName',
    p: 'packageName',
    t: 'buildType',
    m: 'model',
    r: 'portal',
    f: 'contentDir',
    o: 'output',
    c: 'cert',
    k: 'privkey',
  },
});

let {
  appName,
  packageName,
  buildType,
  model: modelPath,
  portal: portalPath,
  contentDir: contentDirPath,
  output: outputPath,
  cert: certPath,
  privkey: privkeyPath,
} = args;
if (!buildType) {
  buildType = 'debug';
}

const _readFile = p => new Promise((accept, reject) => {
  fs.readFile(p, (err, data) => {
    if (!err) {
      accept(data);
    } else {
      reject(err);
    }
  });
});
const _readDirectory = p => new Promise((accept, reject) => {
  fs.lstat(p, (err, stats) => {
    if (!err && stats.isDirectory()) {
      const archive = archiver('zip', {
        zlib: {
          level: 9,
        },
      });
      const bs = [];
      archive.on('data', d => {
        bs.push(d);
      });
      archive.on('end', () => {
        const b = Buffer.concat(bs);
        fs.writeFileSync('/tmp/lol.zip', b);
        accept(b);
      });
      archive.on('error', reject);

      archive.directory(p, '/');
      archive.finalize();
    } else {
      reject(new Error(`${p} is not a directory`));
    }
  });
});

let valid = true;
if (!appName) {
  console.warn('missing appName');
  valid = false;
}
if (!packageName) {
  console.warn('missing packageName');
  valid = false;
}
if (!['production', 'debug'].includes(buildType)) {
  console.warn('invalid buildType');
  valid = false;
}
if (!contentDirPath) {
  console.warn('invalid contentDirPath');
  valid = false;
}
if (!outputPath) {
  console.warn('invalid outputPath');
  valid = false;
}
if (!privkeyPath) {
  console.warn('invalid privkeyPath');
  valid = false;
}
if (valid) {
  (async () => {
    const form = new FormData();

    form.append('appname', appName);
    form.append('packagename', packageName);
    form.append('buildtype', buildType);

    const contentDirBuffer = await _readDirectory(contentDirPath);
    form.append('app.zip', contentDirBuffer, {
      filename: 'app.zip',
    });

    if (modelPath) {
      const modelBuffer = await _readFile(modelPath);
      form.append('model.zip', modelBuffer, {
        filename: 'model.zip',
      });
    }
    if (portalPath) {
      const portalBuffer = await _readFile(portalPath);
      form.append('portal.zip', portalBuffer, {
        filename: 'portal.zip',
      });
    }

    const certBuffer = await _readFile(certPath);
    form.append('app.cert', certBuffer);

    const privkeyBuffer = await _readFile(privkeyPath);
    form.append('app.privkey', privkeyBuffer);

    const u = await new Promise((accept, reject) => {
      form.submit(EXOPORT_URL, (err, res) => {
        if (!err) {
          const bs = [];
          res.on('data', d => {
            bs.push(d);
          });
          res.on('end', () => {
            const b = Buffer.concat(bs);
            const s = b.toString('utf8');
            const j = JSON.parse(s);
            const {url} = j;
            accept(url);
          });
          res.on('error', reject);
        } else {
          reject(err);
        }
      });
    });

    await new Promise((accept, reject) => {
      const req = (/^https:/.test(EXOPORT_HOSTNAME) ? https : http).get(`${EXOPORT_HOSTNAME}${u}`, res => {
        const ws = fs.createWriteStream(outputPath);
        res.pipe(ws);
        ws.on('finish', () => {
          accept();
        });
        ws.on('error', reject);
      });
      req.on('error', reject);
      req.end();
    });
  })()
    .catch(err => {
      console.warn(err.stack);
    });
} else {
  console.warn('usage: exoport [-a appName] [-p packageName] [-m model] [-r portal] [-f contentDir] [-o output] [-c cert] [-k privkey]');
}
