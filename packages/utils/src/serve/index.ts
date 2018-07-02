import http from 'http';
import url from 'url';
import webpack from 'webpack';
import Koa from 'koa';
import koaWebpack from 'koa-webpack';
import {Log} from './log';

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
  middleware: Koa.Middleware & koaWebpack.CombinedWebpackMiddleware;
  host: string;
  port: number;
  log: Log;
}

interface ICompilerOptions {
  webpackConfig: webpack.Configuration;
  watch: boolean;
  log: Log;
}

interface IMiddlewareOptions {
  compiler: webpack.Compiler;
  watch: boolean;
}

function getServerUrl(server: http.Server) {
  const address = server.address();
  return typeof address === 'string' ?
    address :
    url.format({
      protocol: 'http',
      hostname: address.address,
      port: address.port
    });
}

function createCompiler({webpackConfig, log, watch}: ICompilerOptions) {
  webpackConfig.bail = watch;

  webpackConfig.plugins = webpackConfig.plugins || [];
  webpackConfig.plugins.push(
    new webpack.ProgressPlugin(log.compilationProgress)
  );

  const compiler = webpack(webpackConfig);

  const compilerPromise = new Promise((resolve, reject) => {
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

  return {compiler, compilerPromise};
}

function createMiddleware({compiler, watch}: IMiddlewareOptions) {
  return koaWebpack({
    compiler,
    devMiddleware: {
      publicPath: '/',
      logLevel: 'silent',
      watchOptions: watch ?
        {} :
        {ignored: '**/*'}
    },
    hotClient: watch ?
      {
        hmr: false,
        logLevel: 'error',
        reload: true
      } :
      false
  });
}

function createServer({middleware, host, port, log}: IServerOptions):
  {server: IServer, serverPromise: Promise<{}>} {
  const server = new Koa().use(middleware).listen({host, port});
  const getUrl = () => getServerUrl(server);
  const close = () => {
    middleware.close();
    server.close();
  };

  const serverPromise = new Promise((resolve, reject) => {
    server.on('listening', () => {
      log.serverListening(getUrl());
      resolve();
    });
    server.on('error', reject);
  });

  return {server: {close, getUrl}, serverPromise};
}

export async function serve(options: IServeOptions): Promise<IServer> {
  const webpackConfig = options.webpackConfig;
  const host = options.host || '127.0.0.1';
  const port = options.port || 0;
  const watch = options.watch || false;

  const log = new Log(watch);

  const {compiler, compilerPromise} = createCompiler({
    webpackConfig, watch, log
  });

  const middleware = await createMiddleware({compiler, watch});

  const {server, serverPromise} = createServer({
    middleware, host, port, log
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
