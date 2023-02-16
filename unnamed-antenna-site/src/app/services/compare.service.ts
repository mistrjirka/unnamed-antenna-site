import { Injectable } from '@angular/core';
import { StoreService } from './store.service';
import { IAntennaList, IContentAntenna, IFrequencyData } from '../model/chart';
import { FileloadingService } from './fileloading.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CompareService {

  constructor(private store: StoreService, private files: FileloadingService, private router: Router) { }

  async findFrequencies(selected: IAntennaList[], antennaList: IContentAntenna[], dataProcessing: (data: IFrequencyData[][]) => IFrequencyData[]){
    let fileNames: string[] = [];
    let names: string[] = [];
    let antenna: IContentAntenna = {} as IContentAntenna;

    antenna.startFrequency = 0;
    antenna.endFrequency = 9999999999999999;
    antenna.unitDivider = 0;

    antenna.tables = [];
    selected.forEach((sel)=>{
      let tmp: IContentAntenna | undefined = antennaList.find((el) => el.id == sel.id)
      
      if(tmp !== undefined){
        antenna.startFrequency = Math.max(antenna.startFrequency, tmp.startFrequency);
        antenna.endFrequency = Math.min(antenna.endFrequency, tmp.endFrequency);
        antenna.units = tmp.units;
        antenna.unitDivider = tmp.unitDivider;
        antenna.tables = [...antenna.tables,...tmp.tables];

        fileNames.push(tmp.dataFile);
        names.push(tmp.name);
      }
    });

    let data: IFrequencyData[][] = [];
    
    for(let i = 0; i < fileNames.length; i++){
      let tmp = (await this.files.getFrequencyData(fileNames[i]));
      data.push(tmp);
    }

    antenna.name = names.join(' ');
    antenna.description = "Analysis of selected antennas. This uses max function on the data and helps to find frequencies where these antennas all resonate";

    let processedData: IFrequencyData[] = dataProcessing(data);

    this.store.storeAntennaList(antennaList);
    this.store.storeFrequencyData(processedData);
    this.store.storeAntenna(antenna);
    this.router.navigate(['/detail/analyze']);
  }
}

