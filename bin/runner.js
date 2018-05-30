#!/usr/bin/env node
const program = require('commander');
const ssr = require('../scripts/ssr');

program
  .command('ssr')
  .description('run auto-ssr tests on all components with a metadata description')
  .option("-g, --grep <pattern>", "Grep file")
  .action(function(options){
    const searchPattern = options.grep || '';
    // const moreSearch = options.otherDirs || [];
    console.log('Running auto-ssr for', searchPattern,);
    ssr();
  });

program.parse(process.argv);