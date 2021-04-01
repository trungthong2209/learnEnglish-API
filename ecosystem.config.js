module.exports = {
  apps : [{
    name : "learn-english",
    script: 'app.js',
  }],

  deploy : {
    production : {
      user : 'ubutu',
      host : ["192.168.1.112"],
      ref  : 'origin/master',
      repo : 'git@github.com:trungthong2209/learnEnglish-API.git',
      path : '/home/ubuntu/learnEnglish-API',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
