/**
 * @file webpack builder
 * @author clark-t (clarktanglei@163.com
 * )
 */

const webpack = require('webpack');
const middleware = require('koa-webpack');
const config = require('./config');
const chokidar = require('chokidar');
/* eslint-disable */
const {globPify} = require('../../utils/helper');
/* eslint-enable */
const projectPath = require('../../utils/project-path');
const path = require('path');
const cli = require('../../cli');

module.exports = class WebpackBuilder {
    constructor(options) {
        this.outputDir = options.output || path.resolve('dist');
        this.dir = options.dir;
        this.componentDir = projectPath.components(this.dir);
        this.asset = options.asset;

        if (options.dev) {
            this.mode = 'development';
            this.initDev();
            this.initWatcher();
        }
        else {
            this.mode = 'production';
        }
    }

    async dev(ctx, next) {
        if (this.isOnInited) {
            ctx.body = 'initing...';
        }
        else {
            await this.midd(ctx, next);
        }
    }

    async build() {
        await this.initConfig();
        return new Promise((resolve, reject) => {
            webpack(this.config, (err, result) => {
                if (err) {
                    reject(err);
                    // cli.error(err);
                }
                else if (result.hasErrors()) {
                    reject(result.compilation.errors);
                    // resolve(result);
                }
                else {
                    resolve(result);
                }
            });
        });
    }

    async getEntries() {
        let globOpts = {
            cwd: this.componentDir,
            root: this.componentDir
        };

        let complexComponents = await globPify('mip-*/mip-*.vue', globOpts)
            .then(arr => arr.filter(name => /(mip-[\w-]+)\/\1\.vue$/.test(name)));

        return complexComponents.reduce((entries, pathname) => {
            let basename = path.basename(pathname, '.vue');
            entries[basename] = path.resolve(this.componentDir, pathname);
            return entries;
        }, {});

        // let [singleComponents, complexComponents] = await Promise.all([
        //     globPify('mip-*.vue', globOpts),
        //     globPify('mip-*/mip-*.vue', globOpts)
        //         .then(arr => arr.filter(name => /(mip-\w+)\/\1\.vue$/.test(name)))
        // ]);

        // return [...singleComponents, ...complexComponents].reduce((entries, pathname) => {
        //     let basename = path.basename(pathname, '.vue');
        //     entries[basename] = path.resolve(this.componentDir, pathname);
        //     return entries;
        // }, {});
    }

    async initConfig() {
        let entries = await this.getEntries();
        this.config = config({
            entry: entries,
            outputPath: this.outputDir,
            mode: this.mode,
            context: this.dir,
            asset: this.asset
        });
    }

    async initDev() {
        if (this.isOnInited) {
            return;
        }

        this.isOnInited = true;

        if (this.midd) {
            this.midd.close();
        }

        await this.initConfig();
        let compiler = webpack(this.config);

        this.midd = middleware({
            compiler,
            dev: {
                publicPath: '/'
            },
            hot: false
        });
        this.isOnInited = false;
    }

    async initWatcher() {
        this.watcher = chokidar.watch(this.componentDir);
        let cb = async pathname => {
            if (this.isOnInited) {
                return;
            }

            let basename = path.basename(pathname);
            // 非入口文件的增减则不做任何处理
            if (!/^mip-[\w-]+\.vue$/.test(basename)) {
                return;
            }

            // pathname = path.resolve(pathname);

            if (projectPath.componentPath(this.dir, basename.slice(0, -4)) !== path.resolve(pathname)) {
                return;
            }

            // let possibleComponents = projectPath.possibleComponents(this.componentDir, basename.slice(-4));
            // if (possibleComponents.indexOf(pathname) < 0) {
            //     return;
            // }

            try {
                await this.initDev();
            }
            catch (e) {
                cli.error('init error');
                cli.error(e);
            }
        };

        this.watcher.on('ready', () => {
            this.watcher.on('add', cb).on('unlink', cb);
        });
    }
};
