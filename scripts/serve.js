/*
  Copyright (c) 2018-present evan GmbH.
 
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
 
      http://www.apache.org/licenses/LICENSE-2.0
 
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

const gulp = require('gulp');
const serveStatic = require('serve-static');
const express = require('express');
const { lstatSync, readdirSync } = require('fs')
const path = require('path')

const isDirectory = source => lstatSync(source).isDirectory()
const getDirectories = source =>
  readdirSync(source).map(name => path.join(source, name)).filter(isDirectory)

// Run Express, auto rebuild and restart on src changes
gulp.task('serve', function () {
  const app = express();

  // serve all dapps
  getDirectories(path.resolve('../dapps'))
    .forEach(dapp => {
      const splittedPath = dapp.split('/');

      app.use(`/${ splittedPath[splittedPath.length - 1] }`, express.static(`${ dapp }/src`));
    });

  app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });
  
  app.listen(3000, function () {
    console.log('\nServer running on 3000...');
  });
});

gulp.task('default', [ 'serve' ]);
