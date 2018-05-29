const commander = require('commander');

program
    .version('0.0.1')
    .description('auto ssr')
    .action(function() {
      console.log('here');
    });

program.parse(process.argv);