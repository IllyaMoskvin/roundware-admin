This is an admin dashboard for [Roundware](https://github.com/roundware/roundware-server). Uses APIv2. Please note that this repository is currently under active development, which _will_ include extensive use of `git rebase`. If you clone it, you will likely need to use [hard resets](https://stackoverflow.com/questions/1628088/reset-local-repository-branch-to-be-just-like-remote-repository-head) to bring your local in line with origin:

```
git fetch origin
git reset --hard origin/master
```

This is built using AngularJS. It mostly follows [John Papa's](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md) and [Minko Gechev's](https://github.com/mgechev/angularjs-style-guide) style guides. Less consideration is given to [Todd Motto's](https://github.com/toddmotto/angular-styleguide) guide. Overall, it features a vertical, component-based architecture. A more in-depth development guide will be written up as this project progesses.



# Requirements

This project uses [Grunt](https://gruntjs.com/getting-started) to compile [SCSS](https://sass-lang.com/) into CSS. To "build" this project, you'll need the following:

1. [Node.js](https://nodejs.org/en/) (required by Grunt)
2. [Grunt](https://gruntjs.com/getting-started) (install `grunt-cli` globally)
3. [SASS](https://sass-lang.com/install) (SCSS is a syntax of SASS)
4. [Ruby](https://www.ruby-lang.org/en/downloads/) (required by SASS)

Note that this software is only required to _build_ the app, not to _run_ it. The app itself is a static site – it requires no serverside components aside from a simple webserver.

In the future, we may offer "pre-built" releases so that users won't need to install these prerequisites if they wish to run the app without modding it.



# Installation

```bash
# Download the repository into a folder
git clone https://github.com/roundware/roundware-admin

# Enter the repo's directory
cd roundware-admin

# Install the required node modules
npm install

# Run grunt to generate the required CSS files
grunt
```

Grunt will keep running in the terminal, watching your files for changes, and re-building the app as needed. You can stop Grunt at any time with `Ctrl+C`.


## Configuring your environment

By default, `roundware-admin` assumes that you are running `roundware-server` in its default Vagrant configuration. For any sort of production deploy, or if you just want to get rid of those `net::ERR_ABORTED` errors in the dev console, you'll need to create an `app/env.js` file.

```bash
# Enter the app subdirectory
cd app

# Make a copy of your env file
cp env.default.js env.js
```

There, you can modify `API_BASE_URL` to match your server. You probably won't need to modify `API_PATH_URL` under normal circumstances.


## Enabling CORS for multiple domains

If you're hosting `roundware-admin` on a different domain than your `roundware-server`, you may need to whitelist your `roundware-admin` domain in [roundware/settings/common.py](https://github.com/roundware/roundware-server/blob/f26a636c6e5b80b573a185064f48e2086be914c4/roundware/settings/common.py#L264). Alternatively, you can add the following setting to whitelist any domain:

```python
CORS_ORIGIN_ALLOW_ALL = True
```



# Running rounware-admin

Assuming that you've built the app as described above, it acts as a static site, requiring no serverside processing aside from your webserver of choice.

The only caveat is that you must point your webserver at the `app` subdirectory, not at the repo root.

If Python is installed, the following method is useful for development:

```bash
# Enter the app subdirectory
cd app

# For Python 2.x
python -m SimpleHTTPServer 3000

# For Python 3.x
python3 -m http.server
```

