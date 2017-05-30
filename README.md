This is an admin dashboard for [Roundware](https://github.com/roundware/roundware-server). Uses APIv2. Please note that this repository is currently under active development, which _will_ include extensive use of `git rebase`. If you clone it, you will likely need to use [hard resets](https://stackoverflow.com/questions/1628088/reset-local-repository-branch-to-be-just-like-remote-repository-head) to bring your local in line with origin:

```
git fetch origin
git reset --hard origin/master
```

This is built using AngularJS. It mostly follows [John Papa's](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md) and [Minko Gechev's](https://github.com/mgechev/angularjs-style-guide) style guides. Less consideration is given to [Todd Motto's](https://github.com/toddmotto/angular-styleguide) guide. Overall, it features a vertical, component-based architecture. A more in-depth development guide will be written up as this project progesses.



# Installation

```bash
# Download the repository into a folder
git clone https://bitbucket.org/imalab/roundware-admin

# Enter the repo's directory
cd roundware-admin

# Install the required node modules
npm install

# Run grunt to generate the required CSS files
grunt
```
