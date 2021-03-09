import webpack from 'webpack';
import express from 'express';
import webpackDevMiddleware from 'webpack-dev-middleware';
import { Log } from './log';
import { getServerUrl } from '../http';

export interface IServeOptions {
  webpackConfig: webpack.Configuration;
  host?: string;
  port?: number;
  watch?: boolean;
}

export interface IServer {
  close: () => void;
  getUrl: () => string;
}

interface IServerOptions {
  middleware: webpackDevMiddleware.WebpackDevMiddleware & express.Handler;
  host: string;
  port: number;
  log: Log;
}

interface ICompilerOptions {
  webpackConfig: webpack.Configuration;
  watch: boolean;
  log: Log;
}

function createCompiler({ webpackConfig, log, watch }: ICompilerOptions) {
  webpackConfig.bail = watch;

  webpackConfig.plugins = webpackConfig.plugins || [];
  webpackConfig.plugins.push(new webpack.ProgressPlugin(log.compilationProgress));

  const compiler = webpack(webpackConfig);

  const compilerPromise = new Promise<void>((resolve, reject) => {
    // When an error occurs either `hooks.failed` or `hooks.done` runs depending
    // on the bail mode and the type of the error. `hooks.failed` seems to be
    // specific to missing entry points.

    compiler.hooks.failed.tap('Serve', (error) => {
      log.compilationError(error);
      reject();
    });

    compiler.hooks.done.tap('Serve', (stats) => {
      log.compilationFinished(stats);
      stats.hasErrors() ? reject() : resolve();
    });
  });

  return { compiler, compilerPromise };
}

function createServer({
  middleware,
  host,
  port,
  log,
}: IServerOptions): { server: IServer; serverPromise: Promise<unknown> } {
  const server = express().use(middleware).listen({ host, port });
  const getUrl = () => getServerUrl(server);
  const close = () => {
    middleware.close();
    server.close();
  };

  const serverPromise = new Promise<void>((resolve, reject) => {
    server.on('listening', () => {
      log.serverListening(getUrl());
      resolve();
    });
    server.on('error', reject);
  });

  return { server: { close, getUrl }, serverPromise };
}

export async function serve(options: IServeOptions): Promise<IServer> {
  // We're not using a random port by default because Chrome and Firefox
  // block connections to some ports (e.g. 2049 - nfs, 6000 - X11) to prevent
  // cross-protocol attacks.
  const webpackConfig = options.webpackConfig;
  const host = options.host || '127.0.0.1';
  const port = options.port || 0x420;
  const watch = options.watch || false;

  const log = new Log(watch);

  const { compiler, compilerPromise } = createCompiler({
    webpackConfig,
    watch,
    log,
  });

  const middleware = webpackDevMiddleware(compiler);

  const { server, serverPromise } = createServer({
    middleware,
    host,
    port,
    log,
  });

  try {
    if (watch) {
      await serverPromise;
    } else {
      await Promise.all([serverPromise, compilerPromise]);
    }
  } catch (error) {
    server.close();
    throw error;
  }

  return server;
}
