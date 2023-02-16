import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IAntennaList, IContentAntenna, IFrequencyData } from '../model/chart';
import { FileloadingService } from '../services/fileloading.service';
import { ListingService } from '../services/listing.service';
import { StoreService } from '../services/store.service';


@Component({
  selector: 'app-compare',
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.css']
})
export class CompareComponent implements OnInit  {
  
  ready: boolean = false;
  antennaList: IContentAntenna[] = [];

  optionsList: {id: string, name: string}[] = [];
  selected: {id: string, name: string}[] = [];

  
  
  get isReady(): boolean { return this.ready; }

  constructor(private listing: ListingService, private store: StoreService, private files: FileloadingService, private router: Router){}


  async ngOnInit(): Promise<void> {
    this.antennaList = await this.listing.getAntennas();

    this.antennaList.forEach(antenna=>{
      this.optionsList.push({id: antenna.id, name: antenna.name});
    });

    this.ready = true;
  }

  async findFrequencies(){
    let fileNames: string[] = [];
    let names: string[] = [];
    let antenna: IContentAntenna = {} as IContentAntenna;

    antenna.startFrequency = 0;
    antenna.endFrequency = 9999999999999999;
    antenna.unitDivider = 0;

    antenna.tables = [];
    this.selected.forEach((sel)=>{
      let tmp: IContentAntenna | undefined = this.antennaList.find((el) => el.id == sel.id)
      
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

    let processedData: IFrequencyData[] = this.files.maxData(data);

    this.store.storeAntennaList(this.antennaList);
    this.store.storeFrequencyData(processedData);
    this.store.storeAntenna(antenna);
    this.router.navigate(['/detail/analyze']);
  }
}
