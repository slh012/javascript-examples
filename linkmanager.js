/* 
 * The code in here is not not very modular and is tightly coupled.  The project it's used on is in Alpha and still serves as a tehcnical demo for functionality rather than coding excellence. 
 * 
 */
$.urlParam = function(name){
    var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
       return null;
    }
    else{
       return results[1] || 0;
    }
}
function copyToClipboard (text) {
  window.prompt ("Copy to clipboard: Ctrl+C, Enter", text);
}
function userData(){
     var profile_uuid = $('#profile_uuid').data('uuid');
   // var user_id = $('#user_id').data('user-id');
    var obj = new Object({profile_uuid:profile_uuid});
    
    return obj;
}
google.load("visualization", "1", {packages:["controls","corechart","table"]}); 

function setWordCloud(columnFilterWorldCloud){
    var state = columnFilterWorldCloud.getState();
    var user = userData();
    
    var filter_uuid = $('#filter_uuid').data('uuid');
            var domain = getDomain();
            $.ajax({
                type: "GET",
                cache: true,
                url: 'http://'+domain+'/do_word_cloud.php',
                data: ({action : state.selectedValues[0], profile_uuid:user.profile_uuid, filter_uuid:filter_uuid}),
                 success: function(html){
                   $('#word-cloud').html(html);
                    var chartTitle = $('#word-cloud').parent().parent().parent().children('header').children('h2').text();
                    $('#word-cloud').prepend('<div style="font-family:Arial;font-size:18px;font-weight:bold;color:#000000;margin:auto;width:13%;">'+chartTitle+' - '+state.selectedValues[0]+'</div>');
                     columnFilterWorldCloud.draw();
                     
                }
        });	

        
   
    
   
   
}
function getImgData(chartContainer) {
    var chartArea = chartContainer.getElementsByTagName('svg')[0].parentNode;
    var svg = chartArea.innerHTML;
    var doc = chartContainer.ownerDocument;
    var canvas = doc.createElement('canvas');
    canvas.setAttribute('width', chartArea.offsetWidth);
    canvas.setAttribute('height', chartArea.offsetHeight);


    canvas.setAttribute(
        'style',
        'position: absolute; ' +
        'top: ' + (-chartArea.offsetHeight * 2) + 'px;' +
        'left: ' + (-chartArea.offsetWidth * 2) + 'px;');
    doc.body.appendChild(canvas);
    canvg(canvas, svg);
    var imgData = canvas.toDataURL('image/png');
    canvas.parentNode.removeChild(canvas);
    
    return imgData;
}
function saveAsImg(chartContainer) {
    var imgData = getImgData(chartContainer);
    
    // Replacing the mime-type will force the browser to trigger a download
    // rather than displaying the image in the browser window.
    window.location = imgData.replace('image/png', 'image/octet-stream');
}
function drawToolbar(data, id) {
      var components = [
          {type: 'csv', datasource: data}
      ];

      var container = document.getElementById(id);
      google.visualization.drawToolbar(container, components);
    };


function dashboardReady(chart, data) {
    // The dashboard is ready to accept interaction. Configure the buttons to
    // programmatically affect the dashboard when clicked.

   
    // Change the pie chart rendering options when clicked.
    document.getElementById('optionsButton').onclick = function() {
      var options = new Object({
          title: 'Company Performance',
          vAxis: {title: 'Year',  titleTextStyle: {color: 'red'}}
        } );
      chart.setChartType('BarChart');      
      chart.setOptions(options);
      var view = new Object({'columns': [0,2,3,4,5,6,7]});
      chart.setView(view.columns);
 
      chart.draw();
    };
}

function selectionHandler(chart, columnFilter){
        var item = chart.getChart().getSelection()[0];
        var state = columnFilter.getState();
        var column;
       
       switch(state.selectedValues[0]){            
            case 'Followed':
            followed = 1;
        break;
            case 'No-Followed':
            followed = 0;
        break;
        default:
            
        }
        var domain = getDomain();
            
      var tld = data.getValue(item.row,0);
     
      window.open('http://'+domain+'/audit.php?tld='+tld+'&followed='+followed, '_blank', 'fullscreen=yes,menubar=yes,resizable=yes,toolbar=yes,titlebar=yes,scrollbars=yes');
       
    }//selectionHandler
function setChartView (chart, columnFilter, columnsTable, chartSettings) {
        var state = columnFilter.getState();
        var row;
        var view = {
            columns: [0]
        };
        for (var i = 0; i < state.selectedValues.length; i++) {
            row = columnsTable.getFilteredRows([{column: 1, value: state.selectedValues[i]}])[0];
            view.columns.push(columnsTable.getValue(row, 0));
        }
        // sort the indices into their original order
        view.columns.sort(function (a, b) {
            return (a - b);
        });
        chart.setView(view);
        chart.draw();
        
        $("text:contains(" + chart.getOption('title') + ")").attr({'x':'200', 'y':'15'}).append(" - "+state.selectedValues[0]);
       
    }//setChartView    
function createGoogleChart(data, chartSettings) {

//        // Create the dashboard
//        var dashboard = new google.visualization.Dashboard(
//            document.getElementById('dashboard'));
    $('.saveChartImage').click(function(e) {  
      
        saveAsImg(document.getElementById(chartSettings.chart.containerId));
        return false;
    });
       
    var columnsTable = new google.visualization.DataTable();
    columnsTable.addColumn('number', 'colIndex');
    columnsTable.addColumn('string', 'colLabel');
    var initState= {selectedValues: []};
    if(chartSettings.isMulti)    {
        //I only want 3 states so I override by duplicating
        columnsTable.addRow([1, data.getColumnLabel(1)]);//total
        columnsTable.addRow([2, data.getColumnLabel(2)]);//followed
        columnsTable.addRow([3, data.getColumnLabel(3)]);//nofollowed
        columnsTable.addRow([4, data.getColumnLabel(1)]);//overrride
        columnsTable.addRow([5, data.getColumnLabel(2)]);//overrride
        columnsTable.addRow([6, data.getColumnLabel(3)]);//overrride
    }else{
        // put the columns into this data table (skip column 0)
        for (var i = 1; i < data.getNumberOfColumns(); i++) {

            columnsTable.addRow([i, data.getColumnLabel(i)]);
            // you can comment out this next line if you want to have a default selection other than the whole list
           // initState.selectedValues.push(data.getColumnLabel(i));
        }
    }
    var formatter = new google.visualization.NumberFormat({pattern: '###,###'});
    formatter.format(data, 1); 
    formatter.format(data, 2); 
    formatter.format(data, 3); 

     initState.selectedValues.push(data.getColumnLabel(1));

    if(chartSettings.isMulti){
        data.setColumnLabel(1,chartSettings.data.columnLabel[0]);
        data.setColumnLabel(2,chartSettings.data.columnLabel[0]);
        data.setColumnLabel(3,chartSettings.data.columnLabel[0]);
        data.setColumnLabel(4,chartSettings.data.columnLabel[1]);
        data.setColumnLabel(5,chartSettings.data.columnLabel[1]);
        data.setColumnLabel(6,chartSettings.data.columnLabel[1]);
    }
    

    var chart = new google.visualization.ChartWrapper({dataTable: data});

    chart.setChartType(chartSettings.chart.chartType);    
    
    var options;
    
    switch(chartSettings.chart.chartType){
        case "PieChart":
            options = new Object({slices: {},  height: 400, titleTextStyle: {fontSize: 18}, sliceVisibilityThreshold: 1/720, pieSliceText: 'percentage' ,  chartArea: {width: "100%", height: "60%"}} );

            var offset = 0.2;
            var numRows;    
            if(data.getNumberOfRows()>20){
                numRows = 20;
            }else{
                numRows = data.getNumberOfRows();
            }
            for (i = 0; i <= numRows; i++) {
                options.slices[i] = new Object();
                options.slices[i]['offset'] = offset;   
                offset += 0.02;
            }

            
            
        break;
        case "BarChart":    
        case "ColumnChart":
            options = new Object({height: 400, titleTextStyle: {fontSize: 18}, legend: {position:"none"}} );
            if(chartSettings.isMulti){                
                options.legend.position = chartSettings.chart.options.legend.position;
            }
        break;
        default:
        
    }

    chart.setOptions(options); 
    var chartTitle = $('#'+chartSettings.chart.containerId).parent().parent().parent().children('header').children('h2').text();
    chart.setOption('title', chartTitle);
    chart.setContainerId(chartSettings.chart.containerId);

    var columnFilter = new google.visualization.ControlWrapper({
    controlType: 'CategoryFilter',        
    dataTable: columnsTable,
    options: {
        filterColumnLabel: 'colLabel',
        ui: {
            'labelStacking': 'vertical',        
            label: '',
            allowTyping: false,
            allowMultiple: false,
            allowNone: false,
            selectedValuesLayout: 'belowStacked'
        }
    },
    state: initState
    });
    
    columnFilter.setContainerId(chartSettings.columnFilter.containerId);
    
    
//    // Define a StringFilter control for the 'Name' column
//    var stringFilter = new google.visualization.ControlWrapper({
//    'controlType': 'StringFilter'        
//    });
//
//    stringFilter.setOptions(chartSettings.stringFilter.options);
//    stringFilter.setContainerId(chartSettings.stringFilter.containerId);

//     // Register a listener to be notified once the dashboard is ready.
//     new google.visualization.events.addListener(buttons, 'ready', function () {
//         dashboardReady(chart, data);
//    });

    //dashboardReady(chart, data);

    new google.visualization.events.addListener(columnFilter, 'statechange', function () {
        if(chartSettings.isMulti){
            setChartViewMulti(chart, columnFilter, columnsTable);
        }else{
            setChartView(chart, columnFilter, columnsTable, chartSettings);
        }
    });
    //        new google.visualization.events.addListener(chart, 'select', function () {
    //            selectionHandler(chart, columnFilter);
    //        });
    if(chartSettings.isMulti){
        setChartViewMulti(chart, columnFilter, columnsTable);
    }else{
        setChartView(chart, columnFilter, columnsTable, chartSettings);
    }
    columnFilter.draw();

    if($('#'+chartSettings.table.containerId).length){
        // Create and draw the visualization.
        table = new google.visualization.Table(document.getElementById(chartSettings.table.containerId));
        table.draw(data, {page:'enable',pageSize:10});
    }
    if(typeof chartSettings.drawToolbar != "undefined"){
        if($('#'+chartSettings.drawToolbar.containerId).length){
            drawToolbar(data, chartSettings.drawToolbar.containerId);
        }
    }
    //$("text:contains(" + chart.getOption('title') + ")").attr({'x':'200', 'y':'15'});
    
    
    
    // Configure the string filter to affect the table contents
    //bind(stringFilter, table);
    //stringFilter.draw();

}//createGoogleChart
function setChartViewMulti (chart, columnFilter, columnsTable) {
        var state = columnFilter.getState();
       
        var row;
        var data = {
            columns: [0]
        };
        
        for (var i = 0; i < state.selectedValues.length; i++) {
            row = columnsTable.getFilteredRows([{column: 1, value: state.selectedValues[i]}])[0];
            data.columns.push(columnsTable.getValue(row, 0));
         
           // rowMulti = columnsTable.getFilteredRows([{column: 1, value: state.selectedValues[i]+' Multi'}])[0];
            // console.log(rowMulti);
            rowMulti = row + 3;
            data.columns.push(columnsTable.getValue(rowMulti, 0));
        }
        // sort the indices into their original order
        data.columns.sort(function (a, b) {
            return (a - b);
        });
        
        chart.setView(data);
        chart.draw();
    }//setChartViewMulti

function stackedBarLabels(p){
   
   var columnSize = new Array();
   var columnLabel = new Array();
   for(var i = 0; i < p.getData().length; i++){
  
    $.each(p.getData()[i].data, function(i, el){
        
        if(columnSize[i]){
            columnSize[i] += el[0];
            columnSize[i] += (p.getData()[0].max/100);
            columnLabel[i] += ' / '+percentage(el[0], p.getData()[0].totalNofollowed, 2)+'%';//' / '+addCommas(el[0],',')+
        }else{
            columnSize[i] = el[0];
            columnLabel[i] = percentage(el[0], p.getData()[0].totalFollowed, 2)+'%';//addCommas(el[0],',')+
        }
    });
   }
   
  i = 0;
        $.each(p.getData()[0].data, function(i, el){
        
          var o = p.pointOffset({x: columnSize[i], y: el[1]});
          o.top -= (p.getOptions().series.bars.barWidth*10)*5;


          $('<div class="data-point-label">' + columnLabel[i] + '</div>').css( {
            position: 'absolute',
            left: o.left ,
            top: o.top ,
            fontSize: 10   
          }).appendTo(p.getPlaceholder());
          i++;
        });  
}
function normalize(value, max, min, top, bottom){
    return bottom+(value-min)*(top-bottom)/(max-min);
}
function percentage(i, m, d){
    return addCommas(precise_round((i/m)*100,d),',');
}

function precise_round(num,decimals){
 return (Math.round((num*Math.pow(10,decimals))+(sign*(10/Math.pow(100,dec))))/Math.pow(10,decimals)).toFixed(decimals);
}

function addCommas(nStr, ThousandsSep)
   {
   if (typeof(ThousandsSep) == 'undefined')
      {
      var ThousandsSep = '&rsquo;';
      }
   nStr += '';
   x = nStr.split('.');
   x1 = x[0];
   x2 = x.length > 1 ? '.' + x[1] : '';
   var rgx = /(\d+)(\d{3})/;
   while (rgx.test(x1))
      {
      x1 = x1.replace(rgx, '$1' + ThousandsSep + '$2');
      }
   return x1 + x2;
   }
function TransformNumberString(Args)
   {
   if (typeof(Args.Str) == 'undefined')
      {
      var Str = '';
      }
   else
      {
      var Str = Args.Str;
      }

   if (typeof(Args.ThousandsSep) == 'undefined')
      {
      var ThousandsSep = null;
      }
   else
      {
      var ThousandsSep = Args.ThousandsSep;
      }

   if (typeof(Args.Decimals) == 'undefined')
      {
      var Decimals = 0;
      }
   else
      {
      var Decimals = Args.Decimals;
      }

   if (typeof(Args.DecPoint) == 'undefined')
      {
      var DecPoint = '.';
      }
   else
      {
      var DecPoint = Args.DecPoint;
      }

   if (typeof(Args.MinNumTransform) == 'undefined')
      {
      var MinNumTransform = 100;
      }
   else
      {
      var MinNumTransform = Args.MinNumTransform;
      }

	var Ret = Str;
	if (Str != '')
   	{
   	checkNumber = Number(Str);
   	if (checkNumber < 0)
      	{
         var checkNumber = checkNumber * (-1);
      	}
   	if (checkNumber < Number(MinNumTransform))
      	{
         Ret = addCommas(Number(Str).toFixed(Decimals), ThousandsSep);
      	}
      else
      	{
         Ret = addCommas(Number(Str).toFixed(0), ThousandsSep);
      	}
      Ret = Ret.replace(/\./g, DecPoint);
   	}
   return Ret;
   }
function FormatInt(Args)
{
	if (typeof(Args.Str) == 'undefined')
    {
		var Str = '';
    }
	else
	{
		var Str = Args.Str;
	}
	
	return TransformNumberString({Str: Str, ThousandsSep: ',', Decimals: 0});
}
   
function FormatFloat(Args)
{
	if (typeof(Args.Str) == 'undefined')
    {
		var Str = '';
    }
	else
	{
		var Str = Args.Str;
	}

	if (typeof(Args.Decimals) == 'undefined')
    {
		var Decimals = 2;
    }
	else
	{
		var Decimals = Args.Decimals;
	}
	
	return TransformNumberString({Str: Str, ThousandsSep: ',', Decimals: Decimals, DecPoint: '.'});
}
function getURL(){
    var url = window.location.href;
    return url;
}
function getDomain(sub){
    var temp = window.location.href.split("/");
    var domain
    if(sub==4){
        domain = temp[2]+'/'+temp[3]+'/'+temp[4];
    }else{
        domain = temp[2]+'/'+temp[3];
    }
    return domain;
}

function precise_round(num,decimals){
    return Math.round(num*Math.pow(10,decimals))/Math.pow(10,decimals);
}
function randomFromInterval(from,to)
{
    return Math.floor(Math.random()*(to-from+1)+from);
}
function auditProgressSummaryTable(){
    if($('#audit-progress-summary-table').length){
        var user = userData();
        var domain = getDomain();
        $.ajax({
            type: "POST",
            url: 'http://'+domain+'/do_audit.php',
            data: ({action:"audit_progress_summary_table", profile_uuid:user.profile_uuid}),
             success: function(html){
                $('#audit-progress-summary-table').html(html);
            }
        });
    }
}
function removeAdvFilterGroup(){
    $('.adv-filter-group .icon-remove').click(function(i) {     
        if($('.adv-filter-group').length > 1){
           if($(this).parent().parent().prev('.adv-filter-and').length>0){
                $(this).parent().parent().prev('.adv-filter-and').remove();
           }else{
               $(this).parent().parent().next('.adv-filter-and').remove();
           }
           $(this).parent().parent().remove();
        }
       if($('.adv-filter-group').length == 1){
           console.log('No filters');
           $('.icon-remove').css({"color":"transparent", "cursor":"default"});
           
       }
    });
}
function addRemoveAdvFilterGroup(){
     $( ".adv-filter-group" ).each(function(i) {       
             $(this).find('.icon-remove').remove();
             $(this).children('div').prepend('<i class="icon-remove" title="Remove filter"></i>');         
     });
}
function setSelectedAdvFilter(){
    $('.adv-filter-include-exclude ul li a, .adv-filter-match-type ul li a, .adv-filter-comparison-match-type ul li a, .adv-filter-comparison-boolean  ul li a, .adv-filter-status-code  ul li a, .adv-filter-website-category  ul li a, .adv-filter-keyword-category  ul li a').click(function() {           
        var o = $(this).text();
        $(this).parent().parent().parent().children('a:first-child').text(o);
        $(this).each(function() {$(this).removeClass('selected');});
        $(this).addClass('selected');
        
        return false;
    });
}
function advFilterHistoryList(){
    var user = userData();
     var domain = getDomain();
        $.ajax({
            type: "POST",
            cache: true,
            url: 'http://'+domain+'/do_audit.php',
           data: ({action : 'get_save_filter', profile_uuid:user.profile_uuid}),
            success: function(jsonToBeParsed){
                    
                  // console.log("Do advFilterHistoryList");
                  //   console.log(jsonToBeParsed);
                 var listOfPrevFilters;
                   if(jsonToBeParsed){
                       
                       
                       parsedJson = $.parseJSON(jsonToBeParsed);
                  var name;   
                   listOfPrevFilters = '<h4>Saved Filters</h4><div class="btn-toolbar" id="saved-filters-list"><div class="btn-group">';
                    i=0;
                   for (var key in parsedJson) {
                         if (parsedJson.hasOwnProperty(key)) {
                             
                                listOfPrevFilters += '<button class="btn"><a href="#">'+key+'</a></button>';
                             
                              for (var key2 in parsedJson[key]) {
                                  
                                  if (parsedJson[key].hasOwnProperty(key2)) {
                                      
                                        
                                        //listOfPrevFilters += '<button class="btn"><a href="#">'+key2+'</a></button>';
                                  }
                              }
                              i++;
                         }
                    };
                    
                    listOfPrevFilters += '</div></div>';
                     
                   }else{
                       listOfPrevFilters = '<h4>Saved Filters</h4><p>Empty</p>';
                   }
                   $('#list-of-previous-filters').html(listOfPrevFilters);
                   if($('#delete-adv-filter').length == 0)$('#save-adv-filter').after('<a href="#" class="btn" id="delete-adv-filter">Delete Filter</a> ');
                   if($('#saved-filters-list .btn-group .btn').length == 0)$('#delete-adv-filter').remove();
                   
                   deleteAdvFilter()
                   getSavedAdvSearch();
            }
    });	
    
    
//    var advFilterHistoryList = $.evalJSON(localStorage.getItem('advFilterHistoryList'));
//    
//    if(advFilterHistoryList){
//        if(typeof advFilterHistoryList.saveas != 'undefined'){
//            var saveas = advFilterHistoryList.saveas.split('|');
//            var listOfPrevFilters = '<ul>';
//            for(var i=0;i<saveas.length;i++){
//                listOfPrevFilters += '<li><a href="#" id="'+saveas[i]+'">'+saveas[i]+'</a></li>';
//            }
//            listOfPrevFilters += '</ul>';
//            $('#list-of-previous-filters').html(listOfPrevFilters);
//        }
//    }
}
function initAdvSearch(){
   
    //init
    //$('.adv-filter-include-exclude').children('a:first-child').text($('.adv-filter-include-exclude ul li a.selected').text());
    //$('.adv-filter-match-type').children('a:first-child').text($('.adv-filter-match-type ul li a.selected').text());
    $('.adv-filter-comparison-match-type').hide();//.children('a:first-child').text($('.adv-filter-comparison-match-type ul li a.selected').text());
    $('.adv-filter-comparison-boolean').hide();//.children('a:first-child').text($('.adv-filter-comparison-boolean ul li a.selected').text());
    $('.adv-filter-status-code').hide();//.children('a:first-child').text($('.adv-filter-status-code ul li a.selected').text());
    $('.adv-filter-website-category').hide();//.children('a:first-child').text($('.adv-filter-website-category ul li a.selected').text());
    $('.adv-filter-keyword-category').hide();//.children('a:first-child').text($('.adv-filter-keyword-category ul li a.selected').text());
    $('.adv-filter-is').hide();
    
    //console.log(localStorage);
    
    advFilterHistoryList();
   
    
    //advFilterHistory.
   
       
    
    
}
function setSavedFilter(id){
    
    var html = localStorage.getItem('advFilterState_'+id);
  
     $('#adv-filter-container').html(html);
        $(".themed select.with-search").select2("destroy");

  $(".themed select.with-search").select2();
        addRemoveAdvFilterGroup();
        removeAdvFilterGroup();
        setSelectedAdvFilter();
        advFilterDimMetSelect();  
return false;
        var advFilterHistory = localStorage.getItem('advFilterHistory');
        if(advFilterHistory){
          var jsonObj = $.evalJSON(advFilterHistory);
          var text; 
          var id;
          for (var key in jsonObj) {

              if (jsonObj.hasOwnProperty(key)) {



                  for (var key2 in jsonObj[key]) {



                      if (jsonObj[key].hasOwnProperty(key2)) {                        



                            text = jsonObj[key][key2];
                            id = key2.replace('_', '-');
                            if(id == 'dim-met'){           
                                $(".adv-filter-group:eq("+key+") div .adv-filter-"+id+" option[value='"+text+"']").attr("selected","selected");   

                            }else if(id=='input'){
                                $('.adv-filter-group:eq('+key+') div .adv-filter-'+id).val(text); 
                            }
                            //console.log(id+': '+$('.adv-filter-'+id));

                            //console.log(key +' '+id + " -> " + text);
                      }
                  }



              }
            }
        }
       
}
function saveAdvSearch(){
    
    
   // initAdvSearch();
   
        
    
      $('#save-adv-filter').click(function() {    
     
        $(".themed select.with-search").select2("destroy");
        
      
        
      
        
        $(".themed select.with-search").select2();
        
       var parsedJson;
       var domain = getDomain();
       var adv_filter_save_form = $('#adv-filter-save-form').val(); //save name
       var filter_obj;          
       filter_obj = advSearchVal();  //current form 
       var user = userData(); 
         $.ajax({
                type: "POST",
                cache: true,
                url: 'http://'+domain+'/do_audit.php',
                data: ({action : 'get_save_filter', profile_uuid:user.profile_uuid}),
                 success: function(jsonToBeParsed){
                  //get the current saved filters
                  var saveObj = new Object(); 
                   if(jsonToBeParsed){ 
                         parsedJson = $.parseJSON(jsonToBeParsed);
                      //console.log(parsedJson);
                   
                    i=0;
                
//                        for (var key in parsedJson) {
//                                 if (parsedJson.hasOwnProperty(key)) {
//                                     console.log("1st: "+key +'=='+ parsedJson[key]);                                   
//                                    
//                                      for (var key2 in parsedJson[key]) {
//
//                                          if (parsedJson[key].hasOwnProperty(key2)) {
//                                              
//                                               console.log("2nd: "+key2 +'=='+ parsedJson[key][key2].dim_met);
//                                    
//                                                saveObj[key] = new Object();
//                                                saveObj[key][key2] = parsedJson[key][key2];  
//                                            }
//                                
//                                        }
//                            //saveObj[i] = new Object({'Unnamed':parsedJson[key]});
//                            
//                              i++;
//                            }
//                         
//                        };
                    
                           saveObj = parsedJson;
                         
                         if(adv_filter_save_form){     
                             saveObj[adv_filter_save_form] = new Object();//{adv_filter_save_form:adv_filter_state} 
                             saveObj[adv_filter_save_form] = filter_obj
                         }else{
                             saveObj['Unnamed'] = new Object();//{adv_filter_save_form:adv_filter_state} 
                             saveObj['Unnamed'] = filter_obj;
                         }
                 
                   
                   //  saveObj[i] = adv_filter_state;
                  //    console.log(saveObj);
                    var saveJSON =  $.toJSON( saveObj );
                  
                   
                    $.ajax({
                        type: "POST",                
                        url: 'http://'+domain+'/do_audit.php',                
                        data: ({filter_history_code : saveJSON, action : 'save_filter', profile_uuid:user.profile_uuid}),
                         success: function(){
                           advFilterHistoryList();
                        }
                        });	
                        //  
                }else{
                 
                 //   saveJSON = $.toJSON(new Object({id:0,'filter':adv_filter_state}));
                 //saveObj[0] = new Object();//{adv_filter_save_form:adv_filter_state} 
                 if(adv_filter_save_form){                             
                     saveObj[adv_filter_save_form] = new Object();//{adv_filter_save_form:adv_filter_state} 
                     saveObj[adv_filter_save_form] = filter_obj
                 }else{
                     saveObj['Unnamed'] = new Object();//{adv_filter_save_form:adv_filter_state} 
                     saveObj['Unnamed'] = filter_obj;
                 }
                 
                 var saveJSON =  $.toJSON( saveObj );
             
                     $.ajax({
                        type: "POST",
                        cache: true,
                        url: 'http://'+domain+'/do_audit.php',
                        data: ({filter_history_code : saveJSON, action : 'save_filter', profile_uuid:user.profile_uuid}),
                         success: function(){
                           advFilterHistoryList();
                        }
                        });
                }
                   advFilterHistoryList(); 
                }
                });
                 return false;
      });
      
    

}

function advSearchVal(){
    var filter_obj = new Object;
    
    //if(name == '')name = 'default';
    
    filter_obj = new Object;
    
        $('.adv-filter-group').children('div').each(function(i, v) {        

            filter_obj[i] = new Object();

            filter_obj[i]['include-exclude'] = $(this).children('.adv-filter-include-exclude').find(":selected").val();        
            
            
            filter_obj[i]['dim-met'] = $(this).children('.adv-filter-dim-met').find(":selected").val();
            

            if($(this).children('.adv-filter-match-type').is(":visible")){           
                filter_obj[i]['match-type'] = $(this).children('.adv-filter-match-type').find(":selected").val();
               
            }
            if($(this).children('.adv-filter-comparison-match-type').is(":visible")){           
                filter_obj[i]['comparison-match-type'] = $(this).children('.adv-filter-comparison-match-type').find(":selected").val();
               
            }
            if($(this).children('.adv-filter-comparison-boolean').is(":visible")){           
                filter_obj[i]['comparison-boolean'] = $(this).children('.adv-filter-comparison-boolean').find(":selected").val();
               
            }
            if($(this).children('.adv-filter-status-code').is(":visible")){           
                filter_obj[i]['status-code'] = $(this).children('.adv-filter-status-code').find(":selected").val();
               
            }
            if($(this).children('.adv-filter-website-category').is(":visible")){           
                filter_obj[i]['website-category'] = $(this).children('.adv-filter-website-category').find(":selected").val();
               
            }
            if($(this).children('.adv-filter-keyword-category').is(":visible")){           
                filter_obj[i]['keyword-category'] = $(this).children('.adv-filter-keyword-category').find(":selected").val();
               
            }
            if($(this).children('.adv-filter-input').is(":visible")){           
                filter_obj[i]['input'] = $(this).children('.adv-filter-input').val();
               
            }
           
        });
        return filter_obj;
}

function doAdvSearch(){
    
    
    initAdvSearch();
   
    $('#apply-adv-filter').click(function() {
        
        var valid = advFilterValidate();
        if(valid === false){           
            return false;
        }
        var filter_obj;
          
        filter_obj = advSearchVal();
        
        saveFilter = new Object();
        saveFilter['last'] = filter_obj;
         var saveJSON =  $.toJSON( saveFilter );
       var user = userData();
        //$(".themed select.with-search").select2();
        var pagename = $('#pagename').data('pagename');
        $.ajax({
            type: "POST",
            url: 'http://'+getDomain()+'/do_audit.php',
            data: ({filter:saveJSON,action:"adv-filter", profile_uuid:user.profile_uuid, pagename:pagename}),
             success: function(jsonToBeParsed){     
              var parsedJson = $.parseJSON(jsonToBeParsed);
              var filter_uuid = parsedJson.filter_uuid;
              var pagename = parsedJson.pagename;
               //console.log(filter_uuid);
               //var url = getURL();
               //window.location.href = url+'?filter_id='+filter_uuid;
               //window.location.href = 'http://'+domain+'/audit.php?filter_id='+filter_uuid;
               //http://www.jquery4u.com/syntax/jquery-basic-regex-selector-examples/
                
                
                //check that we're still dealing with uuid's before redirecting
                var uuidRegex = new RegExp('[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}');
                var f = uuidRegex.exec(filter_uuid);
                var p = uuidRegex.exec(user.profile_uuid);
                
                if(f[0] == f['input'] && p[0] == p['input']){
                    //console.log('redirect');
                  //  console.log('filter check');
                    $.blockUI({message: '<h1><img src="http://'+getDomain()+'/img/loaders/type1/light/24.gif" /> Processing filter...</h1>'}); 
                   $.ajax({
                        type: "POST",
                        url: 'http://'+getDomain()+'/do_filter_check.php',
                        data: ({action:'check-filter',filter_uuid : filter_uuid, profile_uuid:user.profile_uuid}),
                           success: function(jsonToBeParsed){
                                    var parsedJson = $.parseJSON(jsonToBeParsed);
                                    if(parsedJson.result=='success'){            
                                        $(document).ajaxStop($.unblockUI); 
                                        //console.log('http://'+getDomain()+'/'+pagename+'/'+user.profile_uuid+'/'+filter_uuid+'/');
                                        window.location.href = 'http://'+getDomain(4)+'/'+user.profile_uuid+'/'+filter_uuid+'/';
                                    }else{
                                        //redirect
                                        console.log("FAIL");
                                    }
                            }
                    });
                   //window.location.href = 'http://'+getDomain()+'/filter-check/'+user.profile_uuid+'/'+filter_uuid+'/?pagename='+pagename;
                }else{
                    console.log('error with uuid');
                }
            }
        });
    
        return false;
    });
}

function advFilterDimMetSelect(){
    
    $('.adv-filter-dim-met div.controls select').change(function() {
      
      var val = $(this).find(":selected").val().split(' ')[0];
     
      $(this).parent().parent().parent().each(function(i, v) {  
        
            $(this).children('.adv-filter-input').hide();
            $(this).children('.adv-filter-match-type').hide();
            $(this).children('.adv-filter-comparison-match-type').hide();
            $(this).children('.adv-filter-comparison-boolean').hide();
            $(this).children('.adv-filter-keyword-category').hide();
            $(this).children('.adv-filter-website-category').hide();
            $(this).children('.adv-filter-status-code').hide();         
            $(this).children('.adv-filter-is').hide();
            
         
          if(val == 'comparison-boolean'){
               
                $(this).children('.adv-filter-comparison-boolean').show();
               
          }else if(val == 'match-type'){
                $(this).children('.adv-filter-input').show(); 
                $(this).children('.adv-filter-match-type').show();
               
          }else if(val == 'comparison-match-type'){
              
                $(this).children('.adv-filter-input').show();                
                $(this).children('.adv-filter-comparison-match-type').show();
               
          }else if(val == 'website-category'){
                $(this).children('.adv-filter-is').show();
                $(this).children('.adv-filter-website-category').show();
               
          }else if(val == 'keyword-category'){
                $(this).children('.adv-filter-is').show();
                $(this).children('.adv-filter-keyword-category').show();
              
          }else if(val == 'status-code'){
                $(this).children('.adv-filter-is').show();
                $(this).children('.adv-filter-status-code').show();
                
          }
      });
    });
}
function advFilterValidate(){
  
  var valid = true;
    $('.adv-filter-group div').each(function(i, v) {   
            if($(this).children('.adv-filter-input').is(":visible")){   
             
                if($(this).children('.adv-filter-input').val()==''){
                    valid = false;
                    $(this).children('.adv-filter-input').addClass('error');
                   
                }else{
                   
                    $(this).children('.adv-filter-input').removeClass('error');
                  
                }
            }
    });
    return valid;
   
}
function addAdvFilterClick(){
        $(".themed select.with-search").select2("destroy"); //remove select2 theme
        var adv_filter_group = $('.adv-filter-group').html(); //grab unmodified HTML
       
        $('.adv-filter-group:last').after('<div class="adv-filter-and">And</div><div class="adv-filter-group row-fluid">'+adv_filter_group+'</div>'); //apply copied HTML after last
        $('.adv-filter-group:last').children('div').find('.adv-filter').hide();
        $('.adv-filter-group:last').children('div').find('.adv-filter-include-exclude').show();
        $('.adv-filter-group:last').children('div').find('.adv-filter-match-type').show();
        $('.adv-filter-group:last').children('div').find('.adv-filter-dim-met').show();
        $('.adv-filter-group:last').children('div').find('.adv-filter-input').show();
        
        
        $(".themed select.with-search").select2(); //add select2 ththeme
        
        addRemoveAdvFilterGroup();
        removeAdvFilterGroup();
        setSelectedAdvFilter();
        advFilterDimMetSelect();     
}
function deleteAdvFilter(){
    $('#delete-adv-filter').click(function() {  
       //var filter_name = $(this).data('filter-name');
       var user = userData();
       var filter_name =  $('#adv-filter-save-form').val();
       $('#adv-filter-save-form').val('');
       var domain = getDomain();
            $.ajax({
                type: "POST",
                cache: true,
                url: 'http://'+domain+'/do_audit.php',
                data: ({action : 'get_save_filter', profile_uuid:user.profile_uuid}),
                  success: function(jsonToBeParsed){     
                      var parsedJson = $.parseJSON(jsonToBeParsed);
                      $.each(parsedJson, function(name, v) {
                         // $.each(v, function(i2, v2) {
                             
                              if(name == filter_name){
                                  //$('#adv-filter-container').load('htmlblocks/adv_filter.htm');
                                 
                                  delete parsedJson[name];
                                 saveJSON =  $.toJSON( parsedJson );
                                  
                                   $.ajax({
                                    type: "POST",                
                                    url: 'http://'+domain+'/do_audit.php',                
                                    data: ({filter_history_code : saveJSON, action : 'save_filter', profile_uuid:user.profile_uuid}),
                                     success: function(){
                                      
                                        initAdvSearch();    
        
                                        addRemoveAdvFilterGroup();
                                        removeAdvFilterGroup();
                                        setSelectedAdvFilter();
                                        advFilterDimMetSelect();   
                                        $(".themed select.with-search").select2("destroy"); //remove select2 theme
                                        $(".themed select.with-search").select2(); //add select2 ththeme
                                    }
                                    });	
                                  
                              }
                          
                          //});
                      });
                  }
                 
            });
        
         return false;
    });
}
function getLastAdvFilter(){
    var filter_uuid = $('#filter_uuid').data('uuid');
    
    if(filter_uuid){
        var domain = getDomain();
        $.ajax({
            type: "POST",
            cache: true,
            url: 'http://'+domain+'/do_audit.php',
            data: ({filter_uuid: filter_uuid, action : 'get_last_filter'}),
              success: function(jsonToBeParsed){      
                   $(".themed select.with-search").select2("destroy"); //add select2 ththeme
                   rebuildFilter(jsonToBeParsed, 'last');	
                   $(".themed select.with-search").select2(); //add select2 ththeme
              }//success

                       
                  
        });//ajax
    }
}
function rebuildFilter(jsonToBeParsed, filter_name){
    var i=0;
    if(jsonToBeParsed){ 
                       var parsedJson = $.parseJSON(jsonToBeParsed);
                          //console.log(parsedJson);
                          var html = $('#adv-filter-container .adv-filter-group:eq(0)').html();
                          $('#adv-filter-container').empty();
                          
                          $.each(parsedJson, function(name, v) {
                              //for each saved filter
                             // console.log(name+' -1-> '+v);
                              
                              if(name == filter_name){
                              
                               $.each(v, function(i2, v2) {
                                   
                                     // console.log(i2+' -2-> '+v2);
                                     
                                        
                                                   
                                              //add first template to empty container
                                                $('#adv-filter-container').append('<div class="adv-filter-group row-fluid">'+html+'</div>');
                                                
                                            // if(i >= 1){

                                                $(".adv-filter-group:eq("+i+")").after('<div class="adv-filter-and">And</div>');
                                           // }
                                    
                                            $(".adv-filter-group:eq("+i+") div .adv-filter-input").hide();
                                            $(".adv-filter-group:eq("+i+") div .adv-filter-match-type").hide();
                                            $(".adv-filter-group:eq("+i+") div .adv-filter-comparison-match-type").hide();
                                            $(".adv-filter-group:eq("+i+") div .adv-filter-comparison-boolean").hide();
                                            $(".adv-filter-group:eq("+i+") div .adv-filter-keyword-category").hide();
                                            $(".adv-filter-group:eq("+i+") div .adv-filter-website-category").hide();
                                            $(".adv-filter-group:eq("+i+") div .adv-filter-status-code").hide();         
                                            $(".adv-filter-group:eq("+i+") div .adv-filter-is").hide();
                                    
                                      $.each(v2, function(i3, v3) {
                                              
                                              // console.log(i3 +' --> '+v3);
                                               
                                              
                                              $(".adv-filter-group:eq("+i+") div .adv-filter-"+i3+" option[value='"+v3+"']").attr("selected","selected"); 
                                               $(".adv-filter-group:eq("+i+") div .adv-filter-"+i3+"").show();
                                                                                                    
                                              if(i3 == 'input'){   
                                                $('.adv-filter-group:eq('+i+') div .adv-filter-input').val(v3); 
                                              }
                                              
                                              

                                            

                                      })//each3
                                    //saveObj[i] = new Object({'Unnamed':parsedJson[key]});
                                    
                                     
                                     i++;
                                     
                               })//each2
                               
                               $('.adv-filter-and:last').remove();
                                    
                                    $(".themed select.with-search").select2(); //add select2 ththeme

                                    addRemoveAdvFilterGroup();
                                    removeAdvFilterGroup();
                                    setSelectedAdvFilter();
                                    advFilterDimMetSelect(); 
                                    
                              }//if not filter_name 
                                 
                                
                               })//each1
                       }//if json
}
function getSavedAdvSearch(){
   
    $('#saved-filters-list .btn-group .btn').on("click",function(){
    
//        $.each(parsedJson, function(i, v) {
//                          $.each(v, function(i2, v2) {
//                              
//                          });
//        });
//    
//        return;
        
        var filter_name = $(this).text();
        $('#adv-filter-save-form').val(filter_name);
        
        
    
    $(".themed select.with-search").select2("destroy"); //remove select2 theme
        var domain = getDomain();
        var user = userData(); 
            $.ajax({
                type: "POST",
                cache: true,
                url: 'http://'+domain+'/do_audit.php',
                data: ({action : 'get_save_filter', profile_uuid:user.profile_uuid}),
                  success: function(jsonToBeParsed){                 
                       rebuildFilter(jsonToBeParsed, filter_name);	
                       
                            }//success

                       
                  
        });//ajax
        
       

        
     });//click
}
function getURLParameters(url)
{
	
    var result = {};
		var searchIndex = url.indexOf("?");
		if (searchIndex == -1 ) return result;
    var sPageURL = url.substring(searchIndex +1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++)
    {    	
        var sParameterName = sURLVariables[i].split('=');      
        result[sParameterName[0]] = sParameterName[1];
    }
    return result;
}
function auditCopyToClipboard(){    
    $('.dropdown-toggle-clipboard').click(function() {       
        var text = $(this).parent().parent().parent().children('button').text().trim();
        copyToClipboard(text);   
        return false;
    });
}
function iResize() {
    document.getElementById('window-pane').style.height = 
    document.getElementById('window-pane').contentWindow.document.body.offsetHeight + 'px';
}
function trim(string){
    if (!string.trim()) {        
        return string.replace(/^\s+|\s+$/g,'');     
    }else{
        return string.trim()
    }
}
function urlFormatResult(url) {
    var table;
    table = '<table><tr><td>'+url.urlsource+'</td></tr></table>';
    return table;
}

function urlFormatSelection(url) {   
   
    $("#window-pane").attr("srcdoc", "<img src='http://"+getDomain()+"/img/loaders/type1/light/32.gif' />");   
    
    var style = $('#style').prop("checked");
   
    var domain = url.domain;
    var user = userData();
    var urlsource = url.urlsource;
    $.ajax({        
        type: "POST",
        url: 'http://'+getDomain()+'/do_window.php',
        data: ({profile_uuid: user.profile_uuid, urlsource : urlsource, domain:domain, action: 'load', style:style}),
        success: function(html){              


        $("#window-pane").attr("srcdoc", html);

        $('iframe').load(function() {
            //setTimeout(iResize, 50);
            // Safari and Opera need a kick-start.
            var iSource = document.getElementById('window-pane').src;
            document.getElementById('window-pane').src = '';
            document.getElementById('window-pane').src = iSource;        
        });
        
        $.ajax({        
            type: "POST",
            url: 'http://'+getDomain()+'/do_window.php',
            data: ({profile_uuid: user.profile_uuid, urlsource : urlsource, domain:domain, action: 'domain', style:style}),
            success: function(html){ 

                $("#domain-info").attr("srcdoc", html);           

            return false;
            }
        });

        return false;
        }
    });

    return url.urlsource;
}
$(document).ready( function() { 
    
    
    
    //console.log($.urlParam('AnchorText'));
    //jQuery.parseParams(document.location.search)
//    var params = getURLParameters(window.location.href)
//    if($(params).length){
//        for (var paramName in params){
//            console.log(paramName +" is " + decodeURI(params[paramName]));
//
//        }
//    }
    var url = document.location.toString();
  
    if(url.indexOf('filter-check')>0){
       var filter_uuid = $('#filter_uuid').data('uuid');
       var pagename = $('#pagename').data('pagename');
       if(filter_uuid){
           var user = userData();
           $.blockUI({message: '<h1><img src="http://'+getDomain()+'/img/loaders/type1/light/24.gif" /> Processing filter...</h1>'}); 
           $.ajax({
                type: "POST",
                url: 'http://'+getDomain()+'/do_filter_check.php',
                data: ({action:'check-filter',filter_uuid : filter_uuid, profile_uuid:user.profile_uuid}),
                   success: function(jsonToBeParsed){
                            var parsedJson = $.parseJSON(jsonToBeParsed);
                            if(parsedJson.result=='success'){            
                                $(document).ajaxStop($.unblockUI); 
                                //console.log('http://'+getDomain()+'/'+pagename+'/'+user.profile_uuid+'/'+filter_uuid+'/');
                                window.location.href = 'http://'+getDomain()+'/'+pagename+'/'+user.profile_uuid+'/'+filter_uuid+'/';
                            }else{
                                //redirect
                                console.log("FAIL");
                            }
                    }
            });
        }
    }
    if($('#etl-summary').length){
        
        var etl_summary;

        /* Add the events etc before DataTables hides a column */
        $("thead input").keyup(function() {
                /* Filter on the column (the index) of this element */
                etl_summary.fnFilter(this.value, oTable.oApi._fnVisibleToColumnIndex(etl_summary.fnSettings(), $("thead input").index(this)));
        });

       

        etl_summary = $('#etl-summary').dataTable({
                "sDom" : "t<'row-fluid dt-footer'<'span6 visible-desktop'i><'span6'p>>",
                "oLanguage" : {
                        "sSearch" : "Search all columns:"
                },
                "bSortCellsTop" : true
        }); 
        
        $('body').on('click','#etl-summary a[data-toggle="modal"]',function(e){
        var id= $(this).parent().parent().attr('id');
        
                $.ajax({
                    type: "POST",
                    url: 'http://'+getDomain()+'/admin/do_etl.php',
                    data: ({id : id, action:'log_message'}),
                        success: function(html){
                             $("#process-output-contents").html(html);
                        }
                });
          
         e.preventDefault();
        });
       
    }
    
    if($('#add_new_profile').length){
       
       $("#profile-website-url").alphanumeric({allow:".-"});
       
        $("#profile-website-url").change(function(){
        
        $("#domain_msg").html("<img src='http://"+getDomain()+"/img/loaders/type1/light/24.gif' /> checking...");   
        var url = $("#profile-website-url").val();
        var noprotocol = url.replace('http://', '').replace(/^\s+|\s+$/g,'');
        var domain = noprotocol.replace('www.', '').replace(/^\/+|\/+$/g,'');
        
            $.ajax({
                type: "POST",
                url: 'http://'+getDomain()+'/do_profile.php',
                data: ({domain : domain, action:'domain_check'}),
                    success: function(jsonToBeParsed){
                        var parsedJson = $.parseJSON(jsonToBeParsed);
                        if(parsedJson.result=='success'){                            
                            $("#profile-website-url").val(noprotocol);                            
                            $(".profile-name input").val(domain);
                             $("#domain_msg").html("<i class=\"cus-accept\"></i> Domain valid.");
                        }
                        else{
                            $("#domain_msg").html("<i class=\"cus-cross\"></i> Not a recognised domain.");
                        }
                    }
            });
            
            
        });        
    }
    var user = userData();
    $("#window-dropdown").select2({ 
        width: "100%",
        placeholder: "Search for a url",       
        ajax: {            
            id: function(obj) {
                
              return obj.id; // use slug field for id
           },
            url: 'http://'+getDomain()+'/do_window.php',
            dataType: 'json',
            quietMillis: 100,
            data: function (term, page) { // page is the one-based page number tracked by Select2
                return {
                    q: term, //search term
                    page_limit: 20, // page size
                    page: page, // page number                    
                    action: "list",
                    profile_uuid: user.profile_uuid
                };
            },
            results: function (data, page) {
                var more = (page * 10) < data.total; // whether or not there are more results available
                
                // notice we return the value of more so Select2 knows if more results can be loaded
                return {results: data.sites, more: more};
            }
        },
        formatResult: urlFormatResult, // omitted for brevity, see the source of this page
        formatSelection: urlFormatSelection, // omitted for brevity, see the source of this page
        dropdownCssClass: "bigdrop", // apply css that makes the dropdown taller
        escapeMarkup: function (m) { return m; } // we do not want to escape markup since we are displaying html in results
    });
    
   
     $('#window-menu a').click(function() {   
        
        var nostyle = $(this).data('nostyle');
        var domain = $(this).data('domain');
     var user = userData();
      var urlsource = $(this).data('urlsource');
       $.ajax({
            type: "POST",
            url: 'http://'+getDomain()+'/do_window.php',
            data: ({profile_uuid: user.profile_uuid, urlsource : urlsource, domain:domain, action: 'load', nostyle:nostyle}),
            success: function(html){              
               
              
                $("#window-pane").attr("srcdoc", html);
                
                $('iframe').load(function() {
                    //setTimeout(iResize, 50);
                    // Safari and Opera need a kick-start.
                    var iSource = document.getElementById('window-pane').src;
                    document.getElementById('window-pane').src = '';
                    document.getElementById('window-pane').src = iSource;
                    
                });
                
                  return false;
                
//                var iframe = document.createElement("iframe");
//                $('#navigator-window').html(iframe);
//                
//                var doc = iframe.document;
//                if(iframe.contentDocument){
//                    doc = iframe.contentDocument; // For NS6
//                }
//                else if(iframe.contentWindow){
//                    doc = iframe.contentWindow.document; // For IE5.5 and IE6
//                }
//                // Put the content in the iframe
//                doc.open();
//                doc.writeln(html);
//                doc.close();
//                
//                var storeArea = doc.getElementById("navigator-window");
//                $(storeArea).contents().find('body').html('Hey, i`ve changed content of <body>! Yay!!!');
              // $('#navigator-window').html('<body>'+html+'</body>'); 
              //$("#navigator-window").attr("src", "http://www.w3schools.com/");
              //var html = $("#navigator-window").contents().find('body').html('Hey, i`ve changed content of <body>! Yay!!!');
              //console.log(html);
              
            }

        }); 
        
       
       
    });
   // $('#navigator-window').attr("src", "http://www.w3schools.com/");
    
    $('#menu-control').click(function() {   
        $('aside').toggle('fast');
        var label = $(this).attr('class');
        if (label.indexOf("disabled") >= 0) { 
            $(this).removeClass("disabled");
        }else{
            $(this).addClass("disabled");
        }
        return false;
    });
    
    if($('#widget-id-summary-audit-filter').length){
        auditCopyToClipboard();

        setSelectedAdvFilter();

        doAdvSearch();

        saveAdvSearch();

        advFilterDimMetSelect();

        deleteAdvFilter();

        getLastAdvFilter();
    
    
   
       
    
    $('#add-adv-filter').click(function() {  
        addAdvFilterClick();
        
    });
   
    $('#adv-filter-save-form').alphanumeric({allow:" "});;    
    
   
              
    
       $('#list-of-previous-filters ul li a').click(function(e) {  
           
            setSavedFilter($(this).attr('id'));
            return false;
       });
          
    
    
  
    
    auditProgressSummaryTable();
   
    }
   
    if($("#show-hide-columns").length){
       
       
       var showhidecolumns = '';  
       $('#master-audit thead tr th').each(function() {                    
      
           var i = $(this).index()+1;
           var t = $(this).text();
           var heading = $('#master-audit tr th:nth-child('+i+')').text();
           if(i>=2){
                if(localStorage.getItem("masterAuditTableHide"+i)=="true"){
                    $('#master-audit tr th:nth-child('+i+')').hide();
                    $('#master-audit tr td:nth-child('+i+')').hide();
                    showhidecolumns += '<a href="#" data-master-index="'+i+'" title="Add '+heading+' Column"><span class="btn btn-small disabled">'+t+'</span></a> &nbsp;';
                }else{
                    showhidecolumns += '<a href="#" data-master-index="'+i+'" title="Remove '+heading+' Column"><span class="btn btn-small">'+t+'</span></a> &nbsp;';
                }
           }
       });
      
      
       $("#show-hide-columns").prepend('<p style="line-height:34px;">'+showhidecolumns+'</p>');// showhidecolumns.slice(0, -2)
            

       
        $("#show-hide-columns a").click(function() {   
           
             
            var i = $(this).data('master-index');
          var heading;
           var label = $(this).children('span').attr('class');
           if (label.indexOf("disabled") >= 0) {       
                heading = $('#master-audit tr th:nth-child('+i+')').text();
                $(this).prop('title', 'Remove '+heading+' Column');                
                $(this).children('span').removeClass("disabled");
                $('#master-audit tr th:nth-child('+i+')').show();
                $('#master-audit tr td:nth-child('+i+')').show();
              
                
                localStorage.removeItem("masterAuditTableHide"+i);
           }else{
                heading = $('#master-audit tr th:nth-child('+i+')').text();
                $(this).prop('title', 'Add '+heading+' Column');
                $(this).children('span').addClass('disabled');
                $('#master-audit tr th:nth-child('+i+')').hide();
                $('#master-audit tr td:nth-child('+i+')').hide();
              
                localStorage.setItem("masterAuditTableHide"+i, true);
           }
            
            return false;
         });
    }
  
   
  
   $('.form-horizontal .controls select').change(function() {
     
      var val = $(this).find(":selected").val();
      if(val =='OTHER'){
           //console.log($(this).parent().parent().parent().children('input').is( ":text" ));
          $(this).parent().parent().parent().children('input:text').removeClass('hidden');
      }
   });
   
   $('.source_delete_button').click(function(e) {
       
       
       
       var profile_name = $(this).parent().parent().children('td').eq(2).text();       
       
       var uuid = $(this).parent().parent().data('uuid');
              
       $('#profile-delete-confirm-msg').html("This will remove "+profile_name+" profile. Are you sure?  ");              
        
        $('#profile-delete-confirm').dialog({
          resizable: false,
          title: "Delete Profile",
          modal: true,
          buttons: {
            "Delete site profile": function() {
                var domain = getDomain();
                
                    $.ajax({
                        type: "POST",
                        url: 'http://'+domain+'/do_profile.php',
                        data: ({uuid : uuid, action: 'delete'}),
                        success: function(jsonToBeParsed){
                            var parsedJson = $.parseJSON(jsonToBeParsed);

                            if(parsedJson.result=='success'){                                                                
                                $('table#main-dashboard tbody tr[data-uuid="'+uuid+'"]').hide('slow').remove();                                
                            }
                            
                            if($('table#main-dashboard tbody tr').length==0){
                                $('table#main-dashboard').html('No profiles.').css({'text-align':'left','margin':'10px 0 0 10px'});
                            }
                            // console.log();

                        }

                    }); 
                
              $( this ).dialog( "close" );
            },
            Cancel: function() {
              $( this ).dialog( "close" );
            }
          }
        });
       
   });
   
   $('.saveChartImageWord').click(function(e) {  
      
        //saveAsImg(document.getElementById('word-cloud'));
            html2canvas(document.getElementById('word-cloud'), {
                onrendered: function(canvas) {
                  
                var imgData = canvas.toDataURL('image/png');

                // Replacing the mime-type will force the browser to trigger a download
                // rather than displaying the image in the browser window.
                window.location = imgData.replace('image/png', 'image/octet-stream');
                }
            });
    });
    
    if ($('#word-cloud').length){ 
        //#widget-id-summary-word-cloud.jarviswidget div div.inner-spacer div#word-cloud
        
    
        var data = new google.visualization.arrayToDataTable([  
                  ['All Links', 'Followed', 'No-Followed']
                ]);       

        var columnsTable = new google.visualization.DataTable();
        columnsTable.addColumn('number', 'colIndex');
        columnsTable.addColumn('string', 'colLabel');

        columnsTable.addRow([1, data.getColumnLabel(0)]);//total
        columnsTable.addRow([2, data.getColumnLabel(1)]);//followed
        columnsTable.addRow([3, data.getColumnLabel(2)]);//nofollowed

        var initState= {selectedValues: [data.getColumnLabel(0)]};


        var columnFilterWorldCloud = new google.visualization.ControlWrapper({
        controlType: 'CategoryFilter',        
        dataTable: columnsTable,
        options: {
            filterColumnLabel: 'colLabel',
            ui: {
                'labelStacking': 'vertical',        
                label: '',
                allowTyping: false,
                allowMultiple: false,
                allowNone: false,
                selectedValuesLayout: 'belowStacked'
            }
        },
        state: initState
        });

        columnFilterWorldCloud.setContainerId('word-cloud-colFilter');

        new google.visualization.events.addListener(columnFilterWorldCloud, 'statechange', function () {
            setWordCloud(columnFilterWorldCloud);
        });
         setWordCloud(columnFilterWorldCloud);
        columnFilterWorldCloud.draw();
        
        
        
        
        
        
    }//if word-cloud
   
   
    
   // Clear search form
    $.fn.autoClear = function () {
        $(this).each(function() {
            $(this).data("autoclear", $(this).attr("value"));
        });
        $(this)
            .bind('focus', function() {  
                if ($(this).attr("value") == $(this).data("autoclear")) {
                    $(this).attr("value", "");
                }
            })
            .bind('blur', function() {  
                if ($(this).attr("value") == "") {
                    $(this).attr("value", $(this).data("autoclear"));
                }
            });
        return $(this);
    }
    
    $('#add_new_profile #profile_name, #add_user_colaborate #email, form.form-register input#company, form.form-register input#fullname, form.form-signin input#user, form.form-register input#user, form.form-register input#pass, form.form-register input#conf_pass, form.form-register input#email, form.form-register input#conf_email').autoClear();
    

    if ($('.popover-js-validation').length){
        /* popovers */
        $('.popover-js-validation').popover({
           
          template: '<div class="popover"><div class="arrow"></div><div class="popover-inner validation"><div class="popover-content"><p></p></div></div></div>'}).popover('show');

    }
    
    $('#website_url').alphanumeric({allow:".:/-"});
    
    
    
    $('.logout').click(function(e) {     
        e.preventDefault();
        play_sound_message_box();
        bootbox.confirm("WARNING: Do you really want to log out?", function(result) {           
            
            if(result == true){
                var domain = getDomain();
                window.location.replace('http://'+domain+'/login/process.php');
            }else{
                return false;
            }

        });//result
    });
    
    $(".wrapper1").scroll(function(){
        $(".wrapper2")
            .scrollLeft($(".wrapper1").scrollLeft());
    });
    $(".wrapper2").scroll(function(){
        $(".wrapper1")
            .scrollLeft($(".wrapper2").scrollLeft());
    });
    
    $('#master-audit .checkall').on('click', function () {
                    
        $(this).closest('#master-audit').find(':checkbox').prop('checked', this.checked);
    });
    
    $(".whoisfancy, .inbox_display_fancy, .task_display_fancy").fancybox({
		maxWidth	: 800,
		maxHeight	: 600,
		fitToView	: false,
		width		: '70%',
		height		: '70%',
		autoSize	: false,
		closeClick	: false,
		openEffect	: 'none',
		closeEffect	: 'none'
	});
    
    
     
        /* each each column */    	
	if ($('#link-distributoin').length){
	
		var oTable;

		/* Add the events etc before DataTables hides a column */
		$("thead input").keyup(function() {
			/* Filter on the column (the index) of this element */
			oTable.fnFilter(this.value, oTable.oApi._fnVisibleToColumnIndex(oTable.fnSettings(), $("thead input").index(this)));
		});

		/*
		 * Support functions to provide a little bit of 'user friendlyness' to the textboxes
		 */
		$("thead input").each(function(i) {
			this.initVal = this.value;
		});

		$("thead input").focus(function() {
			if (this.className == "search_init") {
				this.className = "";
				this.value = "";
			}
		});

		$("thead input").blur(function(i) {
			if (this.value == "") {
				this.className = "search_init";
				this.value = this.initVal;
			}
		});

		oTable = $('#link-distributoin').dataTable({                       
			 "oTableTools": {
                                    "sSwfPath": 'http://'+getDomain()+"/js/include/assets/DT/swf/copy_csv_xls_pdf.swf",
                                    "aButtons": [

                                            // print layout
                                            {
                                                    "sExtends": "print",
                                                    "sButtonText": '<i class="cus-printer oTable-adjust"></i>'+" Print View"
                                            },
                                            //save as PDF
                                            {
                                                    "sExtends": "pdf",
                                                    "sPdfOrientation": "landscape",
                                                    "sPdfMessage": "Your custom message would go here.", /* custom message here */
                                                    "sButtonText": '<i class="cus-doc-pdf oTable-adjust"></i>'+" Save to PDF"
                                            },
                                            //save for excel
                                            {
                                                    "sExtends": "copy",
                                                    "sButtonText": '<i class="cus-doc-excel-table oTable-adjust"></i>'+" Copy for Excel"
                                            }
                                    ]
                            },
                           
                            "sDom": "<'row-fluid dt-header'<'span6'><'span6 hidden-phone'T>r>t<'row-fluid dt-footer'<'span6 visible-desktop'i><'span6'p>l>",//t<'row-fluid dt-footer'<'span6 visible-desktop'i><'span6'p>l>
                            "oLanguage" : {
                                    "sSearch" : "Search all columns:"
                            },        
			"bSortCellsTop" : true,
                        "aaSorting": [[ 1, "desc" ]],
                        "aoColumns": [
                            null,                            
                            {"asSorting": [ "desc", "asc", "asc" ], "sType": "numeric"},
                            {"asSorting": [ "desc", "asc", "asc" ], "sType": "numeric"},
                            {"asSorting": [ "desc", "asc", "asc" ], "sType": "numeric"},
                            {"asSorting": [ "desc", "asc", "asc" ], "sType": "numeric"},
                            {"asSorting": [ "desc", "asc", "asc" ], "sType": "numeric"},
                            {"asSorting": [ "desc", "asc", "asc" ], "sType": "numeric"},
                            {"asSorting": [ "desc", "asc", "asc" ], "sType": "numeric"},
                            {"asSorting": [ "desc", "asc", "asc" ], "sType": "numeric"},
                            {"asSorting": [ "desc", "asc", "asc" ], "sType": "numeric"},
                            {"asSorting": [ "desc", "asc", "asc" ], "sType": "numeric"},
                            {"asSorting": [ "desc", "asc", "asc" ], "sType": "numeric"},
                            {"asSorting": [ "desc", "asc", "asc" ], "sType": "numeric"},
                            {"asSorting": [ "desc", "asc", "asc" ], "sType": "numeric"},
                            {"asSorting": [ "desc", "asc", "asc" ], "sType": "numeric"},
                            {"asSorting": [ "desc", "asc", "asc" ], "sType": "numeric"}
                        ]
		}); 
	
	}// end if
    
    
    
      //link_action();
      
      add_team_member();
      
      sidebar_inbox_dismiss();
      
      
      
      upload_source_file();
    
      custom_tables();
      
      add_custom_keyword();
        
      
      
      view_messages();
      
      view_tasks();
      
      delete_message();
      
      delete_task();
      
      deleted_notice();
    
});
    function change_keyword_type(){
         $('#master-keywords tbody tr td input').change(function() {
             console.log($(this));
             var domain = getDomain();
             var keyword =  $(this).parent().parent().children().text().trim();
             
            $.ajax({
                type: "POST",
                url: 'http://'+domain+'/do_target_keywords.php',
                data: ({keyword : keyword, action:'type'}),
                 success: function(jsonToBeParsed){
                    var parsedJson = $.parseJSON(jsonToBeParsed);
                        
                      console.log(parsedJson);
                 }
            });
         });
    }
    function remove_keyword(){
       // $('#master-keywords tbody tr td').on('click', '.delete-keyword', function () {
    $('#master-keywords tbody tr td ul.action li a').click(function(e) {

       // $('.delete-keyword').click(function(e) {
            
            var type = $(this).text().trim();
            var action = $(this).attr('class').replace('keyword-','');
            var ref = $(this).parent().parent().parent().children().closest('button').children('span.keyword-status');
            //var anchor = $(this).parent().parent().parent().parent().parent().children('td:last-child').text();

           // console.log(type+' '+action);
          // console.log(ref);
          //console.log($(this).parent().parent().parent().parent().parent());
            var keyword = $(this).parent().parent().parent().parent().parent().data('keyword');           
            //var type = $(this).parent().parent().children().eq(1).text();
         
            var domain = getDomain();
            $.ajax({
                type: "POST",
                url: 'http://'+domain+'/do_target_keywords.php',
                data: ({keyword : keyword, action:action}),
                 success: function(jsonToBeParsed){
                    var parsedJson = $.parseJSON(jsonToBeParsed);
                        
                       if(parsedJson.result == 'removed'){
                           /*
                           $('#deleted-keywords').dataTable().fnAddData( [
                                keyword,
                                type,
                                '<i class=\"cus-accept add-keyword\" title=\"Add '+keyword+'\"></i>'
                            ], true );
                            */
                            //rownum=$('#deleted-keywords').dataTable().fnGetPosition(row.find("#master-keywords tr[data-keyword='"+keyword+"']")[0])[0]
                            
                            //var pos = $('#master-keywords').dataTable().fnGetPosition($("tr[data-keyword='"+keyword+"']")[0]);
                            //$('#master-keywords').dataTable().fnDeleteRow(pos);
                            
                            //$("#master-keywords tr[data-keyword='"+keyword+"']").dataTable().fnDeleteRow();
                            //add_deleted_keyword();
                            
                            aPos = $('#master-keywords').dataTable().fnGetPosition( $("#master-keywords tr[data-keyword='"+keyword+"']").children('td').get(2) );
                           // console.log(aPos);
                            aData = $('#master-keywords').dataTable().fnGetData( aPos[0] );
                           // console.log(aData);
                            var adata2 = $.parseHTML(aData[2]);
                            var status = $(adata2).children('button').children('span.keyword-status').text();  
                            //
                            switch(status){
                                    case 'ACTIVE':
                                    $(adata2).children('button').children('span.keyword-status').text('PAUSED');
                                break;
                                    case 'PAUSED':
                                    $(adata2).children('button').children('span.keyword-status').text('ACTIVE');
                                break;
                                default:
                                    return false;
                                }
                            //console.log($(adata2).children('button').children('span.keyword-status').text());
                            var html = $(adata2).html();
                            
                            $('#master-keywords').dataTable().fnUpdate( html, aPos[0], aPos[1]);
                            
                         // console.log(aData[2]);
                            // $('#master-keywords').dataTable().fnAddData(aData);
                           //  console.log($("#master-keywords tr[data-keyword='"+keyword+"']"));
                              //$("#master-keywords tr[data-keyword='"+keyword+"']").children('td').eq(2).text('PAUSED');
                              //$("#master-keywords tr[data-keyword='"+keyword+"']").children('td').eq(3).text('<i title="Add '+keyword+'" class="cus-accept add-keyword"></i>');
                              $('#master-keywords').dataTable().fnDraw();;
   
                  
                             
                              toastr.success('Success: '+keyword+' removed.');
                          }else{
                             toastr.error('Warning: There was an error.');
                         }
                           
                            
                           
                          
                       //location.reload();
                   
                   // console.log();
                    
                }
            });
        });
    }
    function add_deleted_keyword(){
        //$('.add-keyword').click(function(e) {
        $('#deleted-keywords tbody tr td').on('click', '.add-keyword', function () {
            
            var keyword = $(this).parent().parent().data('keyword');        
            var type = $(this).parent().parent().children().eq(1).text();
       
            var domain = getDomain();
            $.ajax({
                type: "POST",
                url: 'http://'+domain+'/do_target_keywords.php',
                data: ({keyword : keyword, action:"add_deleted"}),
                 success: function(jsonToBeParsed){
                    var parsedJson = $.parseJSON(jsonToBeParsed);
                        
                       if(parsedJson.result == 'added'){
                           $('#master-keywords').dataTable().fnAddData( [
                                keyword,
                                type,
                                '<i class=\"cus-cross delete-keyword\" title=\"Remove '+keyword+'\"></i>'
                            ], true );
                            
                             var pos = $('#deleted-keywords').dataTable().fnGetPosition($("#deleted-keywords tr[data-keyword='"+keyword+"']")[0]);
                            $('#deleted-keywords').dataTable().fnDeleteRow(pos);
                            
                              //$('#deleted-keywords').dataTable().fnDeleteRow("tr[data-keyword='"+keyword+"']");
                              
                              remove_keyword();
                              toastr.success('Success: '+parsedJson.keyword+' added.');
                          }else{
                             toastr.error('Warning: There was an error.');
                         }
                           
                            
                           
                          
                       //location.reload();
                   
                   // console.log();
                    
                }
            });
        });
    }
    
    function add_custom_keyword(){
        
        $('.add-custom-keyword').click(function(e) {
            var keyword = $('#custom-keyword').val();
           
            var domain = getDomain();
            $.ajax({
                type: "POST",
                url: 'http://'+domain+'/do_target_keywords.php',
                data: ({keyword : keyword, action:"add"}),
                 success: function(jsonToBeParsed){
                    var parsedJson = $.parseJSON(jsonToBeParsed);
                         if(parsedJson.result == 'added'){
                            $('#target-user-words tbody tr.first').after('<tr data-keyword="'+parsedJson.keyword+'"><td>'+parsedJson.keyword+'</td><td><i class="cus-cross delete-target-keyword" title="Remove '+parsedJson.keyword+'"></i></td></tr>');
                            remove_keyword();
                            toastr.success('Success: '+parsedJson.keyword+' added.');
                         }
                         else if(parsedJson.result == 'exists'){
                             toastr.warning('Error: '+parsedJson.keyword+' already in a list.');
                         }else{
                             toastr.error('Warning: There was an error.');
                         }
                       //location.reload();
                   
                   // console.log();
                    
                }
            });
            
        });
        
    }
    function table_refresh(){
        $("#table-refesh").click(function(e){           
            e.preventDefault();   
           for (var key in localStorage){
               
              if(key.indexOf('DataTables_audit-filter') !== -1){
                
                   localStorage.removeItem(key);
               }
            }
            window.location.reload(true);
           
           
        });
    }
    function custom_tables(){
        /* each each column */    	
          
          if($('#audit-filter').length){
              
              $('#audit-filter thead tr.filter th:first-child input').click(function(){
                 $('#audit-filter tbody tr td:first-child input').each(function( index ) {     
                     $(this).prop('checked', true);
                 } );
                  
              });
              
              
              $.fn.dataTableExt.oApi.fnReloadAjax = function ( oSettings, sNewSource, fnCallback, bStandingRedraw )
{
   
    // DataTables 1.10 compatibility - if 1.10 then versionCheck exists.
    // 1.10s API has ajax reloading built in, so we use those abilities
    // directly.
    if ( $.fn.dataTable.versionCheck ) {
        var api = new $.fn.dataTable.Api( oSettings );
 
        if ( sNewSource ) {
            api.ajax.url( sNewSource ).load( fnCallback, !bStandingRedraw );
        }
        else {
            api.ajax.reload( fnCallback, !bStandingRedraw );
        }
        return;
    }
 
    if ( sNewSource !== undefined && sNewSource !== null ) {
        oSettings.sAjaxSource = sNewSource;
    }
 
    // Server-side processing should just call fnDraw
    if ( oSettings.oFeatures.bServerSide ) {
        this.fnDraw();
        return;
    }
 
    this.oApi._fnProcessingDisplay( oSettings, true );
    var that = this;
    var iStart = oSettings._iDisplayStart;
    var aData = [];
 
    this.oApi._fnServerParams( oSettings, aData );
 
    oSettings.fnServerData.call( oSettings.oInstance, oSettings.sAjaxSource, aData, function(json) {
        /* Clear the old information from the table */
        that.oApi._fnClearTable( oSettings );
 
        /* Got the data - add it to the table */
        var aData =  (oSettings.sAjaxDataProp !== "") ?
            that.oApi._fnGetObjectDataFn( oSettings.sAjaxDataProp )( json ) : json;
 
        for ( var i=0 ; i<aData.length ; i++ )
        {
            that.oApi._fnAddData( oSettings, aData[i] );
        }
         
        oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
 
        that.fnDraw();
 
        if ( bStandingRedraw === true )
        {
            oSettings._iDisplayStart = iStart;
            that.oApi._fnCalculateEnd( oSettings );
            that.fnDraw( false );
        }
 
        that.oApi._fnProcessingDisplay( oSettings, false );
 
        /* Callback user function - for event handlers etc */
        if ( typeof fnCallback == 'function' && fnCallback !== null )
        {
            fnCallback( oSettings );
        }
    }, oSettings );
};
              
               
               var filter_uuid = $('#filter_uuid').data('uuid');
               var user = userData();
                    
               
                            
                    
               var audittable = $('#audit-filter').dataTable({
                        "oTableTools": {
                            "sSwfPath": 'http://'+getDomain()+"/js/include/assets/DT/swf/copy_csv_xls_pdf.swf",
                            "aButtons": [

                                    // print layout
                                    {
                                            "sExtends": "print",
                                            "sButtonText": '<i class="cus-printer oTable-adjust"></i>'+" Print View"
                                    },                                    
                                    //save for excel
                                    {
                                            "sExtends": "copy",
                                            "sButtonText": '<i class="cus-doc-excel-table oTable-adjust"></i>'+" Copy for Excel"
                                    }
                            ]
                           },
                        "bStateSave": true,   
                        "bProcessing": true,
                        "bServerSide": true,
                        "sAjaxSource": "http://"+getDomain()+"/do_audit_source.php?profile_uuid="+user.profile_uuid+'&filter_uuid='+filter_uuid, 
                        "sDom": "<'row-fluid dt-header'<'span6'><'span6'TC>r>t<'row-fluid dt-footer'<'span6 visible-desktop'i><'span6'p>l>",//t<'row-fluid dt-footer'<'span6 visible-desktop'i><'span6'p>l> 
                        "oLanguage" : {
                                "sSearch" : "Search all columns:"
                        },          
                        "bSortCellsTop" : true,
                        "bLengthChange" : true,                        
                        "iDisplayLength": 25,                        
                        "aoColumnDefs": [
                          {'bSortable': false, 'aTargets': [ 0 ]},
                          {'bSortable': true, 'aTargets': [ 1,26 ]},
                        ],
                        "sScrollX": "100%",
                        
                        "oColVis": {                               
                               
                               "aiExclude": [ 0 ],
                               "fnLabel": function ( index, title, th ) {
                                return title.replace('<br>', ' ');
                              }
                        },
                        "fnDrawCallback": function (o) {
                            
                                                      
                            $('.anchor_filter').click(function(e) {  
                                e.preventDefault();   
                                var anchor = $(this).data('anchor');
                                audittable.fnFilter(anchor, 23 );
                                $('#anchor_filter').val(anchor);
                            });
                            $('.ip_filter').click(function(e) {  
                                e.preventDefault();   
                                var ip = $(this).data('ip');
                                audittable.fnFilter(ip, 24 );
                                $('#ip_filter').val(ip);
                            });
                            $('.domain_filter').click(function(e) {  
                                e.preventDefault();   
                                var domain = $(this).data('domain');
                                audittable.fnFilter(domain, 26 );
                                $('#domain_filter').val(domain);
                            });
                            $('.source_filter').click(function(e) {  
                                e.preventDefault();   
                                var domain = $(this).data('source');
                                audittable.fnFilter(domain, 27 );
                                $('#source_filter').val(domain);
                            });
                            $('.target_filter').click(function(e) {  
                                e.preventDefault();   
                                var domain = $(this).data('target');
                                audittable.fnFilter(domain, 28 );
                                $('#target_filter').val(domain);
                            });
                            
                            $('#audit-filter tbody tr').each( function() {                                
                                var row = audittable.fnGetPosition($(this).children('td')[0]);
                                rowData = audittable.fnGetData(row[0]);                               
                                var gotten_domain = $('.get_domain', rowData[26]).text();                                                                
                                this.setAttribute( 'title', gotten_domain );
                            } );
                            
                            $('.remove, .nofollow, .anchor, .disavow_url, .ignore_url, .review').click(function(e) {                                   
                                
                                $(this).html('<img src="http://'+getDomain()+'/img/loaders/type1/light/12.gif">');   
                                e.preventDefault();            
                                var refresh = false;                                               
                                var class_name = $(this).attr('class');                                  
                                
                                //always do the first one
                                var link_uuid = $(this).parent().parent().children('td').eq(0).children('input').data('uuid');        
                                refresh = audit_link(link_uuid, class_name);
                                
                                var p = audittable.fnGetPosition( $(this).parent()[0] );
                               
                                $('#audit-filter tbody tr td:first-child input').each(function( index ) {                                    
                                    
                                    //if checked and skip the first one as it has already been dealt with
                                    if($(this).prop('checked')==true && index !== p[0]){
                                        var link_uuid = $(this).data('uuid');   
                                        $('#audit-filter tbody tr:eq('+index+') td:eq('+p[2]+')').html('<img src="http://'+getDomain()+'/img/loaders/type1/light/12.gif">'); 
                                        refresh = audit_link(link_uuid, class_name);
                                        
                                    }
                                });
                                
                                
                                if(refresh==true){
                                    //refresh the table outside of any loops so we only refresh once
                                    var oSettings = audittable.fnSettings();                 
                                    audittable.fnReloadAjax(oSettings.sAjaxSource);                                      
                                    auditProgressSummaryTable();
                                }
                                
                                $('input.master').prop('checked', false);//uncheck master tickbox
                                
                            });
                            
                            
                            $('.disavow_domain, .ignore_domain').click(function(e) {        
                                
                                e.preventDefault();                               
                                var link_uuid = $(this).parent().parent().children('td').eq(0).children('input').data('uuid');                                
                                var domain = $(this).parent().parent().children('td').eq(0).children('input').data('domain'); 
                                var p = audittable.fnGetPosition( $(this).parent()[0] );
                                
                                 $(this).html('<img src="http://'+getDomain()+'/img/loaders/type1/light/12.gif">'); 
                                    
                                     play_sound_message_box();
                                    var class_name = $(this).attr('class'); 
                                    
                                    $('#audit-filter tbody tr').each(function( index ) { 
                                        var row = audittable.fnGetPosition($(this).children('td')[0]);
                                        //var domaincol = $('td:eq(26)', this)
                                        //console.log(domaincol);
                                       
                                        var rowData  = audittable.fnGetData( row[0] );
                                        var gotten_domain = $('.get_domain', rowData[26]).text();   
                                        if(domain == gotten_domain){
                                            $('#audit-filter tbody tr:eq('+index+') td:eq('+p[2]+')').html('<img src="http://'+getDomain()+'/img/loaders/type1/light/12.gif">'); 
                                        }
                                    });
                                    
                                    bootbox.confirm('WARNING: This will effect all links from '+domain+'. Are you sure you want to do this?', function(result) {                                        
                                        if(result === true){ 
                                           action_domain(audittable, link_uuid, domain, class_name);                                         
                                        }

                                    });//result
                                    
                                });
                                //refresh the table
                                auditProgressSummaryTable();
                        },
                        "fnInitComplete": function(oSettings, json) {
                            auditCopyToClipboard(); 
                                 /* Apply the tooltips 
                                audittable.$('#audit-filter tbody tr').tooltip( {                                                                                                          
                                    "delay": 0,
                                    "track": true,
                                    "fade": 250
                                } );*/
                            
                               $('.disavow_domain_remove').click(function () {
                                 data = fnGetData($(this));
                                 console.log(data);
                               });
//                             $('#audit-filter tbody tr td').click(function () {
//                                 var posn = audittable.fnGetPosition( this )
//                                 var data = audittable.fnGetData( this );
//                                 var first = audittable.fnGetData( posn[0] );
//                                 console.log(posn);
//                                console.log(data);
//                                console.log($(this).parent().children('td').eq(0).children('input').data('id'));
//                                console.log(first);
//                                
//                            } );     
                               
                            var table = $('#audit-filter').DataTable();
                            $(".dataTables_scrollHeadInner table.table thead tr.filter th:nth-child(26)").each( function ( i ) {
                               i +=25;
                            var select = $('<select><option value="">Filter on:</option></select>')
                                .appendTo( this )
                                .on( 'change', function () {
                                    table.column( i )
                                        .search( $(this).val() )
                                        .draw();
                                } );

                            table.column( i ).data().unique().sort().each( function ( d, j ) {
                                select.append( '<option value="'+d+'">'+d+'</option>' )
                                } );
                            } );
                        },
                        "aoColumns": [
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,//{type: "number-range"},
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null
                        ]
                        })
//                        .columnFilter({sPlaceHolder: "head:after",
//                                                             aoColumns: [ 
//                                                                    null,
//                                                                    null,
//                                                                    null,
//                                                                    null,
//                                                                    null,
//                                                                    null,
//                                                                    null,
//                                                                    null,
//                                                                    null,
//                                                                    null,
//                                                                    null,
//                                                                    null,
//                                                                    null,
//                                                                    null,
//                                                                    null,//{type: "number-range"},
//                                                                    null,
//                                                                    null,
//                                                                    null,
//                                                                    null,
//                                                                    null,
//                                                                    null,
//                                                                    null,
//                                                                    null,
//                                                                    {type: "text"},
//                                                                    {type: "text"},
//                                                                    {type: "text"},
//                                                                    {type: "text"},
//                                                                    {type: "text"},
//                                                                    {type: "text"}
//                                                                    
//                                                                ]
//               });
               
            
            
            if(audittable.fnSettings().oInit.bStateSave == true){
                $('#widget-id-audit-table ').prepend("WARNING: Table state will be saved. <a href=\"\" id=\"table-refesh\">Click here</a> to refesh the table.");
                table_refresh();
            }
              
              
             $("thead tr.filter input").keyup( function () {
                /* Filter on the column (the index) of this element */ 
                var i = $("thead tr.filter input").index(this);
                var input2col = new Array();
                input2col[1] = 23;//anchor
                input2col[2] = 24;//ip
                input2col[3] = 26;//domain 
                input2col[4] = 27;//URLSource
                input2col[5] = 28;//URLTarget                   
                audittable.fnFilter( this.value, input2col[i] );//There are 23 columns without filters               
                
            } );
            var asInitVals = new Array();
            $("thead tr.filter input").each( function (i) {
                asInitVals[i] = this.value;
            } );

            $("thead tr.filter input").focus( function () {
                if ( this.className == "search_init" )
                {
                    this.className = "";
                    this.value = "";
                }
            } );

            $("thead tr.filter input").blur( function (i) {
                if ( this.value == "" )
                {
                    this.className = "search_init";
                    this.value = asInitVals[$("thead tr.filter input").index(this)];                    
                }
            } );
               
            $(".clear-filter").click(function(e) {   
                
                var col = $(this).parent().index();
                audittable.fnFilter("", $(this).parent().index(), false ); 
                //console.log($(this).parent().parent().children('th:eq('+col+')').children('input').index());
                var col2input = new Array();
                col2input[23] = 1;//anchor
                col2input[24] = 2;//ip
                col2input[26] = 3;//domain 
                col2input[27] = 4;//URLSource
                col2input[28] = 5;//URLTarget              
                $(this).parent().parent().children('th:eq('+col+')').children('input').val(asInitVals[col2input[col]]);
            });
            
            
            
          }
          
          if ($('#tasks-received, #tasks-deleted').length > 0){
	

		/* Add the events etc before DataTables hides a column */
		
                    
                    var received;
                    
                    var deleted;
                  
                     if ($('#tasks-received').length > 0){
                        $("thead input.received_init").keyup(function() {
                                /* Filter on the column (the index) of this element */
                                received.fnFilter(this.value, received.oApi._fnVisibleToColumnIndex(received.fnSettings(), $("thead input.received_init").index(this)));
                        });
                     }
                  
                    if ($('#tasks-deleted').length > 0){
                        $("thead input.tasks_init").keyup(function() {
                                /* Filter on the column (the index) of this element */
                                tasks.fnFilter(this.value, tasks.oApi._fnVisibleToColumnIndex(tasks.fnSettings(), $("thead input.deleted_init").index(this)));
                        });
                    }
                
                

		/*
		 * Support functions to provide a little bit of 'user friendlyness' to the textboxes
		 */
		$("thead input").each(function(i) {
			this.initVal = this.value;
		});

		$("thead input").focus(function() {
			if (this.className == "received_init" || this.className == "deleted_init") {
				this.className = "";
				this.value = "";
			}
		});

		$("thead input.received_init").blur(function(i) {
			if (this.value == "") {
				this.className = "received_init";
				this.value = this.initVal;
			}
		});
                
                $("thead input.deleted_init").blur(function(i) {
			if (this.value == "") {
				this.className = "deleted_init";
				this.value = this.initVal;
			}
		});
                
                 //https://www.datatables.net/usage/options
                   
                if ($('#tasks-received').length > 0){
                   
                    received = $('#tasks-received').dataTable({
                            "sDom" : "t<'row-fluid dt-footer'<'span6 visible-desktop'i><'span6'p>l>",
                            "oLanguage" : {
                                    "sSearch" : "Search all columns:"
                            },
                            "bSortCellsTop" : true,
                            "bLengthChange" : true,
                            "aoColumnDefs": [
                              {'bSortable': false, 'aTargets': [ 0 ]},{'bSortable': false, 'aTargets': [ 5 ]},
                           ]

                    }); 
                }
                 
                  if ($('#tasks-deleted').length > 0){
                    deleted = $('#tasks-deleted').dataTable({
                            "sDom" : "t<'row-fluid dt-footer'<'span6 visible-desktop'i><'span6'p>l>",
                            "oLanguage" : {
                                    "sSearch" : "Search all columns:"
                            },
                            "bSortCellsTop" : true,
                            "bLengthChange" : true,
                            //"bDestroy": true, //used when a new initialisation object is passed
                            "aoColumnDefs": [
                              {'bSortable': false, 'aTargets': [ 0 ]},
                           ]

                    }); 
                  }
                
               
	
	}// end if
          
        if ($('#email-inbox, #email-sent, #email-deleted').length > 0){
	

		/* Add the events etc before DataTables hides a column */
		
                    
                    var inbox;
                    var sent;
                    var deleted;
                  
                     if ($('#email-inbox').length > 0){
                        $("thead input.inbox_init").keyup(function() {
                                /* Filter on the column (the index) of this element */
                                inbox.fnFilter(this.value, inbox.oApi._fnVisibleToColumnIndex(inbox.fnSettings(), $("thead input.inbox_init").index(this)));
                        });
                     }
                   if ($('#email-sent').length > 0){
                        $("thead input.sent_init").keyup(function() {
                                /* Filter on the column (the index) of this element */
                                sent.fnFilter(this.value, sent.oApi._fnVisibleToColumnIndex(sent.fnSettings(), $("thead input.sent_init").index(this)));
                        });
                   }
                    if ($('#email-deleted').length > 0){
                        $("thead input.deleted_init").keyup(function() {
                                /* Filter on the column (the index) of this element */
                                deleted.fnFilter(this.value, deleted.oApi._fnVisibleToColumnIndex(deleted.fnSettings(), $("thead input.deleted_init").index(this)));
                        });
                    }
                
                

		/*
		 * Support functions to provide a little bit of 'user friendlyness' to the textboxes
		 */
		$("thead input").each(function(i) {
			this.initVal = this.value;
		});

		$("thead input").focus(function() {
			if (this.className == "inbox_init" || this.className == "sent_init" || this.className == "deleted_init") {
				this.className = "";
				this.value = "";
			}
		});

		$("thead input.inbox_init").blur(function(i) {
			if (this.value == "") {
				this.className = "inbox_init";
				this.value = this.initVal;
			}
		});
                $("thead input.sent_init").blur(function(i) {
			if (this.value == "") {
				this.className = "sent_init";
				this.value = this.initVal;
			}
		});
                $("thead input.deleted_init").blur(function(i) {
			if (this.value == "") {
				this.className = "deleted_init";
				this.value = this.initVal;
			}
		});
                if ($('#email-inbox').length > 0){
                    
                    //https://www.datatables.net/usage/options
                    inbox = $('#email-inbox').dataTable({
                            "sDom" : "t<'row-fluid dt-footer'<'span6 visible-desktop'i><'span6'p>l>",
                            "oLanguage" : {
                                    "sSearch" : "Search all columns:"
                            },
                            "bSortCellsTop" : true,
                            "bLengthChange" : true,
                            "aoColumnDefs": [
                              {'bSortable': false, 'aTargets': [ 0 ]},{'bSortable': false, 'aTargets': [ 6 ]},
                           ]

                    }); 
                }
                 if ($('#email-sent').length > 0){
                    sent = $('#email-sent').dataTable({
                            "sDom" : "t<'row-fluid dt-footer'<'span6 visible-desktop'i><'span6'p>l>",
                            "oLanguage" : {
                                    "sSearch" : "Search all columns:"
                            },
                            "bSortCellsTop" : true,
                            "bLengthChange" : true,
                            "aoColumnDefs": [
                              {'bSortable': false, 'aTargets': [ 0 ]},{'bSortable': false, 'aTargets': [ 6 ]},
                           ]

                    }); 
                 }
                  if ($('#email-deleted').length > 0){
                    deleted = $('#email-deleted').dataTable({
                            "sDom" : "t<'row-fluid dt-footer'<'span6 visible-desktop'i><'span6'p>l>",
                            "oLanguage" : {
                                    "sSearch" : "Search all columns:"
                            },
                            "bSortCellsTop" : true,
                            "bLengthChange" : true,
                            //"bDestroy": true, //used when a new initialisation object is passed
                            "aoColumnDefs": [
                              {'bSortable': false, 'aTargets': [ 0 ]},
                           ]

                    }); 
                  }
                
               
	
	}// end if
        
        if ($('#tld-filter').length >= 1){
	
		 
               

		/* Add the events etc before DataTables hides a column */
		
                    var tldTable;
                    
                    $("thead input").keyup(function() {
                            /* Filter on the column (the index) of this element */
                            tldTable.fnFilter(this.value, tldTable.oApi._fnVisibleToColumnIndex(tldTable.fnSettings(), $("thead input").index(this)));
                    });
                
                /*
		 * Support functions to provide a little bit of 'user friendlyness' to the textboxes
		 */
                
                    $("thead input").each(function(i) {
			this.initVal = this.value;
                    });

                    $("thead input").focus(function() {
                            if (this.className == "search_init") {
                                    this.className = "";
                                    this.value = "";
                            }
                    });

                    $("thead input").blur(function(i) {
                            if (this.value == "") {
                                    this.className = "search_init";
                                    this.value = this.initVal;
                            }
                    });
                    
//                    add_columns_for_expansion('#tld-filter');
//                    
//                    $('#tld-filter tbody td img').click(function(e) {
//                            var nTr = this.parentNode.parentNode;
//                           
//                            if ( this.src.match('details_close') )
//                            {
//                                    /* This row is already open - close it */
//                                    this.src = 'http://'+getDomain()+"/img/details_open.png";
//                                    tldTable.fnClose( nTr );
//                            }
//                            else
//                            {
//                                    /* Open this row */
//                                    this.src = 'http://'+getDomain()+"/img/details_close.png";
//                                    tldTable.fnOpen( nTr, fnFormatDetailsTld(tldTable, nTr), 'details' );
//                                    
//                            }
//                    } );
                    
                    var filter_uuid = $('#filter_uuid').data('uuid');
                    var user = userData();
                    
                     //https://www.datatables.net/usage/options
                    tldTable = $('#tld-filter').dataTable({
                            "oTableTools": {
				"sSwfPath": 'http://'+getDomain()+"/js/include/assets/DT/swf/copy_csv_xls_pdf.swf",
				"aButtons": [
                                        
					// print layout
					{
						"sExtends": "print",
						"sButtonText": '<i class="cus-printer oTable-adjust"></i>'+" Print View"
					},
					//save as PDF
					{
						"sExtends": "pdf",
						"sPdfOrientation": "landscape",
						"sPdfMessage": "Your custom message would go here.", /* custom message here */
						"sButtonText": '<i class="cus-doc-pdf oTable-adjust"></i>'+" Save to PDF"
					},
					//save for excel
					{
						"sExtends": "copy",
						"sButtonText": '<i class="cus-doc-excel-table oTable-adjust"></i>'+" Copy for Excel"
					}
				]
			},
                            "bProcessing": true,
                            "bServerSide": true,
                            "sAjaxSource": "http://"+getDomain()+"/do_tld_source.php?profile_uuid="+user.profile_uuid+'&filter_uuid='+filter_uuid, 
                            "sDom": "<'row-fluid dt-header'<'span6'><'span6 hidden-phone'T>r>t<'row-fluid dt-footer'<'span6 visible-desktop'i><'span6'p>l>",//t<'row-fluid dt-footer'<'span6 visible-desktop'i><'span6'p>l>
                            "oLanguage" : {
                                    "sSearch" : "Search all columns:"
                            },          
                            "bSortCellsTop" : true,
                            "bLengthChange" : true,
                            "aaSorting": [[ 3, "desc" ]],
                            "iDisplayLength": 25,
                            "aoColumns": [   
                                null,                                 
                               {"asSorting": [ "desc", "asc" ]},                                                    
                               null,
                               {"asSorting": [ "desc", "asc"], "sType": "numeric"},
                                {"asSorting": [ "desc", "asc" ], "sType": "numeric"},
                               {"asSorting": [ "desc", "asc" ], "sType": "numeric"},
                               {"asSorting": [ "desc", "asc" ], "sType": "numeric"}
                        ], 
                        "aoColumnDefs": [
                              {'bSortable': false, 'aTargets': [ 0,2 ]},
                           ],
                           "sScrollX": "100%"
                            

                    }).columnFilter({sPlaceHolder: "head:after",
                                                             aoColumns: [ 
                                                                    null, 
                                                                    {type: "text"}, 
                                                                    null,
                                                                    {type: "number-range"},
                                                                    {type: "number-range"},
                                                                    {type: "number-range"},
                                                                    {type: "number-range"}
                                                                    
                                                                ]
                });
                
//                .yadcf([                                                   
//                        {column_number : 3, filter_container_id:"tld_domains", filter_type: "range_number",ignore_char:","},
//                        {column_number : 4, filter_container_id:"tld_total", filter_type: "range_number",ignore_char:","},
//                        {column_number : 5, filter_container_id:"tld_followed", filter_type: "range_number", ignore_char: ","},
//                        {column_number : 6, filter_container_id:"tld_nofollowed", filter_type: "range_number",ignore_char:","}
//                        
//
//    
//                    ]);
                
                   
                
                     detailsAnchorsButton('#tld-filter', '.view_domains',  tldTable);  
                
               
	
	}// end if
        
        if ($('#depth-filter').length >= 1){
	
		 
               

		/* Add the events etc before DataTables hides a column */
		
                    var oTable;
                    
                    $("thead input").keyup(function() {
                            /* Filter on the column (the index) of this element */
                            oTable.fnFilter(this.value, oTable.oApi._fnVisibleToColumnIndex(oTable.fnSettings(), $("thead input").index(this)));
                    });
                
                /*
		 * Support functions to provide a little bit of 'user friendlyness' to the textboxes
		 */
                
                    $("thead input").each(function(i) {
			this.initVal = this.value;
                    });

                    $("thead input").focus(function() {
                            if (this.className == "search_init") {
                                    this.className = "";
                                    this.value = "";
                            }
                    });

                    $("thead input").blur(function(i) {
                            if (this.value == "") {
                                    this.className = "search_init";
                                    this.value = this.initVal;
                            }
                    });

                      filter_uuid = $('#filter_uuid').data('uuid');
                     user = userData();

                     //https://www.datatables.net/usage/options
                    oTable = $('#depth-filter').dataTable({
                            "oTableTools": {
				"sSwfPath": 'http://'+getDomain()+"/js/include/assets/DT/swf/copy_csv_xls_pdf.swf",
				"aButtons": [
                                        
					// print layout
					{
						"sExtends": "print",
						"sButtonText": '<i class="cus-printer oTable-adjust"></i>'+" Print View"
					},
					//save as PDF
					{
						"sExtends": "pdf",
						"sPdfOrientation": "landscape",
						"sPdfMessage": "Your custom message would go here.", /* custom message here */
						"sButtonText": '<i class="cus-doc-pdf oTable-adjust"></i>'+" Save to PDF"
					},
					//save for excel
					{
						"sExtends": "copy",
						"sButtonText": '<i class="cus-doc-excel-table oTable-adjust"></i>'+" Copy for Excel"
					}
				]
			},
                            "bProcessing": true,
                            "bServerSide": true,
                            "sAjaxSource": "http://"+getDomain()+"/do_depth_source.php?profile_uuid="+user.profile_uuid+'&filter_uuid='+filter_uuid, 
                            "sDom": "<'row-fluid dt-header'<'span6'><'span6 hidden-phone'T>r>t<'row-fluid dt-footer'<'span6 visible-desktop'i><'span6'p>l>",//t<'row-fluid dt-footer'<'span6 visible-desktop'i><'span6'p>l>
                            "oLanguage" : {
                                    "sSearch" : "Search all columns:"
                            },  
                            "bSortCellsTop" : true,
                            "bLengthChange" : true,
                            "aaSorting": [[ 2, "desc" ]],                            
                            "iDisplayLength": 25,                           
                            "aoColumns": [                                                      
                                null,  
                                null,                           
                                {"asSorting": [ "desc", "asc" ], "sType": "numeric"},
                                {"asSorting": [ "desc", "asc" ], "sType": "numeric"},
                                {"asSorting": [ "desc", "asc" ], "sType": "numeric"},
                                {"asSorting": [ "desc", "asc" ], "sType": "numeric"},
                                {"asSorting": [ "desc", "asc" ], "sType": "numeric"},
                                {"asSorting": [ "desc", "asc" ], "sType": "numeric"},
                                {"asSorting": [ "desc", "asc" ] , "sType": "numeric"}
                                
                           
                            ],
                             "aoColumnDefs": [
                              {'bSortable': false, 'aTargets': [ 0,1 ]},
                           ]

                    }).columnFilter({sPlaceHolder: "head:after",
                                                             aoColumns: [ 
                                                                    {type: "text"},                                                                     
                                                                    null,
                                                                    {type: "number-range"},
                                                                    {type: "number-range"},
                                                                    {type: "number-range"},
                                                                    {type: "number-range"},
                                                                    {type: "number-range"},
                                                                    {type: "number-range"},
                                                                    {type: "number-range"}
                                                                    
                                                                ]
                });
                
                   
                
               
	
	}// end if
    
        if ($('#master-keywords').length){
	
		 
               

		/* Add the events etc before DataTables hides a column */
		
                    var masterKWTable;
                    
                    $("thead input").keyup(function() {
                            /* Filter on the column (the index) of this element */
                            masterKWTable.fnFilter(this.value, masterKWTable.oApi._fnVisibleToColumnIndex(masterKWTable.fnSettings(), $("thead input").index(this)));
                    });
                
                    //remove_keyword();
                
                    change_keyword_type();
                
                    //https://www.datatables.net/usage/options
                    masterKWTable = $('#master-keywords').dataTable(
                    );
//                    {  
//                            "fnCreatedRow": function( nRow, aData, iDataIndex ) {                            
//                               
//                               // var text = $.parseHTML(aData[0]);                              
//                                //$(nRow).attr('data-keyword', $(text).text());
//                            },
//                            "oTableTools": {
//				"sSwfPath": 'http://'+getDomain()+"/js/include/assets/DT/swf/copy_csv_xls_pdf.swf",
//				"aButtons": [
//                                        
//					// print layout
//					{
//						"sExtends": "print",
//						"sButtonText": '<i class="cus-printer oTable-adjust"></i>'+" Print View"
//					},
//					//save as PDF
//					{
//						"sExtends": "pdf",
//						"sPdfOrientation": "landscape",
//						"sPdfMessage": "Your custom message would go here.", /* custom message here */
//						"sButtonText": '<i class="cus-doc-pdf oTable-adjust"></i>'+" Save to PDF"
//					},
//					//save for excel
//					{
//						"sExtends": "copy",
//						"sButtonText": '<i class="cus-doc-excel-table oTable-adjust"></i>'+" Copy for Excel"
//					}
//				]
//			},
//                            "sDom": "<'row-fluid dt-header'<'span12 hidden-phone'T>r>t<'row-fluid dt-footer'<'span6 visible-desktop'i><'span6'p>l>",//t<'row-fluid dt-footer'<'span6 visible-desktop'i><'span6'p>l>
//                            "oLanguage" : {
//                                    "sSearch" : "Search all columns:"
//                            },                               
//                            "bSortCellsTop" : true,
//                            "bLengthChange" : true,
//                            "aaSorting": [],
//                            "iDisplayLength": 25
//                            "aoColumns": [   
//                                {"asSorting": [ "desc", "asc" ], "sType": "string"},  
//                                {"asSorting": [ "desc", "asc" ], "sType":"numeric"},  
//                                {"asSorting": [ "desc", "asc" ], "sType":"numeric"}, 
//                               {"asSorting": [ "desc", "asc" ], "sType": "dropdown"},
//                               
//                        ],
//                        "aoColumnDefs": [
//                              {'bSortable': false, 'aTargets': [ 1 ]},
//                              {
//                                'aTargets': [1],    // Column number which needs to be modified
//                                'fnRender': function (o, v) {   // o, v contains the object and value for the column
//                                    return '<input type="checkbox" id="someCheckbox" name="someCheckbox" />';
//                                }
//                              }
//                           ],
                        
                         

                  //  });
                    
//                    .columnFilter({sPlaceHolder: "head:after",
//                             aoColumns: [ 
//                                    {type: "text"},
//                                    null,
//                                    null,
//                                     null
//
//                                ]
//                });
             
                
                    
            
              
	
	}// end if
        
        
        
        if ($('#user-keywords').length >= 1){
	
		 
               

		/* Add the events etc before DataTables hides a column */
		
                    var userKWTable;
                    
                    $("thead input").keyup(function() {
                            /* Filter on the column (the index) of this element */
                            userKWTable.fnFilter(this.value, userKWTable.oApi._fnVisibleToColumnIndex(userKWTable.fnSettings(), $("thead input").index(this)));
                    });
                
                    //https://www.datatables.net/usage/options
                    userKWTable = $('#user-keywords').dataTable({                       
                            "oTableTools": {
				"sSwfPath": 'http://'+getDomain()+"/js/include/assets/DT/swf/copy_csv_xls_pdf.swf",
				"aButtons": [
                                        
					// print layout
					{
						"sExtends": "print",
						"sButtonText": '<i class="cus-printer oTable-adjust"></i>'+" Print View"
					},
					//save as PDF
					{
						"sExtends": "pdf",
						"sPdfOrientation": "landscape",
						"sPdfMessage": "Your custom message would go here.", /* custom message here */
						"sButtonText": '<i class="cus-doc-pdf oTable-adjust"></i>'+" Save to PDF"
					},
					//save for excel
					{
						"sExtends": "copy",
						"sButtonText": '<i class="cus-doc-excel-table oTable-adjust"></i>'+" Copy for Excel"
					}
				]
			},
                            "sDom": "<'row-fluid dt-header'<'span12 hidden-phone'T>r>t<'row-fluid dt-footer'<'span6 visible-desktop'i><'span6'p>l>",//t<'row-fluid dt-footer'<'span6 visible-desktop'i><'span6'p>l>
                            "oLanguage" : {
                                    "sSearch" : "Search all columns:"
                            },                               
                            "bSortCellsTop" : true,
                            "bLengthChange" : true,
                            "aaSorting": [],
                            "iDisplayLength": 25,
                           "aoColumns": [   
                                {"asSorting": [ "desc", "asc" ], "sType": "string"},  
                                {"asSorting": [ "desc", "asc" ], "sType":"unshift"},  
                                {"asSorting": [ "desc", "asc" ], "sType":"unshift"}, 
                               {"asSorting": [ "desc", "asc" ], "sType": "dropdown"},
                               
                        ],
                        "aoColumnDefs": [
                              {'bSortable': false, 'aTargets': [ 2 ]},
                           ],
                        
                           "sScrollX": "100%"

                    }).columnFilter({sPlaceHolder: "head:after",
                             aoColumns: [ 
                                    {type: "text"},
                                    null,
                                    null

                                ]
                });
             
                
                    
            
              
	
	}// end if
    
    
        if ($('#anchors-filter').length){
	
		 
               

		/* Add the events etc before DataTables hides a column */
		
                    var anchorTable;
                    
                    $("thead input").keyup(function() {
                            /* Filter on the column (the index) of this element */
                            anchorTable.fnFilter(this.value, anchorTable.oApi._fnVisibleToColumnIndex(anchorTable.fnSettings(), $("thead input").index(this)));
                    });
                
                /*
		 * Support functions to provide a little bit of 'user friendlyness' to the textboxes
		 */
                
                    $("thead input").each(function(i) {
			this.initVal = this.value;
                    });

                    $("thead input").focus(function() {
                            if (this.className == "search_init") {
                                    this.className = "";
                                    this.value = "";
                            }
                    });

                    $("thead input").blur(function(i) {
                            if (this.value == "") {
                                    this.className = "search_init";
                                    this.value = this.initVal;
                            }
                    });

                    
                
                    $('#anchors-filter tbody tr td ul.dropdown-menu li a').click(function(e) {
                       
                        var type = $(this).text().trim();
                        var action = $(this).attr('class').replace('anchor-','');
                        var ref = $(this).parent().parent().parent().children().closest('button').children('span.anchor-type');
                        var anchor = $(this).parent().parent().parent().parent().parent().children('td:last-child').text();
                       
                        
                        var domain = getDomain();
                            $.ajax({
                                type: "POST",
                                cache: true,
                                url: 'http://'+domain+'/do_anchors.php',
                                data: ({anchor : anchor, action : action}),
                                 success: function(jsonToBeParsed){
                                    var parsedJson = $.parseJSON(jsonToBeParsed);


                                    if(parsedJson.result=='added' || parsedJson.result=='removed'){
                                        if(action == 'add'){                            
                                           switch(type){
                                                case 'Target':
                                                ref.text('BRAND');
                                            break;
                                                case 'Brand':
                                                ref.text('TARGET');
                                            break;
                                            default:
                                                return false;
                                            }
                                        }else if(action == 'remove'){    
                                           
                                          ref.text('UNCLASSIFIED');
                                        }
                                    }
                                }
                        });	
                        
                        return false;
                    });
                    
                    
                    var filter_uuid = $('#filter_uuid').data('uuid');
                    var user = userData();
                    //https://www.datatables.net/usage/options
                    anchorTable = $('#anchors-filter').dataTable({                       
                              "oTableTools": {
                                    "sSwfPath": 'http://'+getDomain()+"/js/include/assets/DT/swf/copy_csv_xls_pdf.swf",
                                    "aButtons": [

                                            // print layout
                                            {
                                                    "sExtends": "print",
                                                    "sButtonText": '<i class="cus-printer oTable-adjust"></i>'+" Print View"
                                            },
                                            //save as PDF
                                            {
                                                    "sExtends": "pdf",
                                                    "sPdfOrientation": "landscape",
                                                    "sPdfMessage": "Your custom message would go here.", /* custom message here */
                                                    "sButtonText": '<i class="cus-doc-pdf oTable-adjust"></i>'+" Save to PDF"
                                            },
                                            //save for excel
                                            {
                                                    "sExtends": "copy",
                                                    "sButtonText": '<i class="cus-doc-excel-table oTable-adjust"></i>'+" Copy for Excel"
                                            }
                                    ]
                            },
                            "bProcessing": true,
                            "bServerSide": true,
                            "sAjaxSource": "http://"+getDomain()+"/do_anchors_source.php?profile_uuid="+user.profile_uuid+'&filter_uuid='+filter_uuid, 
                            "fnServerData": function ( sSource, aoData, fnCallback ) {
                                    /* Add some extra data to the sender */
                                    aoData.push( {"sean": "100"} );                                    
                                    $.getJSON( sSource, aoData, function (json) { 
                                            /* Do whatever additional processing you want on the callback, then tell DataTables */    
                                                                                       
                                            fnCallback(json)
                                    } );
                            },
                            "sDom": "<'row-fluid dt-header'<'span6'><'span6 hidden-phone'T>r>t<'row-fluid dt-footer'<'span6 visible-desktop'i><'span6'p>l>",//t<'row-fluid dt-footer'<'span6 visible-desktop'i><'span6'p>l>
                            "oLanguage" : {
                                    "sSearch" : "Search all columns:"
                            },                               
                            "bSortCellsTop" : true,
                            "bLengthChange" : true,
                            "aaSorting": [[ 1, "desc" ]],
                            "iDisplayLength": 25,
                            "aoColumns": [   
                                null, 
                               {"asSorting": [ "desc", "asc" ], "sType": "numeric"},                                                    
                               {"asSorting": [ "desc", "asc" ], "sType": "numeric"},
                                {"asSorting": [ "desc", "asc" ], "sType": "numeric"},
                               {"asSorting": [ "desc", "asc" ], "sType": "numeric"},                              
                               {"asSorting": [ "desc", "asc" ]},
                               {"asSorting": [ "desc", "asc" ]}
                               
                        ],
                        
                           "sScrollX": "100%"

                    }).columnFilter({sPlaceHolder: "head:after",
                                                             aoColumns: [ 
                                                                    null, 
                                                                    {type: "number-range"},
                                                                    {type: "number-range"},
                                                                    {type: "number-range"}, 
                                                                    {type: "number-range"},                                                             
                                                                    {type: "text"},
                                                                    {type: "text"}
                                                                ]
                });
//                .yadcf([                            
//                        {column_number : 1, filter_container_id:"anchor_domains", filter_type: "range_number",ignore_char:","},
//                        {column_number : 2, filter_container_id:"anchor_domains_pc", filter_type: "range_number",ignore_char:"%"},
//                        {column_number : 3, filter_container_id:"anchor_pages", filter_type: "range_number", ignore_char: ","},
//                        {column_number : 4, filter_container_id:"anchor_pages_pc", filter_type: "range_number",ignore_char:"%"}
//
//    
//                    ]);
                  
                    detailsAnchorsButton('#anchors-filter', '.view_domains',  anchorTable);  
                    
               
                
                    
            
              
	
	}// end if
    
        if ($('#sitewide-filter').length >= 1){
	

               

		/* Add the events etc before DataTables hides a column */
		
                    var oTable;
                    
                    $("thead input").keyup(function() {
                            /* Filter on the column (the index) of this element */
                            oTable.fnFilter(this.value, oTable.oApi._fnVisibleToColumnIndex(oTable.fnSettings(), $("thead input").index(this)));
                    });
                
                /*
		 * Support functions to provide a little bit of 'user friendlyness' to the textboxes
		 */
                
                    $("thead input").each(function(i) {
			this.initVal = this.value;
                    });

                    $("thead input").focus(function() {
                            if (this.className == "search_init") {
                                    this.className = "";
                                    this.value = "";
                            }
                    });

                    $("thead input").blur(function(i) {
                            if (this.value == "") {
                                    this.className = "search_init";
                                    this.value = this.initVal;
                            }
                    });

                    filter_uuid = $('#filter_uuid').data('uuid');
                    user = userData();
                
                    //https://www.datatables.net/usage/options
                    oTable = $('#sitewide-filter').dataTable({                       
                            "oTableTools": {
				"sSwfPath": 'http://'+getDomain()+"/js/include/assets/DT/swf/copy_csv_xls_pdf.swf",
				"aButtons": [
                                        
					// print layout
					{
						"sExtends": "print",
						"sButtonText": '<i class="cus-printer oTable-adjust"></i>'+" Print View"
					},
					//save as PDF
					{
						"sExtends": "pdf",
						"sPdfOrientation": "landscape",
						"sPdfMessage": "Your custom message would go here.", /* custom message here */
						"sButtonText": '<i class="cus-doc-pdf oTable-adjust"></i>'+" Save to PDF"
					},
					//save for excel
					{
						"sExtends": "copy",
						"sButtonText": '<i class="cus-doc-excel-table oTable-adjust"></i>'+" Copy for Excel"
					}
				]
			},
                            "bProcessing": true,
                            "bServerSide": true,
                            "sAjaxSource": "http://"+getDomain()+"/do_sitewide_source.php?action=sitewide&profile_uuid="+user.profile_uuid+'&filter_uuid='+filter_uuid, 
                            "sDom": "<'row-fluid dt-header'<'span6'><'span6 hidden-phone'T>r>t<'row-fluid dt-footer'<'span6 visible-desktop'i><'span6'p>l>",//t<'row-fluid dt-footer'<'span6 visible-desktop'i><'span6'p>l>
                            "oLanguage" : {
                                    "sSearch" : "Search all columns:"
                            },                               
                            "bSortCellsTop" : true,
                            "bLengthChange" : true,
                            "aaSorting": [[ 3, "desc" ]],
                            "iDisplayLength": 10,
                            "aoColumns": [    
                                null, 
                               {"asSorting": [ "desc", "asc", "asc" ]},
                                null,                           
                               {"asSorting": [ "desc", "asc", "asc" ], "sType": "numeric"},
                                {"asSorting": [ "desc", "asc", "asc" ], "sType": "numeric"},
                               {"asSorting": [ "desc", "asc", "asc" ], "sType": "numeric"},
                               null,
                               {"asSorting": [ "desc", "asc", "asc" ]},
                               {"asSorting": [ "desc", "asc", "asc" ]}
                        ],
                        "aoColumnDefs": [
                              {'bSortable': false, 'aTargets': [ 0,2,6 ]},
                           ],
                           "sScrollX": "100%"

                    }).columnFilter({sPlaceHolder: "head:after",
                                                             aoColumns: [ 
                                                                null, 
                                                                {type: "text"},
                                                                null, 
                                                                {type: "number-range"},
                                                                {type: "number-range"},
                                                                {type: "number-range"},
                                                                null,
                                                                {type: "text"},
                                                                {type: "text"}
                                                                ]
                });
                
//                .yadcf([                            
//                        {column_number : 3, filter_container_id:"filter_total", filter_type: "range_number",ignore_char:","},
//                        {column_number : 4, filter_container_id:"filter_followed", filter_type: "range_number", ignore_char: ","},
//                        {column_number : 5, filter_container_id:"filter_nofollowed", filter_type: "range_number", ignore_char: ","}    
//
//    
//                    ]);
    
               
                
                 
                    
                   
            
              
	
	}// end if
      
	if ($('#cblock-filter, #ip-filter').length >= 2){
	
		 
               

		/* Add the events etc before DataTables hides a column */
		
                    var ipTable;
                    var cblockTable;
                    
                    $("thead input").keyup(function() {
                            /* Filter on the column (the index) of this element */
                            ipTable.fnFilter(this.value, ipTable.oApi._fnVisibleToColumnIndex(ipTable.fnSettings(), $("thead input").index(this)));
                    });
                    $("thead input").keyup(function() {
                            /* Filter on the column (the index) of this element */
                            cblockTable.fnFilter(this.value, cblockTable.oApi._fnVisibleToColumnIndex(cblockTable.fnSettings(), $("thead input").index(this)));
                    });
                
                /*
		 * Support functions to provide a little bit of 'user friendlyness' to the textboxes
		 */
                
                    $("thead input").each(function(i) {
			this.initVal = this.value;
                    });

                    $("thead input").focus(function() {
                            if (this.className == "search_init" || this.className == "cblock_search_init") {
                                    //this.className = "";
                                    this.value = "";
                            }
                            
                    });

                    $("thead input").blur(function(i) {
                            if (this.value == "") {
                                    //this.className = "search_init";
                                    this.value = this.initVal;
                            }
                    });

                    //add_columns_for_expansion('#ip-filter'); 
                    //add_columns_for_expansion('#cblock-filter');
                   
                    /* Add event listener for opening and closing details
                     * Note that the indicator for showing which row is open is not controlled by DataTables,
                     * rather it is done here
                     */
                   
                    
                    filter_uuid = $('#filter_uuid').data('uuid');
                    user = userData();
                    
                    //https://www.datatables.net/usage/options
                    ipTable = $('#ip-filter').dataTable({
                            "oTableTools": {
				"sSwfPath": 'http://'+getDomain()+"/js/include/assets/DT/swf/copy_csv_xls_pdf.swf",
				"aButtons": [
                                        
					// print layout
					{
						"sExtends": "print",
						"sButtonText": '<i class="cus-printer oTable-adjust"></i>'+" Print View"
					},
					//save as PDF
					{
						"sExtends": "pdf",
						"sPdfOrientation": "landscape",
						"sPdfMessage": "Your custom message would go here.", /* custom message here */
						"sButtonText": '<i class="cus-doc-pdf oTable-adjust"></i>'+" Save to PDF"
					},
					//save for excel
					{
						"sExtends": "copy",
						"sButtonText": '<i class="cus-doc-excel-table oTable-adjust"></i>'+" Copy for Excel"
					}
				]
			},
                            "bProcessing": true,
                            "bServerSide": true,
                            "sAjaxSource": "http://"+getDomain()+"/do_ip_source.php?action=ip&profile_uuid="+user.profile_uuid+'&filter_uuid='+filter_uuid, 
                            "sDom": "<'row-fluid dt-header'<'span6'><'span6 hidden-phone'T>r>t<'row-fluid dt-footer'<'span6 visible-desktop'i><'span6'p>l>",//t<'row-fluid dt-footer'<'span6 visible-desktop'i><'span6'p>l>
                            "oLanguage" : {
                                    "sSearch" : "Search all columns:"
                            },
                            "bSortCellsTop" : true,
                            "bLengthChange" : true,
                            "aaSorting": [[ 3, "desc" ]],
                            "iDisplayLength": 25,
                            "aoColumns": [  
                                 {'bSortable':false}, 
                                 {'asSorting': [ "desc", "asc" ]}, 
                                 {'bSortable':false} ,                           
                                {"asSorting": [ "desc", "asc" ], "sType": "numeric"},
                                {"asSorting": [ "desc", "asc" ], "sType": "numeric"},
                                {"asSorting": [ "desc", "asc" ], "sType": "numeric"}
                            ]

                    }).columnFilter({sPlaceHolder: "head:after",
                                                             aoColumns: [ 
                                                                null, 
                                                                {type: "text"},
                                                                null,                                                                
                                                                {type: "number-range"},
                                                                {type: "number-range"},
                                                                {type: "number-range"}
                                                                ]
                    });
//                    .yadcf([                            
//                        {column_number : 3, filter_container_id:"ip_total", filter_type: "range_number",ignore_char:","},
//                        {column_number : 4, filter_container_id:"ip_followed", filter_type: "range_number", ignore_char: ","},
//                        {column_number : 5, filter_container_id:"ip_nofollowed", filter_type: "range_number", ignore_char: ","}    
//
//    
//                    ]);
			
                    detailsAnchorsButton('#ip-filter', '.view_domains',  ipTable);  
                        
                    filter_uuid = $('#filter_uuid').data('uuid');
                    user = userData();
                    
                    //https://www.datatables.net/usage/options
                    cblockTable = $('#cblock-filter').dataTable({
                            "oTableTools": {
				"sSwfPath": 'http://'+getDomain()+"/js/include/assets/DT/swf/copy_csv_xls_pdf.swf",
				"aButtons": [
                                        
					// print layout
					{
						"sExtends": "print",
						"sButtonText": '<i class="cus-printer oTable-adjust"></i>'+" Print View"
					},
					//save as PDF
					{
						"sExtends": "pdf",
						"sPdfOrientation": "landscape",
						"sPdfMessage": "Your custom message would go here.", /* custom message here */
						"sButtonText": '<i class="cus-doc-pdf oTable-adjust"></i>'+" Save to PDF"
					},
					//save for excel
					{
						"sExtends": "copy",
						"sButtonText": '<i class="cus-doc-excel-table oTable-adjust"></i>'+" Copy for Excel"
					}
				]
			},
                            "bProcessing": true,
                            "bServerSide": true,
                            "sAjaxSource": "http://"+getDomain()+"/do_ip_source.php?action=cblock&profile_uuid="+user.profile_uuid+'&filter_uuid='+filter_uuid, 
                            "sDom": "<'row-fluid dt-header'<'span6'><'span6 hidden-phone'T>r>t<'row-fluid dt-footer'<'span6 visible-desktop'i><'span6'p>l>",//t<'row-fluid dt-footer'<'span6 visible-desktop'i><'span6'p>l>
                            "oLanguage" : {
                                    "sSearch" : "Search all columns:"
                            },
                            "bSortCellsTop" : true,
                            "bLengthChange" : true,
                            "aaSorting": [[ 3, "desc" ]],
                            "iDisplayLength": 25,
                            "aoColumns": [  
                                 null, 
                                {"asSorting": [ "desc", "asc" ]}, 
                                null,                           
                                {"asSorting": [ "desc", "asc" ], "sType": "numeric"},
                                {"asSorting": [ "desc", "asc" ], "sType": "numeric"},
                                {"asSorting": [ "desc", "asc" ], "sType": "numeric"}
                            ],
                            "aoColumnDefs": [                                
                              {'bSortable': false, 'aTargets': [ 0,2 ]},
                           ]

                    }).columnFilter({sPlaceHolder: "head:after",
                                                             aoColumns: [ 
                                                                null, 
                                                                {type: "text"},
                                                                null, 
                                                                {type: "number-range"},
                                                                {type: "number-range"},
                                                                {type: "number-range"}
                                                                ]
                    });
//                    .yadcf([                            
//                        {column_number : 3, filter_container_id:"cblock_total", filter_type: "range_number",ignore_char:","},
//                        {column_number : 4, filter_container_id:"cblock_followed", filter_type: "range_number", ignore_char: ","},
//                        {column_number : 5, filter_container_id:"cblock_nofollowed", filter_type: "range_number", ignore_char: ","}    
//
//    
//                    ]);
                    
                    detailsAnchorsButton('#cblock-filter', '.view_domains',  cblockTable);  
                    
                    
				
                    
                
               
	
	}// end if
        
    }
    
    // post-submit callback 
    function showResponse(responseText, statusText, xhr, $form)  { 
        // for normal html responses, the first argument to the success callback 
        // is the XMLHttpRequest object's responseText property 

        // if the ajaxForm method was passed an Options Object with the dataType 
        // property set to 'xml' then the first argument to the success callback 
        // is the XMLHttpRequest object's responseXML property 

        // if the ajaxForm method was passed an Options Object with the dataType 
        // property set to 'json' then the first argument to the success callback 
        // is the json data object returned by the server 
        $("#bar").width('100%');
        $("#percent").html('100%');
        //console.log('status: ' + statusText + '\n\nresponseText: \n' + responseText + '\n\nThe output div should have already been updated with the responseText.'); 
    } 

    // pre-submit callback 
    function showRequest(formData, jqForm, options) { 
        
        
        if(formData[0].value == '' || formData[1].value == '' || formData[2].value == '' || formData[3].value == '' || formData[4].value == '' ){
            $("#message").html("<font color='red'> ERROR: Missing parameters</font>");
            return false;
        }
        
        /*
         *1423353601
         1 megabyte = 1,048,576 
         500mb x (1,048,576 bytes/1mb) = 524,288,000 bytes
         */
        // formData is an array; here we use $.param to convert it to a string to display it 
        // but the form plugin does this for you automatically when it submits the data 
        
        //var queryString = $.param(formData); 
        
        // jqForm is a jQuery object encapsulating the form element.  To access the 
        // DOM element for the form do this: 
        //var formElement = jqForm[0]; 
        
        
        
        var filesize = formData[0].value.size;
        var max_file_size = formData[3].value;
        //var sizemb = precise_round(filesize / 1048576, 2);
        
        //console.log(sizemb+'MB '+filesize +'>'+ max_file_size);
        
        if(filesize > max_file_size){
            //console.log('file too big');
            $("#message").html("<font color='red'> ERROR: file size too big. Max upload size of 500MB accepted.</font>");
            return false;
        }
        
        //var filenamebits = $('#source_upload_form :file').fieldValue()[0].split('.'); get the filename from the formData object
        var filenamebits = formData[0].value.name.split('.');
        
        var filenamelength = filenamebits.length;
        var suffix = filenamebits[filenamelength-1];
        
        if(suffix == 'gz' || suffix == 'rar' ){
            var suffix2 = filenamebits[filenamelength-2];
            if(suffix2 !== 'csv'){
                $("#message").html("<font color='red'> ERROR: incorrect file type. Only csv, gz, rar or zip accepted for upload.</font>");
                return false;
            }else{
                 suffix2 += '.'+suffix;
            }
        }
        
//        if(filenamebits[2]){
//            //handles csv.gz
//            suffix += '.'+filenamebits[2];
//        }
       
        if(suffix !== 'csv' && suffix !== 'csv.gz' && suffix !== 'gz' && suffix !== 'rar' ){  //&& suffix !== 'tsv'
            //console.log(suffix);
            //console.log('wrong file type');
            $("#message").html("<font color='red'> ERROR: incorrect file type. Only csv, gz, rar or zip accepted for upload.</font>");
            return false;
        }
       
        var filetype = formData[0].value.type;
        if(filetype !== 'text/csv' && filetype !== 'application/x-gzip-compressed' && ( filetype !== '' && suffix == 'rar' ) ){//&& filetype !== ''
            //console.log('incorrect filetype');
            $("#message").html("<font color='red'> ERROR: incorrect file type. Only csv, gz, rar or zip accepted for upload.</font>");
            return false;
        }
       
        //console.log('About to submit: \n\n' + queryString); 

        // here we could return false to prevent the form from being submitted; 
        // returning anything other than false will allow the form submit to continue 
        return true; 
    } 

    function upload_source_file(){
        
        var options = { 
            beforeSubmit:  showRequest,  // pre-submit callback 
            beforeSend: function() 
            {
                $("#progress").show();
                //clear everything
                $("#bar").width('0%');
                $("#message").html("");
                $("#percent").html("0%");
            },
            uploadProgress: function(event, position, total, percentComplete) 
            {
                //if(percentComplete == '100')percentComplete = randomFromInterval(50,80);//there may be a couple of seconds processing time to check the files on the server               
                if(percentComplete == '100')percentComplete = '99';
                
                $("#bar").width(percentComplete+'%');
                $("#percent").html(percentComplete+'%');

            },
            success:  showResponse,  // pre-submit callback            
            complete: function(response) 
            {
                $("#message").html("<font color='green'>"+response.responseText+"</font>");
                $("#bar").width('100%');
                $("#percent").html('100%');
            },
            error: function()
            {
                $("#message").html("<font color='red'> ERROR: unable to upload files</font>");

            }
        }
        $('.source_upload_button').click(function(e) {
            
            //var profile_id = $(this).data('profile-id');   
            var uuid = $(this).parent().parent().data('uuid');
            var source = $(this).data('source');              
            
            $('#upload_source').val(source).attr('selected', 'selected');
            
            $('#uuid').val(uuid);

            $("#source_upload_form").ajaxForm(options);
            
        });
        
        $('.source_upload_reset').click(function(e) {
            var profile_id = $(this).parent().parent().attr('id');
            //console.log($(this).parent().parent());
            var domain = getDomain();
            $.ajax({
                type: "POST",
                url: 'http://'+domain+'/do_source_reset.php',
                data: ({profile_id : profile_id}),
                 success: function(jsonToBeParsed){
                    var parsedJson = $.parseJSON(jsonToBeParsed);
                                       
                    if(parsedJson.result=='reset'){
                       location.reload();
                    }
                   // console.log();
                    
                }
            });
            
        });
        
        
    }

    

    function sidebar_inbox_dismiss(){
        $('div.mini-inbox div.alert button.close').click(function(e) { 
            var domain = getDomain();
           //console.log();
            var inbox_id = $(this).parent().attr('id');
            $.ajax({
                    type: "GET",
                    url: 'http://'+domain+'/do_inbox.php',
                    data: ({ajax : true, inbox_id : inbox_id, action : 'read'}),
                     success: function(jsonToBeParsed){
                        var parsedJson = $.parseJSON(jsonToBeParsed);
                        
                        if(parsedJson.result=='count'){ 
                            $('.mailbox li#'+parsedJson.inbox_id).remove();
                            $('.mail-sticker').html(parsedJson.count);
                        }
                    }
                });
                
        });
    }
    
    
    

    function add_team_member(){
        $('#add_team_member').click(function(e) {   
            
            e.preventDefault();
            var email = $('#email').val();
            var profile_id = $('#add_user_colaborate #profile_id option:selected').val();
            var domain = getDomain();     
            
            $.ajax({
                    type: "GET",
                    url: 'http://'+domain+'/do_team.php',
                    data: ({ajax : true, email : email, profile_id : profile_id, action : 'add'}),
                                      
                    success: function(jsonToBeParsed){
                        var parsedJson = $.parseJSON(jsonToBeParsed);
                        $('#add_user_colaborate .message').html('');
                        if(parsedJson.result=='error'){                            
                            $('#add_user_colaborate .message ').append('<div class="widget alert alert-error adjusted"><i class="cus-cross-octagon"></i><strong>'+parsedJson.description+'</strong><br/></div>')
                        }else{                            
                            $('#add_user_colaborate .message ').append('<div class="widget alert alert-success adjusted"><i class="cus-accept"></i><strong>'+parsedJson.description+'</strong><br/></div>')
                        }
                    }

                });
                return false;
            
        });
        return false;
    }

    function audit_link(link_uuid, action){
         var user = userData();
         $.ajax({
            type: "GET",
            url: 'http://'+getDomain()+'/do_audit.php',
            data: ({profile_uuid:user.profile_uuid, link_uuid : link_uuid, action:action}),

            success: function(jsonToBeParsed){  

             var parsedJson = $.parseJSON(jsonToBeParsed);
               // console.log(parsedJson.result);
                if(parsedJson.result=='success'){
                    return true;
                }else{
                    return false;
                }
            }
         });
         return true;
    }

    function audit_link2(ref, action, link_id){
            
            var domain = getDomain();               
            var row = $(ref).parent().parent();
                $.ajax({
                    type: "GET",
                    url: 'http://'+domain+'/do_audit.php',
                    data: ({ajax : true, link_id : link_id, action:action}),
                                      
                    success: function(jsonToBeParsed){  
                        
                     var parsedJson = $.parseJSON(jsonToBeParsed);
                       // console.log(parsedJson.result);
                        if(parsedJson.result=='added'){
                            // console.log();
                            
                            //set attributes on ROW
                            row.data("status", 'audited').attr('data-status','audited').removeClass('error').removeClass('warning').addClass('success');                            
                            
                           
                            //Update icon on clicked element
                            $(ref).html("<i class=\"cus-accept\"></i>").parent().data("status", 'on').attr('data-status','on'); 
                            //console.log($(ref));
                            //Update ROW visual
                            row.children('td.audit_flag').html("<i class=\"cus-accept\"></i>");   
                            
                            //console.log((ref.parent().parent().children('td.audit_flag')));
                            //toastr.success('Success: Link flagged.'); 
                            
                        }else if(parsedJson.result=='removed'){
                           
                           //$('tr#'+parsedJson.link_id+' td a.remove').html("<i class=\"cus-cross\"></i>").parent().removeClass('audited');                               
                         //  console.log(ref);
                          
                           //Update icon on clicked element
                           $(ref).html("<i class=\"cus-cross\"></i>").parent().data("status", 'off').attr('data-status','off'); 
                           
                           var remove = true;
                           
                           //Iterate through the row TDs to establish of any other audit flags are raised
                           row.find('td').each(function( index ) {
                               
                                    if($(this).data('status')=='on'){
                                        remove = false;                                    
                                        //return false;
                                    }else if(remove != false){
                                        remove = true;
                                    }                                  
                               
                           });                           
                           
                           if(remove == true){
                                
                                //set attributes on ROW
                                row.data("status", 'outstanding').attr('data-status','outstanding').removeClass('warning').removeClass('success').addClass('error');  
                                
                                //Update ROW visual
                                row.children('td.audit_flag').html("<i class=\"cus-cross\"></i>");
                           }
                           //toastr.warning('Warning: Link removed from \'Removal List\'.');
                        }
                    }

                });
               
                auditProgressSummaryTable();
                return false;
        }
        
        function review_link(oTable, link_uuid){
            var user = userData();            
            $.ajax({
                    type: "GET",
                    url: 'http://'+getDomain()+'/do_audit.php',
                    data: ({profile_uuid:user.profile_uuid, link_uuid : link_uuid, action:"review"}),
                                      
                    success: function(jsonToBeParsed){  
                        
                     var parsedJson = $.parseJSON(jsonToBeParsed);
                   
                        if(parsedJson.result=='success'){
                            var oSettings = oTable.fnSettings();                 
                            oTable.fnReloadAjax(oSettings.sAjaxSource);
                        }
                    }
            });
        }
        
        function review_link2(ref, link_id){
            var domain = getDomain();               
            var row = $(ref).parent().parent();
             //console.log(row);
                $.ajax({
                    type: "GET",
                    url: 'http://'+domain+'/do_audit.php',
                    data: ({ajax : true, link_id : link_id, action:"review"}),
                                      
                    success: function(jsonToBeParsed){  
                        
                     var parsedJson = $.parseJSON(jsonToBeParsed);
                   
                        if(parsedJson.result=='added'){
                            
                            //set attributes on ROW
                            row.data("status", 'audited').attr('data-status','audited').removeClass('error').removeClass('success').addClass('warning'); 
                          
                          // console.log(row);
                            $(ref).html("<i class=\"cus-accept\"></i>"); 
                            
                            toastr.success('Success: Link flagged for further review.');
                            
                        }else if(parsedJson.result=='removed'){
                           
                            $(ref).html("<i class=\"cus-cross\"></i>");  
                            
                            //set attributes on ROW
                            row.data("status", 'outstanding').attr('data-status','outstanding').removeClass('error').removeClass('success').addClass('warning');  
                            
                            toastr.warning('Warning: Link removed from \'Review List\'.');
                        }
                    }

                });
                auditProgressSummaryTable();
                return false;
        }
        
        function delete_message(){
            $('#email-inbox tbody tr td i.delete, #email-sent tbody tr td i.delete').click(function(e) { 
                 var ref = $(this);
                 var inbox_id = ref.parent().parent().attr('id');
                 var domain = getDomain();  
                 $.ajax({
                    type: "GET",
                    url: 'http://'+domain+'/do_inbox.php',
                    data: ({action : 'delete', inbox_id : inbox_id}),
                                      
                    success: function(jsonToBeParsed){  
                        
                     var j = $.parseJSON(jsonToBeParsed);
                   
                        if(j.result=='success'){    
                           var id = ref.parent().parent().parent().parent().attr('id');
                           
                           $(".ll_inbox tbody tr#"+j.inbox_id).remove();  
                                    
                           if(ref.parent().length == 1){                               
                               $('table#'+id+' tbody').append($('<tr>').append($('<td colspan="7">').append('No messages.')   )  );
                           }
                           toastr.success('Success: message deleted.');
                            return false;
                            
                        }else if(parsedJson.result=='error'){
                           
                            console.log('error');
                            return false;
                        }
                    }
                   
                });
                
            });
        }
        
        function delete_task(){
             $('#tasks-received tbody tr td i.delete').click(function(e) { 
                 var ref = $(this);
                 var task_id = ref.parent().parent().attr('id');
                 var domain = getDomain();  
                 $.ajax({
                    type: "GET",
                    url: 'http://'+domain+'/do_tasks.php',
                    data: ({action : 'delete', task_id : task_id}),
                                      
                    success: function(jsonToBeParsed){  
                        
                     var j = $.parseJSON(jsonToBeParsed);
                   
                        if(j.result=='success'){    
                           var id = ref.parent().parent().parent().parent().attr('id');
                            
                           $(".ll_tasks tbody tr#"+j.task_id).remove();  
                                    
                           if(ref.parent().length == 1){                               
                               $('table#'+id+' tbody').append($('<tr>').append($('<td colspan="7">').append('No messages.')   )  );
                           }
                           toastr.success('Success: message deleted.');
                            return false;
                            
                        }else if(parsedJson.result=='error'){
                           
                            console.log('error');
                            return false;
                        }
                    }
                   
                });
             });
        }
        
        function view_tasks(){
            $('.ll_tasks tbody tr td a.task_display').click(function(e) { 
                var task_id = $(this).parent().parent().attr('id');
                
                var domain = getDomain();  
                $.ajax({
                    type: "GET",
                    url: 'http://'+domain+'/do_tasks.php',
                    data: ({action : 'view', task_id : task_id}),
                                      
                    success: function(jsonToBeParsed){  
                        
                     var parsedJson = $.parseJSON(jsonToBeParsed);
                   
                        if(parsedJson.result=='success'){
                           $('#task_display h3.subject').html(parsedJson.subject); 
                           $('#task_display p.message').html(parsedJson.message);
                           $('#task_display p.status').html('Status: '+parsedJson.status+'%');
                           $('#task_display p.profile_name').html('Profile: '+parsedJson.profile_name);
                           $('.ll_tasks tbody tr td a img').attr('src', 'http://'+domain+'/img/email-read.png');
                           
                            return false;
                            
                        }else if(parsedJson.result=='error'){
                           
                            console.log('error');
                            return false;
                        }
                    }
                   
                });
                
            });
        }
        
        function view_messages(){
            $('.ll_inbox tbody tr td a.inbox_display').click(function(e) { 
                var inbox_id = $(this).parent().parent().attr('id');
                var domain = getDomain();  
              
                $.ajax({
                    type: "GET",
                    url: 'http://'+domain+'/do_inbox.php',
                    data: ({action : 'view', inbox_id : inbox_id}),
                                      
                    success: function(jsonToBeParsed){  
                        
                     var parsedJson = $.parseJSON(jsonToBeParsed);
                   
                        if(parsedJson.result=='success'){
                           $('#inbox_display h3.subject').html(parsedJson.subject); 
                           $('#inbox_display p.message').html(parsedJson.message);
                           $('.ll_inbox tbody tr td img').attr('src', 'http://'+domain+'/img/email-read.png');
                            return false;
                            
                        }else if(parsedJson.result=='error'){
                           
                            console.log('error');
                            return false;
                        }
                    }
                   
                });
            });
            
            
            
        }
        
        function deleted_notice(){
            
            $('ul.messages li:last a').one('click', function() {
                var domain = getDomain();
                
                var className = $(this).attr('class');
                if(className != 'inbox' && className != 'tasks'){
                    console.log('error');
                    return;
                }
                
                $.ajax({
                    type: "GET",
                    url: 'http://'+domain+'/do_'+className+'.php',
                    data: ({action : 'deleted'}),
                    dataType : 'html',
                    success: function(html, textStatus){
                        $('#deleted').empty().prepend(html); 
                        if ($('#'+className+'-deleted').length > 0){
                            console.log('deleted');
                            $("thead input.deleted_init").keyup(function() {
                                    /* Filter on the column (the index) of this element */
                                    deleted.fnFilter(this.value, deleted.oApi._fnVisibleToColumnIndex(deleted.fnSettings(), $("thead input.deleted_init").index(this)));
                            });
                            $("thead input").each(function(i) {
                                    this.initVal = this.value;
                            });

                            $("thead input").focus(function() {
                                    if (this.className == "deleted_init") {
                                            this.className = "";
                                            this.value = "";
                                    }
                            });


                            $("thead input.deleted_init").blur(function(i) {
                                    if (this.value == "") {
                                            this.className = "deleted_init";
                                            this.value = this.initVal;
                                    }
                            });
                            deleted = $('#'+className+'-deleted').dataTable({
                                "sDom" : "t<'row-fluid dt-footer'<'span6 visible-desktop'i><'span6'p>l>",
                                "oLanguage" : {
                                        "sSearch" : "Search all columns:"
                                },
                                "bSortCellsTop" : true,
                                "bLengthChange" : true,
                                //"bDestroy": true, //used when a new initialisation object is passed
                                "aoColumnDefs": [
                                  {'bSortable': false, 'aTargets': [ 0 ]},
                               ]

                        }); 
                      }
                        view_messages();
                        view_tasks();
                    }
                                      
                    
                   
                });
           
                
            });
            
        }
        
        function link_action(){
                  
            $('.whois').click(function(e) { 
                $('div#whois div.inner-spacer div#myTabContent.tab-content div#s1.tab-pane p').empty().html('<img src="img/loaders/misc/100.gif" alt="loader" />');
                $('#whois #s1 p span').html('<img src="img/loaders/misc/100.gif" alt="loader" />');
                $('#whois #s2 p').html('<img src="img/loaders/misc/100.gif" alt="loader" />');
                var ref = $(this);
                var link_id = $(ref).parent().parent().data('ref').link_id;   
             
               $(this).parent().parent().find('td').each (function() {                             
                    if(typeof $(this).data('country') !== 'undefined'){
                        var img = $(this).html();
                       
                       var src = $(this).children('img').attr('src');                       
                       var country = $(this).data('country').country;
                       $('#whois #s1 #flag').append(img);                       
                    }
                });  
                           
               
                var domain = getDomain();  
              
                $.ajax({
                    type: "GET",
                    url: 'http://'+domain+'/do_whois.php',
                    data: ({ajax : true, link_id : link_id}),
                                      
                    success: function(jsonToBeParsed){  
                        
                     var parsedJson = $.parseJSON(jsonToBeParsed);
                   
                        if(parsedJson.result=='success'){
                           $('#whois #s1 strong').append(parsedJson.domain);
                           $('#whois #s1 p').html(parsedJson.whois);
                           $('#whois #s2 p').html(parsedJson.contacturl);   
                           $('#whois #s1 #flag').show();
                          
                           
                           //var src = $('#whois #s1 #flag').attr('src');
                           //$('#whois #s1 #flag').attr('src', src+ref);
                           ref.children('i').removeClass('icon-question-sign').addClass('icon-ok-sign');
                            
                            return false;
                            
                        }else if(parsedJson.result=='error'){
                           
                            console.log('error');
                            return false;
                        }
                    }
                   
                });
                
                
                
                
                
               // return false;
            });
            
                  
            $('.remove, .nofollow, .anchor, .disavow_url, .ignore_url').click(function(e) {                
                var link_id;
                var checked = false;
                var ref = $(this);
                //if($('tr td.multi #multi').prop('checked')==true){
                    $('tr td.multi #multi').each(function( index ) {
                         if($(this).prop('checked')==true){

                             link_id = $(this).parent().parent().data('ref').link_id; 
                           //console.log('link id '+link_id);
                             audit_link($(this).parent().parent().children('td').children('a.'+ref.attr('class')), ref.attr('class'), link_id);
                             checked = true;
                        }

                    });
                //}else{
                if(checked==false){
                    link_id = $(this).closest('tr').attr('id');
                    audit_link($(this), $(this).attr('class'), link_id);
                }
                return false;
            });
            
            
            
            $('.review').click(function(e) {                
               var link_id;
               var checked = false;
               var ref = $(this);
               //if($('tr td.multi #multi').prop('checked')==true){
                    $('tr td.multi #multi').each(function( index ) {
                         if($(this).prop('checked')==true){

                             link_id = $(this).parent().parent().data('ref').link_id; 
                             
                             review_link($(this).parent().parent().children('td').children('a.'+ref.attr('class')), link_id);
                             checked = true;
                        }

                    });
               // }else{
               if(checked==false){
                    link_id = $(this).closest('tr').attr('id');
                    review_link($(this), link_id);
                }
                return false;
             
                
            });
            
            
            
            if ($('table.ll_audit').length){
							
               
                        
            
            
            $('.disavow_domain').click(function(e) {        
               
                var link_id = $(this).parent().parent().data('ref').link_id;  
                var domain = $(this).parent().parent().data('ref').domain;  
                //console.log('link id '+link_id+' domain '+domain);
               //if($(this).data('status')=='on'){ 
                var ref = $(this);
               if($(this).parent().data('status')=='on'){ 
                  
                       action_domain(ref, link_id, domain, "disavow_domain");
               }else{
                    //var domain_name = $(this).closest('tr').children('td.domain').text();

                     e.preventDefault();
                    play_sound_message_box();
                    bootbox.confirm("WARNING: Disavowing the domain will tell Google to ignore all links from "+domain+'. Are you sure you want to do this?', function(result) {

                    //toastr.info("Confirm result: "+result);
                   
                        if(result == true){
                            action_domain(ref, link_id, domain, "disavow_domain");
                        }else{
                            return false;
                        }

                    });//result

                }
                return false;
            });
            
            $('.ignore_domain').click(function(e) {        
               
                var link_id = $(this).parent().parent().data('ref').link_id;  
                var domain = $(this).parent().parent().data('ref').domain;  
                //console.log('link id '+link_id+' domain '+domain);
               //if($(this).data('status')=='on'){ 
                var ref = $(this);
               if($(this).parent().data('status')=='on'){ 
                  
                       action_domain(ref, link_id, domain, "ignore_domain");
               }else{
                    //var domain_name = $(this).closest('tr').children('td.domain').text();

                     e.preventDefault();
                    play_sound_message_box();
                    bootbox.confirm("WARNING: Ignoring the domain mean the system will ignore all links from "+domain+'. Are you sure you want to do this?', function(result) {

                    //toastr.info("Confirm result: "+result);
                   
                        if(result == true){
                            action_domain(ref, link_id, domain, "ignore_domain");
                        }else{
                            return false;
                        }

                    });//result

                }
                return false;
            });
            
            };//Bootbox
            
            
        }//link_action
        
        function action_domain(oTable, link_uuid, domain, action){  
            var user = userData();
            $.ajax({
                type: "GET",
                url: 'http://'+getDomain()+'/do_audit.php',
                data: ({profile_uuid:user.profile_uuid, link_uuid : link_uuid, domain : domain, action: action}),

                success: function(jsonToBeParsed){  

                 //var parsedJson = $.parseJSON(jsonToBeParsed);

                    var oSettings = oTable.fnSettings();                 
                    oTable.fnReloadAjax(oSettings.sAjaxSource);  
                }
            });
            return true;
        }
        
        function action_domain2(ref, link_id, domain, action){               
           
                var sitedomain = getDomain();               
                var row = $(ref).parent().parent().parent();
               //console.log(row);
               //console.log($('table.ll_audit tr'));
                $.ajax({
                    type: "GET",
                    url: 'http://'+sitedomain+'/do_audit.php',
                    data: ({ajax : true, link_id : link_id, domain : domain, action: action}),
                                      
                    success: function(jsonToBeParsed){  
                        
                     var parsedJson = $.parseJSON(jsonToBeParsed);
                   
                        if(parsedJson.result=='added'){                           
                             
                            $('table.ll_audit tr').find('td').each(function( index ) {
                                
                               // console.log($(this));
                               // $(this).children("td").each(function() {
                                    
                                    if(typeof $(this).parent().data('ref') !== 'undefined'){
                                   
                                        var domain = $(this).parent().data('ref').domain;                              

                                        if ( domain ==  parsedJson.domain ) {                                           
                                                                                 
                                            //set attributes on ROW
                                            $(this).parent().data("status", 'audited').attr('data-status','audited').removeClass('error').removeClass('warning').addClass('success');                            
//console.log($(this));
                                            if($(this).children("a").attr('class')== action ){
                                                //Update icon as we iterate through the table
                                                $(this).children("a").html("<i class=\"cus-accept\"></i>").parent().data("status", 'on').attr('data-status','on'); 
                                            }
                                            //Update ROW visual
                                             $(this).parent().children('td.audit_flag').html("<i class=\"cus-accept\"></i>");  
                                            

                                        }  
                                    }else{
                                        return;//stop checking unnecessary td tags
                                    }
                                    
                                    
                               // }); 
                                
                                
                                
                            });
                            toastr.success('Success: Link added to disavow file.');
                        }else if(parsedJson.result=='removed'){
                           
                           var remove;
                           
                           
                           $('table.ll_audit tr').each(function( index ) {
                               
                              //The first row return 'undefined'
                              if(typeof $(this).data('ref')!='undefined'){                              
                                                              
                               remove = true;
                               
                               domain = $(this).data('ref').domain;
                               link_id = $(this).data('ref').link_id;   
                               
                            if ( domain ==  parsedJson.domain ) {
                                
                                //$(this).find("td a.disavow_domain").html("<i class=\"cus-cross\"></i>").parent().removeClass('audited');; 
                                //
                                //Update icon on clicked element
                                
                               
                                
                                $(this).find("td").each(function() {
                                   
                                    //if(typeof $(this).attr('id') !== 'undefined'){
                                    
                                    if($(this).children("a").attr('class')== action ){
                                        //Update icon as we iterate through the table
                                        $(this).children("a").html("<i class=\"cus-cross\"></i>").parent().data("status", 'off').attr('data-status','off'); 
                                    }
                                  
                                    if($(this).data('action') == 'audit'){
                                    
                                            //var bits = $(this).attr('class').split(' ');
                                             
                                            if($(this).data('status')=='on'){
                                                remove = false;                                    
                                                //return false;
                                            }else if(remove != false){
                                                remove = true;
                                            }  
                                    }
                                    
                                    
                                }); 
                                
                           
                                //console.log(remove);
                                if(remove == true){
                                    
                                    //set attributes on ROW
                                    $(this).data("status", 'outstanding').attr('data-status','outstanding').removeClass('warning').removeClass('success').addClass('error');  

                                    //Update ROW visual
                                    $(this).children('td.audit_flag').html("<i class=\"cus-cross\"></i>");
                                    //console.log($(this));
                                    
                                    //$(this).children('td').removeClass('audited');
                                    
                                    //$(this).children('tr#'+link_id+' td#'+domain_id+'.audit_flag').html("<i class=\"cus-cross\"></i>");
                                    
                                   
                                }
                             }//matching domain id's  
                                 //console.log('-->next');
                              }//if is object
                            });                          
                           
                           toastr.warning('Warning: Link removed from disavow file.');
                        }
                    }

                });
               auditProgressSummaryTable();
                return false;
        
        }
        
        function add_columns_for_expansion(id){
           
                    /*
                     * Insert a 'details' column to the table
                     */
                    var nCloneTh = document.createElement( 'th' );
                    var nCloneTd = document.createElement( 'td' );
                    nCloneTd.innerHTML = '<img src="http://'+getDomain()+'/img/details_open.png">';
                    nCloneTd.className = "center";

                    $(id+' thead tr').each( function () {
                       
                            this.insertBefore( nCloneTh.cloneNode( true ), this.childNodes[0] );
                    } );

                    $(id+' tbody tr').each( function () {
                            this.insertBefore(  nCloneTd.cloneNode( true ), this.childNodes[0] );
                    } );                    
        }
        
        function fnFormatDetailsIP( oTable, nTr, ip_type )
        {
                
                
                var aData = oTable.fnGetData( nTr );
               
                var ip = $(aData[1]).text();
                
                var filter_uuid = $('#filter_uuid').data('uuid');
                var user = userData();
                
                
                var domain = getDomain();
                var  sOut;
                $.ajax({
                    type: "GET",
                    cache: true,
                    url: 'http://'+domain+'/do_ip.php',
                    data: ({ip : ip, action : 'domains', ip_type:ip_type, profile_uuid:user.profile_uuid, filter_uuid:filter_uuid}),
                     success: function(jsonToBeParsed){
                        var parsedJson = $.parseJSON(jsonToBeParsed);

                        if(parsedJson.result=='success'){

                                sOut = '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;" class="table table-striped table-bordered responsive table-center subdata">';
                                sOut += '<tr><td>Domain</td><td>Total Links</td><td>Followed Links</td><td>No Followed Links</td></tr>';
                                for(var i=0;i<parsedJson.count;i++){

                                    sOut += '<tr><td><a href="http://'+domain+'/do_audit.php?action=create-filter&filter_uuid='+filter_uuid+'&profile_uuid='+user.profile_uuid+'&domain='+parsedJson[i].domain+'">'+parsedJson[i].domain+'</a></td><td>'+parsedJson[i].total+'</td><td>'+parsedJson[i].followed+'</td><td>'+parsedJson[i].nofollowed+'</td></tr>';

                                }
                                sOut += '</table>';

                                oTable.fnOpen( nTr, sOut, 'details' );
                                return true;


                        }else{
                                sOut = '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">';
                                sOut += '<tr><td>Error</tr></td>';
                                sOut += '</table>';
                             oTable.fnOpen( nTr, sOut, 'details' );
                               return true;
                        }
                       // console.log();

                    }
                });	

        }//fnFormatDetailsIP
        
        function fnFormatDetailsTld ( oTable, nTr )
        {

                var aData = oTable.fnGetData( nTr );
                var tld = $(aData[1]).text();
               
                var filter_uuid = $('#filter_uuid').data('uuid');
                var user = userData();
                
                
                var domain = getDomain();
                var  sOut;
                $.ajax({
                    type: "POST",
                    cache: true,
                    url: 'http://'+domain+'/do_tld.php',
                    data: ({tld : tld, action : 'domains', profile_uuid:user.profile_uuid, filter_uuid:filter_uuid}),
                     success: function(jsonToBeParsed){
                        var parsedJson = $.parseJSON(jsonToBeParsed);

                        if(parsedJson.result=='success'){

                                sOut = '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;" class="table table-striped table-bordered responsive table-center subdata">';
                                sOut += '<tr><td>Domain</td><td>Total Links</td><td>Followed Links</td><td>No Followed Links</td></tr>';
                                for(var i=0;i<parsedJson.count;i++){

                                    sOut += '<tr><td><a href="http://'+domain+'/do_audit.php?action=create-filter&filter_uuid='+filter_uuid+'&profile_uuid='+user.profile_uuid+'&domain='+parsedJson[i].domain+'">'+parsedJson[i].domain+'</a></td><td>'+parsedJson[i].total+'</td><td>'+parsedJson[i].followed+'</td><td>'+parsedJson[i].nofollowed+'</td></tr>';

                                }
                                sOut += '</table>';

                                oTable.fnOpen( nTr, sOut, 'details' );
                                return true;


                        }else{
                                sOut = '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">';
                                sOut += '<tr><td>Error</tr></td>';
                                sOut += '</table>';
                             oTable.fnOpen( nTr, sOut, 'details' );
                               return true;
                        }
                       // console.log();

                    }
                });	

        }//fnFormatDetailsAnchors
        
        function fnFormatDetailsAnchors ( oTable, nTr )
        {

                var aData = oTable.fnGetData( nTr );
                var anchor = $(aData[6]).text();
                var user = userData();
                var domain = getDomain();
                var  sOut;
                $.ajax({
                    type: "POST",
                    cache: true,
                    url: 'http://'+domain+'/do_anchors.php',
                    data: ({anchor : anchor, action : 'domains', profile_uuid : user.profile_uuid}),
                     success: function(jsonToBeParsed){
                        var parsedJson = $.parseJSON(jsonToBeParsed);

                        if(parsedJson.result=='success'){

                                sOut = '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;" class="table table-striped table-bordered responsive table-center subdata">';
                                sOut += '<tr><td>Domain</td><td>Total Links</td><td>Followed Links</td><td>No Followed Links</td></tr>';
                                for(var i=0;i<parsedJson.count;i++){

                                    sOut += '<tr><td><a href="http://'+domain+'/audit.php?domain='+parsedJson[i].domain+'&AnchorText='+anchor+'">'+parsedJson[i].domain+'</a></td><td>'+parsedJson[i].total+'</td><td>'+parsedJson[i].followed+'</td><td>'+parsedJson[i].nofollowed+'</td></tr>';

                                }
                                sOut += '</table>';

                                oTable.fnOpen( nTr, sOut, 'details' );
                                return false;


                        }else{
                                sOut = '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">';
                                sOut += '<tr><td>Error</tr></td>';
                                sOut += '</table>';
                             oTable.fnOpen( nTr, sOut, 'details' );
                               return false;
                        }
                       // console.log();

                    }
                });	

        }//fnFormatDetailsAnchors
        
        function detailsAnchorsButton(id, cls, table){
                  
            $(id).on('click', cls , function() {                      

                    var nTr = this.parentNode.parentNode;

                    
                    if ( table.fnIsOpen(nTr) ) 
                    {   
                           
                            /* This row is already open - close it */
                            this.src = 'http://'+getDomain()+"/img/details_open.png";
                            table.fnClose( nTr );
                            return
                    }
                    else
                    {   
                           
                            /* Open this row */
                            this.src = 'http://'+getDomain()+"/img/details_close.png";
                            //anchorTable.fnOpen( nTr, fnFormatDetailsAnchors(anchorTable, nTr), 'details' );
                            switch(id){  
                                case '#tld-filter':
                                    fnFormatDetailsTld(table, nTr);
                                break;
                                case '#anchors-filter':
                                    fnFormatDetailsAnchors(table, nTr);
                                break;
                                case '#ip-filter':
                                case '#cblock-filter':
                                    var ip_type = id.replace('#', '').replace('-filter', '')                                    
                                    fnFormatDetailsIP(table, nTr, ip_type);
                                break;                              
                               
                                default:

                            }
                            
                            
                            return

                    }
            } );
        }//detailsAnchorsButton