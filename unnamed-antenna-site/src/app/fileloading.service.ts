import { Injectable } from '@angular/core';
import { IGraphData, IFrequencyData, IFrequencyRange, IFrequencyTable } from './model/chart';
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

  async getFrequencyDdata(fname: string): Promise<IFrequencyData[]> {
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
          parsedData.push({ frequency: tmp[0], real: tmp[1], imag: tmp[2] });
        }
      }
    });

    return parsedData;
  }

  parseDataToGraph(
    data: IFrequencyData[],
    limit: number = 5,
    startFrequency: number = 0
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
      if (point.frequency / 1000000 > startFrequency) {
        parsedData.labels.push(
          (point.frequency / 1000000000).toFixed(4).toString() + 'Ghz'
        );
        parsedData.datasets[0].data.push(
          this.calculateSwr(point.real, point.imag, limit).toString()
        );
      }
    });
    return parsedData;
  }

  parseDataToFpvGraph(
    data: IFrequencyData[],
    table: IFrequencyTable[],
    color: string = 'red'
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
      parsedData.labels.push(channel.name + ' ' + channel.center + 'Mhz');
      let start = Math.trunc(channel.center - channel.bandwidth / 2);
      let end = Math.trunc(channel.center + channel.bandwidth / 2);
      let startIndex = 0;
      for (
        ;
        startIndex < data.length &&
        data[startIndex].frequency / 1000000 < start;
        startIndex++
      );
      let endIndex = startIndex;
      for (
        ;
        endIndex < data.length && data[endIndex].frequency / 1000000 < end;
        endIndex++
      );

      let dataBetween = data.slice(startIndex, endIndex);
      let averageSwr = 0;
      dataBetween.forEach((element) => {
        averageSwr += this.calculateSwr(element.real, element.imag);
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
    minFrequency: number = 0
  ): IFrequencyRange[] {
    let usefulRanges: IFrequencyRange[] = [];
    let lastFrequency: number = 0;
    let logging: boolean = false;
    let swrAveraging: number = 0;
    let length: number = 0;
    data.forEach((point) => {
      if (point.frequency / 1000000 > minFrequency) {
        let swr = this.calculateSwr(point.real, point.imag);
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
    usefulRanges = this.identifyGoodChannels(usefulRanges, tables);
    return usefulRanges;
  }

  public identifyGoodChannels(
    ranges: IFrequencyRange[],
    tables: IFrequencyTable[][]
  ): IFrequencyRange[] {
    ranges.forEach((range) => {
      tables.forEach((table) => {
        table.forEach((channel) => {
          if(channel.center < (range.center + range.bandwidth/2)/1000000 && channel.center > (range.center - range.bandwidth/2)/1000000){
            range.channels.push(channel)
          }
        });
      });1
    });
    return ranges;
  }
}
