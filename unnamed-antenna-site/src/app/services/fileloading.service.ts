import { Injectable } from '@angular/core';
import { IGraphData, IFrequencyData, IFrequencyRange, IFrequencyTable } from '../model/chart';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class FileloadingService {
  constructor(private http: HttpClient) {}
  private readonly sfile_root: string = '/assets/data/';

  private calculateSwr(real: number, imag: number, limit: number = 5) {
    let vswr =
      (1 + (real ** 2 + imag ** 2) ** 0.5) /
      (1 - (real ** 2 + imag ** 2) ** 0.5);
    return 1 > vswr || vswr > limit ? limit : vswr;
  }

  async getFrequencyData(fname: string): Promise<IFrequencyData[]> {
    const result$ = this.http.get(`${this.sfile_root}/${fname}`, {
      responseType: 'text',
    });

    const rawData: string = await lastValueFrom(result$);
    const lines = rawData.split('\n');
    let parsedData: IFrequencyData[] = [];
    lines.forEach((line) => {
      const splitLine = line.split(' ');
      if (splitLine.length == 3) {
        let failed = false;
        let tmp: number[] = [];
        splitLine.every((word) => {
          let num_val = parseFloat(word);
          if (Number.isNaN(num_val)) {
            failed = true;
            return false;
          }
          tmp.push(num_val);
          return true;
        });

        if (!failed && tmp.length == 3) {
          parsedData.push({ frequency: tmp[0], real: tmp[1], imag: tmp[2], swr: this.calculateSwr(tmp[1], tmp[2]) });
        }
      }
    });

    return parsedData;
  }

  processData(data:IFrequencyData[][], f: (...args: number[])=>number):IFrequencyData[] 
  {
    if(data.length == 0) return [];

    let averagedData:IFrequencyData[] = data[0];
    
    averagedData.forEach((point, index)=>{
      data.slice(1).forEach(element => {
        point.real = f(element[index].real, point.real);
        point.imag = f(element[index].imag, point.imag);
        point.swr = f(element[index].swr, point.swr);
      });
      averagedData[index] = point;                                                 
    });

    return averagedData;
  }

  maxData(data:IFrequencyData[][]):IFrequencyData[] 
  {
    if(data.length == 0) return [];

    let averagedData:IFrequencyData[] = data[0];
    
    averagedData.forEach((point, index)=>{
      data.slice(1).forEach(element => {
        point.real = Math.max(element[index].real, point.real);
        point.imag = Math.max(element[index].imag, point.imag);
        point.swr = Math.max(element[index].swr, point.swr);
      });
      averagedData[index] = point;                                                 
    });

    return averagedData;


  }

  minData(data:IFrequencyData[][]):IFrequencyData[] 
  {
    if(data.length == 0) return [];

    let averagedData:IFrequencyData[] = data[0];
    
    averagedData.forEach((point, index)=>{
      
      data.slice(0).forEach(element => {
        if(point.frequency > 52300000000*0.99 && point.frequency < 52300000000*1.01)
          console.log(point, element[index]);
        point.real = Math.min(element[index].real, point.real);
        point.imag = Math.min(element[index].imag, point.imag);
        point.swr = Math.min(element[index].swr, point.swr);
      });
      averagedData[index] = point;                                                 
    });

    return averagedData;
  }

  averageData(data:IFrequencyData[][]):IFrequencyData[] 
  {
    if(data.length == 0) return [];

    let averagedData:IFrequencyData[] = data[0];
    
    averagedData.forEach((point, index)=>{
      data.slice(1).forEach(element => {
        point.frequency += element[index].frequency;
        point.real += element[index].real;
        point.imag += element[index].imag;
        point.swr += element[index].swr;
      });
      point.frequency /= data.length;
      point.real /= data.length;
      point.imag /= data.length;
      point.swr /= data.length;
      averagedData[index] = point;                                                 
    });

    return averagedData;
  }

  parseDataToGraph(
    data: IFrequencyData[],
    startFrequency: number = 0,
    endFrequency: number = 0,
    units: string = "Mhz",
    unitDivider: number = 1000000
  ): IGraphData {
    let parsedData: IGraphData = {
      labels: [],
      datasets: [
        {
          label: 'VSWR (lower better, min 1)',
          data: [],
          backgroundColor: 'limegreen',
        },
      ],
    };
    data.forEach((point) => {
      if (point.frequency / unitDivider > startFrequency && point.frequency / unitDivider < endFrequency) {
        parsedData.labels.push(
          (point.frequency / unitDivider).toFixed(0).toString() + units
        );
        parsedData.datasets[0].data.push(
          point.swr.toString()
        );
      }
    });
    return parsedData;
  }

  parseDataToFpvGraph(
    data: IFrequencyData[],
    table: IFrequencyTable[],
    color: string = 'red',
    units: string = "Mhz",
    unitDivider: number = 1000000
  ): IGraphData {
    let parsedData: IGraphData = {
      labels: [],
      datasets: [
        {
          label: 'VSWR per channel (lower better, min 1)',
          data: [],
          backgroundColor: color,
        },
      ],
    };

    table.forEach((channel) => {
      parsedData.labels.push(channel.name + ' ' + channel.center + units);
      let start = Math.trunc(channel.center - channel.bandwidth / 2);
      let end = Math.trunc(channel.center + channel.bandwidth / 2);
      let startIndex = 0;
      for (
        ;
        startIndex < data.length &&
        data[startIndex].frequency / unitDivider < start;
        startIndex++
      );
      let endIndex = startIndex;
      for (
        ;
        endIndex < data.length && data[endIndex].frequency / unitDivider < end;
        endIndex++
      );

      let dataBetween = data.slice(startIndex, endIndex+1);
      let averageSwr = 0;
      dataBetween.forEach((element) => {
        averageSwr += element.swr;
      });
      averageSwr /= dataBetween.length;
      parsedData.datasets[0].data.push(averageSwr.toFixed(2).toString());
    });

    return parsedData;
  }

  findUsefulFrequencies(
    data: IFrequencyData[],
    tables: IFrequencyTable[][],
    threshold: number = 2,
    minFrequency: number = 0,
    units: string = "Mhz",
    unitDivider: number = 1000000,
    dontAddEmpty: boolean = false,
  ): IFrequencyRange[] {
    let usefulRanges: IFrequencyRange[] = [];
    let lastFrequency: number = 0;
    let logging: boolean = false;
    let swrAveraging: number = 0;
    let length: number = 0;
    data.forEach((point) => {
      if (point.frequency / unitDivider > minFrequency) {
        let swr = point.swr;
        if (swr <= threshold) {
          if (!logging) {
            usefulRanges.push({
              center: point.frequency,
              bandwidth: 1,
              averageSwr: swr,
              channels: [],
            });

            swrAveraging = swr;
            length = 1;
            logging = true;
          } else {
            length++;
            swrAveraging += swr;
          }
          lastFrequency = point.frequency;
        } else {
          if (logging) {
            logging = false;
            let bandwidth =
              (point.frequency - usefulRanges[usefulRanges.length - 1].center);
            usefulRanges[usefulRanges.length - 1].center += point.frequency;
            usefulRanges[usefulRanges.length - 1].center /= 2;
            usefulRanges[usefulRanges.length - 1].bandwidth = bandwidth;
            usefulRanges[usefulRanges.length - 1].averageSwr =
              swrAveraging / length;
          }
        }
      }
    });

    if (logging) {
      let bandwidth =
        (data[data.length - 1].frequency -
          usefulRanges[usefulRanges.length - 1].center);
      usefulRanges[usefulRanges.length - 1].center +=
        data[data.length - 1].frequency;
      usefulRanges[usefulRanges.length - 1].center /= 2;
      usefulRanges[usefulRanges.length - 1].bandwidth = bandwidth;
      usefulRanges[usefulRanges.length - 1].averageSwr = swrAveraging / length;
      usefulRanges[usefulRanges.length - 1].averageSwr = swrAveraging / length;
    }
    usefulRanges = this.identifyGoodChannels(usefulRanges, tables, units, unitDivider, dontAddEmpty);
    return usefulRanges;
  }

  public identifyGoodChannels(
    ranges: IFrequencyRange[],
    tables: IFrequencyTable[][],
    units: string = "Mhz",
    unitDivider: number = 1000000,
    dontAddEmpty: boolean = false
  ): IFrequencyRange[] {
    let indexesToRemove: number[] = [];
    ranges.forEach((range, index) => {
      tables.forEach((table) => {
        table.forEach((channel) => {
          if(channel.center < (range.center + range.bandwidth/2)/unitDivider && channel.center > (range.center - range.bandwidth/2)/unitDivider){
            range.channels.push(channel)
          }
        });
        if(range.channels.length == 0 && dontAddEmpty){
          indexesToRemove.push(index);
        }
      });1
    });
    indexesToRemove = [...new Set(indexesToRemove.reverse())];
    indexesToRemove.forEach((index)=>{
      ranges.splice(index, 1)
    });
    return ranges;
  }
}
