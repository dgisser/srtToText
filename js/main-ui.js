/**
 * modified from Flag Waver https://github.com/krikienoid/flagwaver/blob/master/js/flagwaver-ui.js
 */

//
// Main UI
//

;( function ( window, document, $, rivets, main, hashVars, undefined ) {

    //
    // Vars
    //

    // Browser support

    var isHistorySupported = !!( window.history && window.history.pushState );

    // DOM elements

    var $controlTxtUpload,
        $setTxtUploadMode,
        $inputTxtLink,
        $setTxtLink,
        $openTxtFile,
        $infoTxtFile,

    // Settings

    var mainDefaults = {
            text     : {
                txtUploadMode : 'web',
                txtURL        : '',
                txtFilePath   : '',
            }
        },
        mainOpts = $.extend( true, {}, mainDefaults );

    var mainControls = {
            text : {
                setTxtUploadMode : function () {
                    if ( mainOpts.text.txtUploadMode === 'web' ) {
                        $controlTxtUpload
                            .removeClass( 'upload-mode-file' )
                            .addClass( 'upload-mode-web' )
                            .append( $( '.input-txt-web' ) );
                    }
                    else if ( mainOpts.text.txtUploadMode === 'file' ) {
                        $controlTxtUpload
                            .removeClass( 'upload-mode-web' )
                            .addClass( 'upload-mode-file' )
                            .append( $( '.input-txt-file' ) );
                    }
                },
                setTxtURL : function () {
                    mainOpts.text.txtFilePath = '';
                    if ( mainOpts.text.txtURL ) {
                        setMainOpts( { txtSrc : mainOpts.text.txtURL } );
                        toHash( true );
                    }
                },
                setTxtFile : function () {
                    var file       = this.files[ 0 ],
                        reader     = new window.FileReader(),
                        isNewState = false;
                    mainOpts.text.txtFilePath = this.value;
                    reader.onload = function ( e ) {
                        isNewState = !!( mainOpts.text.txtURL );
                        mainOpts.text.txtURL = '';
                        setMainOpts( { txtSrc : e.target.result } );
                        toHash( isNewState );
                    };
                    reader.readAsDataURL( file );
                },
            }
        };

    var mainModel = {
            mainOpts : mainOpts,
            mainControls : mainControls
        };

    //
    // Functions
    //

    function setOpts ( mainData ) { main.text.setOpts( mainData ); }

    function fromHash () {
        var hashFrag = window.location.hash.split( '#' )[ 1 ],
            Opts = {},
            mainData;
        if ( hashFrag ) {
            if ( window.location.href.search( /\#(\!|\?)/ ) >= 0 ) {
                mainData = hashVars.getData(
                    // Compatibility with old version links
                    window.location.hash.replace( /\#(\!|\?)/, '#?' )
                );
                mainOpts.txtURL   = mainData.src;
            }
            else { // Compatibility with old version links
                mainOpts.txtURL = window.unescape( hashFrag );
            }
        }
        $.extend( mainOpts.text, mainDefaults.text, mainOpts );
        setmainOpts( {
            txtSrc : mainOpts.text.txtURL,
        } );
    }

    function toHash ( isNewState ) {
        hashVars.setData(
            {
                src      : mainOpts.text.txtURL,
            },
            {
                isNewState : isNewState,
                clearHash  : !mainOpts.text.txtURL
            }
        );
    }

    function updateExpander ( $expander ) {
        var $expandable = $( $expander.data( 'target' ) );
        if ( $expandable.hasClass( 'expanded' ) ) {
            $expander
                .removeClass( 'closed' )
                .addClass( 'open' )
                .val( $expander.data( 'text-expanded' ) )
                .attr( 'aria-expanded', 'true' );
            $expandable.attr( 'aria-hidden', 'false' );
        }
        else {
            $expander
                .removeClass( 'open' )
                .addClass( 'closed' )
                .val( $expander.data( 'text-collapsed' ) )
                .attr( 'aria-expanded', 'false' );
            $expandable.attr( 'aria-hidden', 'true' );
        }
    }

    //
    // Rivets.js configuration
    //

    rivets.configure( {
        prefix             : 'data-rv',
        preloadData        : true,
        rootInterface      : '.',
        templateDelimiters : [ '{', '}' ]
    } );

    rivets.formatters.onoff = function ( value, onText, offText ) {
        return ( value )? onText || 'On' : offText || 'Off';
    };

    rivets.formatters.fileName = function ( value, defaultText ) {
        return ( value )? value.split( '\\' ).pop() : defaultText || '';
    };

    //
    // Create HashVars
    //

    hashVars.create( {
        key : 'src',
        defaultValue : '',
        encode : function ( data ) { return window.encodeURIComponent( data ); }
    } );

    hashVars.create( {
        key : 'hoisting',
        defaultValue : 'dexter',
        decode : function ( value ) {
            if ( value.toLowerCase().match( /^dex(ter)?$/g ) ) {
                return 'dexter';
            }
            else if ( value.toLowerCase().match( /^sin(ister)?$/g ) ) {
                return 'sinister';
            }
        },
        encode : function ( data ) { return 'sin'; }
    } );

    hashVars.create( {
        key : 'topedge',
        defaultValue : 'top',
        decode : function ( value ) {
            if ( value.toLowerCase().match( /^(top|right|bottom|left)$/g ) ) {
                return value;
            }
        }
    } );

    //
    // Init
    //

    $( document ).ready( function () {

        //
        // Get DOM elements
        //

        $controlTxtUpload = $( '#control-txt-upload' );
        $setTxtUploadMode = $( '#set-img-upload-mode' );
        $inputTxtLink     = $( '#input-txt-link' );
        $setTxtLink       = $( '#set-txt-link' );
        $openTxtFile      = $( '#open-txt-file' );
        $infoTxtFile      = $( '#info-txt-file' );

        //
        // Init
        //

        // Init and append renderer to DOM
        main.init();
        $( '.js-main-canvas' ).append( main.canvas );
        window.dispatchEvent( new window.Event( 'resize' ) );

        // Load settings from hash vars on page load
        fromHash();

        //
        // Bind event handlers
        //

        // UI controls

        // Expander control
        $( 'input[type="button"].expander' ).on( 'click', function () {
            var $this = $( this );
            $( $this.data( 'target' ) ).toggleClass( 'expanded' );
            updateExpander( $this );
        } ).each( function () { updateExpander( $( this ) ); } );

        // Select file loading mode
        rivets.bind( $setTxtUploadMode, mainModel );
        $setTxtUploadMode.trigger( 'change' );


        // Load image from hash on user entered hash
        if ( isHistorySupported ) { $( window ).on( 'popstate', fromHash ); }

        // Load image from url
        rivets.bind( $inputTxtLink, mainModel );
        rivets.bind( $setTxtLink,   mainModel );

        // Load image from file
        $openTxtFile
            .on( 'focus', function () {
                $openTxtFile.parent().addClass( 'active' );
            } )
            .on( 'blur', function () {
                $openTxtFile.parent().removeClass( 'active' );
            } );

        rivets.bind( $openTxtFile, mainModel );
        rivets.bind( $infoTxtFile, mainModel );

    } );

} )( window, document, jQuery, rivets, main, hashVars );