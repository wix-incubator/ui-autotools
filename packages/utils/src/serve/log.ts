import readline from 'readline';
import chalk from 'chalk';
import webpack from 'webpack';

function clearConsole() {
  process.stdout.write(
    process.platform === 'win32' ?
      '\x1B[2J\x1B[0f' :
      '\x1B[2J\x1B[3J\x1B[H'
  );
}

function formatWebpackStats(stats: webpack.Stats) {
  return stats.toString({
    assets: false,
    builtAt: false,
    chunks: false,
    colors: true,
    entrypoints: false,
    hash: false,
    modules: false,
    performance: false,
    timings: false,
    version: false
  });
}

export class Log {
  private firstRun: boolean = true;
  private listening: boolean = false;
  private watch: boolean = false;

  constructor(watch: boolean) {
    this.watch = watch;
  }

  // Postpone progress logging until the server is listening to avoid mixing
  // compiler's and server's output, since they start in parallel.
  public compilationProgress = (percentage: number) => {
    if (this.listening && this.watch) {
      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0);
      if (percentage < 1) {
        process.stdout.write(`Compiling ${Math.round(100 * percentage)}%`);
      }
    }
  }

  public compilationFinished = (stats: webpack.Stats) => {
    if (this.firstRun) {
      this.firstRun = false;
    } else if (this.watch) {
      clearConsole();
    }

    if (stats.hasErrors()) {
      process.stderr.write(chalk.red('Compilation failed.\n'));
      process.stderr.write(formatWebpackStats(stats));
    } else if (stats.hasWarnings()) {
      process.stderr.write(chalk.yellow('Compiled with warnings.\n'));
      process.stderr.write(formatWebpackStats(stats));
    } else if (this.watch) {
      process.stdout.write(chalk.green('Compiled successfully.\n'));
    }
  }

  public compilationError(error: Error) {
    process.stderr.write(chalk.red('Compilation failed.\n'));
    process.stderr.write(error.toString() + '\n');
  }

  public serverListening = (url: string) => {
    this.listening = true;
    if (this.watch) {
      process.stdout.write(`Running on ${chalk.blue(url)}\n`);
    }
  }
}
