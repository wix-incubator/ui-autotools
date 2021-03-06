import '@ts-tools/node/r';
import { promisify } from 'util';
import glob from 'glob';
import chalk from 'chalk';
import webpack from 'webpack';
import express from 'express';
import webpackDevMiddleware from 'webpack-dev-middleware';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { StylableWebpackPlugin } from '@stylable/webpack-plugin';
import { WebpackConfigurator, RawAssetWebpackPlugin, getServerUrl } from '@ui-autotools/utils';
import { getMetadataAndSchemasInDirectory, getComponentNamesFromMetadata } from './meta';
import { getClientData } from './client-data';

interface IProjectOptions {
  projectPath: string;
  webpackConfigPath: string;
  metadataGlob: string;
  sourcesGlob: string;
}

export interface IStartWebsiteOptions {
  projectOptions: IProjectOptions;
  host: string;
  port: number;
}

export interface IBuildWebsiteOptions {
  projectOptions: IProjectOptions;
  outputPath: string;
}

interface IGetWebpackConfigOptions {
  outputPath?: string;
  production?: boolean;
  projectOptions: IProjectOptions;
}

function getWebsiteWebpackConfig({
  outputPath,
  production,
  projectOptions,
}: IGetWebpackConfigOptions): webpack.Configuration {
  const metadataAndSchemas = getMetadataAndSchemasInDirectory(
    projectOptions.projectPath,
    projectOptions.metadataGlob,
    projectOptions.sourcesGlob
  );

  const componentNames = getComponentNamesFromMetadata(metadataAndSchemas.metadata);

  const clientData = getClientData(projectOptions.projectPath, metadataAndSchemas);

  const componentPages = componentNames.map(
    (name) =>
      new HtmlWebpackPlugin({
        title: name,
        filename: `components/${name}/index.html`,
      })
  );

  return {
    mode: production ? 'production' : 'development',
    entry: [require.resolve('../client/website')],
    output: {
      filename: 'website.js',
      path: outputPath,
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: {
            loader: '@ts-tools/webpack-loader',
          },
        },
      ],
    },
    plugins: [
      new StylableWebpackPlugin(),
      new RawAssetWebpackPlugin({
        filename: 'components.json',
        data: JSON.stringify(clientData),
      }),
      new HtmlWebpackPlugin({
        title: 'Website',
        filename: 'index.html',
      }),
      ...componentPages,
    ],
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },
    stats: 'errors-warnings',
  };
}

function getMetadataWebpackConfig({
  outputPath,
  production,
  projectOptions,
}: IGetWebpackConfigOptions): webpack.Configuration {
  const metaFiles = glob.sync(projectOptions.metadataGlob, {
    cwd: projectOptions.projectPath,
    absolute: true,
  });

  const config = WebpackConfigurator.load(projectOptions.webpackConfigPath).getConfig();
  config.mode = production ? 'production' : 'development';
  config.stats = 'errors-warnings';
  config.context = projectOptions.projectPath;
  config.entry = [...metaFiles, require.resolve('../client/simulation')];
  config.output = {
    filename: 'metadata.js',
    path: outputPath,
  };
  if (!config.plugins) {
    config.plugins = [];
  }
  config.plugins.push(
    new HtmlWebpackPlugin({
      title: 'Simulation',
      filename: 'simulation.html',
    })
  );
  return config;
}

export function startWebsite({ projectOptions, host, port }: IStartWebsiteOptions): void {
  const app = express();

  const websiteCompiler = webpack(
    getWebsiteWebpackConfig({
      projectOptions,
      production: false,
      outputPath: '/dev/null',
    })
  );

  const metadataCompiler = webpack(
    getMetadataWebpackConfig({
      projectOptions,
      production: false,
      outputPath: '/dev/null',
    })
  );

  app.use(webpackDevMiddleware(websiteCompiler));
  app.use(webpackDevMiddleware(metadataCompiler));

  const server = app.listen({ host, port });

  server.on('listening', () => {
    const serverUrl = getServerUrl(server);
    process.stdout.write(`Running on ${chalk.blue(serverUrl)}\n`);
  });
}

export async function buildWebsite({ projectOptions, outputPath }: IBuildWebsiteOptions): Promise<void> {
  try {
    // Compile the metadata first, because if there are type or syntactic errors
    // in the project it's easier to let Webpack catch and report them instead
    // of implementing friendly error reporting in the schema extractor.

    const metadataCompiler = webpack(
      getMetadataWebpackConfig({
        projectOptions,
        production: true,
        outputPath,
      })
    );

    const metadataStats = await promisify(metadataCompiler.run.bind(metadataCompiler))();

    if (metadataStats.hasErrors()) {
      throw metadataStats.toString();
    }

    const websiteCompiler = webpack(
      getWebsiteWebpackConfig({
        projectOptions,
        production: true,
        outputPath,
      })
    );

    const websiteStats = await promisify(websiteCompiler.run.bind(websiteCompiler))();

    if (websiteStats.hasErrors()) {
      throw websiteStats.toString();
    }
  } catch (e: unknown) {
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    process.stderr.write(e + '\n');
    process.exit(1);
  }
}
