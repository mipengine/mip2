const fs = require('fs')
const path = require('path')

const head = `
   <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
   <meta name="apple-mobile-web-app-capable" content="yes">
   <meta name="apple-mobile-web-app-status-bar-style" content="black">
   <meta name="format-detection" content="telephone=no">
   <meta name="screen-orientation" content="portrait">
   <meta name="x5-orientation" content="portrait">
   <style>
     *,
     *:before,
     *:after {
       box-sizing: border-box;
     }
     body{
       margin: 0;
       padding: 0;
       font-size: 120%;
       font-family: Consolas, Tahoma;
     }
     a{
       text-decoration: none;
       color: #333;
     }
     a:hover{
       background: #eaeaea;
     }
     ul{
       list-style-type: none;
       margin: 0;
       padding: 0;
     }
     .crumb{
       margin-bottom: 1em;
       padding: 1em;
       background: #333;
     }
     .crumb li{
       display: inline;
       margin-right: 5px;
       color: #ccc;
     }
     .crumb li a{
       color: #ccc;
     }
     .crumb li a:hover{
       text-decoration: underline;
       background: inherit;
     }
     .list li{
       min-height: .5em;
       display: inline-block;
       width: 33.33%;
     }
     .list.block li{
       width: 100%;
     }
     .list li a{
       display: block;
       padding: 0 1em;
       line-height: 2;
     }
     @media only screen and (max-width : 768px) {
       .list li{
         display: block;
         width: 100%;
       }
       .list li a{
         line-height: 3;
         border-bottom: 1px dotted #ccc;
       }
     }
   </style>
 `;

module.exports = function (config) {
  return [
    async (ctx, next) => {

      let pagePath = path.join(config.dir, ctx.url)

      let content = ''
      let stat = fs.statSync(pagePath)
      if(stat.isDirectory()) {
        content = dir(
          ctx.url.endsWith('/') ? ctx.url : ctx.url+'/', 
          pagePath.endsWith('/') ? pagePath : pagePath+'/'
        )
        ctx.body = content;
      } else {
        ctx.throw(404, 'no such folder in: ' + pagePath)
      }
    }
  ]
}

function dir (url, reqPath) {

  let {fileList, dirList} = walk(reqPath)

  let html = `
            ${head}
            {crumb}
            {list}
            `
  let fileListHtml = '<ul class="list">'
  let dirListHtml = '<ul class="list">'
  let crumbHtml = '<ul class="crumb">'
  for(let item of fileList) {
    fileListHtml += `<li><a href="${url}${item}">${item}</a></li>`
  }
  for(let item of dirList) {
    dirListHtml += `<li><a href="${url}${item}/">${item}/</a></li>`
  }
  fileListHtml += '</ul>'
  dirListHtml += '</ul>'
  crumbHtml += '<li><a href="/">/</a></li>'

  if (url !== '/') {
    let dirUrl = '/';
    const urlArr = url.substr(1, url.length-2).split('/');
    for (let u of urlArr) {
      dirUrl += u + '/';
      crumbHtml += '<li><a href="' + dirUrl + '">' + u + '/</a></li>'
    }
  }
  crumbHtml += '</ul>';

  html = html.replace('{crumb}', crumbHtml).replace('{list}', dirListHtml + fileListHtml);
  
  return html;
}

function walk (reqPath) {
  let files = fs.readdirSync(reqPath)

  let dirList = []
  let fileList = []
  for (let item of files) {
    let stats = fs.statSync(reqPath + '/' + item)
    if(stats.isDirectory()) {
      dirList.push(item)
    }
    if(stats.isFile()) {
      let extname = path.extname(item)
      if(extname === '.html' || extname === '.js' || extname === '.vue') {
        fileList.push(item)
      }
    }
  }
  return {
    fileList: fileList,
    dirList: dirList
  }
}