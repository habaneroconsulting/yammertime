/*! Gruntfile.js | Yammertime */

'use strict';

var mountFolder = function (connect, dir) {
	return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {
	require('load-grunt-config')(grunt);

	// configurable paths
	var config = {
		src: 'src',
		dist: 'dist',
		prod: 'prod',
		repo: 'https://github.com/habaneroconsulting/yammertime.git'
	};

	grunt.initConfig({
		config: config,
		pkg: grunt.file.readJSON('package.json'),
		connect: {
			options: {
				open: true
			},
			dist: {
				options: {
					base: '<%= config.dist %>',
					hostname: 'localhost',
					livereload: true,
					port: 9000
				}
			},
			production: {
				options: {
					base: '<%= config.prod %>',
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
				tasks: ['newer:copy:js', 'jshint']
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
		sass: {
			dist: {
				files: [
					{
						expand: true,
						cwd: '<%= config.src %>/styles/',
						src: [
							'**/*.css',
							'**/*.scss',
							'!**/_*.scss',
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
							'**/*.scss',
							'!**/_*.scss',
							'!_**/*'
						],
						dest: '.tmp/scss/styles/',
						ext: '.css'
					}
				]
			}
		},
		postcss: {
			options: {
				processors: [
					require('pixrem')(),
					require('autoprefixer')({ browsers: '> 1%' })
				]
			},
			dist: {
				options: {
					map: true
				},
				files: [
					{
						expand: true,
						cwd: '<%= config.build %>/styles/',
						src: [
							'**/*.css',
							'!vendor/**/*.css'
						],
						dest: '<%= config.build %>/styles/',
						ext: '.css'
					}
				]
			},
			prod: {
				files: [
					{
						expand: true,
						cwd: '.tmp/scss/styles/',
						src: [
							'**/*.css',
							'!vendor/**/*.css'
						],
						dest: '.tmp/scss/styles/',
						ext: '.css'
					}
				]
			}
		},
		sasslint: {
			options: {
				configFile: './node_modules/habanero-code-style/scss/sasslint.yml',
			},
			target: ['<%= config.src %>/styles/\*.scss']
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
				preserveComments: function (node, comment) {
					return comment.value.charAt(0) === '!';
				}
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
		jshint: {
			files: ['<%= config.src %>/scripts/*.js'],
			options: {
				globals: {
					jQuery: true
				}
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
		},
		'gh-pages': {
			options: {
				base: '<%= config.prod %>',
				branch: 'gh-pages',
				clone: '.tmp/deploy/repo',
				repo: '<%= config.repo %>'
			},
			src: [
				'**/*',
				'!.tmp/**/*',
				'!bower_components/**/*',
				'!dist/**/*',
				'!node_modules/**/*',
				'!src/**/*'
			]
		}
	});

	grunt.registerTask('bower', [
		'shell:bower'
	]);

	grunt.registerTask('build', [
		'clean:dist',
		'sass:dist',
		'postcss:dist',
		'jshint',
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
		'sass:prod',
		'postcss:prod',
		'handlebars:prod',
		'uglify:prod',
		'useminPrepare',
		'concat',
		'cssmin',
		'copy:prod',
		'usemin'
	]);

	grunt.registerTask('deploy', [
		'prod',
		'gh-pages'
	]);

	grunt.registerTask('default', [
		'build'
	]);
};