/* 
 * Sean Hardaker 2010
 * This project was never completed and the code was written to support the technical demo.
 */



function get_domain(){
    var temp = window.location.href.split("/");
    var domain = temp[2];
    return domain;
}

function removeIngredient(){
    

    $('#add_recipe img.remove_ingredient').click(function(e) {
        var val = $(this).parent().children('input.ingredient').val();
        if(val==''){
            val = $(this).parent().children('input.measurement').val();
        }
        if(val!=''){
           var dialog = $('<div></div>')
		.html('The field you are trying to delete is not empty!<br /><br />If you still want to delete this field clear the contents first.')
		.dialog({
			autoOpen: false,
			title: 'Field Is Not Empty'
		});

           dialog.dialog('open');
		// prevent the default action, e.g., following a link
		return false;

        }else{
            $(this).parent().remove();
            orderIngredients();
        }
        
    });
}//removeIngredient

function removeMethod(){
    $('#add_recipe img.remove_method').click(function(e) {
         var val = $(this).parent().children('textarea.method_desc').val();
         if(val!=''){
           var dialog = $('<div></div>')
		.html('The field you are trying to delete is not empty!<br /><br />If you still want to delete this field clear the contents first.')
		.dialog({
			autoOpen: false,
			title: 'Field Is Not Empty'
		});

           dialog.dialog('open');
		// prevent the default action, e.g., following a link
		return false;

        }else{
            $(this).parent().remove();
            orderMethod();
        }
    });
}//removeMethod

function removeFootnote(){
    $('#add_recipe ul#footnotes li img.remove_footnote').click(function(e) {       
        var val = $(this).parent().children('textarea').val();
        alert(val)
         if(val!=''){
           var dialog = $('<div></div>')
		.html('The field you are trying to delete is not empty!<br /><br />If you still want to delete this field clear the contents first.')
		.dialog({
			autoOpen: false,
			title: 'Field Is Not Empty'
		});

           dialog.dialog('open');
		// prevent the default action, e.g., following a link
		return false;

        }else{
            $(this).parent().remove();
        }
    });
}//removeMethod


function removeAvatarPhoto(){
    /*
     *remove main photo image
     *
    */
     $('#avatar_display img.remove_avatar_photo').click(function(e) {
         var id = $(this).attr('id');

         var src = $('#avatar_display img#avatar_photo_'+id).attr('src');
        
         var bits = src.split('/');
         var folder = '/'+bits[3]+'/'+bits[4]+'/'+bits[5]+'/';
         
         var filename = bits[6];
         var domain = get_domain();
         $.post('http://'+domain+'/uploadify.php', { remove_main_photo: true, folder: folder, filename: filename } );

         $('#avatar_display img#avatar_photo_'+id).remove();
         $(this).remove();
    });

}//removeAvatarPhoto

function removeMainPhoto(){
    /*
     *remove main photo image
     *
    */
     $('#main_photos img.remove_main_photo').click(function(e) {
         var id = $(this).attr('id');

         var src = $('#main_photos img#main_photo_'+id).attr('src');
        
         var bits = src.split('/');
         var folder = '/'+bits[3]+'/'+bits[4]+'/'+bits[5]+'/';
         
         var filename = bits[6];
         var domain = get_domain();
         $.post('http://'+domain+'/uploadify.php', { remove_main_photo: true, folder: folder, filename: filename } );

         $('#main_photos img#main_photo_'+id).remove();
         $(this).remove();
    });

}//removeMainPhoto

function removeMethodPhoto(){
    /*
     *remove main photo image
     *
    */
     $('#method_photos img.remove_method_photo').click(function(e) {
         var id = $(this).attr('id');

         var src = $('#method_photos img#method_photo_'+id).attr('src');
        
         var bits = src.split('/');
         var folder = '/'+bits[3]+'/'+bits[4]+'/'+bits[5]+'/';
         
         var filename = bits[6];
         var domain = get_domain();
         $.post('http://'+domain+'/uploadify.php', { remove_main_photo: true, folder: folder, filename: filename } );

         $('#method_photos img#method_photo_'+id).remove();
         $(this).remove();
    });

}//removeMethodPhoto

function addRemoveIngredient(){
    /*
     *add a remove image to all li except the first li
     *
    */
    $( "ul#ingredients li" ).not('.last').each(function(val) {
        var domain = get_domain();
        var no = parseInt(val)+1;               
        if(no!=1 ){
            $(this).children('img').remove();
            $(this).append('<img src="http://'+domain+'/a/i/cancel.png" width="15" height="15" alt="Remove Ingredient" alt="Remove Ingredient" id="remove_ingredient_'+no+'" class="remove_ingredient"/>');
        }
    })
    removeIngredient();
}

function addRemoveMethod(){
    /*
     *add a remove image to all li except the first li
     *
    */
    $( "ul#method li" ).not('.last').each(function(val) {
        var domain = get_domain();
        var no = parseInt(val)+1;
        if(no!=1 ){           
            $(this).children('img').remove();
            $(this).append('<img src="http://'+domain+'/a/i/cancel.png" width="15" height="15" alt="Remove Method" alt="Remove Method" id="remove_method_'+no+'" class="remove_method"/>');
        }
    })
    removeMethod();
}

function addRemoveFootnotes(){
    /*
     *add a remove image to all li except the first li
     *
    */
    $( "ul#footnotes li" ).not('.last').each(function(val) {
        var domain = get_domain();
        var no = parseInt(val)+1;
        if(no!=1 ){
            $(this).children('img').remove();
            $(this).append('<img src="http://'+domain+'/a/i/cancel.png" width="15" height="15" alt="Remove Footnote" alt="Remove Footnote" id="remove_footnote_'+no+'" class="remove_footnote"/>');
        }
    })
    removeFootnote();
}

function addRemoveTag(){
    /*
     *add a remove image to remove the corropsonding tag
     *
    */
   $( "ul#add_tag li" ).each(function(val) {
        var domain = get_domain();
        var tag = $(this).attr('class');
        $(this).children('img').remove();
        $(this).append('<img src="http://'+domain+'/'+'a/i/cancel.png" width="15" height="15" alt="Remove Tag" title="Remove Tag" id="'+tag+'" class="remove_tag"/>');
   });
   bindRemoveTag();
}
function orderIngredients(){
    $( "ul#ingredients li" ).not('.last').each(function(val) {
        var no = parseInt(val)+1;
        
        if(no==1){
            $(this).children('img').remove();
        }else{
            addRemoveIngredient();
        }
        $(this).children('input:eq(0)').attr('name', 'measurement_'+no).attr('id', 'measurement_'+no);
        $(this).children('label:eq(0)').attr('for', 'measurement_'+no);
        
        $(this).children('input:eq(1)').attr('name', 'ingredient_'+no).attr('id', 'ingredient_'+no);
        $(this).children('label:eq(1)').attr('for', 'ingredient_'+no);
       
        $(this).children('img').attr('id', 'remove_ingredient_'+no);
    });
}

function orderMethod(){
    $( "ul#method li" ).not('.last').each(function(val) {
        var no = parseInt(val)+1;

        if(no==1){
            $(this).children('img').remove();
        }else{
            addRemoveMethod();
        }

        $(this).children('textarea').attr('name', 'method_desc_'+no).attr('id', 'method_desc_'+no);
        $(this).children('img').attr('id', 'remove_method_'+no);
        $(this).children('.uploadify').children('input').attr('name', 'uploadify_'+no).attr('id', 'uploadify_'+no);
        $(this).children('.uploadify').children('object').attr('id', 'uploadify_'+no+'Uploader');        
        var flashvars = $(this).children('.uploadify').children('object').children('param[name="flashvars"]');
        var uploadifyID = flashvars.attr('value').replace(/uploadify_[0-9]/, 'uploadify_'+no );
        flashvars.attr('value', uploadifyID);

    });
}

function bindRemoveTag(){
    $('#add_recipe img.remove_tag').click(function(e) {
        var tag = $(this).attr('id');
        $('li.'+tag).remove();

        var tags = $('div#hidden input[name="tags"]').val();
        var bits = tags.split(',');
        var pos = jQuery.inArray(tag, bits);
        if(pos !== '-1' && pos >'-1'){            
            bits.splice(pos, 1);
        }
        tags = bits.join(',');

        $('div#hidden input[name="tags"]').val(tags);
    });
}//bindRemoveTag

function showTimings(){
    
}
function addJavascriptFunctionality(){

    //tags
    $('#hidden #hidden_tags[type="hidden"]').attr('name', 'tags');
    $('#add_tag[type="text"]').val('').attr('name', 'add_tag');
    
    $('#add_recipe #add_tag_submit').html('<input type="submit" value="Add Tag" id="add_tag" />');
    var tags = $('div#hidden input[name="tags"]').val();
   
    var bits = tags.split(',');
    for(var i=1; i<=bits.length; i++){
        var tag = bits[i-1];        
        if(tag !=''){            
            $('ul#add_tag').append('<li class="'+ tag +'">' + tag + '&nbsp;</li>');
        }        
    }
    
    


    //ingredients
    $('#add_recipe #add_ingredient_submit').html('<input type="submit" value="Add another ingredient" id="add_ingredient" />');

    //method
    $('#add_recipe #add_method_submit').html('<input type="submit" value="Add another step" id="add_step" />');

    //footnotes
    $('#add_recipe #add_footnote_submit').html('<input type="submit" value="Add another footnote" id="add_footnote" />');
    
}

$(function() {
    //add the remove functionality with javascript and bind the event to the class
    addJavascriptFunctionality();
    addRemoveTag();
    addRemoveIngredient();
    addRemoveMethod();
    addRemoveFootnotes();
    showTimings();
    //style UI
    $('input:submit').button();

    //validate
    
    // a custom method making the default value for companyurl ("http://") invalid, without displaying the "invalid url" message
	/*jQuery.validator.addMethod("defaultInvalid", function(value, element) {
		return value != element.defaultValue;
	}, "");*/
        
        
       
        jQuery.validator.addMethod("hasQuantity", function(value, element) {            
	    if (element.value == '' && $('#makes').val()=='' && $('#makes_desc').val()=='') {                
                return false;
	    }
	    else return true;
	  }, "" );

          jQuery.validator.addMethod("hasAnchor", function(value, element) {
	    if (element.value != '' &&  $('#anchor').val()==''  ) {
                return false;
	    }
	    else return true;
	  }, "Please enter some anchor text" );

          jQuery.validator.addMethod("prepGroup", function(value, element) {
              //at least one should be selected
	    if ( $('#prep_time_days').val()=='' && $('#prep_time_hours').val()=='' && $('#prep_time_minutes').val()=='') {
                return false;
	    }
	    else return true;
	  }, "" );

          jQuery.validator.addMethod("cookingGroup", function(value, element) {
              //at least one should be selected
	    if ( $('#cooking_time_days').val()=='' && $('#cooking_time_hours').val()=='' && $('#cooking_time_minutes').val()=='') {
                return false;
	    }
	    else return true;
	  }, "" );

          jQuery.validator.addMethod("extraGroup", function(value, element) {
             //a extra time method and at least one time should be selected
	    if ( $('#extra_time_action').val()!='' && ( $('#extra_time_days').val()=='' && $('#extra_time_hours').val()=='' && $('#extra_time_minutes').val()=='' ) ) {
                 
                return false;
	    }
	    else return true;
	  }, "" );

        /*jQuery.validator.messages.required = "";*/
        $("#add_recipe").validate({
                            debug: false,
                            invalidHandler: function(e, validator) {
                                var errors = validator.numberOfInvalids();
                                if (errors) {
                                        var message = errors == 1
                                                ? 'You missed 1 field. It has been highlighted below'
                                                : 'You missed ' + errors + ' fields.  They have been highlighted below';
                                        $("div.error span").html(message);
                                        $("div.error").show();
                                } else {
                                        $("div.error").hide();
                                }
                            },
                            groups: {
                              prep_time_error: "prep_time_days prep_time_hours prep_time_minutes",
                              cooking_time_error: "cooking_time_days cooking_time_hours cooking_time_minutes",
                              extra_time_error: "extra_time_days extra_time_hours extra_time_minutes"
                            },
                            errorPlacement: function(error, element) {
                                   /* alert(element.attr('id'));
                                    alert(dumpObj(error,'errorPlacement','-',''))*/
                               
                                var id = element.attr('id');
                                if(id=='servings'){
                                    error.insertBefore('#error_'+id);
                                }
                                else{
                                    error.insertAfter(element);
                                }


                            },
                            messages: {
                                servings: {
                                    required: "Please indicate how much this recipe makes.",
                                    hasQuantity: "Please indicate how much this recipe makes.",
                                    number: "Please enter a number."
                                }
                            },
                            rules:{
                              recipe_name:{
                                 required:true
                              },
                              description:{
                                 required:true
                              },
                              measurement_1:{
                                  required:true
                              },
                              ingredient_1:{
                                  required:true
                              },
                              method_desc_1:{
                                  required:true
                              },
                              servings:{
                                   number: true,
                                  hasQuantity: true
                                 
                              },
                              extra_time_action:{
                                  extraGroup: true
                              },
                              recipe_difficulty:{
                                  required:true
                              },
                              category_1:{
                                  required:true,
                                  minlength:1
                              },
                              category_2:{
                                  required:true,
                                  minlength:1
                              },
                              category_3:{
                                  required:true,
                                  minlength:1
                              },
                              url:{
                                  require: false,
                                  
                                  url: true
                              }
                            }
                        });
                        
                        
                        $("#add_user").validate({
                            debug: false,
                            invalidHandler: function(e, validator) {
                                var errors = validator.numberOfInvalids();
                                if (errors) {
                                        var message = errors == 1
                                                ? 'You missed 1 field. It has been highlighted below'
                                                : 'You missed ' + errors + ' fields.  They have been highlighted below';
                                        $("div.error span").html(message);
                                        $("div.error").show();
                                } else {
                                        $("div.error").hide();
                                }
                            },
                            groups: {
                              prep_time_error: "prep_time_days prep_time_hours prep_time_minutes",
                              cooking_time_error: "cooking_time_days cooking_time_hours cooking_time_minutes",
                              extra_time_error: "extra_time_days extra_time_hours extra_time_minutes"
                            },
                            errorPlacement: function(error, element) {
                                   /* alert(element.attr('id'));
                                    alert(dumpObj(error,'errorPlacement','-',''))*/
                               
                                var id = element.attr('id');
                                if(id=='servings'){
                                    error.insertBefore('#error_'+id);
                                }
                                else{
                                    error.insertAfter(element);
                                }


                            },
                            messages: {
                                username: {
                                    required: "Please enter a username",
                                    minlength: "Your username must consist of at least 2 characters"
                                },                                
                                password: {
                                    required: "Please enter a password",
                                    minlength: "Your password must be at least 5 characters long"
                                },
                                email: "Please enter a valid email address",
                                agree: "Please accept our policy"
                            },
                            rules:{
                              username:{
                                 required:true,
                                 minlength: 2
                              },
                              email:{
                                 required:true,
                                 minlength: 5,
                                 email:true
                              },
                              password:{
                                  required:true,
                                  minlength: 5
                              },
                                agree: "required"
                              
                            }
                        });
});


//difficulty
$(function() {

   $('ul#difficulty li label').click(function(e) {
         var diff = $(this).attr('for');        
         $(this).parent().each(function() {           
            $(this).children('span').removeClass('fade');
            $(this).children('span').not('span#'+diff).addClass('fade');
         });
   });

});

//time
$(function() {
    $('#prep_time_days, #prep_time_hours, #prep_time_minutes').change(function(e) {
        var prep_time_days = $('#prep_time_days').val();
        var prep_time_hours = $('#prep_time_hours').val();
        var prep_time_minutes = $('#prep_time_minutes').val();

        if(prep_time_days=='')prep_time_days=0;
        if(prep_time_hours=='')prep_time_hours=0;
        if(prep_time_minutes=='')prep_time_minutes=0;

        $('#prep_time').html(
            prep_time_days+' Days, '+prep_time_hours+' Hours &amp; '+prep_time_minutes+' Minutes'
        );
    });
    $('#cooking_time_days, #cooking_time_hours, #cooking_time_minutes').change(function(e) {
        var cooking_time_days = $('#cooking_time_days').val();
        var cooking_time_hours = $('#cooking_time_hours').val();
        var cooking_time_minutes = $('#cooking_time_minutes').val();

        if(cooking_time_days=='')cooking_time_days=0;
        if(cooking_time_hours=='')cooking_time_hours=0;
        if(cooking_time_minutes=='')cooking_time_minutes=0;

        $('#cooking_time').html(
            cooking_time_days+' Days, '+cooking_time_hours+' Hours &amp; '+cooking_time_minutes+' Minutes'
        );
    });
    $('#extra_time_days, #extra_time_hours, #extra_time_minutes').change(function(e) {
        var extra_time_days = $('#extra_time_days').val();
        var extra_time_hours = $('#extra_time_hours').val();
        var extra_time_minutes = $('#extra_time_minutes').val();

        if(extra_time_days=='')extra_time_days=0;
        if(extra_time_hours=='')extra_time_hours=0;
        if(extra_time_minutes=='')extra_time_minutes=0;

        $('#extra_time').html(
            extra_time_days+' Days, '+extra_time_hours+' Hours &amp; '+extra_time_minutes+' Minutes'
        );

    });
});

//delete field
$(function() {
    $('#field_not_empty #field_delete_anyway[type="submit"]').click(function(e) {
        $(this).parent().dialog( "close" )
       return true;
    });
    $('#field_not_empty #field_cancel[type="submit"]').click(function(e) {
       return false;
    });
});


//servings
$(function() {
    $('#quantity').change(function(e) {
        var val = $(this).val();
        if(val =='1_makes'){
            $('#servings').hide();
            $('#makes, #makes_desc, label[for="makes_desc"]').removeClass('hide').addClass('show');
        }else if(val =='0_servings'){
            $('#makes, #makes_desc, label[for="makes_desc"]').removeClass('show').addClass('hide');
            $('#servings').show();
        }
    });
});
//method & ingredients
$(function() {


    

       $( "#ingredients" ).sortable({
           revert: true,
           update : function () {
                orderIngredients();
           }
       });
       $( "#method" ).sortable({
           revert: true,
           /*cancel: '.uploadify',*/
           update : function () {
               //organise method so the order of the method is sequential when the list is re-ordered
               orderMethod();
            }
       });
       $("li.disablesort").draggable( "disable" ).draggable({disabled: true});
});

//ADD ingredients
$(function() {
    $('ul#ingredients li #add_ingredient[type="submit"]').click(function(e) {
        //assing the mext id sequentialy when a new method is added
        var template = $('ul#ingredients li').slice(-2).html();
       
        var id = $('ul#ingredients li').slice(-2).children('input').attr('name');       
        
        var bits = id.split('_');
        var last = parseInt(bits[1]);
        var next = parseFloat(last + 1).toFixed(0);
        template = template.replace(/measurement_[0-9]/g, 'measurement_'+next ).replace(/ingredient_[0-9]/g, 'ingredient_'+next ).replace(/measurement_[0-9]/g, 'measurement_'+next ).replace(/ingredient_[0-9]/g, 'ingredient_'+next );
        $('<li>'+template+'</li>').insertBefore('ul#ingredients li.last');
       
        $(this).parent().prev().children('input#measurement_'+next).val('');
        $(this).parent().prev().children('input#ingredient_'+next).val('');
        addRemoveIngredient();        
        return false;
    });

     

});


//ADD method
$(function() {
    $('ul#method li #add_step[type="submit"]').click(function(e) {
        //assing the mext id sequentialy when a new method is added
        var template = $('ul#method li').slice(-2).html();
        var id = $('ul#method li textarea').slice(-1).attr('name');
        
        var bits = id.split('_');
        var last = parseInt(bits[2]);
        var next = parseFloat(last + 1).toFixed(0);
        template = template.replace(/method_desc_[0-9]/g, 'method_desc_'+next ).replace(/uploadify_[0-9]/g, 'uploadify_'+next ).replace(/uploadify_#[0-9]/g, 'uploadify_#'+next );
        $('<li>'+template+'</li>').insertBefore('ul#method li.last');
        addRemoveMethod();
        return false;
    });
});

//ADD footnotes
$(function() {
    $('ul#footnotes li #add_footnote[type="submit"]').click(function(e) {
        //assing the mext id sequentialy when a new footnote is added

        var li = $('ul#footnotes li').slice(-2);
        
       // dom = dom.children('textarea').val('');
        var textareaVal = li.children('textarea').val();
        var template = li.html();
        
        /*alert($('ul#footnotes li textarea').slice(-1).val());*/
        var id = $('ul#footnotes li select').slice(-1).attr('name');
        var bits = id.split('_');
        var last = parseInt(bits[1]);
        var next = parseFloat(last + 1).toFixed(0);
        template = template.replace(/footnoteName_[0-9]/g, 'footnoteName_'+next ).replace(/footnote_[0-9]/g, 'footnote_'+next ).replace(textareaVal, '').replace('selected="selected"', '');
        $('<li>'+template+'</li>').insertBefore('ul#footnotes li.last');
        addRemoveFootnotes();
        return false;
    });
});



//categories
$(function() {

 

    //uses event bubbling
    $(".multi_select").click(function(e) {
      e.stopPropagation();
    });
    $(".multi_select_option").click(function(e) {
      e.stopPropagation();
    });
    
    $(document).click(function() {
     
          $(".multi_select").hide();
          var domain = get_domain();
          $('.multi_select_option').removeClass('on').addClass('off').attr("src", 'http://'+domain+'/a/i/select-off-01.png');
      
    });

    $('.multi_select_box .multi_select div label').click(function() {

        var id = $(this).children('input').attr('id');          
        if($(this).children('#'+id).attr('checked')==true){
            $(this).children('#'+id).attr('checked', false);
        }else{
             $(this).children('#'+id).attr('checked', true);
        }
        
    });

    $('.multi_select_box .multi_select_option').click(function() {
        var classes = $(this).parent().children('img').attr('class');
        var bits = classes.split(' ');
        
        if(bits[1]=='on'){
            var id = $(this).next().next().attr('id');            
            var domain = get_domain();
            $('#'+id).hide();
            $(this).attr("src", 'http://'+domain+'/a/i/select-off-01.png');
            $(this).removeClass('on').addClass('off');

        }else{
            $(".multi_select").hide();
            var domain = get_domain();
            $('.multi_select_option').removeClass('on').addClass('off');
            $('.multi_select_option').attr("src", 'http://'+domain+'/a/i/select-off-01.png');
           $(this).removeClass('off').addClass('on');
            var id = $(this).next().next().attr('id');
            var domain = get_domain();
            $(this).attr("src", 'http://'+domain+'/a/i/select-on-01.png');
            
            $('#'+id).show();

            
        }

        

    });

    $('.multi_select_box label').click(function() {
      var domain = get_domain();
      $(this).parent().children('img').attr("src", 'http://'+domain+'/a/i/select-on-01.png');
   });

});

//tags
$(function() {

        $('ul li input#add_tag').autocomplete({
			source: "suggest_tags.php",
			minLength: 2
        });

        $('#add_tag[type="text"]').click(function(e) {
            var tag = $('#add_tag[type="text"]').val();
            if(tag=='Please enter a tag here'){
                $('#add_tag[type="text"]').val('');
            }
        });


        $('#add_tag[type="submit"]').click(function(e) {
            
            var tag = $('#add_tag[type="text"]').val();
            tag = tag.toLowerCase();            
            var tags = $('div#hidden input[name="tags"]').val();
            var bits = tags.split(',');
            var pos = jQuery.inArray(tag, bits);
            
            if(pos == '-1' || pos <'-1'){
                if(tag !='' && tag!='Please enter a tag here'){
                    
                    $('ul#add_tag').append('<li class="'+tag+'">' + tag + '&nbsp;</li>');
                    tags = $('div#hidden input[name="tags"]').val();
                    var deliminator = '';
                    if(tags!='' && tags !='undefined'){
                        deliminator = ',';
                    }
                    $('div#hidden input[name="tags"]').val(tags+deliminator+tag);
                    $('#add_tag[type="text"]').val('');
                    addRemoveTag();
                }else{
                    $('#add_tag[type="text"]').val('Please enter a tag here');
                }
            }else{
                $('#add_tag[type="text"]').val('');
            }
            return false;
        });
   

    
});

//uploads
$(document).ready(function() {
        var domain = get_domain();
        var length = $('ul#method li').size();
        var timestamp = $('#timestamp').val();
        var user_id = $('#user_id').val();
        
       
        
        length = length - 1;        
        for(var i=1; i<=length; i++){
            $("#uploadify_"+i).uploadify({
		'uploader'       : 'http://'+domain+'/a/flash/uploadify.swf',
		'script'         : 'http://'+domain+'/uploadify.php',
		'cancelImg'      : 'http://'+domain+'/a/i/cancel.png',
		'folder'         : 'uploads/method_photos/'+timestamp,
		'auto'           : true,
                'scriptData'  : {'timestamp':timestamp},
                'onComplete'  : function(event, ID, fileObj, response, data) {
                   if(fileObj.type != '.JPG' && fileObj.type != '.jpg'){
                       alert('File must be a jpg, sorry.');
                       
                   }else{
                       $('#method_photos_'+i).append('<img src="http://'+domain+fileObj.filePath+'" width="180" id="method_photo_'+ID+'" />&nbsp;<img src="http://'+domain+'/'+'a/i/cancel.png" width="15" height="15" alt="Remove Photo" title="Remove Photo" class="remove_method_photo" id="'+ID+'" />&nbsp;');
                       removeMethodPhoto();
                   }
                   return false;
              }
		
            });
        
        }

      
       
      
           
            $("#main_photo_1").uploadify({
		'uploader'       : 'http://'+domain+'/a/flash/uploadify.swf',
		'script'         : 'http://'+domain+'/uploadify.php',
		'cancelImg'      : 'http://'+domain+'/a/i/cancel.png',
		'folder'         : 'uploads/main_photos/'+timestamp,
		'auto'           : true,
                'scriptData'  : {'timestamp':timestamp},
                'onComplete'  : function(event, ID, fileObj, response, data) {
                       if(fileObj.type != '.JPG' && fileObj.type != '.jpg'){
                           alert('File must be a jpg, sorry.');

                       }else{
                           $('#main_photos').append('<img src="http://'+domain+fileObj.filePath+'" width="180" id="main_photo_'+ID+'" />&nbsp;<img src="http://'+domain+'/'+'a/i/cancel.png" width="15" height="15" alt="Remove Photo" title="Remove Photo" class="remove_main_photo" id="'+ID+'" />&nbsp;');
                           removeMainPhoto();
                       }
                        return false;
                    }

            });
            
            $("#avatar").uploadify({
		'uploader'       : 'http://'+domain+'/a/flash/uploadify.swf',
		'script'         : 'http://'+domain+'/uploadify.php',
		'cancelImg'      : 'http://'+domain+'/a/i/cancel.png',
		'folder'         : 'uploads/avatar/'+user_id,
		'auto'           : true,
                'scriptData'  : {'user_id':user_id},
                'onComplete'  : function(event, ID, fileObj, response, data) {
                       if(fileObj.type != '.JPG' && fileObj.type != '.jpg' && fileObj.type != '.GIF' && fileObj.type != '.gif' && fileObj.type != '.PNG' && fileObj.type != '.png'){
                           alert('File must be an image, sorry.');

                       }else{
                           $('#avatar_display').append('<img src="http://'+domain+fileObj.filePath+'" width="180" id="avatar_photo_'+ID+'" />&nbsp;<img src="http://'+domain+'/'+'a/i/cancel.png" width="15" height="15" alt="Remove Avatar" title="Remove Avatar" class="remove_avatar_photo" id="'+ID+'" />&nbsp;');
                           removeAvatarPhoto();
                       }
                        return false;
                    }

            });

        
	
});