import { CommonModule, CurrencyPipe, getLocaleCurrencyCode } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { SubMenuComponent } from "../../components/sub-menu/sub-menu.component";

export interface data {
	[key: string]: any;
}

@Component({
    selector: 'app-home',
    standalone: true,
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
    imports: [CommonModule, CanvasJSAngularChartsModule, RouterLink, SubMenuComponent]
})
export class HomeComponent implements OnInit  {
  title:string = '';

  ngOnInit(): void {
    this.title = 'HOME'
  }

  dashboardOS = {
    animationEnabled: true,
    data: [{
    type: "pie",
    startAngle: -90,
    indexLabel: "{name}: {x} ({y})",
    yValueFormatString: "#,###.##'%'",
    dataPoints: [
      { y: 35.56, x: 64, color:"#0d6efd" , name: "OS em execução" },
      { y: 57.22, x: 103, color:"#198754" , name: "OS executadas" },
      { y: 7.22, x: 13, color:"#dc3545" , name: "OS canceldas" }
    ]
  }]
  }

  dashboardFinancas = {
      animationEnabled: true,
      theme: "light2",
      axisX:{
      valueFormatString: "DD/MM"
      },
      toolTip: {
      shared: true
      },
      legend: {
      cursor: "pointer",
      itemclick: function (e: any) {
        if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
          e.dataSeries.visible = false;
        } else {
          e.dataSeries.visible = true;
        }
        e.chart.render();
      }
      },
      axisY: {
        valueFormatString: "R$ 00.00"
      },
      data: [{
      type: "line",
      showInLegend: true,
      name: "Despesas",
      color: "#dc3545",
      lineDashType: "dash",
			markerType:"percent",
      yValueFormatString: "R$ 00.00",
      xValueFormatString: "DD MMM, YYYY",
      dataPoints: [
        { x: new Date('2024-03-01'), y: 0 },
        { x: new Date('2024-03-02'), y: 0 },
        { x: new Date('2024-03-03'), y: 0 },
        { x: new Date('2024-03-04'), y: 0 },
        { x: new Date('2024-03-05'), y: 0 },
        { x: new Date('2024-03-06'), y: 0 },
        { x: new Date('2024-03-07'), y: 0 },
        { x: new Date('2024-03-08'), y: 210.50 },
        { x: new Date('2024-03-09'), y: 20.00 },
        { x: new Date('2024-03-10'), y: 87.10 },
        { x: new Date('2024-03-11'), y: 110.50 },
        { x: new Date('2024-03-12'), y: 0.0 },
        { x: new Date('2024-03-13'), y: 0.0 },
        { x: new Date('2024-03-14'), y: 0.0 },
        { x: new Date('2024-03-15'), y: 100.00 },
        { x: new Date('2024-03-16'), y: 50.00 },
        { x: new Date('2024-03-17'), y: 400.00 },
        { x: new Date('2024-03-18'), y: 55.00 },
        { x: new Date('2024-03-19'), y: 230.00 },
        { x: new Date('2024-03-20'), y: 0.0 },
        { x: new Date('2024-03-21'), y: 0.0 },
        { x: new Date('2024-03-22'), y: 0.0 },
        { x: new Date('2024-03-23'), y: 0.0 },
        { x: new Date('2024-03-24'), y: 0.0 },
        { x: new Date('2024-03-25'), y: 0.0 },
        { x: new Date('2024-03-26'), y: 0.0 },
        { x: new Date('2024-03-27'), y: 0.0 },
        { x: new Date('2024-03-28'), y: 0.0 },
        { x: new Date('2024-03-29'), y: 0.0 },
        { x: new Date('2024-03-30'), y: 0.0 },
        { x: new Date('2024-03-31'), y: 0.0 },
      ]
      }, {
      type: "line",
      showInLegend: true,
      name: "Receitas",
      color: "#198754",
      lineDashType: "dash",
			markerType: "percent",
      yValueFormatString: "R$ 00.00",
      xValueFormatString: "DD MMM, YYYY",
      dataPoints: [
        { x: new Date('2024-03-01'), y: 0 },
        { x: new Date('2024-03-02'), y: 0 },
        { x: new Date('2024-03-03'), y: 0 },
        { x: new Date('2024-03-04'), y: 0 },
        { x: new Date('2024-03-05'), y: 0 },
        { x: new Date('2024-03-06'), y: 0 },
        { x: new Date('2024-03-07'), y: 0 },
        { x: new Date('2024-03-08'), y: 540.50 },
        { x: new Date('2024-03-09'), y: 411.15 },
        { x: new Date('2024-03-10'), y: 874.10 },
        { x: new Date('2024-03-11'), y: 55.0 },
        { x: new Date('2024-03-12'), y: 421.00 },
        { x: new Date('2024-03-13'), y: 100.00 },
        { x: new Date('2024-03-14'), y: 250.00 },
        { x: new Date('2024-03-15'), y: 1010.00 },
        { x: new Date('2024-03-16'), y: 457.00 },
        { x: new Date('2024-03-17'), y: 0.0 },
        { x: new Date('2024-03-18'), y: 0.0 },
        { x: new Date('2024-03-19'), y: 0.0 },
        { x: new Date('2024-03-20'), y: 0.0 },
        { x: new Date('2024-03-21'), y: 0.0 },
        { x: new Date('2024-03-22'), y: 0.0 },
        { x: new Date('2024-03-23'), y: 0.0 },
        { x: new Date('2024-03-24'), y: 0.0 },
        { x: new Date('2024-03-25'), y: 0.0 },
        { x: new Date('2024-03-26'), y: 0.0 },
        { x: new Date('2024-03-27'), y: 0.0 },
        { x: new Date('2024-03-28'), y: 0.0 },
        { x: new Date('2024-03-29'), y: 0.0 },
        { x: new Date('2024-03-30'), y: 0.0 },
        { x: new Date('2024-03-31'), y: 0.0 },
      ]
    }]
    }
}
