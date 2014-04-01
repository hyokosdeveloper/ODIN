<?php
/**
 * update view
 * 
 * @package     Tinebase
 * @subpackage  Views
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: update.php,v 1.1 2009/12/08 23:15:16 hyokos Exp $
 *
 */
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <link rel="stylesheet" type="text/css" href="library/ExtJS/resources/css/ext-all.css"/>
    <link rel="stylesheet" type="text/css" href="library/ExtJS/resources/css/xtheme-slate.css" /><!-- LIBS -->

    <script type="text/javascript" src="library/ExtJS/adapter/ext/ext-base.js"></script>
    <script type="text/javascript" src="library/ExtJS/ext-all.js"></script>

	<script type="text/javascript">

		Ext.onReady(function() {


			function beginSetupProcess(){
				//Ext.Msg.alert('ok', 'forward user to setup.php');
			}

			/**
				Function which prompts the user to enter setup wizard or exit completely.
			*/			
			function enterSetupDialogue(){
				Ext.Msg.show({
					   title:'No Configuration Found',
					   msg: '<b>Please click the button below to enter the setup wizard</b>',
					   closable:false,					   
					   buttonText: Ext.MessageBox.buttonText.ok = 'Enter Setup',
					   buttonText: Ext.MessageBox.buttonText.cancel = 'Exit Setup - Contact Support',
					   buttons: Ext.Msg.OKCANCEL,
					   icon: Ext.MessageBox.ERROR,
					   //fn: beginSetupProcess	
					   fn: function(btn){
							if (btn == 'ok'){
								//Ext.Msg.alert('ok', 'forward user to setup.php');
								window.location.href = "setup.php";
							} else {
								window.location.href = "support.php";
								//Ext.Msg.alert('cancel', 'exit - close window');
							}
					   }					   				   
					});
			}

			/**
				Loader - buy some time while system determines if this user is setup yet or not
			*/			
			function loadProgressBar(pbarTitle, pbWindowText, pbarMessage){		
				Ext.Msg.progress(pbarTitle, pbWindowText, pbarMessage);				
				var count = 0;
				var interval = window.setInterval(function() {
					count = count + 0.03;			
					Ext.Msg.updateProgress(count);			
					if(count >= 1){
							window.clearInterval(interval);
							Ext.Msg.hide();
							enterSetupDialogue();
					}
				}, 100);		
			}

			/**
				Begin analyzation process
			*/			
			loadProgressBar('Odin Framework', 'Analyzing Configuration','please wait...');

			
		});
			
    </script>
    
    
<!-- 
    <script type="text/javascript">
        Ext.onReady(function() {
                
                
                new Ext.Viewport({
                        layout: 'fit',
                        items: {
                                xtype: 'panel',
                                layout: 'fit'
                        }
                    });
                    Ext.MessageBox.wait('ODIN needs to be updated or is not installed yet.', 'Please wait or contact your administrator');
                    window.setTimeout('location.href = location.href', 20000);
        }); 
    </script>
 -->
 
</head>
<body>
<div id="button"></div>
</body>
</html>
