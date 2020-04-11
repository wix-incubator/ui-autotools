import '@ts-tools/node/r';
import path from 'path';
import { promisify } from 'util';
import glob from 'glob';
import chalk from 'chalk';
import webpack from 'webpack';
import Koa from 'koa';
import koaWebpack from 'koa-webpack';
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
  outputPath: string;
  production: boolean;
  projectOptions: IProjectOptions;
}

const ownPath = path.resolve(__dirname, '../..');

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
    context: ownPath,
    entry: [path.resolve(ownPath, 'src/client/website.tsx')],
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
  config.context = projectOptions.projectPath;
  config.entry = [...metaFiles, path.join(ownPath, 'esm/client/simulation.js')];
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

export async function startWebsite({ projectOptions, host, port }: IStartWebsiteOptions) {
  const koa = new Koa();

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

  const devMiddleware: koaWebpack.Options['devMiddleware'] = {
    publicPath: '/',
    logLevel: 'warn',
  };

  const hotClient: koaWebpack.Options['hotClient'] = {
    logLevel: 'warn',
  };

  koa.use(
    await koaWebpack({
      compiler: websiteCompiler,
      devMiddleware,
      hotClient,
    })
  );

  koa.use(
    await koaWebpack({
      compiler: metadataCompiler,
      devMiddleware,
      hotClient,
    })
  );

  const server = koa.listen({ host, port });

  server.on('listening', () => {
    const serverUrl = getServerUrl(server);
    process.stdout.write(`Running on ${chalk.blue(serverUrl)}\n`);
  });
}

export async function buildWebsite({ projectOptions, outputPath }: IBuildWebsiteOptions) {
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
  } catch (e) {
    process.stderr.write(e + '\n');
    process.exit(1);
  }
}
