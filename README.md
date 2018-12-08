# Exoport CLI

This will build your Exokit WebXR app into a Magic Leap `app.mpk`.

### Usage

```exoport [args]```

#### Arguments

'appName',
    'packageName',
    'buildType',
    'model',
    'portal',
    'contentDir',
    'output',
    'cert',
    'privkey',

r: 'portal',
    f: 'contentDir',
    o: 'output',
    c: 'cert',
    k: 'privkey',

- `-a', `--appName`: Name of the application (App) **required**
- `-p', `--packageName`: Name of the package (com.inc.app) **required**
- `-t', `--buildType`: `debug` (default) or `production`
- `-m', `--model`: Model assets directory
- `-r', `--portal`: Portal assets directory
- `-f', `--contentDir`: App content root directory
- `-o', `--output`: Output zip file path
- `-c', `--cert`: Certificate file path (`app.cert`)
- `-k', `--privkey`: Private key file path (`app.privkey`)
