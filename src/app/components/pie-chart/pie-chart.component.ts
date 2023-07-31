import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import Chart from 'chart.js/auto';
import { DataService } from 'src/app/utils/data-service/data.service';
import { categorias, pagamentos, tipos } from 'src/app/utils/data/data';
import { Movimentacao } from 'src/app/utils/models/movimentacao.model';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent implements AfterViewInit, OnChanges  {
  @ViewChild('myChartCanvas') myChartCanvas!: ElementRef;
  categorias: any;
  tipos:any;
  pagamentos:any;
  usedColors = new Set<string>();
  myChart: any;

  public movimentacoes: Movimentacao[] = [];
  @Input() set data(data: any[]) {
    this.movimentacoes = data;
  }

  constructor(
    
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && !changes['data'].firstChange) {
      this.createChart();
    }
  }

  async ngAfterViewInit(): Promise<void> {
    this.categorias = categorias;
    this.tipos = tipos;
    this.pagamentos = pagamentos;
    //this.createBarChart();

  }

 

  createChart() {
    if (this.myChart) {
      this.myChart.destroy();
    }
    const ctx = this.myChartCanvas.nativeElement.getContext('2d');
    let labels: string[] = [];
    let data:number[] = [];
    let backgroundColor:string[]=[];
    let borderColor:string[]=[];
    let datasets: any =[];
    this.movimentacoes.forEach(el => {
      let label:string = "";
     
      if(el.tipo == 'd' && el.categoria != null){
        let categoria = this.categorias.find((cat:any) => cat.id == el.categoria);
        label = categoria.nome;
        if(labels.includes(label)){
          const index = labels.indexOf(label);
          const valorNumerico = parseFloat(el.valor.toString().replace(',', '.'));
          data[index] = data[index] + valorNumerico;
        }
        else{
          labels.push(label);
          const valorNumerico = parseFloat(el.valor.toString().replace(',', '.'));
          data.push(valorNumerico);
          const randomColor = this.generateNonRepeatingRandomColor();
          backgroundColor.push(randomColor);
          borderColor.push("000");
        }
      }

    });
    let dataset = {
      label: "Gastos",
      data: data,
      backgroundColor:backgroundColor,
      borderColor: borderColor,
      borderWidth: 1
    }
    datasets.push(dataset);
    this.myChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Gastos'
          }
        }
      },
    });
  }

  generateRandomHexColor(): string {
    const hexDigits = '0123456789ABCDEF';
    let color = '#';
  
    for (let i = 0; i < 6; i++) {
      color += hexDigits[Math.floor(Math.random() * 16)];
    }
  
    return color;
  }
  
  
  
  generateNonRepeatingRandomColor(): string {
    let randomColor = this.generateRandomHexColor();
  
    while (randomColor === '#000000' || randomColor === '#FFFFFF' || this.usedColors.has(randomColor)) {
      randomColor = this.generateRandomHexColor();
    }
  
    this.usedColors.add(randomColor);
    return randomColor;
  }
  
}

