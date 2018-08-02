import 'typescript-support';
import path from 'path';
import http from 'http';
import url from 'url';
import glob from 'glob';
import webpack from 'webpack';
import Koa from 'koa';
import koaWebpack from 'koa-webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import RawAssetWebpackPlugin from '@ui-autotools/utils/cjs/webpack-raw-asset-plugin';
import {WebpackConfigurator} from '@ui-autotools/utils';
import {getMetadataAndSchemasInDirectory} from './meta';
import {formatComponentDataForClient} from './client-data';
const StylableWebpackPlugin = require('stylable-webpack-plugin');

const ownPath = path.resolve(__dirname, '../..');

// TODO: import this function from utils.
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

function getWebsiteWebpackConfig(
  options: {
    projectPath: string;
    outputPath: string;
    metadataGlob: string;
    sourceGlob: string;
  }
): webpack.Configuration {
  const metadataAndSchemas = getMetadataAndSchemasInDirectory(
    options.projectPath,
    options.metadataGlob,
    options.sourceGlob
  );
  const schemas = Array.from(metadataAndSchemas.schemasByComponent.values());
  const componentData = formatComponentDataForClient(metadataAndSchemas);
  const componentPages = schemas.map(({name}) =>
    new HtmlWebpackPlugin({
      title: name,
      filename: `components/${name}/index.html`,
    })
  );

  return {
    mode: 'development',
    context: ownPath,
    entry: [path.resolve(ownPath, 'esm/client/website.js')],
    output: {
      filename: 'website.js',
      path: options.outputPath
    },
    plugins: [
      new StylableWebpackPlugin(),
      new RawAssetWebpackPlugin({
        filename: 'components.json',
        data: JSON.stringify(componentData)
      }),
      new HtmlWebpackPlugin({
        title: 'Website',
        filename: 'index.html'
      }),
      ...componentPages
    ]
  };
}

function getMetadataWebpackConfig(
  options: {
    projectPath: string;
    metadataGlob: string;
    outputPath: string;
    webpackConfigPath: string;
  }
): webpack.Configuration {
  const metaFiles = glob.sync(options.metadataGlob, {
    cwd: options.projectPath,
    absolute: true,
  });

  const config = WebpackConfigurator.load(options.webpackConfigPath).getConfig();

  config.mode = 'development';
  config.context = options.projectPath;
  config.entry = [...metaFiles, path.join(ownPath, 'esm/client/simulation.js')];
  config.output = {
    filename: 'metadata.js',
    path: options.outputPath
  };
  if (!config.plugins) {
    config.plugins = [];
  }
  config.plugins.push(new HtmlWebpackPlugin({
    title: 'Simulation',
    filename: 'simulation.html'
  }));
  return config;
}

export interface IStartWebisteOptions {
  host: string;
  port: number;
  projectPath: string;
  outputPath: string;
  webpackConfigPath: string;
  metadataGlob: string;
  sourceGlob: string;
}

export async function startWebsite(options: IStartWebisteOptions) {
  const koa = new Koa();

  const websiteCompiler = webpack(getWebsiteWebpackConfig({
    projectPath: options.projectPath,
    outputPath: options.outputPath,
    metadataGlob: options.metadataGlob,
    sourceGlob: options.sourceGlob
  }));

  const metadataCompiler = webpack(getMetadataWebpackConfig({
    projectPath: options.projectPath,
    outputPath: options.outputPath,
    webpackConfigPath: options.webpackConfigPath,
    metadataGlob: options.metadataGlob
  }));

  const devMiddleware: koaWebpack.Options['devMiddleware'] = {
    publicPath: '/',
    logLevel: 'warn'
  };

  const hotClient: koaWebpack.Options['hotClient'] = {
    logLevel: 'warn'
  };

  koa.use(await koaWebpack({
    compiler: websiteCompiler,
    devMiddleware,
    hotClient
  }));

  koa.use(await koaWebpack({
    compiler: metadataCompiler,
    devMiddleware,
    hotClient
  }));

  const server = koa.listen({
    host: options.host,
    port: options.port
  });

  server.on('listening', () => {
    process.stdout.write(`Listening on ${getServerUrl(server)}\n`);
  });
}
