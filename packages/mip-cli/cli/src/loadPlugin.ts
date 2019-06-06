/**
 * @file 加载 Plugin
 * @author tracy(qiushidev@gmail.com)
 */

import program from 'commander'

export function load (command: string, subcommand?: string) {

  // 1 检查plugin 是否安装
  // 2 npm install 安装plugin
  // 3 根据命令 子命令 加载模块
  // 4 运行命令

  console.log('command:' + command)
  console.log('subcommand:' + subcommand)

  setupCommand()
}

function setupCommand () {

  program
    .command('dev <name>')
    .option('-p, --port <port>', '端口号')
    .description('描述这个命令的功能')
    // .on('--help', () => {
    //   console.log('')
    //   console.log('Examples:');
    //   console.log('  $ custom-help --help');
    //   console.log('  $ custom-help -h');
    // })
    .action((...args) => {
      console.log('========= plugin run ==========')
      console.log(args)
    })

  program.parse(process.argv)
}
