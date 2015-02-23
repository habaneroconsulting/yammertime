/*! Gruntfile.js | Yammertime */

'use strict';

var mountFolder = function (connect, dir) {
	return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {
	// load all grunt tasks
	require('load-grunt-config')(grunt);

	// configurable paths
	var config = {
		src: 'src',
		dist: 'dist',
		prod: 'prod'
	};

	grunt.initConfig({
		config: config,
		pkg: grunt.file.readJSON('package.json'),
		connect: {
			options: {
				port: 9000,
				hostname: 'localhost'
			},
			dist: {
				options: {
					middleware: function (connect) {
						return [
							mountFolder(connect, config.dist)
						];
					},
					open: true
				}
			},
			prod: {
				options: {
					middleware: function (connect) {
						return [
							mountFolder(connect, config.prod)
						];
					},
					open: true,
					keepalive: true
				}
			}
		},
		watch: {
			options: {
				livereload: true
			},
			less: {
				files: ['<%= config.src %>/styles/{,*/}*.{css,less}'],
				tasks: ['newer:less:dist']
			},
			html: {
				files: ['<%= config.src %>/*.html'],
				tasks: ['newer:copy:html']
			},
			js: {
				files: ['<%= config.src %>/scripts/{,*/}*.js'],
				tasks: ['newer:copy:js']
			},
			hbs: {
				files: ['<%= config.src %>/templates/{,*/}*.hbs'],
				tasks: ['newer:handlebars:dist']
			},
			livereload: {
				files: [
					'<%= config.dist %>/**/*.html',
					'{.tmp,<%= config.dist %>}/styles/{,*/}*.css',
					'{.tmp,<%= config.dist %>}/scripts/{,*/}*.js',
					'{.tmp,<%= config.dist %>}/templates/{,*/}*.hbs',
					'<%= config.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
				]
			}
		},
		clean: {
			dist: {
				files: [{
					dot: true,
					src: [
						'.tmp',
						'<%= config.dist %>/*',
						'!<%= config.dist %>/.git*'
					]
				}]
			},
			prod: {
				files: [{
					dot: true,
					src: [
						'.tmp',
						'<%= config.prod %>/*',
						'!<%= config.prod %>/.git*'
					]
				}]
			},
			server: '.tmp'
		},
		handlebars: {
			options: {
				namespace: 'Yt.Templates',
				processName: function(filePath) {
					var pieces = filePath.split('/');
					return pieces[pieces.length - 1].replace('.hbs', '');
				}
			},
			dist: {
				files: {
					'<%= config.dist %>/scripts/templates.js': ['<%= config.src %>/templates/*.hbs']
				}
			},
			prod: {
				files: {
					'.tmp/handlebars/scripts/templates.js': ['<%= config.src %>/templates/*.hbs']
				}
			}
		},
		less: {
			dist: {
				files: [
					{
						expand: true,
						cwd: '<%= config.src %>/styles/',
						src: [
							'**/*.css',
							'**/*.less',
							'!**/_*.less',
							'!_**/*'
						],
						dest: '<%= config.dist %>/styles/',
						ext: '.css'
					}
				]
			},
			prod: {
				files: [
					{
						expand: true,
						cwd: '<%= config.src %>/styles/',
						src: [
							'**/*.css',
							'**/*.less',
							'!**/_*.less',
							'!_**/*'
						],
						dest: '.tmp/less/styles/',
						ext: '.css'
					}
				]
			}
		},
		useminPrepare: {
			html: '<%= config.src %>/*.html',
			options: {
				dest: '<%= config.prod %>'
			}
		},
		copy: {
			dist: {
				files: [{
					expand: true,
					dot: true,
					cwd: '<%= config.src %>',
					dest: '<%= config.dist %>',
					src: [
						'**/*.html',
						'*.{ico,png,txt}',
						'images/{,*/}*',
						'styles/fonts/{,*/}*.*',
						'scripts/data/{,*/}*.*',
						'scripts/**/*.*'
					]
				}]
			},
			prod: {
				files: [{
					expand: true,
					dot: true,
					cwd: '<%= config.src %>',
					dest: '<%= config.prod %>',
					src: [
						'**/*.html',
						'*.{ico,png,txt}',
						'images/{,*/}*'
					]
				},
				{
					expand: true,
					dot: true,
					cwd: '.tmp/concat',
					dest: '<%= config.prod %>',
					src: [
						'scripts/**/*.js'
					]
				}]
			},
			js: {
				files: [{
					expand: true,
					dot: true,
					cwd: '<%= config.src %>',
					dest: '<%= config.dist %>',
					src: [
						'scripts/{,*/}*.*'
					]
				}]
			},
			html: {
				files: [{
					expand: true,
					dot: true,
					cwd: '<%= config.src %>',
					dest: '<%= config.dist %>',
					src: [
						'**/*.html'
					]
				}]
			}
		},
		concat: {
			options: {
				banner: '/*! <%= pkg.name %> - v<%= pkg.version %> | Licensed under MIT */\r\n\r\n'
			}
		},
		uglify: {
			options: {
				preserveComments: 'some'
			},
			prod: {
				files: [{
					expand: true,
					dot: true,
					cwd: '<%= config.src %>',
					dest: '.tmp/uglify',
					src: [
						'**/*.js'
					]
				},
				{
					expand: true,
					dot: true,
					cwd: '.tmp/handlebars',
					dest: '.tmp/uglify',
					src: [
						'**/*.js'
					]
				}]
			}
		},
		shell: {
			bower: {
				options: {
					stdout: true
				},
				command: 'bower-installer'
			}
		},
		usemin: {
			html: ['<%= config.prod %>/{,*/}*.html'],
			css: ['<%= config.prod %>/styles/{,*/}*.css'],
			options: {
				dirs: ['<%= config.prod %>'],
				flow: {
					steps: {
						js: ['concat'],
						css: ['concat', 'cssmin']
					},
					post: []
				}
			}
		}
	});

	grunt.registerTask('bower', [
		'shell:bower'
	]);

	grunt.registerTask('build', [
		'clean:dist',
		'less:dist',
		'handlebars:dist',
		'copy:dist'
	]);

	grunt.registerTask('serve', [
		'build',
		'connect:dist',
		'watch'
	]);

	grunt.registerTask('prodserve', [
		'prod',
		'connect:prod'
	]);

	grunt.registerTask('prod', [
		'clean:prod',
		'less:prod',
		'handlebars:prod',
		'uglify:prod',
		'useminPrepare',
		'concat',
		'cssmin',
		'copy:prod',
		'usemin'
	]);

	grunt.registerTask('default', [
		'build'
	]);
};