/*jshint esversion:8 */
let CDTE_DICTIONARIES = [];
let CDTE_PREDICTIVE_PHRASES = [];
let CDTE_EDITORS = [];

class CDTextEditor {
    /**
     * Create an CDTextEditor entity.
     * @param {String} workbenchId - id of container.
     */
    constructor(workbenchId) {
        "use strict";
        if (typeof CodeMirror === undefined) {
            throw new Error("CodeMirror not found. Install: https://codemirror.net/");
        }
        if (workbenchId === undefined) {
            return;
        }
        this.id = getEditorId();

        this.workbench = document.getElementById(workbenchId);
        this.workbench.setAttribute('class', 'CDTextEditor_workbench');
        this.workbenchWidth = this.workbench.offsetWidth - 2;
        this.workbenchHeight = this.workbench.offsetHeight - 48;
        this.viewer = document.createElement('div');
        this.viewer.setAttribute('class', 'CDTextViewer');

        let textarea = document.createElement('textarea');
        textarea.setAttribute('class', 'CDTextEditor');

        this.fileInput = document.createElement('input');
        this.fileInput.setAttribute('type', 'file');
        this.fileInput.setAttribute('class', 'CDTextEditor_inputfile');
        this.fileInput.setAttribute('id', 'CDTextEditor_inputfile_' + this.id);
        
        this.fileInput.addEventListener('change', () => getFileContents(this.fileInput.files, this.editor));
        
        // Header Construction start
        let header = document.createElement('div');
        header.setAttribute('class', 'CDTextEditor_header');
        header.setAttribute('id', 'CDTextEditor_header_' + this.id);

        let headerLogo = document.createElement('div');
        headerLogo.setAttribute('class', 'logo');
        headerLogo.setAttribute('title', 'CDTextEditor v0.1');

        let fileInputLabel = document.createElement('label');
        fileInputLabel.setAttribute('for', 'CDTextEditor_inputfile_' + this.id);
        fileInputLabel.setAttribute('class', 'CDTextEditor_button');
        fileInputLabel.innerHTML = 'Load';

        let fileSaveRaw = document.createElement('div');
        fileSaveRaw.setAttribute('class', "CDTextEditor_button");
        fileSaveRaw.innerHTML = "Save raw";
        fileSaveRaw.onclick = function() {
            this.save_raw();
        }.bind(this);

        let fileSaveHtml = document.createElement('div');
        fileSaveHtml.setAttribute('class', "CDTextEditor_button");
        fileSaveHtml.innerHTML = "Save as HTML";
        fileSaveHtml.onclick = function() {
            this.save_html();
        }.bind(this);

        this.buttonPreview = document.createElement('div');
        this.buttonPreview.setAttribute('class', 'CDTextEditor_button');
        this.buttonPreview.innerHTML = "+ Preview";
        this.buttonPreview.onclick = function() {
            if (this.viewer.style.display !== 'block') {
                this.preview();
                this.buttonPreview.innerHTML = "- Preview";
            } else {
                this.viewer.style.display = 'none';
                this.initSize();
                this.buttonPreview.innerHTML = "+ Preview";
            }
        }.bind(this);

        // spellcheck menu start
        let buttonSpellcheck = document.createElement('div');
        buttonSpellcheck.setAttribute('class', 'CDTextEditor_button');
        buttonSpellcheck.innerHTML = "&rtrif; Spellcheck";
        buttonSpellcheck.onclick = function() {
            if (this.spellcheckMenu.style.display !== 'block') {
                this.spellcheckMenu.style.display = 'block';
                buttonSpellcheck.innerHTML = "&dtrif; Spellcheck";
            } else {
                this.spellcheckMenu.style.display = 'none';
                buttonSpellcheck.innerHTML = "&rtrif; Spellcheck";
            }
            this.spellcheckMenu.style.top = buttonSpellcheck.offsetTop + 30 + "px";
            this.spellcheckMenu.style.left = buttonSpellcheck.offsetLeft + 1 + "px";
            this.spellcheckMenu.style.width = buttonSpellcheck.offsetWidth - 2 + 'px';
        }.bind(this);

        this.spellcheckMenu = document.createElement('div');
        this.spellcheckMenu.setAttribute('class', 'CDTextEditor_spellcheck_menu');
        // spellcheck menu end


        let autopreviewCheckboxBlock = document.createElement('div');
        autopreviewCheckboxBlock.setAttribute('class', 'CDTextEditor_autopreview_block');

        this.autopreviewCheckbox = document.createElement('input');
        this.autopreviewCheckbox.setAttribute('type', 'checkbox');
        this.autopreviewCheckbox.setAttribute('class', 'CDTextEditor_autopreview_checkbox');
        this.autopreviewCheckbox.setAttribute('id', 'CDTextEditor_autopreview_checkbox_' + this.id);
        
        let autopreviewCheckboxLabel = document.createElement('label');
        autopreviewCheckboxLabel.setAttribute('for', 'CDTextEditor_autopreview_checkbox_' + this.id);
        autopreviewCheckboxLabel.innerHTML = "Autopreview";

        autopreviewCheckboxBlock.appendChild(this.autopreviewCheckbox);
        autopreviewCheckboxBlock.appendChild(autopreviewCheckboxLabel);


        header.appendChild(headerLogo);
        header.appendChild(fileInputLabel);
        header.appendChild(fileSaveRaw);
        header.appendChild(fileSaveHtml);
        header.appendChild(this.buttonPreview);
        header.appendChild(buttonSpellcheck);
        header.appendChild(autopreviewCheckboxBlock);
        // Header Construction end
        
        // Footer Construction start
        let footer = document.createElement('div');
        footer.setAttribute('class', 'CDTextEditor_footer');

        this.spellcheckStatus = document.createElement('div');
        this.spellcheckStatus.setAttribute('class', "CDTextEditor_footer_spellcheck");
        this.spellcheckStatus.innerHTML = "Spell check not enabled.";
        footer.appendChild(this.spellcheckStatus);
        // Footer Construction end

        // Workbench Construction start
        let editorViewerWrapper = document.createElement('div');
        editorViewerWrapper.setAttribute('class', 'CDTextEditor_wrapper');
        editorViewerWrapper.appendChild(textarea);
        editorViewerWrapper.appendChild(this.viewer);

        this.workbench.appendChild(this.fileInput);
        this.workbench.appendChild(header);
        this.workbench.appendChild(editorViewerWrapper);
        this.workbench.appendChild(footer);
        this.workbench.appendChild(this.spellcheckMenu);
        // Workbench Construction end


        this.editor = CodeMirror.fromTextArea(textarea);
        
        // Editor defaults
        this.editor.setOption("lineNumbers", true);
        this.editor.setSize(this.workbenchWidth + "px", this.workbenchHeight + "px");
        this.editor.getWrapperElement().style.display = 'block';
        this.editor.getWrapperElement().style.float = 'left';
        this.autopreview = false;
        this.isflex = false;
        this.spellcheck = [];

        // Editor events
        this.editor.on("change", function() {
            if (this.autopreview) {
                this.preview();
            }
        }.bind(this));

        this.autopreviewCheckbox.onclick = function() {
            if (!this.autopreview) {
                this.preview();
            }
            this.autopreview = !this.autopreview;
        }.bind(this);

        CDTE_EDITORS[this.id] = this;
    }

    /**
     * Wrapper for asyncSetup method intended to return CDTextEditor entity.
     * @param {Object} options 
     * @returns {CDTextEditor}
     */
    setup(options) {
        this.asyncSetup(options);
        return this;
    }

    /**
     * Apply the selected options to the editor.
     * @param {Object} options
     */
    async asyncSetup(options) {
        "use strict";
        for (let option in options) {
            this.optionsSwitch(option, options[option]);
            await timeout(500);
        }
    }

    /**
     * According to selected option call corresponding method
     * and get its return.
     * @param {String} opt - selected option.
     * @param {String|Object} val - option settings.
     * @returns {CDTextEditor}
     */
    optionsSwitch(opt, val) {
        switch (opt) {
            case "maxSize":
                return this.maxSize(val.w, val.h);
            case "fill":
                return this.fill(val);
            case "draggable": 
                return (val === true ? this.draggable() : this);
            case "resizable":
                return (val === true ? this.resizable() : this);
            case "flex":
                return (val === true ? this.flex() : this);
            case "spellchecking":
                return this.spellCheck(val.url, val.loc);
            case "predictive":
                return this.predictive(val);
            case "readOnly":
                return (val === true ? this.readOnly() : this);
            case "autoPreview":
                return (val === true ? this.autoPreview() : this);
        }
        return this;
    }

    /**
     * Set max size of the workbench (if it resizable).
     * @param {int} width
     * @param {int} height 
     * @returns {CDTextEditor}
     */
    maxSize(width, height) {
        this.workbench.style.maxWidth = width + 'px';
        this.workbench.style.maxHeight = height + 'px';
        return this;
    }

    /**
     * Fill the editor with text.
     * @param {String} text 
     * @returns {CDTextEditor}
     */
    fill(text) {
        this.editor.setValue(text);
        return this;
    }

    /**
     * Show viewer next to the editor.
     */
    showViewer() {
        if (this.viewer.style.display !== 'block') {
            this.viewer.style.display = 'block';
            this.initSize();
            this.buttonPreview.innerHTML = "- Preview";
        }
    }

    /**
     * Hide viewer.
     */
    hideViewer() {
        if (this.viewer.style.display === 'block') {
            this.viewer.style.display = 'none';
            this.initSize();
            this.buttonPreview.innerHTML = "+ Preview";
        }
    }

    /**
     * Set sizes of workbench elements.
     */
    initSize() {
        let viewerWidth = 0;
        if (this.viewer.style.display === 'block') {
            viewerWidth = this.workbenchWidth / 2 - 1;
            this.viewer.style.height = (this.workbenchHeight) + "px";
        } 
        this.viewer.style.width = viewerWidth + "px";
        this.editor.setSize((this.workbenchWidth - viewerWidth - 1) + "px", (this.workbenchHeight) + "px");
    }

    /**
     * Workbench elements resizing, while dragging dividing line.
     */
    flexResize() {
        if (this.viewer.offsetWidth < this.workbenchWidth * 0.05) {
            this.hideViewer();
        }
        let viewerWidth = this.viewer.offsetWidth;
        this.viewer.style.left = "0";
        this.viewer.style.maxWidth = 0.75 * this.workbenchWidth + "px";
        this.editor.setSize((this.workbenchWidth - viewerWidth - 1) + "px", (this.workbenchHeight) + "px");
    }

    /**
     * Workbench elements resizing, while resizing workbench.
     */
    resize() {
        "use strict";
        this.workbenchWidth = this.workbench.offsetWidth - 2;
        this.workbenchHeight = this.workbench.offsetHeight - 48;
        if (this.isflex) {
            let viewerWidth = this.viewer.offsetWidth;
            this.viewer.style.height = this.workbenchHeight + "px";
            this.editor.setSize((this.workbenchWidth - viewerWidth) + "px", (this.workbenchHeight) + "px");
        } else {
           this.initSize();
        }
    }

    /**
     * Get contents of the editor.
     * @returns {String} contents as string.
     */
    val() {
        return this.editor.getValue();
    }

    /**
     * Get converted to HTML contents of the editor.
     * @returns {String} converted to HTML contents.
     */
    htmlval() {
        return markdown2html(this.val());
    }

    /**
     * Fill the viewer with current contents of the editor.
     */
    preview() {
        "use strict";
        this.showViewer();
        this.viewer.innerHTML = this.htmlval();
        if (this.isflex) {
            $(this.viewer).resizable({
                handles: 'w',
                resize: function() {
                    this.flexResize();
                }.bind(this)
            });
        }
    }

    /**
     * Make the workbench draggable.
     * Requirements: jQuery, jQuery UI
     * @returns {CDTextEditor}
     */
    draggable() {
        "use strict";
        jqueryRun(function() {
            $(this.workbench).draggable({
                start: function() {
                    $(this.workbench).css('z-index', 9999);
                }.bind(this),
                cursor: 'crosshair',
                handle: "#CDTextEditor_header_" + this.id
            });
        }.bind(this));
        return this;
    }

    /**
     * Make the workbench resizable.
     * Requirements: jQuery, jQuery UI
     * @returns {CDTextEditor}
     */
    resizable() {
        "use strict";
        jqueryRun(function() {
            $(this.workbench).resizable({
                resize: function() {
                    this.resize();
                }.bind(this)
            });
        }.bind(this));
        return this;
    }

    /**
     * Make border between the editor and the viewer draggable.
     * Requirements: jQuery, jQuery UI 
     * @returns {CDTextEditor}
     */
    flex() {
        "use strict";
        jqueryRun(function() {
            this.isflex = true;
        }.bind(this));
        return this;
    }

    /**
     * Make the edtior show formatted text in the viewer automatically.
     * @returns {CDTextEditor}
     */
    autoPreview() {
        this.autopreview = true;
        this.autopreviewCheckbox.setAttribute('checked', 'checked');
        this.buttonPreview.innerHTML = "- Preview";
        this.preview();
        return this;
    }

    /**
     * Set language(s) for spell checking.
     * @param {String} dictPath
     * @param {Object} locales 
     * @returns {CDTextEditor}
     */
    spellCheck(dictPath, locales) {
        "use strict";
        this.spellcheckStatus.innerHTML = "<span style='color: #de9e00;'>Loading dictionaries for [" + locales + "]...</span>";
        let typos = [];
        let failed = [];
        let promises = [];
        locales.forEach(
            function(locale) {
                if (locale in CDTE_DICTIONARIES) {
                    typos.push(CDTE_DICTIONARIES[locale]);
                    this.spellcheck.push({loc : locale, enabled : true});
                    return;
                }
                promises.push(loadTypo(dictPath, locale).then(function(typo) {
                    typos.push(typo);
                    CDTE_DICTIONARIES[locale] = typo;
                    this.spellcheck.push({loc : locale, enabled : true});
                }.bind(this)).catch(() => failed.push(locale)));
            }.bind(this)
        );
        if (promises.length === 0) {
            this.spellCheckOverlay(typos);
            if (failed.length > 0 && typos.length == 0) {
                this.spellcheckStatus.innerHTML = "<span style='color: #990000;'>Failed to load dictionaries for [" + failed + "].</span>";
            } else if (failed.length > 0 && typos.length > 0) {
                this.spellcheckStatus.innerHTML = "<span style='color: #de9e00;'>Failed to load dictionaries for [" + failed + "].</span>";
            } else {
                this.spellcheckStatus.innerHTML = "<span style='color: #009900;'>Dictionaries for [" + locales + "] loaded!</span>";
            }
            this.updateSpellCheckMenu();
            return this;
        }
        Promise.all(promises).then(function() {
            this.spellCheckOverlay(typos);
            if (failed.length > 0 && typos.length == 0) {
                this.spellcheckStatus.innerHTML = "<span style='color: #990000;'>Failed to load dictionaries for [" + failed + "].</span>";
            } else if (failed.length > 0 && typos.length > 0) {
                this.spellcheckStatus.innerHTML = "<span style='color: #de9e00;'>Failed to load dictionaries for [" + failed + "].</span>";
            } else {
                this.spellcheckStatus.innerHTML = "<span style='color: #009900;'>Dictionaries for [" + locales + "] loaded!</span>";
            }
            this.updateSpellCheckMenu();
        }.bind(this));
        return this;
    }

    /**
     * Create spell checking menu options list, when dictionaries loaded.
     */
    updateSpellCheckMenu() {
        "use strict";
        for (let opt of this.spellcheck) {
            const locale = opt.loc;
            let enabled = opt.enabled;
            let menuOption = document.createElement('div');
            menuOption.setAttribute('class', 'CDTextEditor_spellcheck_menu_option');

            let menuOptionCheckbox = document.createElement('input');
            menuOptionCheckbox.setAttribute('id', 'CDTextEditor_' + this.id + '_spellcheck_menu_option_' + locale);
            menuOptionCheckbox.setAttribute('type', 'checkbox');
            if (enabled) menuOptionCheckbox.setAttribute('checked', 'checked');
            menuOptionCheckbox.onclick = function() {
                this.switchSpellCheckOption(locale);
            }.bind(this);
            
            let menuOptionLabel = document.createElement('label');
            menuOptionLabel.setAttribute('for', 'CDTextEditor_' + this.id + '_spellcheck_menu_option_' + locale);
            menuOptionLabel.innerHTML = locale;

            menuOption.appendChild(menuOptionCheckbox);
            menuOption.appendChild(menuOptionLabel);
            this.spellcheckMenu.appendChild(menuOption);
        }
    }

    /**
     * Switch status of spell checking for chosen language.
     * @param {String} locale 
     */
    switchSpellCheckOption(locale) {
        for (let i = 0; i < this.spellcheck.length; i++) {
            if (this.spellcheck[i].loc === locale) {
                this.spellcheck[i].enabled = !this.spellcheck[i].enabled;
            }
        }
    }

    /**
     * Get status of spell checking for specific language.
     * @param {String} locale 
     * @returns {Boolean}
     */
    getSpellCheckOption(locale) {
        "use strict";
        for (let opt of this.spellcheck) {
            if (opt.loc === locale) {
                return opt.enabled;
            }
        }
        return false;
    }

    /**
     * Add spellcheck overlay to the editor.
     * @param {Typo[]} typos
     */
    spellCheckOverlay(typos) {
        "use strict";
        if (typos.length === 0) return;
        
        var rx_word = '!\'\"#$%&()*+,-./:;<=>?@[\\]^_`{|}~ ';
    
        this.editor.spellcheckOverlay = {
            token: function(stream) {
                var ch = stream.peek();
                var word = "";
    
                if (rx_word.includes(ch) || ch === '\uE000' || ch === '\uE001') {
                    stream.next();
                    return null;
                }
    
                while ((ch = stream.peek()) && !rx_word.includes(ch)) {
                    word += ch;
                    stream.next();
                }
    
                if (!/[a-z]/i.test(word)) return null;
                let isTypo = true;
                let activeTypos = false;
                for (let typo of typos) {
                    if (this.getSpellCheckOption(typo.dictionary)) {
                        activeTypos = true;
                        if (typo.check(word)) {
                            isTypo = false;
                        }
                    }
                }
                if (activeTypos && isTypo) return "spell-error";
            }.bind(this)
        };
        this.editor.addOverlay(this.editor.spellcheckOverlay);
    }

    /**
     * Make the editor show phrases endings while typing
     * according to phrases dictionary
     * which can be reached by presented link.
     * @param {String} dictLink 
     * @returns {CDTextEditor}
     */
    predictive(dictLink) {
        "use strict";
        if (dictLink in CDTE_PREDICTIVE_PHRASES) {
            let dict = CDTE_PREDICTIVE_PHRASES[dictLink];
            this.bindPredictiveDictionary(dict);
        } else {
            loadPredictiveDictionary(dictLink).then(function(phrases) {
                let dict = formPredictiveDictionary(phrases);
                CDTE_PREDICTIVE_PHRASES[dictLink] = dict;
                this.bindPredictiveDictionary(dict);
            }.bind(this)); 
        }
        return this;    
    }

    /**
     * Bind predictive dictionary to the editor.
     * @param {Object} dict 
     */
    bindPredictiveDictionary(dict) {
        "use strict";
        this.editor.on('change', function(){
            let fword = this.editor.findWordAt(this.editor.getDoc().getCursor());
            let word = '';
            word = this.editor.getDoc().getRange(fword.anchor, fword.head);
            word = word.toLowerCase().trim();
            let wordlen = word.length;
            let variants = [];
            
            if ('"'+word+'"' in dict) {
                variants = dict['"'+word+'"'];
                let options = {
                    hint: function() {
                        let fr1 = this.editor.getDoc().getCursor().line;
                        let fr2 = this.editor.getDoc().getCursor().ch;
                        return {
                            from: {line: fr1, ch: fr2 + 1},
                            to: this.editor.getDoc().getCursor(),
                            list: variants,
                        };
                    }.bind(this),
                    completeSingle: false
                };
                this.editor.showHint(options);
            }
        }.bind(this));
    }

    /**
     * Make editor be read-only.
     */
    readOnly() {
        this.editor.setOption("readOnly", true);
        return this;
    }

    /**
     * Save raw editor contents to a file.
     */
    save_raw() {
        "use strict";
        let textToWrite = this.val();
        var textFileAsBlob = new Blob([ textToWrite ], { type: 'text/plain' });
        var fileNameToSaveAs = "MarkdownFile.md";

        var downloadLink = document.createElement("a");
        downloadLink.download = fileNameToSaveAs;
        if (window.webkitURL != null) {
            downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
        } else {
            downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
            downloadLink.onclick = destroyClickedElement;
            downloadLink.style.display = "none";
            document.body.appendChild(downloadLink);
        }

        downloadLink.click();
    }

    /**
     * Save formatted editor contents as html file.
     */
    save_html() {
        "use strict";
        let textToWrite = "<html><head><title>FormattedMarkdownFile</title></head><body>" + this.htmlval() + "</body></html>";
        var textFileAsBlob = new Blob([ textToWrite ], { type: 'text/plain' });
        var fileNameToSaveAs = "FormattedMarkdownFile.html";

        var downloadLink = document.createElement("a");
        downloadLink.download = fileNameToSaveAs;
        if (window.webkitURL != null) {
            downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
        } else {
            downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
            downloadLink.onclick = destroyClickedElement;
            downloadLink.style.display = "none";
            document.body.appendChild(downloadLink);
        }

        downloadLink.click();
    }

    /**
     * Wrapper for asyncCreate indended to return list of CDTextEditor entities.
     * @param {Object} editors
     * @return {Object}
     */
    static create(editors) {
        CDTextEditor.asyncCreate(editors);
        return CDTE_EDITORS;
    }

    /**
     * In case when multiple editors needed on the same page
     * allows to create them avoiding unneccessary loadings
     * such as spellchecking dictionaries, jQuery/jQuery UI, etc.
     * @param {Object} editors 
     */
    static async asyncCreate(editors) {
        "use strict";
        for (let editor of editors) {
            new CDTextEditor(editor.id).setup(editor.options);
            await timeout(500);
        }
    }
}

/**
 * Check if jQuery loaded. If not, load it automatically, then check if jQuery UI loaded.
 * Finally, after jQuery & jQuery UI loaded, execute function fn().
 * @param {Function} fn 
 */

async function jqueryRun(fn) {
    await loadJQuery();
    await loadJQueryUI();
    fn();
}

/**
 * If jQuery is not presented yet, load it from external source.
 * @returns {Promise}
 */
function loadJQuery() {
    "use strict";
    return new Promise((resolve) => {
        if (window.jQuery) {
            resolve();
        } else {
            let jquery_script = document.createElement('script');
            jquery_script.onload = function() {
                console.warn("jQuery not found. \n Loaded from: https://code.jquery.com/jquery-3.6.0.js");
                resolve();
            };
            jquery_script.src = "https://code.jquery.com/jquery-3.6.0.js";
            document.head.insertBefore(jquery_script, document.head.getElementsByTagName("script")[0]);
        }
    });
}

/**
 * If jQuery UI is not presented yet, load it from external source.
 * @returns {Promise}
 */
function loadJQueryUI() {
    "use strict";
    return new Promise((resolve) => {
        if (window.jQuery.ui) {
            resolve();
        } else {
            let jquery_ui_script = document.createElement('script');
            jquery_ui_script.onload = function() {
                let jquery_ui_theme = document.createElement('link');
                jquery_ui_theme.onload = function() {
                    console.warn("jQuery-UI not found. \n Loaded from: https://code.jquery.com/ui/1.12.0/jquery-ui.min.js \n Theme: https://code.jquery.com/ui/1.12.0/themes/smoothness/jquery-ui.css");
                    resolve();
                };
                jquery_ui_theme.rel = "stylesheet";
                jquery_ui_theme.href = "https://code.jquery.com/ui/1.12.0/themes/smoothness/jquery-ui.css";
                document.head.insertBefore(jquery_ui_theme, document.head.getElementsByTagName("link")[0]);
            };
            jquery_ui_script.src = "https://code.jquery.com/ui/1.12.0/jquery-ui.min.js";
            document.head.insertBefore(jquery_ui_script, document.head.getElementsByTagName("script")[1]);
        }
    });
}

/**
 * Convert editor contents to HTML via {@link https://github.com/showdownjs/showdown Showdown}.
 * If Showdown is not presented, returns raw contents.
 * @param {String} md 
 * @returns {String}
 */
function markdown2html(md) {
    if (typeof showdown === undefined) {
        console.warn("Showdown not found. Document preview may not be correct. Install: https://github.com/showdownjs/showdown");
        return md;
    } else {
        let converter = new showdown.Converter();
        return converter.makeHtml(md);
    }
}

/**
 * Load dictionary for the specific language
 * and create a Typo {@link https://github.com/cfinke/Typo.js Typo.js} object for the following spell checking.
 * @param {String} dictPath 
 * @param {String} locale 
 * @returns {Promise}
 */
function loadTypo(dictPath, locale) {
    "use strict";
    const affDict= dictPath + locale + '.aff';
    const dicDict= dictPath + locale + '.dic';
    return new Promise(function(resolve, reject) {
        let xhr_aff = new XMLHttpRequest();
        xhr_aff.open('GET', affDict, true);
        xhr_aff.onreadystatechange = function(e) {
            if (xhr_aff.readyState === 4) {
                if (xhr_aff.status === 200) {
                    let xhr_dic = new XMLHttpRequest();
                    xhr_dic.open('GET', dicDict, true);
                    xhr_dic.onreadystatechange = function(e) {
                        if (xhr_dic.readyState === 4) {
                            if (xhr_dic.status === 200) {
                                resolve(new Typo(locale, xhr_aff.responseText, xhr_dic.responseText, { platform: 'any' }));
                            } else {
                                reject();
                            }
                        }
                    };
                    xhr_dic.send(null);
                } else {
                    reject();
                }
            }
        };
        xhr_aff.send(null);
    });
}

/**
 * Read the file and put its contents into the editor.
 * @param {FileList} files 
 * @param {CodeMirror} editor 
 */
function getFileContents(files, editor) {
    "use strict";
    if (files.length == 0) return;
    
    const file = files[0];
    
    let reader = new FileReader();
    
    reader.onload = (e) => {
        const file = e.target.result;
        const lines = file.split(/\r\n|\n/);
        editor.setValue(lines.join('\n'));
    };
    
    reader.onerror = (e) => alert(e.target.error.name);
    
    reader.readAsText(file);
}

/**
 * Load the dictionary of phrases for predictive texting from the presented file.
 * @param {String} link 
 * @returns {Promise}
 */
function loadPredictiveDictionary(link) {
    "use strict";
    return new Promise(function(resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', link, true);
        xhr.onreadystatechange = function(e) {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(xhr.responseText);
                } else {
                    reject();
                }
            }
        };
        xhr.send(null);
    });
}

/**
 * Form the predictive dictionary hash map
 * "*first word of phrase*" => "*whole phrase*"
 * @param {String} contents 
 * @returns {Object}
 */
function formPredictiveDictionary(contents) {
    "use strict";
    let phrases = contents.split(/\r?\n/);
    let dict = [];

    for (let str of phrases) {
        if (str.length === 0)
            continue;
        let arr = str.toLowerCase().trim().split(/\s+/);
        let key = arr[0];
        arr[0] = '';
        if ('"'+key+'"' in dict) {
            dict['"'+key+'"'].push(arr.join(" "));
        } else {
            dict['"'+key+'"'] = [];
            dict['"'+key+'"'].push(arr.join(" "));
        }
    }

    return dict;
}

/**
 * Generate an unique id for this editor.
 * @returns {Number}
 */
function getEditorId() {
    let min = Math.ceil(1000000);
    let max = Math.floor(9999999);
    return Math.floor(Math.random() * (max - min)) + min;
}
/**
 * Set timeout.
 * @param {Number} ms 
 * @returns {Promise}
 */
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}