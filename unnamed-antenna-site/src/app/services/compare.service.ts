import { Injectable } from '@angular/core';
import { StoreService } from './store.service';
import { IAntennaList, ICompatibleAntenna, IContentAntenna, IContentFile, IFrequencyData, IFrequencyTable, IFrequencyRange } from '../model/chart';
import { FileloadingService } from './fileloading.service';
import { Router } from '@angular/router';
import { ListingService } from './listing.service';

@Injectable({
  providedIn: 'root'
})
export class CompareService {

  constructor(private store: StoreService, private files: FileloadingService, private listing: ListingService, private router: Router) { }

  async acquireFrequencyData(fileNames: string[]): Promise<IFrequencyData[][]>{
    let data: IFrequencyData[][] = [];
    
    for(let i = 0; i < fileNames.length; i++){
      let tmp = (await this.files.getFrequencyData(fileNames[i]));
      data.push(tmp);
    }
    return data;

  }

  async findFrequencies(selected: IAntennaList[], antennaList: IContentAntenna[], dataProcessing: (data: IFrequencyData[][]) => IFrequencyData[], redirect: boolean = true){
    if(selected.length == 0){
      alert("Please select one or more antennas");
      return;
    }
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

    let data: IFrequencyData[][] = await this.acquireFrequencyData(fileNames);
    
    antenna.name = names.join(' ');
    antenna.description = "Analysis of selected antennas. This uses max function on the data and helps to find frequencies where these antennas all resonate";

    let processedData: IFrequencyData[] = dataProcessing(data);

    this.store.storeAntennaList(antennaList);
    this.store.storeFrequencyData(processedData);
    this.store.storeAntenna(antenna);
    if (redirect)
      this.router.navigate(['/detail/analyze']);
  }

  async getListOfCompatibleAntennas(antenna: IContentAntenna, frequencyData: IFrequencyData[], tables: IFrequencyTable[][], threshold: number = 2): Promise<ICompatibleAntenna[]> {
    let results: ICompatibleAntenna[] = [];
    let frequencyRanges: IFrequencyRange[] = this.files.findUsefulFrequencies(frequencyData, tables, threshold, antenna.startFrequency, antenna.units, antenna.unitDivider, true); 

    let contentFile: IContentFile = await this.listing.getContent();
    let allAntennas: IContentAntenna[] = this.listing.getAntennasFromCategory(contentFile, "");
    for (let i = 0; i < allAntennas.length;i++){
      let antenna: IContentAntenna = allAntennas[i];
      let tmpFrequencyData: IFrequencyData[] = await this.files.getFrequencyData(antenna.dataFile);
      let tmpFrequencyRanges: IFrequencyRange[] = await this.files.findUsefulFrequencies(tmpFrequencyData, tables, threshold, antenna.startFrequency, antenna.units, antenna.unitDivider, true); 
    }
    
    return results;
  }
}

