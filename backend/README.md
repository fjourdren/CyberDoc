# CyberDoc Backend

### Launch procedure

1. Run `npm install -g nodemon`
2. Copy `.env.example` file and rename the copy to `.env.dev`
    - set `APP_ENV` to `dev`
    - set other properties if neeeded
3. launch backend with `nodemon` command
4. When console prints `[<DATE>] [INFO] app - Listening at http://<IP>:<PORT>`, the app is ready and can be used at the specified adress.