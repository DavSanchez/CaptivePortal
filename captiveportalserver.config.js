module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [
    {
      name      : "nodeserver",
      script    : "./nodeserver.js",
      watch     : true,
      ignore_watch: ["./.git", "./node_modules", "./.gitignore", "./uploads", "./users/users.json", "./users/usersOneTime.json"]
    }
  ]
}
