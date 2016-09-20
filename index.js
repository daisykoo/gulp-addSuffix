var gutil = require('gulp-util');
var through = require('through2');
var PluginError = gutil.PluginError;
var fs = require('fs');
var _ = require('underscore');

var PLUGIN_NAME = 'gulp-addSuffix';


function refreshRecord(recordPath, data) {
	fs.open(recordPath, 'a+', function(err, fd){
		if(err) throw err;
		
		var oldDataObj = null;
		var oldData = fs.readFileSync(recordPath, 'utf-8');

		if (oldData.length === 0) {
			oldDataObj = {};
		} else {
			oldDataObj = JSON.parse(oldData);
		}
		var files = _.keys(data);
		files.forEach(function(key, n, arr) {
			oldDataObj[key] = data[key];
		});
		var buffer = new Buffer(JSON.stringify(oldDataObj));
		fs.write(fd, buffer, 0, buffer.length, 0, function(err, written, buffer){
			if (err) {throw err} 
		});
	});
};

//js 文件添加后缀并输出记录
var plugin = function(recordPath, insertString) {
	if (!recordPath) {
		this.emit('error', new PluginError(PLUGIN_NAME, ' missing path of record file'));
	} else if (!insertString) {
		this.emit('error', new PluginError(PLUGIN_NAME, ' missing insert content'));
	}

	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			this.push(file);
			return cb();
		}

		if (file.isStream()) {
			this.emit('error', new PluginError(PLUGIN_NAME, 'Streaming not supported'));
			return cb();
		}
		var oldName = file.relative;
		var arr = oldName.split('.');
		var newName = arr[0] + insertString + '.' + arr[1];
		file.path = file.base + newName;
		var record = {};
		record[oldName] = newName;
		refreshRecord(recordPath, record);
		
		this.push(file);
		cb();
	});
}
//修改html引用路径
plugin.html = function(recordPath) {
	return through.obj(function(file, enc, cb) {
		if (file.isNull()) {
			this.push(file);
			return cb();
		}
		if (file.isStream()) {
			this.emit('error', new PluginError(PLUGIN_NAME, 'Streaming not supported'));
			return cb();
		}
		var fileData = file.contents.toString('utf-8');
		var recordData = fs.readFileSync(recordPath,'utf-8');

		if (recordData.length === 0) {
			this.push(file);
			cb();
		} else {
			var recordObj = JSON.parse(recordData);
			var keys = _.keys(recordObj);
			keys.forEach(function(item, n, arr) {
				var reg = new RegExp(item, 'g');
				fileData = fileData.replace(reg, recordObj[item]);
			});
			file.contents = new Buffer(fileData);
			this.push(file);
			cb();
		}
	});
}

module.exports = plugin;