(function($) {
    'use strict';
    $.fn.andSelf = function() {
      return this.addBack.apply(this, arguments);
    }
    $(function() {
      if ($("#currentBalanceCircle").length) {
        var bar = new ProgressBar.Circle(currentBalanceCircle, {
          color: '#000',
          // This has to be the same size as the maximum width to
          // prevent clipping
          strokeWidth: 12,
          trailWidth: 12,
          trailColor: '#0d0d0d',
          easing: 'easeInOut',
          duration: 1400,
          text: {
            autoStyleContainer: false
          },
          from: { color: '#d53f3a', width: 12 },
          to: { color: '#d53f3a', width: 12 },
          // Set default step function for all animate calls
          step: function(state, circle) {
            circle.path.setAttribute('stroke', state.color);
            circle.path.setAttribute('stroke-width', state.width);
        
            var value = Math.round(circle.value() * 100);
            circle.setText('');
        
          }
        });
  
        bar.text.style.fontSize = '1.5rem';
        bar.animate(0.4);  // Number from 0.0 to 1.0
      }
      if ($("#transaction-history").length) {
        var areaData = {
          labels: ["Prognose", "Design","Entwicklung"],
          datasets: [{
              data: [55, 25, 20],
              backgroundColor: [
                "#111111","#00d25b","#ffab00"
              ]
            }
          ]
        };
        var areaOptions = {
          responsive: true,
          maintainAspectRatio: true,
          segmentShowStroke: false,
          cutoutPercentage: 70,
          elements: {
            arc: {
                borderWidth: 0
            }
          },      
          legend: {
            display: false
          },
          tooltips: {
            enabled: true
          }
        }
        var transactionhistoryChartPlugins = {
          beforeDraw: function(chart) {
            var width = chart.chart.width,
                height = chart.chart.height,
                ctx = chart.chart.ctx;
        
            ctx.restore();
            var fontSize = 1;
            ctx.font = fontSize + "rem sans-serif";
            ctx.textAlign = 'left';
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#ffffff";
        
            var text = "$1200", 
                textX = Math.round((width - ctx.measureText(text).width) / 2),
                textY = height / 2.4;
        
            ctx.fillText(text, textX, textY);
  
            ctx.restore();
            var fontSize = 0.75;
            ctx.font = fontSize + "rem sans-serif";
            ctx.textAlign = 'left';
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#6c7293";
  
            var texts = "Total", 
                textsX = Math.round((width - ctx.measureText(text).width) / 1.93),
                textsY = height / 1.7;
        
            ctx.fillText(texts, textsX, textsY);
            ctx.save();
          }
        }
        var transactionhistoryChartCanvas = $("#transaction-history").get(0).getContext("2d");
        var transactionhistoryChart = new Chart(transactionhistoryChartCanvas, {
          type: 'doughnut',
          data: areaData,
          options: areaOptions,
          plugins: transactionhistoryChartPlugins
        });
      }
      
      });
  })(jQuery);