var myDataset = new Array();  
    
//-------------------------description begin
//var imgURL = ['1988':'seoul1988'];
var msgIntro = '<ul><li><b>그래프의 점</b>들을 터치하거나 <b>그래프의 점</b> 위에 마우스를 올려보세요! 스마트폰 같이 작은 화면의 경우 점이 보이질 않으면, 그래프의 특정 구간을 터치해보면 됩니다.</li><li>또는 하단의 화살표 ◀ ▶를 이용하여 연도를 이동할 수 있습니다.</li><li>크롬을 권장합니다.</li></ul>';
var msgCitation= '<ul><li><b>평균 시급</b>:통계청 - 경제활동인구부가조사 원자료</li><li><b>라면 소비자 가격</b>:블로그 조사</li><li><b>짜장면 및 영화 평균 가격</b>:서울연구데이터서비스</li><li>제공된 자료는 당해정부 발표한 최저시급일 뿐, 실제 받는 급여와는 관계가 없습니다. 직종이나 취업상황에 따라 다를 수 있고, 물가 역시 정부 집계 평균일 뿐 지역적 차이가 있을 수 있습니다.</li></ul>';
var president = new Array();
var dataYearly = new Array();
var desc = {};
var myChart;

function getCurrentIndex(){
  return Math.round($('#infoYear').html()) - 1988;
}

function getPresident(year){
  var result = null;
  president.forEach(function(el){
    if (Math.round(year) >= el.begin && Math.round(year) <= el.end ) result = el.name;
  });
  return result;
}
function showMsg(title,message){
  $('#modalHead').html(title);
  $('#modalBody').html(message);
  $('#myModal').modal('show');
}

//처음엔 그냥 차트 데이터를 모두 공유하는 방식이었으나...쉽게 읽기 위하여 데이터를 차트용과 human readable로 둘로 쪼갬
    /* 연도 및 시급: divCircle / infoYear / infoWageHourly
         설명 및 기타: divMiddle / infoPrice / infoDesc
         꼬리설명: divEnd */
//----------------------on mouseover

function showYear(indexVar){
  var targetYear = myDataset[0].dataPoints[indexVar].label;
        targetYear = targetYear.replace('년', '');
    var priceMsg = "짜장면 {priceJajang} 원 | 라면 {priceRamyeon}원 | 영화 {priceTicket}원 | {president} 정부";
    priceMsg = priceMsg.replace('{priceJajang}', myDataset[1].dataPoints[indexVar].y)
                        .replace('{priceRamyeon}', myDataset[2].dataPoints[indexVar].y)
                        .replace('{priceTicket}', myDataset[3].dataPoints[indexVar].y)
                        .replace('{president}',dataYearly[indexVar].president);

    $('#infoWageHourly').text('시급 ' + myDataset[0].dataPoints[indexVar].y +'원');
    $('#infoYear').html(targetYear);
    $('#infoDesc').html(desc[targetYear]);
    $('#infoPrice').html(priceMsg);
    
    //prevent flickering background when moving in the same column
    var imageBack = ($('#divBack').css('background-image')).split('/').pop();
    imageBack = imageBack.replace('seoul','').replace('.jpg")','');

    if (imageBack != targetYear){
      $('#divBack').removeClass('animBack');
      $('#divBack').animate({opacity:0},300,function(){
        $('#divBack').css('background-image','url(seoul' + targetYear + '.jpg)');
        $('#divBack').addClass('animBack');
      });
  };
  
  //setting up indexstripline
  chartSetup.axisX.stripLines[0].value = indexVar;
  myChart.render();
};

var chartEvent = function(e){
  var indexVar = e.dataPointIndex;
  showYear(indexVar);
};
//-------------------------chart begin

var whiteA = 'rgba(255,255,255,0.5)';
//batch setup
var z;
myDataset = new Array();
for(z=0;z<=4;z++) {
    myDataset.push({type:'line', showInLegend:true, dataPoints:[]});
}
myDataset[0].name = '시급'; myDataset[0].legendText = '시급'; myDataset[0].lineThickness = 6;
myDataset[1].name= '짜장면 가격'; myDataset[1].legendText = '짜장면 가격';
myDataset[2].name = '라면 가격'; myDataset[2].legendText = '라면 가격';
myDataset[3].name = '영화 티켓 가격'; myDataset[3].legendText = '영화 티켓 가격';
myDataset[4].name = '시급 인상률';myDataset[4].legendText = '시급 인상률'; myDataset[4].axisYType = 'secondary';
    
var chartSetup = {
    colorSet:'chartShades',
    backgroundColor:'rgba(0,0,0,0)',
    title:{ text: "대한민국 시급과 물가의 변화",
           margin:10,
           fontColor:whiteA
          },
    axisX:{ valueFormatString: "YYYY년",
           labelFontColor:whiteA,
           stripLines:[
             {value:0, opacity:0.5, color:whiteA},
             {value:11, label:'IMF', opacity:0.5, lineDashType:'dot'},
             {value:22, label:'IMF 탕감', opacity:0.5, lineDashType:'dot'},
           ]
          },
    axisY:{ lineColor:'rgba(0,0,0,0)',
           tickColor:whiteA,
           gridColor:'rgba(255,255,255,0.2)',
           labelFontColor:whiteA
          },
    axisY2:{lineColor:'rgba(0,0,0,0)'
        
    },
    legend:{fontColor:whiteA,
            fontFamily:'Noto Sans KR'
    },
    toolTip:{shared:true,
            fontFamily:'Noto Sans KR',
            fontStyle:'normal',
            borderThickness:0
            },
    data: myDataset,
}


//----------------------------start of onload function
$(function(){
  //bootstrap tooltip init
  $('#mailTooltip').tooltip(); 

  //always us jsonlint before publish .json
  $.getJSON("description.json",function(data){
      data.president.forEach(function(el){
        president.push(el);
      });
      desc = data.description;
  }).done(function(){
  
  //chart init!
    CanvasJS.addColorSet("chartShades",[
        "#729EA1","#B5BD89","#DFBE99","#EC9192","rgba(100,40,40,0.6)"    ]);

    $.getJSON("wagedata.json",function(data){
        var c = 0;
        data.forEach(function(el){
          //parsing values for chart dataset
            var i;
            for (i=0; i<=4; i++){
                myDataset[i].dataPoints.push({x:c, label:el.year + "년"});
            }
            myDataset[0].dataPoints[myDataset[0].dataPoints.length - 1].y = Math.round(el.wage_hourly);
            myDataset[1].dataPoints[myDataset[1].dataPoints.length - 1].y = Math.round(el.price_jajang);

            myDataset[2].dataPoints[myDataset[2].dataPoints.length - 1].y = Math.round(el.price_ramyeon);
            myDataset[3].dataPoints[myDataset[3].dataPoints.length - 1].y = Math.round(el.price_ticket);
            myDataset[4].dataPoints[myDataset[4].dataPoints.length - 1].y = Math.round(el.raise);
            c++; 
          //parsing value for convenience
            dataYearly.push({year:el.year,
                             president:getPresident(el.year),
                             wageHourly:el.wage_hourly,
                             priceRamyeon:el.price_ramyeon,
                             priceTicket:el.price_ticket,
                             priceJajang:el.price_jajang,
                             raise:el.raise});
        });
        
        var i;
        for (i=0;i<=4;i++){
           myDataset[i].mouseover = chartEvent;
           myDataset[i].click = chartEvent;
        }
        
        var chartCanvas = document.getElementById('wagechart');
        myChart = new CanvasJS.Chart(chartCanvas, chartSetup);

        myChart.render();
    });//end of getJSON - wagedata
  });//end of getJSON - description
  
    
  showMsg('시작하기 전에',msgIntro);
  
  //miscellaneous button handlings
  $('#btnCalc').on('click',function(){
    var msgCalc = '라면을 {amountRamyeon} 그릇 먹을 수 있었고,<br>짜장면을 {amountJajang} 그릇 먹을 수 있었습니다.';
    
    var targetYear = getCurrentIndex();
    var curWage = dataYearly[targetYear].wageHourly;
    
    //var amountRamyeon = math.round();
    msgCalc = msgCalc.replace('{amountRamyeon}', Math.floor(curWage / dataYearly[targetYear].priceRamyeon))
                    .replace('{amountJajang}',Math.floor(curWage / dataYearly[targetYear].priceJajang));
    showMsg(targetYear + 1988 + '년에 1시간 일하면...',msgCalc);
  });
  
  
  $('#btnPrev').on('click',function(){
    var targetIndex = getCurrentIndex();
    if (targetIndex >= 1){
      targetIndex = targetIndex - 1;
      showYear(targetIndex);
    };
  
  });
  
  $('#btnNext').on('click',function(){
    var targetIndex = getCurrentIndex();
    if (targetIndex < myDataset[0].dataPoints.length - 1){
      targetIndex = targetIndex + 1;
      showYear(targetIndex);
    };
  });
  
  $('#btnIntro').on('click',function(){
    showMsg('사용법',msgIntro);
  });
  
  $('#btnInfo').on('click',function(){
    showMsg('자료 출처', msgCitation);
  });
  
});//---------------end of onload function