import { Component, OnInit } from '@angular/core';

import Chart from 'chart.js/auto';

import { FileloadingService } from '../fileloading.service';
import { IGraphData, IFrequencyData, IFrequencyRange } from '../model/chart';
import { AnalogueFrequencyTable, DigFrequencyTable } from '../data/frequency-table';

@Component({
  selector: 'app-single',
  templateUrl: './single.component.html',
  styleUrls: ['./single.component.css'],
})
export class SingleComponent implements OnInit {
  public ready = false;
  public toRenderCharts: any[] = [];

  public usefulRanges:IFrequencyRange[] = []
  constructor(private fileLoading: FileloadingService) {}

  get isReady(): boolean { return this.ready; }
  floor(num: number){
    return Math.floor(num);
  }
  createChart(data: IGraphData, name:string, classname: string) {
    return new Chart(classname, {
      type: 'line', //this denotes tha type of chart
      data: data,
      options: {   
        plugins: {
          title: {
              display: true,
              text: name
          }
        }, 
        aspectRatio: 2.5,
        maintainAspectRatio: false,
        responsive: false,
        scales: {
          y: {
            grid: {
              color: 'grey'
            }
          },
          x: {
            grid: {
              color: 'white'
            }
          }
        }
        
      },
      
    });
  }
  createBarChart(data: IGraphData, name: string, classname: string){
    return new Chart(classname, {
      type: 'bar', //this denotes tha type of chart
      data: data,
      options: { 
        plugins: {
          title: {
              display: true,
              text: name
          }
        }, 
        aspectRatio: 2.5,
        maintainAspectRatio: false,
        responsive: false,   
        scales: {
          y: {
            grid: {
              color: 'white'
            }
          },
          x: {
            grid: {
              color: 'grey'
            }
          }
        }
        
      },
      
    });
  }

  async ngOnInit(): Promise<void> {
    
    let frequencyData: IFrequencyData[] = await this.fileLoading.getFrequencyDdata('1port.s1p');
    let data: IGraphData = this.fileLoading.parseDataToGraph(frequencyData, 5, 5000);
    let fpvData: IGraphData = this.fileLoading.parseDataToFpvGraph(frequencyData, AnalogueFrequencyTable);
    let digFpvData: IGraphData = this.fileLoading.parseDataToFpvGraph(frequencyData, DigFrequencyTable, "blue");
    this.usefulRanges = this.fileLoading.findUsefulFrequencies(frequencyData, [AnalogueFrequencyTable, DigFrequencyTable] , 2, 5000)
    console.log(this.usefulRanges);
    this.createChart(data,'VSWR over measured frequency range', "vswr-chart");
    this.createBarChart(fpvData, 'VSWR over analog fpv channels', "fpv-analog-chart");
    this.createBarChart(digFpvData, 'VSWR over Dikital fpv channels', "fpv-digital-chart");
    
    this.ready = true;
  }
}
