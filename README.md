# Exoport CLI

This will build your Exokit WebXR app into a Magic Leap `app.mpk`.

### Usage

```exoport [args]```

#### Arguments

- `-a`, `--appName`: Name of the application (App) **required**
- `-p`, `--packageName`: Name of the package (com.inc.app) **required**
- `-t`, `--buildType`: `debug` (default) or `production`
- `-f`, `--contentDir`: App content root directory **required**
- `-o`, `--output`: Output zip file path **required**
- `-m`, `--model`: Model assets directory
- `-r`, `--portal`: Portal assets directory
- `-c`, `--cert`: Certificate file path (`app.cert`) **required**
- `-k`, `--privkey`: Private key file path (`app.privkey`) **required**
