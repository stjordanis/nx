import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { Tree } from '@angular-devkit/schematics';

import * as path from 'path';

import { updateKarmaConf } from './update-karma-conf';
import { createEmptyWorkspace } from '../testing-utils';
import { updateJsonInTree } from '../ast-utils';

describe('updateKarmaConf', () => {
  let tree: Tree;
  let schematicRunner: SchematicTestRunner;
  beforeEach(done => {
    schematicRunner = new SchematicTestRunner(
      '@nrwl/schematics',
      path.join(__dirname, '../../collection.json')
    );
    tree = createEmptyWorkspace(Tree.empty());
    tree.create('apps/projectName/karma.conf.js', '');
    const process$ = schematicRunner.callRule(
      updateJsonInTree('/angular.json', angularJson => {
        angularJson.projects.projectName = {
          root: 'apps/projectName',
          architect: {
            test: {
              options: {
                karmaConfig: 'apps/projectName/karma.conf.js'
              }
            }
          }
        };
        return angularJson;
      }),
      tree
    );

    process$.subscribe(
      _ => done(),
      error => {
        console.log(error);
      }
    );
  });

  it('should overwrite the karma.conf.js', done => {
    const replaceKarmaConf = updateKarmaConf({ projectName: 'projectName' });
    schematicRunner.callRule(replaceKarmaConf, tree).subscribe(result => {
      const contents = result.read('apps/projectName/karma.conf.js');
      expect(contents.toString()).toEqual(UPDATED_KARMA_CONF);
      done();
    });
  });
});

const UPDATED_KARMA_CONF = `// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

const { join } = require('path');
const getBaseKarmaConfig = require('../../karma.conf');

module.exports = function(config) {
  const baseConfig = getBaseKarmaConfig();
  config.set({
    ...baseConfig,
    coverageIstanbulReporter: {
      ...baseConfig.coverageIstanbulReporter,
      dir: join(__dirname, '../../coverage/apps/projectName')
    }
  });
};
`;