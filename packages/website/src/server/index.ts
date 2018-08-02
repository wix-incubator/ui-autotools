import 'typescript-support';
import path from 'path';
import http from 'http';
import url from 'url';
import glob from 'glob';
import chalk from 'chalk';
import webpack from 'webpack';
import Koa from 'koa';
import koaWebpack from 'koa-webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import RawAssetWebpackPlugin from '@ui-autotools/utils/cjs/webpack-raw-asset-plugin';
import {WebpackConfigurator} from '@ui-autotools/utils';
import {getMetadataAndSchemasInDirectory} from './meta';
import {formatComponentDataForClient} from './client-data';
const StylableWebpackPlugin = require('stylable-webpack-plugin');

interface IProjectOptions {
  projectPath: string;
  webpackConfigPath: string;
  metadataGlob: string;
  sourcesGlob: string;
}

export interface IStartWebisteOptions {
  projectOptions: IProjectOptions;
  host: string;
  port: number;
}

export interface IBuildWebisteOptions {
  projectOptions: IProjectOptions;
  outputPath: string;
}

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
  {
    outputPath,
    production,
    projectOptions
  }: {
    outputPath: string;
    production: boolean;
    projectOptions: IProjectOptions;
  }
): webpack.Configuration {
  const metadataAndSchemas = getMetadataAndSchemasInDirectory(
    projectOptions.projectPath,
    projectOptions.metadataGlob,
    projectOptions.sourcesGlob
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
    mode: production ? 'production' : 'development',
    context: ownPath,
    entry: [path.resolve(ownPath, 'esm/client/website.js')],
    output: {
      filename: 'website.js',
      path: outputPath
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
  {
    outputPath,
    production,
    projectOptions
  }: {
    outputPath: string;
    production: boolean;
    projectOptions: IProjectOptions;
  }
): webpack.Configuration {
  const metaFiles = glob.sync(projectOptions.metadataGlob, {
    cwd: projectOptions.projectPath,
    absolute: true,
  });

  const config = WebpackConfigurator
                 .load(projectOptions.webpackConfigPath)
                 .getConfig();
  config.mode = production ? 'production' : 'development';
  config.context = projectOptions.projectPath;
  config.entry = [...metaFiles, path.join(ownPath, 'esm/client/simulation.js')];
  config.output = {
    filename: 'metadata.js',
    path: outputPath
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

export async function startWebsite(
  {projectOptions, host, port}: IStartWebisteOptions
) {
  const koa = new Koa();

  const websiteCompiler = webpack(getWebsiteWebpackConfig({
    projectOptions,
    production: false,
    outputPath: '/dev/null'
  }));

  const metadataCompiler = webpack(getMetadataWebpackConfig({
    projectOptions,
    production: false,
    outputPath: '/dev/null'
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

  const server = koa.listen({host, port});

  server.on('listening', () => {
    const serverUrl = getServerUrl(server);
    process.stdout.write(`Running on ${chalk.blue(serverUrl)}\n`);
  });
}

export async function buildWebsite(
  {projectOptions, outputPath}: IBuildWebisteOptions
) {
  try {
    // Compile the metadata first, because if there are type or syntactic errors
    // in the project it's easier to let Webpack catch and report them instead
    // of implementing friendly error reporting in the schema extractor.

    const metadataCompiler = webpack(getMetadataWebpackConfig({
      projectOptions,
      production: true,
      outputPath
    }));

    await new Promise((resolve, reject) => {
      metadataCompiler.run((err, stats) => {
        if (err) {
          reject(err);
        } else if (stats.hasErrors()) {
          reject(stats.toString());
        } else {
          resolve();
        }
      });
    });

    const websiteCompiler = webpack(getWebsiteWebpackConfig({
      projectOptions,
      production: true,
      outputPath
    }));

    await new Promise((resolve, reject) => {
      websiteCompiler.run((err, stats) => {
        if (err) {
          reject(err);
        } else if (stats.hasErrors()) {
          reject(stats.toString());
        } else {
          resolve();
        }
      });
    });
  } catch (e) {
    process.stderr.write(e);
    process.exit(1);
  }
}
