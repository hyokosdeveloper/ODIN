/*
 * RJP: This custom layout manager fixes the width/height issues in Ext.layout.AbsoluteLayout
 * Use this instead until they fix it...
 */


Ext.layout.IesAbsoluteLayout = Ext.extend(Ext.layout.AnchorLayout, {
			extraCls : 'x-abs-layout-item',
			onLayout : function(ct, target) {
				target.position();
				this.paddingLeft = target.getPadding('l');
				this.paddingTop = target.getPadding('t');
				Ext.layout.AbsoluteLayout.superclass.onLayout.call(this, ct,
						target);
			}
		});

Ext.Container.LAYOUTS['iesabsolute'] = Ext.layout.IesAbsoluteLayout;
