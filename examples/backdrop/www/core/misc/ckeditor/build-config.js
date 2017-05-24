/**
 * This is a Backdrop-optimized build of CKEditor.
 *
 * You may re-use it at any time at http://ckeditor.com/builder to build
 * CKEditor again. Alternatively, use the "build.sh" script to build it locally.
 * If you do so, be sure to pass it the "-s" flag. So: "sh build.sh -s".
 *
 * NOTE:
 *    This file is not used by CKEditor, you may remove it.
 *    Changing this file will not change your CKEditor configuration.
 */

/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

/**
 * This file was added automatically by CKEditor builder.
 * You may re-use it at any time to build CKEditor again.
 *
 * If you would like to build CKEditor online again
 * (for example to upgrade), visit one the following links:
 *
 * (1) http://ckeditor.com/builder
 *     Visit online builder to build CKEditor from scratch.
 *
 * (2) http://ckeditor.com/builder/9601e8a4f446e48a2eec0a186955b32d
 *     Visit online builder to build CKEditor, starting with the same setup as before.
 *
 * (3) http://ckeditor.com/builder/download/9601e8a4f446e48a2eec0a186955b32d
 *     Straight download link to the latest version of CKEditor (Optimized) with the same setup as before.
 *
 * NOTE:
 *    This file is not used by CKEditor, you may remove it.
 *    Changing this file will not change your CKEditor configuration.
 */

var CKBUILDER_CONFIG = {
	skin: 'moono',
	preset: 'standard',
	ignore: [
		'.bender',
		'bender.js',
		'bender-err.log',
		'bender-out.log',
		'dev',
		'.DS_Store',
		'.editorconfig',
		'.gitattributes',
		'.gitignore',
		'gruntfile.js',
		'.idea',
		'.jscsrc',
		'.jshintignore',
		'.jshintrc',
		'less',
		'.mailmap',
		'node_modules',
		'package.json',
		'README.md',
		'tests'
	],
    // So that they are not shipped with Backdrop, after using this config file
    // for rebuilding, the following are removed manually, because adding them
    // to the ignore array does not cause them to be ignored:
    // 'README.md',
    // 'adapters',
    // 'config.js',
    // 'contents.css',
    // 'samples',
    // 'skins/moono/readme.md',
    // 'styles.js',
	plugins : {
		'a11yhelp' : 1,
		'about' : 1,
		'basicstyles' : 1,
		'blockquote' : 1,
		'clipboard' : 1,
		'contextmenu' : 1,
		'elementspath' : 1,
		'enterkey' : 1,
		'entities' : 1,
		'filebrowser' : 1,
		'floatingspace' : 1,
		'format' : 1,
		'horizontalrule' : 1,
		'htmlwriter' : 1,
		'image2' : 1,
		'indent' : 1,
		'indentlist' : 1,
		'justify' : 1,
		'list' : 1,
		'magicline' : 1,
		'maximize' : 1,
		'pastefromword' : 1,
		'pastetext' : 1,
		'removeformat' : 1,
		'resize' : 1,
		'sharedspace' : 1,
		'showblocks' : 1,
		'showborders' : 1,
		'sourcearea' : 1,
		'sourcedialog' : 1,
		'specialchar' : 1,
		'stylescombo' : 1,
		'tab' : 1,
		'table' : 1,
		'tableresize' : 1,
		'tabletools' : 1,
		'toolbar' : 1,
		'undo' : 1,
		'uploadwidget' : 1,
		'widget' : 1,
		'wysiwygarea' : 1
	},
	languages : {
		'af' : 1,
		'ar' : 1,
		'az' : 1,
		'bg' : 1,
		'bn' : 1,
		'bs' : 1,
		'ca' : 1,
		'cs' : 1,
		'cy' : 1,
		'da' : 1,
		'de' : 1,
		'de-ch' : 1,
		'el' : 1,
		'en' : 1,
		'en-au' : 1,
		'en-ca' : 1,
		'en-gb' : 1,
		'eo' : 1,
		'es' : 1,
		'et' : 1,
		'eu' : 1,
		'fa' : 1,
		'fi' : 1,
		'fo' : 1,
		'fr' : 1,
		'fr-ca' : 1,
		'gl' : 1,
		'gu' : 1,
		'he' : 1,
		'hi' : 1,
		'hr' : 1,
		'hu' : 1,
		'id' : 1,
		'is' : 1,
		'it' : 1,
		'ja' : 1,
		'ka' : 1,
		'km' : 1,
		'ko' : 1,
		'ku' : 1,
		'lt' : 1,
		'lv' : 1,
		'mk' : 1,
		'mn' : 1,
		'ms' : 1,
		'nb' : 1,
		'nl' : 1,
		'no' : 1,
		'oc' : 1,
		'pl' : 1,
		'pt' : 1,
		'pt-br' : 1,
		'ro' : 1,
		'ru' : 1,
		'si' : 1,
		'sk' : 1,
		'sl' : 1,
		'sq' : 1,
		'sr' : 1,
		'sr-latn' : 1,
		'sv' : 1,
		'th' : 1,
		'tr' : 1,
		'tt' : 1,
		'ug' : 1,
		'uk' : 1,
		'vi' : 1,
		'zh' : 1,
		'zh-cn' : 1
	}
};