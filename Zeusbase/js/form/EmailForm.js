/*	EMAIL POP WINDOW FORM
 */

//Ext.BLANK_IMAGE_URL = 'lib/resources/images/default/s.gif';

Ext.onReady(function() {
    
    var button = Ext.getCmp('email-form-button');

    button.on('click', function(){

    	
    			
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
			            value: 'Hello from the Blog Aministrator',
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
			        title: 'Email Helper :: Member User',
			        id: 'email-form-window',			        
			        animateTarget: 'member-email-button',
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
			
			    emailFormWindow.show(button);
			    
				emailFormWindow.on('destroy', function(){
					Ext.getCmp('member-email-button').enable();
				});



    // close the button trigger that loads this object    
    });
// close the onReady event
});