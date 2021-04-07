# CDTextEditor v0.1
***
## Description
**CDTextEditor** is a simple [Markdown](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet) text editor for websites with some features such as highlighting, multi-language spell checking, predictive text and more.
***
## Documentation
* [Installation](#installation)
* [Usage](#usage)
* [UI](#ui)
* [Examples (demos)](#examples)
* [Related projects](#relatedprojects)
* [Notes](#notes)
* [License](#license)
***
## Installation
The project uses [grunt](https://gruntjs.com) for building.

1. Clone git repository:
`$ git clone https://github.com/CrazyPhD/CDTextEditor.git`
2. Install all dependencies using `npm`:
`$ npm install`
3. Build a project:
	* Full build process: `$ grunt`
    * Skip lint: `$ grunt build`
4. Place following strings before the closing `</head>` tag:
`<script src="dist/cdtexteditor.min.js"></script>`
`<link rel="stylesheet" href="dist/cdtexteditor.min.css">`
***
## Usage
### Create single editor
The simplest way to create ***single*** editor on the web-page:

1. Create a `<div>` element with specific id.
2. Place following code before the closing `</body>` tag:
`<script>let editor = new CDTextEditor(div_id).setup({"autoPreview": true}); // div_id - id of the selected div. .setup() method is not required.</script>`
**Note:** *If you need multiple editors on the same page it is strongly recommended to use [CDTextEditor.create()](#cdtexteditorcreate) method!* 

### Editor customization
Use `editor.setup({...})` method to set options for the selected editor. See [examples](#examples).
#### readOnly
Type: `Boolean`
Default: `false`
Make the selected editor read-only.

#### fill
Type: `String`
Fill the selected editor with some text.

#### autoPreview
Type: `Boolean`
Default: `false`
Make the viewer show current contents of the editor.

#### maxSize
Type: `Object {w: Number, h: Number}`
Set size limit for the selected editor.

#### predictive
Type: `String`
This string is a link to the dictionary of phrases for [predictive text](#predictivetext).

#### spellchecking
Type: `Object {url: String, loc: String[]}`

The `url` string is a link to the directory (it can be presented as link to external resource, ex.: `https://example.com/dict/`), containing Hunspell-style dictionaries (`.dic`, `.aff` files) for all necessary languages, which are listed in `loc`.

*Example: option `spellchecking: {url: './dict/', loc: ['en_US', 'en_UK']}` will search files `en_US.dic`, `en_US.aff`, `en_UK.dic` and `en_UK.aff` within directory `./dict/`*



**Note:** the options below require [jQuery](https://jquery.com) and [jQuery UI](https://jqueryui.com) libraries ([about](#jqueryjqueryui))

#### resizable
Type: `Boolean`
Default: `false`
Make editor resizable. To set editor size limit, see: [maxSize](#maxsize)

#### draggable
Type: `Boolean`
Default: `false`
Make editor draggable.

#### flex
Type: `Boolean`
Default: `false`
Make the line between editor and viewer draggable (make viewer resizable).

### Create multiple editors on the same page
#### CDTextEditor.create([...])
This method allows you to create multiple editors on the same page, avoiding unnecessary downloads of dictionaries, jQuery/jQueryUI libraries, etc. (ex.: you need to create three editors with usage of `en_US` dictionary, in that case, usage of [editor.setup({...})](#createsingleeditor) may cause unnecessary loading of dictionary twice)

It creates editors asynchronically one by one. To get access to `CDTextEditor` objects you should use global variable `CDTE_EDITORS[id]` where `id` is an unique id of the editor.
**Note:** this method can also be used to create a single editor.
***
## UI
Description of elements of UI.
The whole CDTextEditor is presented as container with following elements: Header, Editor, Viewer, Footer.
Minimum size of CDTextEditor container is `[w: 610px, h: 200px]`.
### Header
Header contains following buttons:
* `Load` - on click opens file selector dialog to choose what file should be loaded into the editor.
* `Save raw` - on click saves current raw editor contents into a `.md` file.
* `Save as HTML` - on click saves current editor contents as HTML file.
* `+/- Preview` - on click shows/hides viewer.
* `Spellcheck` - on click opens menu to choose language for spell checking (from [loaded dictionaries](#spellchecking))
In the right side of Header there is an `Autopreview` checkbox, which allows user to switch autopreview mode. 
### Editor
Simply Editor is an advanced textarea, which takes whole space of the wrapping container by default.
If Viewer is visible, Editor width depends on Viewer width.
### Viewer
Viewer is an area which demonstrates formatted contents of Editor. It's hidden by default. 
To show viewer either push menu button `+ Preview`, or check `Autopreview` checkbox.
**Note:** when `autopreview` option is enabled, Viewer will be appearing whenever user type text in Editor.
**Note:** by default Viewer width is half of wrapping container width. Set [flex](#flex) option to true to change change its width.
If you want to hide Viewer make sure you disabled `autopreview` mode, then either push button `- Preview` or, if `flex` option is true, collapse it by dragging the line between Editor and Viewer.
### Footer
Footer presented as status bar, which shows status of dictionaries loading.
***
## Examples
* Page with single editor, using `<body>` as wrapper container. [[Live DEMO #1]](https://crazydoctor.ru/cdtexteditor/single.html)
CSS: 
```CSS
html {
	height: 100%;
}

body {
	margin: 0;
	padding: 0;
	min-height: 100%;
}
```
HTML:
```HTML
<body id="workbench">
```
JS:
```JS
let editor = new CDTextEditor("workbench").setup({
	predictive: './dist/assets/dict/en_phrases.txt',
	spellchecking: {
		url: './dist/assets/dict/',
		loc: ['en_US']
    }
});
```

* Page with multiple editors. [[Live DEMO #2]](https://crazydoctor.ru/cdtexteditor/multiple.html)
HTML:
```HTML
<div id="workbench" style="width: 800px; height: 400px;"></div>
<div id="workbench1" style="width: 100px; height: 100px;"></div>
<div id="workbench2" style="width: 700px; height: 350px;"></div>
```
JS:
```JS
CDTextEditor.create([
    {
        id: "workbench",
        options: {
            predictive: "./dist/assets/dict/en_phrases.txt",
            flex: true,
            spellchecking: {
                url: "./dict/",
                loc: [
                    "en_US"
                ]
            }
        }
    },
   {
        id: "workbench1",
        options: {
            autoPreview: true,
            predictive: "./dist/assets/dict/en_phrases.txt",
            resizable: true,
            flex: true,
            maxSize: {
                w: 900, 
                h: 500
            },
            spellchecking: {
                url: "./dict/",
                loc: [
                    "en_US",
                    "de_DE"
                ]
            }
        }
    },
    {
        id: "workbench2",
        options: {
            draggable: true,
            spellchecking: {
                url: "./dict/",
                loc: [
                    "de_DE"
                ]
            }
        }
    }
]);
```
***
## Related projects
I would like to thank all the people involved in the following projects for their contributions both to the Open Source and to my project in particular:
* [CodeMirror](https://codemirror.net/) - a browser code editor library.
* [showdownjs/showdown](https://github.com/showdownjs/showdown/) - a Markdown to HTML converter.
* [cfinke/Typo.js](https://github.com/cfinke/Typo.js/) - a spellchecker that uses Hunspell-style dictionaries.
* [Project Gutenberg](https://www.gutenberg.org/) - an eBook library, where were found amazing book "Fifteen Thousand Useful Phrases" by Greenville Kleiser, where [almost 6000 phrases](https://github.com/CrazyPhD/CDTextEditor/blob/master/src/dict/en_phrases.txt) were taken from.
* [wooorm/dictionaries](https://github.com/wooorm/dictionaries) - a huge collection of Hunspell-style dictionaries.
* [jQuery](https://jquery.com/) - a JavaScript library designed to simplify HTML DOM tree traversal and manipulation, as well as event handling, CSS animation, and Ajax.
* [jQueryUI](https://jqueryui.com/) - a set of user interface interactions, effects, widgets, and themes built on top of jQuery. 
Thank you everybody!
***
## Notes
### jQuery/jQuery UI
jQuery and jQuery UI are <ins>not</ins> included in a project build due to their heaviness and relative prevalence.
Inclusion of them would lead to a significant weighting of built project and to redundancy on most modern Internet resources.
However, if you do not have them installed, CDTextEditor will do it for you with minimal investment of time and resources and only when necessary (if enabled any of following options: resizable, draggable, flex).

### License
[MIT](https://github.com/CrazyPhD/CDTextEditor/blob/master/license) (c) Oleg Karataev