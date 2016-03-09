
import path from 'path';

import async from 'async';
import clapi from 'clapi';
import extend from 'extend';
import findup from 'findup';
import chalk from 'chalk';

import store from '../commands/batch/store';
import batchGetAll from '../commands/batch/get-all';
import batchAnalyze from '../commands/batch/analyze';
import dbFind from '../commands/db/find';
import report from '../commands/report';
import analyze from '../commands/file/analyze-multi';
import println from '../println';
import glob from '../middleware/glob';

import logger from '../logger';

const cli = clapi.create();

const rcfile = '.platorc';
const dbfile = '.platodb';

cli.before(findrcfile);
cli.before(defaults);

cli.use(glob('args.files'));

cli.command('default', store);
cli.command('store', store);
cli.command('report', report);
cli.command('get-all', batchGetAll);
cli.command('batch-analyze', batchAnalyze);
cli.command('analyze', analyze);
cli.command('db-find', dbFind);

report.after((input, output) => {
  Object.keys(output.reporters).forEach(reporter => {
    process.stdout.write(chalk.yellow(`:: ${reporter}\n`));
    process.stdout.write(output.reporters[reporter] + '\n');
  });
});

cli.command('help', function() {
  println(`
  Usage: plato [command] [options]

  Commands:
  `);
  println(Object.keys(cli.commands).map(cmd => `  ${cmd} : ${cli.commands[cmd].description}`).join('\n'));
}).description = 'Help text';

export default cli;

export function defaults(input, output) {
  let defaults = {
    db: path.join(input.rcDir, dbfile),
    files: [],
    analyzers: [],
    reporters: [],
  };
  input.args = extend(defaults, input.args);
  if (input.args.loglevel) logger.level = input.args.loglevel;

}

export function findrcfile(input, output, done) {
  findup(input.cwd, rcfile, (err, dir)=>{
    if (err) {
      logger.verbose('cli', `unable to find rcfile ${rcfile} anywhere in path`);
      input.rcDir = input.cwd;
      return done();
    }
    let config = require(path.join(dir, rcfile));
    extend(input.args, config);
    input.rcDir = dir;
    done();
  });
}
