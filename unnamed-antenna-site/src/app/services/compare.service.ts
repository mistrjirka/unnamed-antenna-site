import { Injectable } from '@angular/core';
import { StoreService } from './store.service';
import {
  IAntennaList,
  ICompatibleAntenna,
  IContentAntenna,
  IContentFile,
  IFrequencyData,
  IFrequencyTable,
  IFrequencyRange,
} from '../model/chart';
import { FileloadingService } from './fileloading.service';
import { Router } from '@angular/router';
import { ListingService } from './listing.service';

@Injectable({
  providedIn: 'root',
})
export class CompareService {
  constructor(
    private store: StoreService,
    private files: FileloadingService,
    private listing: ListingService,
    private router: Router
  ) {}

  async acquireFrequencyData(fileNames: string[]): Promise<IFrequencyData[][]> {
    let data: IFrequencyData[][] = [];

    for (let i = 0; i < fileNames.length; i++) {
      let tmp = await this.files.getFrequencyData(fileNames[i]);
      data.push(tmp);
    }
    return data;
  }

  async findFrequencies(
    selected: IAntennaList[],
    antennaList: IContentAntenna[],
    dataProcessing: (data: IFrequencyData[][]) => IFrequencyData[],
    redirect: boolean = true
  ) {
    if (selected.length == 0) {
      alert('Please select one or more antennas');
      return;
    }
    let fileNames: string[] = [];
    let names: string[] = [];
    let antenna: IContentAntenna = {} as IContentAntenna;

    antenna.startFrequency = 0;
    antenna.endFrequency = 9999999999999999;
    antenna.unitDivider = 0;

    antenna.tables = [];
    selected.forEach((sel) => {
      let tmp: IContentAntenna | undefined = antennaList.find(
        (el) => el.id == sel.id
      );

      if (tmp !== undefined) {
        antenna.startFrequency = Math.max(
          antenna.startFrequency,
          tmp.startFrequency
        );
        antenna.endFrequency = Math.min(antenna.endFrequency, tmp.endFrequency);
        antenna.units = tmp.units;
        antenna.unitDivider = tmp.unitDivider;
        antenna.tables = [...antenna.tables, ...tmp.tables];

        fileNames.push(tmp.dataFile);
        names.push(tmp.name);
      }
    });

    let data: IFrequencyData[][] = await this.acquireFrequencyData(fileNames);

    antenna.name = names.join(' ');
    antenna.description =
      'Analysis of selected antennas. This uses max function on the data and helps to find frequencies where these antennas all resonate';

    let processedData: IFrequencyData[] = dataProcessing(data);

    this.store.storeAntennaList(selected);
    this.store.storeFrequencyData(processedData);
    this.store.storeAntenna(antenna);
    if (redirect) this.router.navigate(['/detail/analyze']);
  }

  overlapOfRanges(
    range1: IFrequencyRange,
    range2: IFrequencyRange
  ): IFrequencyRange {
    let result: IFrequencyRange = {
      center: -1,
      bandwidth: -1,
      averageSwr: -1,
      channels: [],
    };
    if (
      range1.center - range1.bandwidth / 2 >
        range2.center + range2.bandwidth / 2 ||
      range2.center - range1.bandwidth / 2 >
        range1.center + range1.bandwidth / 2
    ) {
      return result;
    }
    let start: number = Math.min(
      range1.center - range1.bandwidth / 2,
      range2.center - range2.bandwidth / 2
    );
    let end: number = Math.max(
      range1.center + range1.bandwidth / 2,
      range2.center + range2.bandwidth / 2
    );
    result.bandwidth = end - start;
    result.center = (start + end) / 2;

    range1.channels.forEach((channel: IFrequencyTable) => {
      range2.channels.forEach((channel2: IFrequencyTable) => {
        if (channel.name === channel2.name) {
          result.channels.push(channel);
        }
      });
    });

    return result;
  }

  async getListOfCompatibleAntennas(
    antennaOrig: IContentAntenna,
    frequencyData: IFrequencyData[],
    antennaList: IAntennaList[],
    tables: IFrequencyTable[][],
    threshold: number = 2
  ): Promise<ICompatibleAntenna[]> {
    let results: ICompatibleAntenna[] = [];
    let frequencyRanges: IFrequencyRange[] = this.files.findUsefulFrequencies(
      frequencyData,
      tables,
      threshold,
      antennaOrig.startFrequency,
      antennaOrig.units,
      antennaOrig.unitDivider,
      true
    );

    let contentFile: IContentFile = await this.listing.getContent();
    let allAntennas: IContentAntenna[] = this.listing.getAntennasFromCategory(
      contentFile,
      ''
    );
    for (let i = 0; i < allAntennas.length; i++) {
      let antennaToTest: IContentAntenna = allAntennas[i];

      if (!antennaList.find((a) => a.id === antennaToTest.id)) {
        let tmpFrequencyData: IFrequencyData[] =
          await this.files.getFrequencyData(antennaToTest.dataFile);
        let tmpFrequencyRanges: IFrequencyRange[] =
          await this.files.findUsefulFrequencies(
            tmpFrequencyData,
            tables,
            threshold,
            antennaToTest.startFrequency,
            antennaToTest.units,
            antennaToTest.unitDivider,
            true
          );
        let commonRanges: IFrequencyRange[] = [];
        frequencyRanges.forEach((origRange) => {
          tmpFrequencyRanges.forEach((testRange) => {
            let tmp = this.overlapOfRanges(testRange, origRange);
            if (tmp.center != -1) {
              commonRanges.push(tmp);
            }
          });
        });
        if (commonRanges.length != 0) {
          results.push({ antenna: antennaToTest, bands: commonRanges });
        }
      }
    }

    return results;
  }
}
