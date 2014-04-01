<?php
/**
 * support view
 * 
 * @package     Tinebase
 * @subpackage  Views
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      h yokos
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: support.php,v 1.1 2009/12/08 23:15:25 hyokos Exp $
 *
 */



?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">


    <link rel="stylesheet" type="text/css" href="library/ext-3.0.3/resources/css/ext-all.css"/>
    <link rel="stylesheet" type="text/css" href="library/ext-3.0.3/resources/css/xtheme-slickness.css" />

    <script type="text/javascript" src="library/ext-3.0.3/adapter/ext/ext-base.js"></script>
    <script type="text/javascript" src="library/ext-3.0.3/ext-all.js"></script>
    
    <!-- 
    <script type="text/javascript" src="Odinbase/js/form/EmailForm.js"></script>
     -->
    
    <!-- OLD LIBS
    <link rel="stylesheet" type="text/css" href="library/ExtJS/resources/css/ext-all.css"/>
    <link rel="stylesheet" type="text/css" href="library/ExtJS/resources/css/xtheme-slate.css" />
 	
    <script type="text/javascript" src="library/ExtJS/adapter/ext/ext-base.js"></script>
    <script type="text/javascript" src="library/ExtJS/ext-all.js"></script>
	-->
	
	
	<script type="text/javascript">

		Ext.onReady(function() {
			//Ext.Msg.alert('Odin Support', 'Please Contact our support staff');
			
			
			/** SEND EMAIL FUNCTION
			 * 
			 */
			function sendMemberCustomEmail(to, from, subject, message){
					var conn = new Ext.data.Connection();
					conn.request({
						url: 'service.php/email/send.member.message.php',
							params: {
								to: to,
								from: from,
								subject: subject,
								message: message
							},
							success: function(resp,opt) {					
						},
							failure: function(resp,opt) {												
				
						}
					});		
					
					Ext.Msg.progress('Notifying Member', 'Sending Mail', to);				
					var count = 0;
					var interval = window.setInterval(function() {
						count = count + 0.03;			
						Ext.Msg.updateProgress(count);			
						if(count >= 1){
								window.clearInterval(interval);		
								Ext.Msg.hide();					
						}
					}, 100);		
			}
	
	

		
			
			/** FORM:  email form (outlook style)
			 * 
			 */
		    var emailForm = new Ext.form.FormPanel({
		        baseCls: 'x-plain',
		        id: 'email-form',
		        labelWidth: 55,
		        url:'server/sendemail',
		        defaultType: 'textfield',
		        items: [
		        {
		            fieldLabel: 'To',
		            name: 'to',
		            value: 'support@odin.tinlabapps.com',
		            id: 'email-form-field-to',
		            anchor:'100%'  // anchor width by percentage
		        }
		        ,{
		            fieldLabel: 'From',
		            name: 'from',
		            id: 'email-form-field-from',
		            readOnly: true,
		            //emptyText: '',
		            anchor:'100%'  // anchor width by percentage
		        }        
		        ,{        	
		            fieldLabel: 'Subject',
		            name: 'subject',
		            value: 'Help! From tinlab:odin User',		            
		            id: 'email-form-field-subject',
		            anchor: '100%'  // anchor width by percentage
		        }
		        ,{
		            //xtype: 'textarea',
		        	xtype: 'htmleditor',
		        	id: 'email-form-field-msg',
		            hideLabel: true,
		            name: 'msg',
		            anchor: '100% -73'  // anchor width by percentage and height by raw adjustment
		        }
		       ]
			});
		
			
			/** WINDOW:  email form holder (pop up window)
			 * 
			 */	
		    var emailFormWindow = new Ext.Window({
		        title: 'Email Support :: tinlab:odin User',
		        id: 'email-form-window',			        
		        //animateTarget: 'member-email-button',
		        //closeAction: 'hide',
		        closable : true,
		        width: 700,
		        height:500,
		        minWidth: 400,
		        minHeight: 300,
		        layout: 'fit',
		        plain:true,
		        bodyStyle:'padding:5px;',
		        buttonAlign:'center',
		        items: emailForm,
		
		        buttons: [{
		            text: 'Send',
		            handler: function(){	
		            	
			            	var to 		= Ext.getCmp('email-form-field-to').getValue();
			            	var from 	= Ext.getCmp('email-form-field-from').getValue();
			            	var subject = Ext.getCmp('email-form-field-subject').getValue();
			            	var message = Ext.getCmp('email-form-field-msg').getValue();			            	
			            	sendMemberCustomEmail(to, from, subject, message);			            
							Ext.getCmp('email-form-window').destroy();
							
							
		            }
		        },{
		            text: 'Cancel',
		            handler: function(){
		            	Ext.getCmp('email-form-window').destroy();			            	
		            }
		        }]
		    });
		
		    //emailFormWindow.show(button);
		    emailFormWindow.show();
		    
			emailFormWindow.on('destroy', function(){
				//Ext.getCmp('member-email-button').enable();
			});


			
		});
			
    </script>
    
    

 
</head>
<body>
<!-- 
<div id="button"></div>
 -->
</body>
</html>
