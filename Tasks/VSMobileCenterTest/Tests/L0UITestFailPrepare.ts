
import ma = require('vsts-task-lib/mock-answer');
import tmrm = require('vsts-task-lib/mock-run');
import path = require('path');
var Readable = require('stream').Readable
var Stats = require('fs').Stats

var nock = require('nock');

let taskPath = path.join(__dirname, '..', 'vsmobilecentertest.js');
let tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

tmr.setInput('credsType', 'inputs');
tmr.setInput('username', 'MyUsername');
tmr.setInput('password', 'MyPassword');
tmr.setInput('appSlug', 'testuser/testapp');
tmr.setInput('app', '/test/path/to/my.ipa');
tmr.setInput('devices', '1234abcd');
tmr.setInput('series', 'master');
tmr.setInput('dsymDir', '/path/to/dsym');
tmr.setInput('locale', 'user');
tmr.setInput('userDefinedLocale', 'nc_US');
tmr.setInput('artifactsDir', '/path/to/artifactsDir');
tmr.setInput('framework', 'uitest');
tmr.setInput('uitestBuildDir', '/path/to/uitest_build_dir');
tmr.setInput('prepareOpts', '--myopts');
tmr.setInput('cliLocationOverride', '/path/to/mobile-center');

// provide answers for task mock
let a: ma.TaskLibAnswers = <ma.TaskLibAnswers>{
    "checkPath" : {
        "/test/path/to/my.ipa": true,
        "/path/to/mobile-center": true
    },
    "exec" : {
        "/path/to/mobile-center login -u MyUsername -p MyPassword --quiet" : {
            "code": 0,
            "stdout": "success",
            "stderr": ""
        },
        "/path/to/mobile-center logout --quiet" : {
            "code": 0,
            "stdout": "success",
            "stderr": ""
        },
        "/path/to/mobile-center test prepare uitest --artifacts-dir /path/to/artifactsDir --app-path /test/path/to/my.ipa --build-dir /path/to/uitest_build_dir --myopts --quiet": {
            "code": 128,
            "stdout": "failed",
            "stderr": ""
        }
    },
    "exist": {
        "/path/to/mobile-center": true
    }
};
tmr.setAnswers(a);

tmr.registerMock('./utils.js', {
    resolveSinglePath: function(s) {
        return s ? s : null;
    },
    checkAndFixFilePath: function(p, name) {
        return p;
    }
});

path.join = function(p, s) {
    return `${p}/${s}`;
}
tmr.registerMock('path', path);

tmr.run();

