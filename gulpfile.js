var gulp = require( 'gulp' );
var merge = require('merge-stream');
var del = require( 'del' );
var run = require( 'gulp-run' );
var replace = require( 'gulp-string-replace' );

var fs = require( 'fs' );
var config = JSON.parse( fs.readFileSync( './package.json' ) );

var changelog = fs.readFileSync( './CHANGELOG.md' )
	.toString()
	.replace( new RegExp( '##', 'g'), '=' )
	.replace( new RegExp( '#', 'g'), '==' );

gulp.task( 'version', function () {
	var pluginStream = gulp.src( [ 'block-lab.php' ] )
		.pipe( replace( new RegExp( /Version:\s*(.*)/, 'g' ), "Version: " + config.version ) )
		.pipe(gulp.dest('./package/trunk/'))
		.pipe(gulp.dest('./'))

	var readmeStream = gulp.src( [ './trunk/readme.txt' ] )
		.pipe( replace( new RegExp( /Stable tag:\s*(.*)/, 'g' ), "Stable tag: " + config.version ) )
		.pipe( replace( new RegExp( /== Autogenerated Changelog\s*(.*)/, 'g' ), changelog ) )
		.pipe(gulp.dest('./package/trunk/'))

	return merge(pluginStream, readmeStream);
} )

gulp.task( 'run:build', function () {
	return run( 'npm run build' ).exec();
} )

gulp.task( 'bundle', function () {
	return gulp.src( [
		'**/*',
		'!node_modules/**/*',
		'!js/blocks/**/*',
		'!js/src/**/*',
		'!js/tests/**/*',
		'!js/coverage/**/*',
		'!package/**/*',
	] )
		.pipe( gulp.dest( 'package/prepare' ) );
} );

gulp.task( 'remove:bundle', function () {
	return del( [
		'package',
	] );
} );

gulp.task( 'wporg:prepare', function () {
	return run( 'mkdir -p package/assets package/trunk' ).exec();
} )

gulp.task( 'wporg:assets', function () {
	return run( 'mv package/prepare/assets/wporg/*.* package/assets' ).exec();
} )

gulp.task( 'wporg:readme', function () {
	return run( 'mv package/prepare/trunk/readme.txt package/trunk/readme.txt' ).exec();
} )

gulp.task( 'wporg:trunk', function () {
	return run( 'mv package/prepare/* package/trunk' ).exec();
} )

gulp.task( 'clean:bundle', function () {
	return del( [
		'package/trunk/assets/wporg',
		'package/trunk/coverage',
		'package/trunk/js/blocks',
		'package/trunk/js/src',
		'package/trunk/node_modules',
		'package/trunk/tests',
		'package/trunk/trunk',
		'package/trunk/gulpfile.js',
		'package/trunk/Makefile',
		'package/trunk/package*.json',
		'package/trunk/phpunit.xml.dist',
		'package/trunk/README.md',
		'package/trunk/CHANGELOG.md',
		'package/trunk/webpack.config.js',
		'package/prepare',
	] );
} );

gulp.task( 'default', gulp.series(
	'remove:bundle',
	'run:build',
	'bundle',
	'wporg:prepare',
	'wporg:assets',
	'wporg:readme',
	'wporg:trunk',
	'version',
	'clean:bundle'
) );