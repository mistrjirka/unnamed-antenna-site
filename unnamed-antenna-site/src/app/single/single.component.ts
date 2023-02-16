import { Component, OnInit } from '@angular/core';

import Chart from 'chart.js/auto';
import { ActivatedRoute } from '@angular/router';
import { FileloadingService } from '../services/fileloading.service';
import {
  IGraphData,
  IFrequencyData,
  IFrequencyRange,
  IContentAntenna,
  IFrequencyTable,
} from '../model/chart';
import {
  AnalogueFrequencyTable,
  DigFrequencyTable,
} from '../data/frequency-table';
import { Router } from '@angular/router';
import { ListingService } from '../services/listing.service';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-single',
  templateUrl: './single.component.html',
  styleUrls: ['./single.component.css'],
})
export class SingleComponent implements OnInit {
  public ready = false;
  public toRenderCharts: any[] = [];
  public id: string = '';
  public usefulRanges: IFrequencyRange[] = [];
  public antenna: IContentAntenna = {} as IContentAntenna;

  constructor(
    private fileLoading: FileloadingService,
    private route: ActivatedRoute,
    private router: Router,
    private listing: ListingService,
    private store: StoreService
  ) {}

  get isReady(): boolean {
    return this.ready;
  }
  floor(num: number) {
    return Math.floor(num);
  }
  createChart(data: IGraphData, name: string, classname: string) {
    return new Chart(classname, {
      type: 'line', //this denotes tha type of chart
      data: data,
      options: {
        plugins: {
          title: {
            display: true,
            text: name,
          },
        },
        aspectRatio: 2.5,
        maintainAspectRatio: false,
        responsive: false,
        scales: {
          y: {
            grid: {
              color: 'grey',
            },
          },
          x: {
            grid: {
              color: 'white',
            },
          },
        },
      },
    });
  }
  createBarChart(data: IGraphData, name: string, classname: string) {
    return new Chart(classname, {
      type: 'bar', //this denotes tha type of chart
      data: data,
      options: {
        plugins: {
          title: {
            display: true,
            text: name,
          },
        },
        aspectRatio: 2.5,
        maintainAspectRatio: false,
        responsive: false,
        scales: {
          y: {
            grid: {
              color: 'white',
            },
          },
          x: {
            grid: {
              color: 'grey',
            },
          },
        },
      },
    });
  }

  async ngOnInit(): Promise<void> {
    let id = this.route.snapshot.paramMap.get('id');

    if (id == null) {
      this.router.navigate(['']);
    } else {
      this.id = id;
    }

    let frequencyData: IFrequencyData[] = [];

    if(id == "analyze"){
      this.antenna = this.store.getAntenna();
      frequencyData = this.store.getFrequencyData();
    }else{
      let tmp: IContentAntenna | null = await this.listing.getAntennaById(
        this.id
      );
      if (tmp != null) {
        this.antenna = tmp;
      } else {
        this.router.navigate(['']);
      }
      frequencyData = await this.fileLoading.getFrequencyData(this.antenna.dataFile);
    }
    console.log(frequencyData);

     
    
    let data: IGraphData = this.fileLoading.parseDataToGraph(
      frequencyData,
      this.antenna.startFrequency
    );
    let tablesToCheck: IFrequencyTable[][] = [];

    if(this.antenna.tables.indexOf("digital")!= -1){
      tablesToCheck.push(DigFrequencyTable);
      let digFpvData: IGraphData = this.fileLoading.parseDataToFpvGraph(
        frequencyData,
        DigFrequencyTable,
        'blue',
        this.antenna.units,
        this.antenna.unitDivider
      );
      this.createBarChart(
        digFpvData,
        'VSWR over Digital fpv channels',
        'fpv-digital-chart'
      );
    }

    
    if(this.antenna.tables.indexOf("analogue")!= -1){
      tablesToCheck.push(AnalogueFrequencyTable);
      let fpvData: IGraphData = this.fileLoading.parseDataToFpvGraph(
        frequencyData,
        AnalogueFrequencyTable,
        "red",
        this.antenna.units,
        this.antenna.unitDivider
      );

      this.createBarChart(
        fpvData,
        'VSWR over analog fpv channels',
        'fpv-analog-chart'
      );
    }
    
    this.usefulRanges = this.fileLoading.findUsefulFrequencies(
      frequencyData,
      tablesToCheck,
      2,
      this.antenna.startFrequency
    );

    this.createChart(data, 'VSWR over measured frequency range', 'vswr-chart');
    this.ready = true;
  }
}
